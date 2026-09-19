// A paraIndex that points past the end of its lesson is a citation to a
// paragraph that does not exist. The reader sees a verse-jump button that
// silently does nothing, and src/lib/corpus.ts emits a locus for it marked
// `transcriptionStatus: 'verified'` -- the site asserting it has checked a
// passage it cannot show. Neither build-verse-citations.js nor
// add-editorial-verse-index.js prunes, so these accumulate: nine lessons
// carried one before the volume back matter was ever cut.
//
// Indices count the poem-filtered array, the same one BilingualText renders.
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..', 'src', 'data');
const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BAS = /^(أعوذ بالله|بسم الله|اللهم صل)/;

const count = id => JSON.parse(fs.readFileSync(path.join(D, 'lessons', String(id).padStart(2, '0') + '.json'), 'utf8'))
  .arabicBody.replace(/<[^>]+>/g, '').split('\n')
  .filter(p => p.trim()).filter(p => { const s = p.trim(); return !(POEM.test(s) || BAS.test(s)); }).length;

const n = {};
for (let i = 1; i <= 56; i++) n[i] = count(i);
const write = process.argv.includes('--write');
let dropped = 0;

const idx = JSON.parse(fs.readFileSync(path.join(D, 'verseIndexAuto.json'), 'utf8'));
for (const L of Object.keys(idx)) {
  const before = idx[L].length;
  idx[L] = idx[L].filter(e => {
    if (e.paraIndex < n[L]) return true;
    console.log(`  verseIndexAuto L${L} ¶${e.paraIndex} -> ${e.verse} (body has ${n[L]})`);
    return false;
  });
  dropped += before - idx[L].length;
}
const cit = JSON.parse(fs.readFileSync(path.join(D, 'verseCitations.json'), 'utf8'));
for (const L of Object.keys(cit)) {
  for (const p of Object.keys(cit[L])) {
    if (+p >= n[L]) { console.log(`  verseCitations L${L} ¶${p} (body has ${n[L]})`); delete cit[L][p]; dropped++; }
  }
}
console.log(`${dropped} stale entr${dropped === 1 ? 'y' : 'ies'}`);
if (write) {
  fs.writeFileSync(path.join(D, 'verseIndexAuto.json'), JSON.stringify(idx, null, 2) + '\n');
  fs.writeFileSync(path.join(D, 'verseCitations.json'), JSON.stringify(cit) + '\n');
  console.log('written');
}
