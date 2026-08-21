#!/usr/bin/env node
/**
 * Puts the āyāt Niasse quotes without parentheses into the verse index.
 *
 * WHY THIS EXISTS
 *
 * scripts/match-verses.js only ever reads inside ( ) and « ». That rule is
 * right about authority -- inside the brackets the Qurʾān governs, outside
 * them the words are the Shaykh's -- and wrong about coverage, because the
 * compiler did not bracket everything he quoted. Lesson 3 carries
 *
 *     أخذ على ذرية آدم يوم أَلَسْتُ بِرَبِّكُمْ فَالُواْ بَلِى
 *
 * with no parentheses in it anywhere. That is Q 7:172, and the site cannot
 * see it. scripts/find-unbracketed-quotations.js already proved the point by
 * repairing the OCR inside such runs; this script takes the same runs and
 * makes them navigable.
 *
 * THE ANCHOR, AND WHY IT CARRIES
 *
 * A run of five consecutive prose words occurring word-aligned in exactly ONE
 * āya of the 6,236, and nowhere else in the muṣḥaf, is a quotation of that
 * āya. Uniqueness across the whole book is the same warrant the 'enclosed'
 * tier rests on in match-verses.js -- not a length ratio, not a score.
 *
 * Four words was tried and rejected upstream: four words of ordinary Arabic
 * recur, and a run has to be unique BECAUSE it is a quotation, not because it
 * grew long enough to stumble into uniqueness.
 *
 * WHAT THE INDEX THEN ASSERTS
 *
 * Less than a bracketed citation does, and the entry says so. `inferred: true`
 * marks a quotation this project identified rather than one the printing
 * declares. A reader following the jump should be able to tell which of those
 * two they are looking at, because they are different claims: one reports the
 * edition, the other reads it. Q 21:98 is the standing warning -- Lesson 34
 * writes وَمَن where Ḥafṣ has وَمَا, whom against what, and that is the author
 * quoting from memory, not a scanner losing a dot.
 *
 * Nothing here edits the Arabic. The repairs were a separate pass with its own
 * guards; this only adds index entries.
 *
 *     node scripts/index-unbracketed-ayat.js            # report only
 *     node scripts/index-unbracketed-ayat.js --write    # merge into the index
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'src', 'data', 'lessons');
const VERSE_TEXT_FILE = path.join(ROOT, 'src', 'data', 'verse_text.json');
const INDEX_FILE = path.join(ROOT, 'src', 'data', 'verseIndexAuto.json');
const RUNS_FILE = path.join(ROOT, 'translation-drafts', 'unbracketed-ayat.json');

const ANCHOR_WORDS = 5;
const MIN_WORD = 2;
const WRITE = process.argv.includes('--write');

const TOKEN = /[ء-يٱےۓً-ْٰ]+/g;

// Identical to find-unbracketed-quotations.js and match-verses.js. A fourth
// copy of this is a fourth thing to forget; keep them the same.
function normalizeAr(text) {
  return text.normalize('NFC')
    .replace(/\p{Mn}/gu, '').replace(/[ۥۦ]/g, '').replace(/\p{Cf}/gu, '')
    .replace(/\[\s*\d+\s*\]/g, ' ').replace(/[۞۩]/g, '').replace(/ـ/g, '')
    .replace(/[آأإٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[ےۓ]/g, 'ي').replace(/[ؤئ]/g, 'ء')
    .replace(/[،؛؟!:"'«»()\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

// The paragraph filter paraIndex counts into, byte-identical to
// match-verses.js. src/lib/niasseVerseExcerpt.ts documents why.
const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA = /^(أعوذ بالله|بسم الله|اللهم صل)/;
const isPoem = t => POEM.test(t.trim()) || BASMALA.test(t.trim());

function paragraphsOf(body) {
  return body.split('\n').filter(p => p.trim()).filter(p => !isPoem(p));
}

/** true where the character sits inside ( ) or « » -- the matcher's territory. */
function bracketMask(text) {
  const mask = new Uint8Array(text.length);
  const re = /\(([^()]{2,400})\)|«([^»]{2,400})»/g;
  let m;
  while ((m = re.exec(text))) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = 1;
  }
  return mask;
}

// --- Index the muṣḥaf by n-gram --------------------------------------------

const verseText = JSON.parse(fs.readFileSync(VERSE_TEXT_FILE, 'utf8'));
const verses = [];
for (const key of Object.keys(verseText)) {
  const ar = verseText[key] && verseText[key].ar;
  if (!ar) continue;
  verses.push({ key, words: normalizeAr(ar).split(' ').filter(Boolean) });
}

/** n-gram -> occurrences. Capped at 4: an n-gram in many places cannot anchor. */
const grams = new Map();
for (let v = 0; v < verses.length; v++) {
  const w = verses[v].words;
  for (let i = 0; i + ANCHOR_WORDS <= w.length; i++) {
    const slice = w.slice(i, i + ANCHOR_WORDS);
    if (slice.some(x => x.length < MIN_WORD)) continue;
    const g = slice.join(' ');
    let list = grams.get(g);
    if (!list) grams.set(g, list = []);
    if (list.length < 4) list.push(v);
  }
}

// --- Walk every paragraph of every lesson ----------------------------------

const runs = [];
for (let id = 1; id <= 56; id++) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) continue;
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const body = lesson.arabicBody || lesson.arabicText;
  if (!body) continue;

  paragraphsOf(body).forEach((para, paraIndex) => {
    const bracketed = bracketMask(para);
    const words = [];
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(para))) {
      if (bracketed[m.index]) continue;
      words.push({ raw: m[0], at: m.index, n: normalizeAr(m[0]) });
    }

    for (let i = 0; i + ANCHOR_WORDS <= words.length; i++) {
      const slice = words.slice(i, i + ANCHOR_WORDS);
      if (slice.some(w => w.n.length < MIN_WORD)) continue;
      const hits = grams.get(slice.map(w => w.n).join(' '));
      if (!hits || hits.length !== 1) continue;
      runs.push({
        lesson: id,
        paraIndex,
        verse: verses[hits[0]].key,
        anchor: slice.map(w => w.raw).join(' '),
        at: slice[0].at,
      });
      i += ANCHOR_WORDS - 1;             // do not re-anchor inside the same run
    }
  });
}

// --- What is new ------------------------------------------------------------

const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
const heldByLesson = new Map();
const heldAnywhere = new Set();
for (const l of Object.keys(index)) {
  const set = new Set((index[l] || []).map(e => e.verse));
  heldByLesson.set(Number(l), set);
  for (const v of set) heldAnywhere.add(v);
}

// One entry per (lesson, verse): the first place in the lesson the quotation
// appears is where the jump should land.
const additions = [];
const seen = new Set();
for (const r of runs) {
  const key = `${r.lesson}|${r.verse}`;
  if (seen.has(key)) continue;
  if ((heldByLesson.get(r.lesson) || new Set()).has(r.verse)) continue;
  seen.add(key);
  additions.push(r);
}

const freshVerses = new Set(additions.map(r => r.verse).filter(v => !heldAnywhere.has(v)));

console.log(`${runs.length} unbracketed runs (${ANCHOR_WORDS} words, unique in the muṣḥaf)`);
console.log(`${new Set(runs.map(r => r.verse)).size} distinct āyāt identified`);
console.log(`${additions.length} index entries to add across ${new Set(additions.map(r => r.lesson)).size} lessons`);
console.log(`${freshVerses.size} āyāt the index does not hold anywhere today`);
console.log(`index today: ${heldAnywhere.size} āyāt -> after: ${heldAnywhere.size + freshVerses.size}`);
console.log('');
for (const r of additions.slice(0, 10)) {
  console.log(`  L${r.lesson} ¶${r.paraIndex}  Q ${r.verse}  ${r.anchor}`);
}

fs.mkdirSync(path.dirname(RUNS_FILE), { recursive: true });
fs.writeFileSync(RUNS_FILE, JSON.stringify(runs, null, 2), 'utf8');
console.log(`\nWrote ${path.relative(ROOT, RUNS_FILE)} (every run, for checking)`);

if (!WRITE) {
  console.log('Report only. Re-run with --write to merge into the index.');
  process.exit(0);
}

for (const r of additions) {
  const key = String(r.lesson);
  if (!index[key]) index[key] = [];
  index[key].push({
    verse: r.verse,
    paraIndex: r.paraIndex,
    uncertain: true,
    // Not the compiler's bracket. This project read the quotation off a
    // five-word run unique in the muṣḥaf, and the page has to say so.
    inferred: true,
  });
}
for (const key of Object.keys(index)) {
  index[key].sort((a, b) => a.paraIndex - b.paraIndex);
}
fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`Merged ${additions.length} entries into ${path.relative(ROOT, INDEX_FILE)}`);
