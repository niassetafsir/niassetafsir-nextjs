#!/usr/bin/env node
/**
 * Repairs single-letter OCR damage inside Qurʾānic quotations, and proves each
 * repair by the effect it has on the matcher.
 *
 * scripts/find-qaf-fa-ocr.js did this for one letter pair, where the physical
 * cause was known: the printing is Maghribī, where qāf carries one dot above
 * and fāʾ one dot below, and the OCR read Mashriqī dotting. The same misreading
 * runs through the rest of the alphabet -- a Maghribī fāʾ, dotted below, comes
 * back as bāʾ (294 times), and final nūn comes back as rāʾ (234), lām (85),
 * tāʾ (83), sīn (70). Counting every class, 1,922 words inside quotations
 * differ from the āya they quote by exactly one letter.
 *
 * WHY THIS NEEDS A PROOF AND THE ق/ف PASS DID NOT
 *
 * All 1,922 sit in spans the matcher could only guess at -- the fuzzy and
 * ambiguous tiers. That follows from what an exact match is: a span that
 * already matches word-aligned has no differing words left to correct. So
 * every correction here rests on a verse identification that is itself
 * uncertain, and correcting a span toward a verse Niasse never quoted would
 * be worse than leaving the OCR alone.
 *
 * ق/ف was safe without a proof because the pair is closed and the cause
 * physical: قال misread as فال is not a competing reading of anything. Across
 * 141 letter classes that argument no longer holds -- بعل is a word (Q 37:125)
 * and so is فعل.
 *
 * THE PROOF
 *
 * Apply every candidate, re-run the matcher, and keep only the spans that
 * moved from a guess to an exact match ON THE SAME ĀYA the corrections came
 * from. Revert everything else, character by character.
 *
 * A span promotes only when its corrected text sits word-aligned inside that
 * āya, which is a far stronger claim than the 0.55 word overlap that got it
 * there. The corrections cannot manufacture that: each one requires the words
 * on either side to already match the āya exactly -- that is what fixes the
 * alignment window -- so a correction can only ever extend an anchor that is
 * already right. A wrongly identified verse offers no anchors to extend.
 *
 * WHAT IT WILL NOT TOUCH
 *
 * The same line as the ق/ف pass: only inside ( ) and « », never the running
 * prose between them. Inside the brackets the Qurʾān is the authority and a
 * divergence from it is an error by definition. Outside them the words are
 * Niasse's.
 *
 *   node scripts/repair-ocr-from-quran.js            # report only
 *   node scripts/repair-ocr-from-quran.js --write    # apply, prove, revert
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
const VERSE_TEXT_FILE = path.join(__dirname, '..', 'src', 'data', 'verse_text.json');
const REPORT_FILE = path.join(__dirname, '..', 'translation-drafts', 'verse-match-report.json');
const OUT_FILE = path.join(__dirname, '..', 'translation-drafts', 'ocr-repairs.json');

const WRITE = process.argv.includes('--write');

const EXACT_TIERS = new Set(['substring', 'enclosed', 'pair']);

// --- Mirrors scripts/match-verses.js. Keep in step. ------------------------

const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;
function isPoem(text) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

function normalizeAr(text) {
  return text
    .normalize('NFC')
    .replace(/\p{Mn}/gu, '')
    .replace(/[ۥۦ]/g, '')
    .replace(/\p{Cf}/gu, '')
    .replace(/\[\s*\d+\s*\]/g, ' ')
    .replace(/[۞۩]/g, '')
    .replace(/ـ/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ےۓ]/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[،؛؟!:"'«»()\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** extractSpans, but carrying each span's absolute offset in the paragraph.
 *  Two passes in the same order as match-verses.js, so spanIndex agrees. */
function extractSpansWithOffset(paragraph) {
  const spans = [];
  const patterns = [/\(([^()]{2,400})\)/g, /«([^»]{2,400})»/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(paragraph))) {
      const inner = m[1];
      if (/[.{}]/.test(inner.trim())) continue;
      // m.index+1 is the first character inside the bracket; the span itself
      // is trimmed, so skip whatever leading whitespace trim() would remove.
      const lead = inner.length - inner.replace(/^\s+/, '').length;
      spans.push({ text: inner.trim(), offset: m.index + 1 + lead });
    }
  }
  return spans;
}

/** Paragraphs as match-verses.js sees them, each with its offset in the body. */
function paragraphsWithOffset(raw) {
  const out = [];
  let at = 0;
  for (const line of raw.split('\n')) {
    if (line.trim() && !isPoem(line)) out.push({ text: line, offset: at });
    at += line.length + 1;
  }
  return out;
}

// --- Collect candidates ----------------------------------------------------

const verseText = JSON.parse(fs.readFileSync(VERSE_TEXT_FILE, 'utf8'));

/** Every single-letter repair this span needs to become its cited āya.
 *  Returns [] when any of them is ambiguous. */
function repairsFor(spanText, verseAr) {
  const rawWords = spanText.split(/(\s+)/);            // keeps separators
  const sw = [], rawIndexOf = [];
  let at = 0;
  for (const piece of rawWords) {
    if (piece.trim()) { sw.push(piece); rawIndexOf.push(at); }
    at += piece.length;
  }
  const nw = sw.map(normalizeAr);
  const vw = normalizeAr(verseAr).split(' ');
  const repairs = [];

  for (let i = 0; i < nw.length; i++) {
    const w = nw[i];
    if (!w || w.length < 3 || vw.includes(w)) continue;

    let lo = 0, hi = vw.length - 1;
    for (let k = i - 1; k >= 0; k--) { const a = vw.indexOf(nw[k]); if (a >= 0) { lo = a + 1; break; } }
    for (let k = i + 1; k < nw.length; k++) { const a = vw.indexOf(nw[k]); if (a >= 0) { hi = a - 1; break; } }
    if (hi < lo) continue;

    const hits = [];
    for (let j = lo; j <= hi; j++) {
      const t = vw[j];
      if (!t || t.length !== w.length || t === w) continue;
      let pos = -1, ok = true;
      for (let c = 0; c < w.length; c++) {
        if (w[c] === t[c]) continue;
        if (pos !== -1) { ok = false; break; }
        pos = c;
      }
      if (ok && pos !== -1) hits.push({ pos, from: w[pos], to: t[pos] });
    }
    if (hits.length !== 1) continue;
    const { pos, from, to } = hits[0];

    // Walk the raw, vocalised token to find the character normalisation kept.
    const raw = sw[i];
    let seen = -1, rawPos = -1;
    for (let c = 0; c < raw.length; c++) {
      if (normalizeAr(raw[c]) === '') continue;
      seen++;
      if (seen === pos) { rawPos = c; break; }
    }
    if (rawPos < 0 || raw[rawPos] !== from) continue;

    repairs.push({ offsetInSpan: rawIndexOf[i] + rawPos, from, to, word: raw });
  }
  return repairs;
}

const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
const perLesson = new Map();   // lessonId -> [{ paraIndex, spanIndex, verse, edits:[{index,from,to}] }]
let candidateSpans = 0, candidateEdits = 0;
const classTally = {};

for (const lessonId of Object.keys(report).map(Number).sort((a, b) => a - b)) {
  const file = path.join(LESSONS_DIR, `${String(lessonId).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) continue;
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const raw = lesson.arabicBody || lesson.arabicText;
  if (!raw) continue;

  const paras = paragraphsWithOffset(raw);
  const jobs = [];

  for (const span of report[lessonId].spans || []) {
    if (!span.match || !span.match.verse) continue;
    if (EXACT_TIERS.has(span.match.type)) continue;       // nothing to fix
    if (String(span.match.verse).includes('-')) continue; // pair: no single āya
    const verse = verseText[span.match.verse];
    if (!verse || !verse.ar) continue;

    const para = paras[span.paraIndex];
    if (!para) continue;
    const found = extractSpansWithOffset(para.text)[span.spanIndex];
    if (!found || found.text !== span.text) continue;     // indices drifted; skip

    const repairs = repairsFor(span.text, verse.ar);
    if (!repairs.length) continue;

    const base = para.offset + found.offset;
    const edits = repairs.map(r => ({ index: base + r.offsetInSpan, from: r.from, to: r.to }));
    if (edits.some(e => raw[e.index] !== e.from)) continue; // offset maths wrong; refuse

    jobs.push({ paraIndex: span.paraIndex, spanIndex: span.spanIndex, verse: span.match.verse, was: span.match.type, edits });
    candidateSpans++;
    candidateEdits += edits.length;
    for (const e of edits) {
      const k = `${e.from}→${e.to}`;
      classTally[k] = (classTally[k] || 0) + 1;
    }
  }
  if (jobs.length) perLesson.set(lessonId, jobs);
}

const classes = Object.entries(classTally).sort((a, b) => b[1] - a[1]);
console.log(`${candidateEdits} candidate repairs in ${candidateSpans} spans across ${perLesson.size} lessons`);
console.log(`  ${classes.length} letter classes; commonest: ${classes.slice(0, 8).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

if (!WRITE) {
  fs.writeFileSync(OUT_FILE, JSON.stringify([...perLesson], null, 2), 'utf8');
  console.log(`\nReport only. Re-run with --write to apply, prove and revert.`);
  process.exit(0);
}

// --- Apply all, then prove ------------------------------------------------

function bodyField(lesson) { return lesson.arabicBody ? 'arabicBody' : 'arabicText'; }

const originals = new Map();
for (const [lessonId, jobs] of perLesson) {
  const file = path.join(LESSONS_DIR, `${String(lessonId).padStart(2, '0')}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const field = bodyField(lesson);
  originals.set(lessonId, lesson[field]);
  const chars = [...lesson[field]];
  for (const job of jobs) for (const e of job.edits) chars[e.index] = e.to;
  lesson[field] = chars.join('');
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + '\n', 'utf8');
}
console.log(`\nApplied all ${candidateEdits}. Re-running the matcher to see which hold up…`);

execFileSync('node', [path.join(__dirname, 'match-verses.js')], { stdio: 'ignore' });
const after = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));

// --- Revert every span that did not promote --------------------------------

let keptSpans = 0, keptEdits = 0, revertedSpans = 0, revertedEdits = 0;
const keptClasses = {};
const promotions = [];

for (const [lessonId, jobs] of perLesson) {
  const file = path.join(LESSONS_DIR, `${String(lessonId).padStart(2, '0')}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const field = bodyField(lesson);
  const chars = [...lesson[field]];
  const before = originals.get(lessonId);

  for (const job of jobs) {
    const now = (after[lessonId].spans || [])
      .find(s => s.paraIndex === job.paraIndex && s.spanIndex === job.spanIndex);
    const promoted = now && now.match
      && EXACT_TIERS.has(now.match.type)
      && String(now.match.verse) === String(job.verse);

    if (promoted) {
      keptSpans++; keptEdits += job.edits.length;
      for (const e of job.edits) keptClasses[`${e.from}→${e.to}`] = (keptClasses[`${e.from}→${e.to}`] || 0) + 1;
      if (promotions.length < 20) {
        promotions.push(`L${lessonId} ¶${job.paraIndex}  Q ${job.verse}  ${job.was} → ${now.match.type}  ${job.edits.map(e => e.from + '→' + e.to).join(' ')}`);
      }
    } else {
      revertedSpans++; revertedEdits += job.edits.length;
      for (const e of job.edits) chars[e.index] = e.from;   // restore
    }
  }
  lesson[field] = chars.join('');
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + '\n', 'utf8');

  // Nothing outside the intended positions may have moved.
  const now = lesson[field];
  if (now.length !== before.length) throw new Error(`lesson ${lessonId}: body length changed`);
}

const kept = Object.entries(keptClasses).sort((a, b) => b[1] - a[1]);
console.log(`\nkept      ${String(keptEdits).padStart(5)} repairs in ${keptSpans} spans -- each one turned a guess into an exact match`);
console.log(`reverted  ${String(revertedEdits).padStart(5)} repairs in ${revertedSpans} spans -- the verse did not confirm them`);
console.log(`\nkept by class: ${kept.slice(0, 12).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log('\nsample promotions:');
for (const p of promotions) console.log('  ' + p);

fs.writeFileSync(OUT_FILE, JSON.stringify({ keptEdits, keptSpans, revertedEdits, revertedSpans, keptClasses }, null, 2), 'utf8');
console.log(`\nThe matcher currently holds the ALL-APPLIED run. Re-run the pipeline:`);
console.log('  node scripts/match-verses.js && python3 scripts/build-lesson-ranges.py && node scripts/build-verse-citations.js');
