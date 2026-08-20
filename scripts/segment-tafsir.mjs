#!/usr/bin/env node
/**
 * segment-tafsir.mjs — turn a continuous Arabic tafsīr text for one sūra into
 * the `[s:v]`-marked format that src/data/jalalaynArabic/ and
 * src/data/ruhAlBayanArabic/ use.
 *
 *   node scripts/segment-tafsir.mjs --surah 2 --in raw-baqara.txt --out src/data/jalalaynArabic/02.txt
 *
 * WHY THIS EXISTS. Fetching a tafsīr text is the easy half. The hard half is
 * deciding where one verse's gloss ends and the next begins, and doing that by
 * hand across 286 verses is where silent errors enter a critical edition.
 *
 * Both Jalālayn and Rūḥ al-Bayān open each verse's gloss by quoting the āya --
 * Jalālayn in {curly braces}, Rūḥ al-Bayān usually as a bare opening lemma. So
 * the boundaries can be found by matching those quotations against the actual
 * Qurʾānic text, which this repo already holds in src/data/verse_text.json
 * (6,236 āyāt). Matching is done on a normalised form -- tashkīl stripped,
 * alef/yāʾ/tāʾ-marbūṭa variants folded -- because editions differ in
 * orthography even where the consonantal skeleton is identical.
 *
 * WHAT IT WILL NOT DO. It never invents text, never reorders, never repairs.
 * Every input character ends up in exactly one output block, and the script
 * reports anything it could not place rather than guessing. Verses it cannot
 * find are listed so they can be placed by hand. Treat its output as a draft
 * to be checked against the printed edition, not as a finished file --
 * run scripts/validate-tafsir-text.mjs on it, then read it.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
const surah = parseInt(args.surah, 10);
const inFile = args.in;
const outFile = args.out;
const minLemma = parseInt(args['min-lemma'] || '8', 10);

if (!surah || !inFile) {
  console.error('usage: node scripts/segment-tafsir.mjs --surah N --in raw.txt [--out out.txt] [--min-lemma 8]');
  process.exit(2);
}

/** Fold orthographic variation so two spellings of the same words compare equal. */
function normalise(s) {
  return s
    // Superscript (dagger) alef FIRST, and to a real alef rather than to
    // nothing. src/data/verse_text.json is in Uthmānī orthography, where
    // مَٰلِك carries a dagger alef, while tafsīr editions use imlāʾī spelling
    // and write مَالِك with a full alef. Deleting it made those two forms
    // compare unequal, and al-Fātiḥa 1:4, 1:5 and 1:6 all failed to match.
    // ONLY U+0670. U+06E1 is the Uthmānī sukūn mark, not a dagger alef --
    // folding it to alef turned يَوۡمِ into يوام and broke every match.
    .replace(/\u0670/g, '\u0627')
    .replace(/[\u064b-\u0652\u0653-\u0655\u06d6-\u06ed\u0640]/g, '')  // tashkīl, tatwīl
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')      // آ أ إ ٱ -> ا
    .replace(/\u0649/g, '\u064a')                            // ى -> ي
    // Yeh barree (U+06D2, U+06D3) -> ي. The Warsh reference writes final yāʾ
    // this way in 2,072 of its 6,236 verses; the catch-all two lines below
    // would otherwise turn each one into a space and split the word in half.
    .replace(/[\u06d2\u06d3]/g, '\u064a')
    .replace(/\u0629/g, '\u0647')                            // ة -> ه
    .replace(/\u0624/g, '\u0648').replace(/\u0626/g, '\u064a') // ؤ -> و, ئ -> ي
    .replace(/[^\u0621-\u064a\s]/g, ' ')                     // drop punctuation/latin/digits
    .replace(/\s+/g, ' ')
    .trim();
}

const versesAll = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/data/verse_text.json'), 'utf8')
);
const verses = [];
for (let v = 1; ; v++) {
  const key = `${surah}:${v}`;
  if (!versesAll[key]) break;
  verses.push({ n: v, ar: versesAll[key].ar, norm: normalise(versesAll[key].ar), normLoose: '' });
}
if (!verses.length) {
  console.error(`No verses found for sūra ${surah} in src/data/verse_text.json`);
  process.exit(1);
}

for (const v of verses) v.normLoose = v.norm.replace(/\u0627/g, '');

const raw = fs.readFileSync(inFile, 'utf8');

// Candidate gloss openings: {...} quotations, plus line starts.
const candidates = [];
for (const m of raw.matchAll(/\{([^{}]{3,200})\}/g)) {
  candidates.push({ index: m.index, lemma: m[1], kind: 'brace' });
}
if (candidates.length < verses.length / 4) {
  // Few or no braces (Rūḥ al-Bayān style): treat each paragraph opening as a candidate.
  let off = 0;
  for (const line of raw.split('\n')) {
    if (line.trim()) candidates.push({ index: off, lemma: line.slice(0, 120), kind: 'line' });
    off += line.length + 1;
  }
  candidates.sort((a, b) => a.index - b.index);
}

/**
 * Alef-insensitive form, used as a fallback.
 *
 * Folding the dagger alef to a real alef fixes مَٰلِك / مَالِك but breaks
 * ٱلرَّحۡمَٰنِ / الرَّحْمَن, where the Uthmānī spelling carries the alef and the
 * imlāʾī one omits it. Since alef is exactly the letter the two orthographies
 * disagree about, dropping it from both sides makes them comparable without
 * loosening anything else.
 */
function normaliseLoose(s) {
  return normalise(s).replace(/\u0627/g, '');
}

/** Which verse does this lemma open? Requires a run of >= minLemma normalised chars. */
function matchVerse(lemma, fromVerse) {
  const nl = normalise(lemma);
  if (nl.length < minLemma) return null;

  const search = (needle, hay) => {
    const hits = [];
    for (const v of verses) {
      if (v.n < fromVerse) continue;            // segmentation is monotonic
      const h = hay(v);
      if (!h) continue;
      if (h.includes(needle)) hits.push(v.n);
      else if (needle.includes(h) && h.length >= minLemma) hits.push(v.n);
    }
    return hits;
  };

  let hits = search(nl, v => v.norm);
  if (!hits.length) hits = search(normaliseLoose(lemma), v => v.normLoose);
  return hits.length ? hits[0] : null;          // earliest candidate at or after the cursor
}

const marks = [];
let cursor = 1;
const unmatched = [];
for (const c of candidates) {
  const v = matchVerse(c.lemma, cursor);
  if (v === null) { unmatched.push(c); continue; }
  if (marks.length && marks[marks.length - 1].verse === v) continue; // same verse, later lemma
  marks.push({ index: c.index, verse: v });
  cursor = v;                                    // allow repeats of the same verse, never go back
}

if (!marks.length) {
  console.error('No verse boundaries could be identified. Check --surah and the input encoding.');
  process.exit(1);
}

// Everything before the first mark is sūra-level front matter; attach to verse 1,
// the same convention ruhAlBayanArabic/SOURCE.md already records.
const blocks = [];
for (let i = 0; i < marks.length; i++) {
  const start = i === 0 ? 0 : marks[i].index;
  const end = i + 1 < marks.length ? marks[i + 1].index : raw.length;
  blocks.push({ verse: marks[i].verse, text: raw.slice(start, end).trim() });
}

const out = blocks.map(b => `[${surah}:${b.verse}]\n${b.text}`).join('\n') + '\n';

const found = new Set(blocks.map(b => b.verse));
const missing = verses.filter(v => !found.has(v.n)).map(v => v.n);

console.log(`sūra ${surah}: ${verses.length} āyāt in verse_text.json`);
console.log(`blocks emitted        : ${blocks.length}`);
console.log(`distinct verses marked: ${found.size}`);
console.log(`input chars           : ${raw.length}`);
console.log(`output chars          : ${out.length}`);
if (missing.length) {
  console.log(`\nNOT MATCHED -- place these by hand (${missing.length}):`);
  console.log('  ' + missing.join(', '));
}
if (unmatched.length) {
  console.log(`\nlemmas that matched no āya (${unmatched.length}), first 10:`);
  for (const u of unmatched.slice(0, 10)) console.log('  ' + u.lemma.slice(0, 70).replace(/\n/g, ' '));
}
console.log('\nThis output is a DRAFT. Run scripts/validate-tafsir-text.mjs on it, then read it against the printed edition before committing.');

if (outFile) {
  fs.writeFileSync(outFile, out, 'utf8');
  console.log(`\nwritten: ${outFile}`);
} else {
  process.stdout.write('\n----- output -----\n' + out);
}
