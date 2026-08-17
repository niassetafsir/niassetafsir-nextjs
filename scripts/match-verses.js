#!/usr/bin/env node
/**
 * Matches every Qur'anic citation Niasse quotes in his Arabic commentary
 * (the spans already extracted by src/lib/arabicCommentary.ts (formerly quranicFragments.ts), inside ()
 * or guillemets) against the actual verse it comes from, using the full
 * verse-keyed Qur'an text in src/data/verse_text.json (rebuilt by
 * scripts/rebuild-verse-text.js -- run that FIRST if you haven't).
 *
 * This does NOT touch anything served to the site. It writes a report to
 * translation-drafts/verse-match-report.json (private working file, same
 * convention as the MT drafts) for AK + Claude to review before deciding
 * how/whether to surface verse numbers in the UI or extend VERSE_INDEX.
 *
 * Run with: node scripts/match-verses.js
 */

const fs = require('fs');
const path = require('path');

const VERSE_TEXT_FILE = path.join(__dirname, '..', 'src', 'data', 'verse_text.json');
const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
const OUT_FILE = path.join(__dirname, '..', 'translation-drafts', 'verse-match-report.json');

// --- Surah <-> lesson range (mirrors src/app/read/page.tsx / src/lib/surahLessons.ts) ---

const SURA_TO_LESSON = {
  1:1, 2:2, 3:8, 4:11, 5:14, 6:16, 7:18, 8:21, 9:22, 10:24,
  11:25, 12:26, 13:28, 14:28, 15:29, 16:30, 17:30, 18:31, 19:32, 20:32,
  21:33, 22:34, 23:35, 24:35, 25:36, 26:37, 27:37, 28:38, 29:39, 30:39,
  31:39, 32:40, 33:40, 34:41, 35:41, 36:42, 37:42, 38:43, 39:43, 40:44,
  41:44, 42:45, 43:45, 44:45, 45:46, 46:46, 47:46, 48:46, 49:47, 50:47,
  51:47, 52:48, 53:48, 54:48, 55:49, 56:49, 57:49, 58:50, 59:50, 60:50,
  61:50, 62:51, 63:51, 64:51, 65:51, 66:51, 67:52, 68:52, 69:52, 70:52,
  71:52, 72:53, 73:53, 74:53, 75:53, 76:53, 77:53, 78:54, 79:54, 80:54,
  81:54, 82:54, 83:54, 84:54, 85:54, 86:54, 87:55, 88:55, 89:55, 90:55,
  91:55, 92:55, 93:55, 94:55, 95:55, 96:55, 97:55, 98:55, 99:55, 100:55,
  101:55, 102:55, 103:55, 104:55, 105:55, 106:55, 107:55, 108:55, 109:55, 110:55,
  111:55, 112:56, 113:56, 114:56,
};
const SURA_LESSON_END = {
  2:7, 3:10, 4:13, 5:16, 6:17, 7:20, 9:23, 11:26, 12:27, 20:33, 21:34,
  24:36, 27:38, 31:40, 33:41, 35:42, 37:43, 41:45, 44:46, 48:47, 51:48,
};

// Invert to lesson -> surahs touched (informational only now -- matching
// itself searches the whole Qur'an, see note below). Lesson 1 also gets
// surah 1 folded in as a special case: it's the only lesson whose range
// starts a surah *before* SURA_TO_LESSON says that surah "begins".
const LESSON_SURAHS = {};
for (let surah = 1; surah <= 114; surah++) {
  const start = SURA_TO_LESSON[surah];
  if (!start) continue;
  const end = SURA_LESSON_END[surah] || start;
  for (let lessonId = start; lessonId <= end; lessonId++) {
    (LESSON_SURAHS[lessonId] = LESSON_SURAHS[lessonId] || []).push(surah);
  }
}
LESSON_SURAHS[1] = [...new Set([...(LESSON_SURAHS[1] || []), 2])];

// --- Mirrors src/lib/arabicCommentary.ts (formerly quranicFragments.ts) -- keep in sync ------------------

const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;
function isPoem(text) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

function extractSpans(paragraph) {
  const spans = [];
  const patterns = [/\(([^()]{2,400})\)/g, /«([^»]{2,400})»/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(paragraph))) {
      const span = m[1].trim();
      if (/[.{}]/.test(span)) continue;
      spans.push(span);
    }
  }
  return spans;
}

// --- Arabic normalization for matching (diacritics, letter-form variants,
// punctuation) -- deliberately lossy, this is for MATCHING only, never
// used to alter displayed text. Uses the Unicode "combining mark" property
// (\p{Mn}) rather than a hand-picked codepoint range, so it strips ALL
// diacritics regardless of which script convention produced them --
// matters here because the rebuilt verse_text.json uses Uthmani-style
// marks (sukun, wasla) that a plain-tashkil-only range would miss. -------

function normalizeAr(text) {
  return text
    .normalize('NFC')
    .replace(/\p{Mn}/gu, '')                 // all combining diacritics
    .replace(/[۞۩]/g, '')          // standalone Quranic markers (rub el hizb, sajda)
    .replace(/ـ/g, '')                  // tatwil
    .replace(/[آأإٱ]/g, 'ا') // alif variants + wasla -> bare alif
    .replace(/ة/g, 'ه')            // ta marbuta -> ha
    .replace(/ى/g, 'ي')            // alif maqsura -> ya
    .replace(/[ؤئ]/g, 'ء')    // hamza-on-waw/ya -> bare hamza
    .replace(/[،؛؟!:"'«»()\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Load verse text, index by surah ---------------------------------------

const verseText = JSON.parse(fs.readFileSync(VERSE_TEXT_FILE, 'utf8'));
const versesBySurah = {}; // { surahId: [{key:'2:6', norm:'...', words:Set}] }
const ALL_VERSES = [];   // flat list, every surah -- see matching note below
for (const key of Object.keys(verseText)) {
  const [surahStr] = key.split(':');
  const surah = Number(surahStr);
  const entry = verseText[key];
  if (!entry || !entry.ar) continue;
  const norm = normalizeAr(entry.ar);
  const rec = { key, norm, words: new Set(norm.split(' ').filter(w => w.length > 1)) };
  (versesBySurah[surah] = versesBySurah[surah] || []).push(rec);
  ALL_VERSES.push(rec);
}

// --- Matching ----------------------------------------------------------

// Citations shorter than this are too ambiguous to match reliably (a lone
// word occurs in dozens of verses) -- report them as unmatched rather than
// guessing. Threshold is on normalized word count.
const MIN_SPAN_WORDS = 3;

function findMatch(spanNorm, candidates) {
  if (!spanNorm) return null;
  if (spanNorm.split(' ').filter(w => w.length > 1).length < MIN_SPAN_WORDS) {
    return null;
  }

  // Pass 1: single-verse substring match (either direction -- citation may
  // be a sub-clause of the verse, or may literally equal it). Only accepted
  // if it clears a real confidence threshold -- low-confidence candidates
  // are discarded here, not carried into later passes.
  let pass1 = null;
  for (const c of candidates) {
    if (!c.norm) continue;
    if (c.norm.includes(spanNorm) || spanNorm.includes(c.norm)) {
      const score = Math.min(spanNorm.length, c.norm.length) / Math.max(spanNorm.length, c.norm.length);
      if (!pass1 || score > pass1.score) pass1 = { verse: c.key, score, type: 'substring' };
    }
  }
  if (pass1 && pass1.score >= 0.25) return pass1;

  // Pass 2: adjacent-pair concatenation, for citations spanning a verse
  // boundary (rare, but Niasse does sometimes quote across one).
  let pass2 = null;
  for (let i = 0; i < candidates.length - 1; i++) {
    const a = candidates[i], b = candidates[i + 1];
    const [as, aa] = a.key.split(':').map(Number);
    const [bs, ba] = b.key.split(':').map(Number);
    if (as !== bs || ba !== aa + 1) continue; // must be adjacent verses, same surah
    const combined = `${a.norm} ${b.norm}`;
    if (combined.includes(spanNorm)) {
      const score = spanNorm.length / combined.length;
      if (!pass2 || score > pass2.score) pass2 = { verse: `${a.key}-${b.key}`, score, type: 'pair' };
    }
  }
  if (pass2) return pass2;

  // Pass 3: word-overlap fallback for paraphrase-ish or partial matches.
  const spanWords = new Set(spanNorm.split(' ').filter(w => w.length > 1));
  if (spanWords.size === 0) return null;
  let pass3 = null;
  for (const c of candidates) {
    const cWords = c.words;
    let overlap = 0;
    for (const w of spanWords) if (cWords.has(w)) overlap++;
    const score = overlap / spanWords.size;
    if (score >= 0.55 && (!pass3 || score > pass3.score)) pass3 = { verse: c.key, score, type: 'fuzzy' };
  }
  return pass3;
}

// --- Run per lesson ----------------------------------------------------

function loadLesson(id) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.warn(`  ! failed to parse lesson ${id}: ${e.message}`); return null; }
}

const report = {};
let totalSpans = 0, totalMatched = 0;

for (let id = 1; id <= 56; id++) {
  const lesson = loadLesson(id);
  if (!lesson) continue;
  const raw = lesson.arabicBody || lesson.arabicText;
  if (!raw) continue;

  const surahs = LESSON_SURAHS[id] || [];
  // Search the WHOLE Qur'an, not just the surah(s) this lesson's title
  // covers -- tafsir routinely cites other surahs as cross-reference/proof
  // texts (an early pilot run scoped to same-surah-only matched only 23%,
  // and inspection showed most "unmatched" spans were verses from entirely
  // different surahs, e.g. a Q. 75:17 citation appearing in Lesson 1's
  // commentary on al-Fatiha/al-Baqara).
  const candidates = ALL_VERSES;

  const paragraphs = raw.split('\n').filter(p => p.trim()).filter(p => !isPoem(p));
  const lessonReport = [];

  paragraphs.forEach((p, paraIndex) => {
    const spans = extractSpans(p);
    spans.forEach((span, spanIndex) => {
      totalSpans++;
      // Liturgical formulas (refuge formula, basmala, etc.) recur as fixed
      // sentence templates across many unrelated verses -- fuzzy word-
      // overlap matching reliably misattributes them (spot-checked: the
      // refuge formula matched to Q. 2:67, which is unrelated). They're
      // recitation formulas, not citations of a specific verse, so leave
      // them unmatched rather than guess. isPoem() already excludes this
      // at paragraph-start; this catches the same patterns mid-paragraph.
      const match = BASMALA_PATTERN.test(span.trim()) ? null : findMatch(normalizeAr(span), candidates);
      if (match) totalMatched++;
      lessonReport.push({
        paraIndex,
        spanIndex,
        text: span,
        match: match ? { verse: match.verse, score: Number(match.score.toFixed(2)), type: match.type } : null,
      });
    });
  });

  report[id] = { surahs, spanCount: lessonReport.length, spans: lessonReport };
  console.log(`Lesson ${id}: ${lessonReport.length} citation(s), surah(s) ${surahs.join(',')}`);
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2), 'utf8');

console.log(`\nTotal citations: ${totalSpans} · matched: ${totalMatched} (${((totalMatched/totalSpans)*100).toFixed(1)}%)`);
console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
