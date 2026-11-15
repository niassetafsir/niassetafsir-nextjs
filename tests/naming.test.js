// Naming policy (AK, 15 Nov 2026): on the site Shaykh Ibrāhīm is never bare
// "Niasse" -- reader-facing text says "Shaykh Ibrāhīm" or "Shaykh Ibrāhīm
// Niasse". Other members of the family keep their names (Maryam Niasse, Abū
// Bakr Niasse, ...). scripts/name-policy.py rewrites data files to this rule;
// this test fails if a bare "Niasse" comes back into the data the pages print.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DATA = [
  'src/data/corpus.json',
  'src/data/sourceComparison.json',
  'src/data/glossary.json',
  'src/data/glossary_graph.json',
  'src/data/editorNotes.json',
  'src/data/verseTranslation.json',
];
const KEEP_BEFORE = /(Ibr[āa]h[īi]m|Ibrahim|Ibra|Maryam|ʿUthmān|ʿUmar|Bakr|Allāh|Khalīfa|Muḥammad|Aḥmad|Ḥājj|Hādī|ʿĀqib|Mā|b\.|bint|ibn|Baye|Serigne|Sërin|Seydi|Mamadou|Shaykh|Sheikh)[\s ]*$/;

function bare(text) {
  const hits = [];
  const re = /Niass[eé](?![\w_])/g;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 30), m.index);
    if (KEEP_BEFORE.test(before) || /[\w/_.-]$/.test(before)) continue;
    if (/^\s*,\s*Ibr/.test(text.slice(m.index + m[0].length))) continue;
    hits.push(text.slice(Math.max(0, m.index - 40), m.index + 20));
  }
  return hits;
}

for (const file of DATA) {
  test(`no bare "Niasse" in ${file}`, () => {
    const p = path.join(__dirname, '..', file);
    if (!fs.existsSync(p)) return;
    const hits = bare(fs.readFileSync(p, 'utf8'));
    assert.deepStrictEqual(hits.slice(0, 5), [], `${hits.length} bare "Niasse" — run scripts/name-policy.py ${file}`);
  });
}
