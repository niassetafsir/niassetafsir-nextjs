// public/data/term_concordance.json points at paragraphs by index, and this
// week's body work — Lesson 56 lifted out of Lesson 55, the volume back matter,
// 47 running heads, four double-scanned pages — moved most of those indices.
// 67 of its 873 loci now point past the end of their lesson, and more point at
// the wrong paragraph without being out of range.
//
// Nothing needs deleting. Every occurrence carries a `context` string: the text
// it was recorded against. So each one can be FOUND again and its index reset —
// the locus is recovered rather than dropped.
//
// No generator for this file exists in the repo, so it is edited in place. The
// context strings are left untouched; only paraIndex moves.
//
//   node scripts/reanchor-term-concordance.js          # dry run
//   node scripts/reanchor-term-concordance.js --write
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..');
const FILE = path.join(D, 'public', 'data', 'term_concordance.json');

const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BAS = /^(أعوذ بالله|بسم الله|اللهم صل)/;
const paras = id => JSON.parse(fs.readFileSync(path.join(D, 'src/data/lessons', String(id).padStart(2, '0') + '.json'), 'utf8'))
  .arabicBody.replace(/<[^>]+>/g, '').split('\n')
  .filter(p => p.trim()).filter(p => { const s = p.trim(); return !(POEM.test(s) || BAS.test(s)); });

const N = s => (s || '').normalize('NFD').replace(/[ؐ-؟ً-ٟۖ-ٰۭ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();

// Every lesson's paragraphs, normalised once, for the cross-lesson pass.
const CORPUS = [];
for (let id = 1; id <= 56; id++) {
  try { paras(id).forEach((x, i) => CORPUS.push({ lessonId: id, paraIndex: i, text: N(x) })); }
  catch { /* a lesson file that is not there is not an error here */ }
}

/** The one paragraph in the whole corpus that holds this context, or null. */
function searchCorpus(key, form) {
  const uniq = rows => (rows.length === 1 ? rows[0] : null);
  const exact = uniq(CORPUS.filter(r => r.text.includes(key)));
  if (exact && (!form || exact.text.includes(form))) return exact;
  const w = key.split(' ').filter(x => x.length > 3);
  for (let len = Math.min(7, w.length); len >= 5; len--) {
    for (let st = 0; st + len <= w.length; st++) {
      const run = w.slice(st, st + len).join(' ');
      const hit = uniq(CORPUS.filter(r => r.text.includes(run)));
      if (hit && (!form || hit.text.includes(form))) return hit;
    }
  }
  return null;
}

const T = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const cache = {};
let total = 0, already = 0, moved = 0, lost = 0, relocated = 0;
const losses = [];

for (const term of T) {
  for (const occ of term.occurrences || []) {
    if (typeof occ.paraIndex !== 'number' || !occ.lessonId) continue;
    total++;
    const p = cache[occ.lessonId] || (cache[occ.lessonId] = paras(occ.lessonId));
    const key = N(occ.context).slice(0, 70);
    if (key.length < 25) { already++; continue; }          // too short to relocate on

    // Exact context first. Every one of these matches in exactly ONE paragraph
    // — checked across the whole file, zero ambiguous cases — so when it hits,
    // it is the paragraph, not a guess.
    let hits = [];
    p.forEach((x, i) => { if (N(x).includes(key)) hits.push(i); });

    // Failing that, the longest run of distinctive words from the context that
    // still occurs exactly once. The text has had OCR repairs since this file
    // was built (August), so a context can differ from the body by a letter or
    // two and still be locatable by the words around the damage.
    if (hits.length !== 1) {
      const w = key.split(' ').filter(x => x.length > 3);
      for (let len = Math.min(6, w.length); len >= 4 && hits.length !== 1; len--) {
        for (let st = 0; st + len <= w.length && hits.length !== 1; st++) {
          const run = w.slice(st, st + len).join(' ');
          const h = []; p.forEach((x, i) => { if (N(x).includes(run)) h.push(i); });
          if (h.length === 1) hits = h;
        }
      }
    }

    // A run of four ordinary words can be a formula rather than the passage.
    // "ja'alana llahu wa-iyyakum minhum" -- may God place us and you among
    // them -- is said over any blessing, and matching it anchored a locus
    // about the soul being taken (qabd ruhihi) to a paragraph about guidance
    // to the Garden, where the word ruh does not appear at all. So a candidate
    // paragraph must also contain the term form this occurrence was recorded
    // against. If it does not, the match is a coincidence of phrasing.
    if (hits.length === 1) {
      const form = N(occ.matchedForm || term.arabic || '');
      if (form && !N(p[hits[0]]).includes(form)) hits = [];
    }

    // Still nothing in this lesson. The body work moved whole passages between
    // lessons -- Lesson 56 was lifted out of 55 -- so look across the corpus
    // before giving up, and move the lesson id too when the text is found.
    if (hits.length !== 1) {
      const found = searchCorpus(key, N(occ.matchedForm || term.arabic || ''));
      if (found) {
        delete occ.anchorLost;
        if (found.lessonId !== occ.lessonId) { occ.lessonId = found.lessonId; relocated++; }
        if (found.paraIndex !== occ.paraIndex) { occ.paraIndex = found.paraIndex; moved++; }
        else already++;
        continue;
      }
    }

    if (hits.length !== 1) {
      // Not findable. Say so in the data rather than leave an index that points
      // at whatever paragraph now happens to sit there. Clamped so nothing
      // points past the end of the lesson.
      lost++; losses.push([term.term, occ.lessonId, occ.paraIndex]);
      occ.anchorLost = true;
      if (occ.paraIndex >= p.length) occ.paraIndex = p.length - 1;
      continue;
    }
    delete occ.anchorLost;
    if (hits[0] === occ.paraIndex) { already++; continue; }
    moved++;
    occ.paraIndex = hits[0];
  }
}
console.log(`${total} loci · ${already} already right · ${moved} re-anchored · ${relocated} moved to another lesson · ${lost} context not found`);
for (const [t, L, i] of losses.slice(0, 8)) console.log(`    lost: ${t}  L${L} ¶${i}`);
if (process.argv.includes('--write')) {
  fs.writeFileSync(FILE, JSON.stringify(T, null, 2) + '\n');
  console.log('written');
}
