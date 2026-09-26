#!/usr/bin/env node
/**
 * What are the 2,989 unplaced spans?
 *
 * build-citation-status.js marks a bracketed span `unplaced` when it runs to
 * four words or more and the matcher could not find it in the muṣḥaf. The
 * worklist has been treating that number as a backlog of Qurʾānic quotations
 * waiting on a better matcher. This asks whether it is one.
 *
 * For each unplaced span, find the āya that shares the most words with it and
 * report how close the two are. A span that is 90% of an āya is OCR damage a
 * looser rule could reach. A span that shares a third of its words with its
 * best candidate is not a quotation of it at all -- it is ḥadīth, or poetry,
 * or Niasse's own prose inside ordinary brackets.
 *
 * Reads only. Writes translation-drafts/unplaced-span-audit.json.
 *
 *   node scripts/audit-unplaced-spans.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// Same folding as the matcher: strip the vowels and marks, level the alif
// seats, alif maqṣūra and tāʾ marbūṭa, drop everything that is not a letter.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭٖ-ٗٞ]/g;
const fold = s => (s || '')
  .normalize('NFC')
  .replace(MARKS, '')
  .replace(/[آأإٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^ء-ي ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const words = s => fold(s).split(' ').filter(Boolean);

const verseText = R('src/data/verse_text.json');
const verses = [];
for (const key of Object.keys(verseText)) {
  const w = words(typeof verseText[key] === 'string' ? verseText[key] : verseText[key].ar);
  if (w.length) verses.push({ key, w, set: new Set(w) });
}

// Index by word so a span is only scored against āyāt that share something
// with it. Words in more than 400 āyāt are too common to narrow anything.
const byWord = new Map();
for (let i = 0; i < verses.length; i++) {
  for (const w of verses[i].set) {
    if (!byWord.has(w)) byWord.set(w, []);
    byWord.get(w).push(i);
  }
}
const COMMON = 400;

function best(spanWords) {
  const seen = new Map();
  for (const w of new Set(spanWords)) {
    const rows = byWord.get(w);
    if (!rows || rows.length > COMMON) continue;
    for (const i of rows) seen.set(i, (seen.get(i) || 0) + 1);
  }
  let top = null;
  for (const [i, shared] of seen) {
    const v = verses[i];
    // Share of the span's own words that stand in this āya, which is what
    // matters: a short span inside a long āya is still a quotation of it.
    const covered = spanWords.filter(w => v.set.has(w)).length / spanWords.length;
    if (!top || covered > top.covered || (covered === top.covered && shared > top.shared)) {
      top = { key: v.key, covered, shared, ayaWords: v.w.length };
    }
  }
  return top;
}

const status = R('src/data/verseCitationStatus.json');
const report = require(path.join(ROOT, 'translation-drafts/verse-match-report.json'));

const rows = [];
for (const lesson of Object.keys(status)) {
  const spans = (report[lesson] || {}).spans || [];
  const byKey = new Map(spans.map(s => [`${s.paraIndex}:${s.spanIndex}`, s]));
  for (const para of Object.keys(status[lesson])) {
    for (const span of Object.keys(status[lesson][para])) {
      const v = status[lesson][para][span];
      const state = typeof v === 'object' ? v.status : v;
      if (state !== 'unplaced') continue;
      const src = byKey.get(`${para}:${span}`);
      if (!src) continue;
      const w = words(src.text);
      if (!w.length) continue;
      const top = best(w);
      rows.push({
        lesson: Number(lesson), para: Number(para), span: Number(span),
        length: w.length,
        text: src.text,
        bestAya: top ? top.key : null,
        covered: top ? Number(top.covered.toFixed(2)) : 0,
      });
    }
  }
}

const bucket = { 'near-certain (>=0.9)': 0, 'likely (0.75-0.9)': 0, 'partial (0.5-0.75)': 0, 'weak (<0.5)': 0 };
for (const r of rows) {
  if (r.covered >= 0.9) bucket['near-certain (>=0.9)']++;
  else if (r.covered >= 0.75) bucket['likely (0.75-0.9)']++;
  else if (r.covered >= 0.5) bucket['partial (0.5-0.75)']++;
  else bucket['weak (<0.5)']++;
}

const byLength = {};
for (const r of rows) {
  const k = r.length >= 12 ? '12+' : r.length >= 8 ? '8-11' : r.length >= 6 ? '6-7' : '4-5';
  byLength[k] = byLength[k] || { n: 0, nearCertain: 0 };
  byLength[k].n++;
  if (r.covered >= 0.9) byLength[k].nearCertain++;
}

console.log(`unplaced spans scored: ${rows.length}`);
console.log(bucket);
console.log('by span length:', byLength);
console.log('\nsamples at each level:');
for (const [lo, hi] of [[0.9, 1.01], [0.75, 0.9], [0.5, 0.75], [0, 0.5]]) {
  const s = rows.filter(r => r.covered >= lo && r.covered < hi).slice(0, 2);
  for (const r of s) console.log(`  ${r.covered}  L${r.lesson} ¶${r.para}.${r.span}  ->  ${r.bestAya}  ${r.text.slice(0, 60)}`);
}

fs.writeFileSync(path.join(ROOT, 'translation-drafts/unplaced-span-audit.json'),
  JSON.stringify({ generated: new Date().toISOString().slice(0, 10), bucket, byLength, rows }, null, 1));
console.log('\nwrote translation-drafts/unplaced-span-audit.json');
