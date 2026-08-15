#!/usr/bin/env node
/**
 * Rebuilds public/data/search-main.json from src/data/lessons/*.json.
 *
 * This file was previously a public, unauthenticated dump of the FULL
 * Arabic + English corpus (2,176 passages) -- a single fetchable URL that
 * exposed the whole book. It was emptied as an emergency stopgap.
 *
 * This script rebuilds it in a way that matches what the lesson pages
 * themselves now show:
 *   - English:  full paragraph text, for any lesson with hasEnglish=true.
 *               (English is AK's own translation and is shown in full on
 *               the lesson pages, so indexing it in full adds no new
 *               exposure.)
 *   - Arabic:   reduced to Qur'anic citation fragments only -- the exact
 *               same parens/guillemets extraction used server-side in
 *               src/lib/quranicFragments.ts for the lesson pages. This
 *               MUST stay in sync with that file. If you change the
 *               extraction logic there, change it here too.
 *
 * Run with: node scripts/build-search-index.js
 * (Node only -- no build step / bundler needed. Safe to re-run any time
 * lesson content changes; it fully regenerates the output file.)
 */

const fs = require('fs');
const path = require('path');

const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
const OUT_FILE = path.join(__dirname, '..', 'public', 'data', 'search-main.json');

// --- Mirrors src/lib/quranicFragments.ts -- keep in sync ------------------

const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;

function isPoem(text) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

function extractSpans(paragraph) {
  const spans = [];
  // Deliberately no brace {} pattern -- see src/lib/quranicFragments.ts for why.
  const patterns = [/\(([^()]{2,400})\)/g, /«([^»]{2,400})»/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(paragraph))) spans.push(m[1].trim());
  }
  return spans;
}

function redactToQuranicFragments(raw) {
  if (!raw) return [];
  const allParagraphs = raw.split('\n').filter(p => p.trim());
  const commentaryParagraphs = allParagraphs.filter(p => !isPoem(p));
  return commentaryParagraphs
    .map(p => extractSpans(p).join('  ·  '))
    .filter(f => f && f.trim().length > 0);
}

// --- Build ------------------------------------------------------------

function loadLesson(id) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.warn(`  ! failed to parse lesson ${id}: ${e.message}`);
    return null;
  }
}

const entries = [];
let lessonsWithEnglish = 0;
let lessonsIndexed = 0;

for (let id = 1; id <= 56; id++) {
  const lesson = loadLesson(id);
  if (!lesson) continue;
  lessonsIndexed++;

  const lessonTitle = lesson.englishTitle || '';
  const lessonTitleAr = lesson.arabicTitle || '';
  const verseRange = lesson.verseRange || '';

  // Arabic -- Qur'anic citation fragments only.
  const arFragments = redactToQuranicFragments(lesson.arabicBody || lesson.arabicText);
  arFragments.forEach((text, i) => {
    entries.push({
      id: `l${id}-niasse-ar-${i}`,
      lessonId: id,
      lessonTitle,
      lessonTitleAr,
      verseRange,
      text,
      language: 'ar',
      type: 'niasse-ar',
    });
  });

  // English -- full text, only for lessons AK has actually translated.
  if (lesson.hasEnglish && lesson.englishText) {
    lessonsWithEnglish++;
    const paragraphs = lesson.englishText.split('\n').filter(p => p.trim());
    paragraphs.forEach((text, i) => {
      entries.push({
        id: `l${id}-niasse-en-${i}`,
        lessonId: id,
        lessonTitle,
        lessonTitleAr,
        verseRange,
        text,
        language: 'en',
        type: 'niasse-en',
      });
    });
  }
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify({ entries }), 'utf8');

console.log(`Indexed ${lessonsIndexed} lessons (${lessonsWithEnglish} with English translations).`);
console.log(`Wrote ${entries.length} entries to ${path.relative(process.cwd(), OUT_FILE)}`);
