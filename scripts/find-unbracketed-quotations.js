#!/usr/bin/env node
/**
 * Finds Qurʾānic quotations the compiler did not bracket, and repairs OCR
 * damage inside them on the same warrant as the bracketed ones.
 *
 * WHY
 *
 * Every repair so far stops at ( ) and « », on the principle that inside them
 * the Qurʾān is the authority and outside them the words are Niasse's. That
 * rule is right about who may be overruled and wrong about where the brackets
 * fall. The prose worksheet made it visible: Lesson 3 carries
 *
 *     أخذ على ذرية آدم يوم أَلَسْتُ بِرَبِّكُمْ فَالُواْ بَلِى
 *
 * with no parentheses anywhere in it. أَلَسْتُ بِرَبِّكُمْ ... قَالُواْ بَلَىٰ is
 * Q 7:172. The bracket rule is a proxy for where the Qurʾān speaks, and it
 * under-reaches; 1,075 of the tokens sent to the lexicon pile are of this
 * kind, waiting on a philological decision the muṣḥaf could settle outright.
 *
 * THE ANCHOR
 *
 * A run of consecutive prose words that occurs word-aligned in exactly ONE āya
 * of the 6,236, and nowhere else, is a quotation of that āya. This is the same
 * warrant the 'enclosed' tier rests on in match-verses.js: uniqueness across
 * the whole muṣḥaf, not a length ratio. ANCHOR_WORDS sets how long a run has
 * to be before uniqueness is worth believing -- four words of ordinary Arabic
 * recur; four that recur in one place only do not.
 *
 * The anchor cannot be manufactured. It is built only from words that already
 * match the āya EXACTLY, so no correction contributes to establishing it.
 *
 * THE EXTENSION
 *
 * From an anchor the quotation is grown outward one word at a time, matching
 * each against the āya's next word. A word that matches exactly extends the
 * run for free. A word differing in exactly one character is the OCR damage
 * this is looking for: it is repaired, and only then extends the run. Two
 * differences, a length change, or the end of the āya stops the growth.
 *
 * FLANKED ON BOTH SIDES, OR NOT AT ALL
 *
 * A repair is kept only when an exactly-matching word stands on BOTH sides of
 * it. Trailing repairs -- the ones at the point where growth stopped -- are
 * discarded, because they have the āya's authority on one side only and the
 * open question on the other.
 *
 * This is not a refinement. Without it the run grows one word past the end of
 * the quotation and rewrites the commentary that follows, and the word it
 * reaches first is the likeliest to be damaged: أي, the gloss marker this text
 * uses constantly, which differs by one letter from both أو and أن. A first
 * run of this script emended three of them into the āya.
 *
 * With the rule, every surviving repair sits between two stretches that
 * already agree with the āya word for word, and a wrongly identified verse
 * offers nothing to grow from at all. The proof is structural rather than
 * statistical, which is what it has to be here: the promote-or-revert loop in
 * repair-ocr-from-quran.js cannot help, because the matcher only ever looks
 * inside brackets.
 *
 * ONLY CONFUSIONS THIS OCR IS KNOWN TO MAKE
 *
 * Both guards above are about WHERE a repair sits. This one is about WHAT it
 * changes. Not every divergence between the prose and the āya is scribal: a
 * tafsīr quotes from memory, paraphrases, and sometimes means the variant it
 * gives. Lesson 34 writes إنكم وَمَن تعبدون for Q 21:98's إِنَّكُمْ وَمَا
 * تَعْبُدُونَ -- a real difference, whom against what, and nūn is nothing like
 * alif. Emending that is not repairing the scan; it is correcting the author.
 *
 * Inside the brackets the compiler declared the text a quotation, so the āya
 * governs whatever the divergence is. Out here the quotation is inferred, and
 * the only divergences this may touch are the ones the scan demonstrably
 * produces. The 2,156 bracketed corrections give that list directly: 39 letter
 * classes seen three times or more, headed by ف→ق 1,133, ب→ف 160, ر→ن 136,
 * ق→ف 102 -- exactly the Maghribī-against-Mashriqī dotting confusions. Classes
 * outside it are left alone, and the divergence is left to be read as what it
 * may well be, which is Niasse.
 *
 * WHAT IT STILL WILL NOT TOUCH
 *
 * Niasse's own words. A quotation is what the Qurʾān can be shown to say, and
 * the anchor is the showing. Prose that never joins a run is left exactly as
 * it is, however suspect it looks.
 *
 *   node scripts/find-unbracketed-quotations.js            # report only
 *   node scripts/find-unbracketed-quotations.js --write    # apply
 */

const fs = require('fs');
const path = require('path');

const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
const VERSE_TEXT_FILE = path.join(__dirname, '..', 'src', 'data', 'verse_text.json');
const OUT_FILE = path.join(__dirname, '..', 'translation-drafts', 'unbracketed-quotations.json');

const WRITE = process.argv.includes('--write');

/** Letter confusions proved by the bracketed repairs, and how often. Derived
 *  from the diff against BASELINE_REV so it stays true as more are made. */
const BASELINE_REV = process.env.BASELINE_REV || 'd363dc1';
/** A class needs this many proved instances before it may be applied here. */
const MIN_CLASS_EVIDENCE = 3;

/** How many consecutive exact words make a run worth believing unique. */
const ANCHOR_WORDS = 5;
/** Words shorter than this carry too little information to anchor on. */
const MIN_WORD = 2;

const TOKEN = /[ء-يٱےۓً-ْٰ]+/g;

function normalizeAr(text) {
  return text.normalize('NFC')
    .replace(/\p{Mn}/gu, '').replace(/[ۥۦ]/g, '').replace(/\p{Cf}/gu, '')
    .replace(/\[\s*\d+\s*\]/g, ' ').replace(/[۞۩]/g, '').replace(/ـ/g, '')
    .replace(/[آأإٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[ےۓ]/g, 'ي').replace(/[ؤئ]/g, 'ء')
    .replace(/[،؛؟!:"'«»()\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

// --- Which letter confusions this OCR is known to make ---------------------

const provedClasses = new Map();
{
  const { execFileSync } = require('child_process');
  for (let id = 1; id <= 56; id++) {
    const rel = `src/data/lessons/${String(id).padStart(2, '0')}.json`;
    let before;
    try {
      before = JSON.parse(execFileSync('git', ['show', `${BASELINE_REV}:${rel}`],
        { cwd: path.join(__dirname, '..'), maxBuffer: 1 << 28, encoding: 'utf8' }));
    } catch { continue; }
    const file = path.join(__dirname, '..', rel);
    if (!fs.existsSync(file)) continue;
    const a = before.arabicBody || before.arabicText || '';
    const b = JSON.parse(fs.readFileSync(file, 'utf8')).arabicBody || '';
    if (!a || a.length !== b.length) continue;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[i]) continue;
      const k = `${a[i]}→${b[i]}`;
      provedClasses.set(k, (provedClasses.get(k) || 0) + 1);
    }
  }
}
const allowedClass = new Set(
  [...provedClasses].filter(([, n]) => n >= MIN_CLASS_EVIDENCE).map(([k]) => k));
if (!allowedClass.size) {
  console.error(`No proved letter classes found at ${BASELINE_REV}. Refusing to run:`);
  console.error('without that evidence every divergence would look like OCR damage.');
  process.exit(1);
}

// --- Index the muṣḥaf by n-gram --------------------------------------------

const verseText = JSON.parse(fs.readFileSync(VERSE_TEXT_FILE, 'utf8'));
const verses = [];
for (const key of Object.keys(verseText)) {
  const ar = verseText[key] && verseText[key].ar;
  if (!ar) continue;
  verses.push({ key, words: normalizeAr(ar).split(' ').filter(Boolean) });
}

/** n-gram -> [{ verseIndex, at }]. Capped: an n-gram in many places cannot anchor. */
const grams = new Map();
for (let v = 0; v < verses.length; v++) {
  const w = verses[v].words;
  for (let i = 0; i + ANCHOR_WORDS <= w.length; i++) {
    const slice = w.slice(i, i + ANCHOR_WORDS);
    if (slice.some(x => x.length < MIN_WORD)) continue;
    const g = slice.join(' ');
    let list = grams.get(g);
    if (!list) grams.set(g, list = []);
    if (list.length < 4) list.push({ v, at: i });
  }
}

// --- Walk each lesson's prose ----------------------------------------------

function proseMask(body) {
  // true where the character sits inside ( ) or « » -- already handled.
  const mask = new Uint8Array(body.length);
  const re = /\(([^()]{2,400})\)|«([^»]{2,400})»/g;
  let m;
  while ((m = re.exec(body))) for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = 1;
  return mask;
}

/** Exactly one differing character, same length? */
function singleCharDiff(a, b) {
  if (a.length !== b.length || a === b) return -1;
  let at = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (at !== -1) return -1;
    at = i;
  }
  return at;
}

const findings = [];
const allRuns = [];
let totalRepairs = 0, totalRuns = 0;
const classTally = {};

for (let id = 1; id <= 56; id++) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) continue;
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const body = lesson.arabicBody || lesson.arabicText;
  if (!body) continue;

  const bracketed = proseMask(body);
  const words = [];
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(body))) {
    if (bracketed[m.index]) continue;              // inside a bracket already
    words.push({ raw: m[0], at: m.index, n: normalizeAr(m[0]) });
  }

  let i = 0;
  while (i + ANCHOR_WORDS <= words.length) {
    const slice = words.slice(i, i + ANCHOR_WORDS);
    if (slice.some(w => w.n.length < MIN_WORD)) { i++; continue; }
    const hits = grams.get(slice.map(w => w.n).join(' '));
    if (!hits || hits.length !== 1) { i++; continue; }   // absent, or not unique

    const { v, at } = hits[0];
    const verse = verses[v];
    const repairs = [];

    // Grow right: one word at a time, repairing single-character damage.
    // pending holds repairs not yet flanked by an exact word on the far side.
    let wi = i + ANCHOR_WORDS, vi = at + ANCHOR_WORDS;
    let pending = [];
    while (wi < words.length && vi < verse.words.length) {
      const w = words[wi], t = verse.words[vi];
      if (w.n === t) {                      // an exact word closes the pending set
        repairs.push(...pending);
        pending = [];
        wi++; vi++; continue;
      }
      const d = singleCharDiff(w.n, t);
      if (d < 0) break;
      const r = locate(w, d, t[d]);
      if (!r) break;
      pending.push(r);
      wi++; vi++;
    }
    wi -= pending.length;                   // trailing repairs are not part of the run
    pending = [];

    // Grow left the same way.
    let wj = i - 1, vj = at - 1;
    while (wj >= 0 && vj >= 0) {
      const w = words[wj], t = verse.words[vj];
      if (w.n === t) {
        repairs.push(...pending);
        pending = [];
        wj--; vj--; continue;
      }
      const d = singleCharDiff(w.n, t);
      if (d < 0) break;
      const r = locate(w, d, t[d]);
      if (!r) break;
      pending.push(r);
      wj--; vj--;
    }
    wj += pending.length;

    totalRuns++;
    allRuns.push({ lesson: id, verse: verse.key, words: wi - wj - 1 });
    if (repairs.length) {
      for (const r of repairs) {
        const k = `${r.from}→${r.to}`;
        classTally[k] = (classTally[k] || 0) + 1;
      }
      totalRepairs += repairs.length;
      findings.push({
        lesson: id, verse: verse.key,
        runWords: wi - wj - 1,
        quoted: words.slice(wj + 1, wi).map(w => w.raw).join(' ').slice(0, 200),
        aya: verse.words.slice(Math.max(0, vj + 1), vi).join(' ').slice(0, 200),
        repairs: repairs.map(r => ({ index: r.index, from: r.from, to: r.to, word: r.word })),
      });
    }
    i = wi;                                        // do not re-scan inside the run
  }
}

/** Map a normalised character position back onto the raw, vocalised token. */
function locate(word, normIndex, to) {
  const raw = word.raw;
  let seen = -1;
  for (let c = 0; c < raw.length; c++) {
    if (normalizeAr(raw[c]) === '') continue;
    seen++;
    if (seen !== normIndex) continue;
    if (!allowedClass.has(`${raw[c]}→${to}`)) return null;   // not a confusion this scan makes
    return { index: word.at + c, from: raw[c], to, word: raw };
  }
  return null;
}

// --- Report -----------------------------------------------------------------

const classes = Object.entries(classTally).sort((a, b) => b[1] - a[1]);
const lessons = new Set(findings.map(f => f.lesson));
console.log(`${allowedClass.size} letter classes proved by the bracketed repairs (>=${MIN_CLASS_EVIDENCE} each); only these may be applied`);
console.log(`${totalRuns} unbracketed quotations found (${ANCHOR_WORDS}+ words, unique in the muṣḥaf)`);
console.log(`${totalRepairs} repairs inside them, across ${lessons.size} lessons`);
console.log(`  ${classes.length} letter classes; commonest: ${classes.slice(0, 10).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log('');
for (const f of findings.slice(0, 12)) {
  console.log(`  L${f.lesson}  Q ${f.verse}  ${f.repairs.length} repair(s): ${f.repairs.map(r => r.from + '→' + r.to).join(' ')}`);
  console.log(`     text: ${f.quoted.slice(0, 110)}`);
  console.log(`     āya : ${f.aya.slice(0, 110)}`);
}

{
  const idxFile = path.join(__dirname, '..', 'src', 'data', 'verseIndexAuto.json');
  const known = new Set();
  if (fs.existsSync(idxFile)) {
    const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
    for (const l of Object.keys(idx)) for (const e of idx[l] || []) known.add(e.key || e.verse || e);
  }
  const found = new Set(allRuns.map(r => r.verse));
  const fresh = [...found].filter(v => !known.has(v));
  console.log(`\nThese runs identify ${found.size} distinct āyāt, ${fresh.length} of which the`);
  console.log(`verse index does not currently hold -- the matcher only ever reads bracketed spans,`);
  console.log(`so every one of these quotations is invisible to the site today.`);
  fs.writeFileSync(path.join(__dirname, '..', 'translation-drafts', 'unbracketed-runs.json'),
    JSON.stringify(allRuns, null, 2), 'utf8');
}

fs.writeFileSync(OUT_FILE, JSON.stringify(findings, null, 2), 'utf8');
console.log(`\nWrote ${path.relative(process.cwd(), OUT_FILE)}`);

if (!WRITE) {
  console.log('\nReport only. Re-run with --write to apply.');
  process.exit(0);
}

// --- Apply ------------------------------------------------------------------

let applied = 0;
for (const id of [...lessons].sort((a, b) => a - b)) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const field = lesson.arabicBody ? 'arabicBody' : 'arabicText';
  const chars = [...lesson[field]];
  let n = 0;
  for (const f of findings.filter(x => x.lesson === id)) {
    for (const r of f.repairs) {
      if (chars[r.index] !== r.from) continue;     // moved under us; refuse
      chars[r.index] = r.to;
      n++;
    }
  }
  if (!n) continue;
  const out = chars.join('');
  if (out.length !== lesson[field].length) throw new Error(`lesson ${id}: length changed`);
  lesson[field] = out;
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + '\n', 'utf8');
  applied += n;
  console.log(`  L${id}: ${n}`);
}
console.log(`\nApplied ${applied} repairs in unbracketed quotations. Now re-run:`);
console.log('  node scripts/match-verses.js && python3 scripts/build-lesson-ranges.py && node scripts/build-verse-citations.js');
