#!/usr/bin/env node
/**
 * Applies the ق/ف repairs in Niasse's prose that the corpus has already
 * proved, and holds back the ones a lexicon has to settle.
 *
 * The worksheet (scripts/build-prose-ocr-worksheet.js) sorts suspect prose
 * tokens by whether this OCR has been caught making that exact substitution
 * inside a quotation, under Qurʾānic control. 83 forms clear three or more
 * confirmations. This applies most of them.
 *
 * NOT ALL OF THEM, AND THAT IS THE POINT
 *
 * "Proved" means the scan produces this misreading, not that every instance of
 * the damaged spelling is one. Some of the 83 are words in their own right, and
 * in Niasse's prose that may well be what they are. Those are held, with their
 * contexts, in translation-drafts/prose-ocr-hold.md -- see the table below for
 * which, and why.
 *
 * A first pass held nine. Reading the contexts settled five: four were
 * unbracketed Qurʾān throughout and are now applied, one was never a candidate
 * at all. Four remain genuinely mixed, and for those the unit of decision is
 * the instance, not the form.
 *
 * Held forms are not a defect in the bucketing. They are what it is for: 605
 * lexical decisions reduced to four that actually matter.
 *
 * SCOPE
 *
 * Prose only: text outside ( ) and « », since everything inside has been
 * repaired against the āya already. Word-bounded, so a damaged form cannot be
 * rewritten inside a longer token.
 *
 *   node scripts/apply-prose-ocr-attested.js            # report
 *   node scripts/apply-prose-ocr-attested.js --write    # apply
 */

const fs = require('fs');
const path = require('path');

const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
const WORKSHEET = path.join(__dirname, '..', 'translation-drafts', 'prose-ocr-worksheet.json');
const HOLD_MD = path.join(__dirname, '..', 'translation-drafts', 'prose-ocr-hold.md');

const WRITE = process.argv.includes('--write');

/**
 * Forms held back from the attested bucket, and why.
 *
 * The first pass held nine. Reading their contexts settled five of them, which
 * is the point AK made and the method the buckets were built to serve: a
 * lexical decision is made in the clause, not in a frequency table.
 *
 * REJECTED OUTRIGHT -- never apply, in any pass:
 *
 *   الفي   Not القي at all. Every one of the seven is أَلْفَيْ, "two thousand" --
 *          two thousand miracles, two thousand robes a year, a distance of two
 *          thousand years. The proposal was simply wrong.
 *
 * STILL HELD -- genuinely mixed, so each instance needs deciding, not the form:
 *
 *   قلما   Q 6:44 فَلَمَّا نَسُوا and Q 6:76 فَلَمَّا جَنَّ عَلَيْهِ اِ۬لَّيْلُ are OCR.
 *          But Lesson 13's صاحب القلم سمي قلما is the Pen.
 *   حفت    Lessons 24 and 29 are Qurʾānic -- Niasse glosses the word وجبت, so
 *          he reads حَقَّتْ. Lesson 4's سحابة حفت المدينة is a cloud encircling
 *          the city: ḥaffat, and the false positive that started all of this.
 *   خلفت   Q 38:75 لِمَا خَلَقْتُ بِيَدَيَّ and Q 17:61 لِمَنْ خَلَقْتَ طِيناً are OCR.
 *          Lesson 26 is Abū Bakr's testament, "I have left ʿUmar among you".
 *   خلفا   Both of Lesson 30's are Q 17:49 and 17:51, خَلْقاً جَدِيداً. Lesson 7
 *          glosses faḍl as رزقا خلفا منه, provision as a replacement.
 *
 * RELEASED this pass -- every occurrence turned out to be unbracketed Qurʾān:
 *
 *   قلا    Q 75:31 فَلَا صَدَّقَ وَلَا صَلَّىٰ · Q 2:150 فَلَا تَخْشَوْهُمْ
 *   فوه    Q 11:80 لَوْ أَنَّ لِي بِكُمْ قُوَّةً · Q 18:39 لَا قُوَّةَ إِلَّا بِاللَّهِ
 *   فوم    Q 7:109 اَ۬لْمَلَؤُاْ مِن قَوْمِ فِرْعَوْنَ · حَرْثَ قَوْمٍ
 *   قمن    Q 2:173 فَمَنِ اُ۬ضْطُرَّ · Q 28:27 فَمِنْ عِندِكَ
 *
 * That they were unbracketed is not incidental. 37.9% of unbracketed
 * quotations fall outside their lesson's declared range against 1.7% of
 * bracketed ones, so the prose is exactly where Niasse's cross-Qurʾānic
 * reaching lives -- and exactly where the bracket rule could not follow him.
 */
const REJECT = new Map([
  ['الفي', 'أَلْفَيْ, "two thousand" — the proposal was wrong'],
]);

const HOLD = new Map([
  ['قلما', 'qallamā "rarely" / al-qalam the Pen, against Q 6:44, 6:76 فَلَمَّا'],
  ['حفت', 'ḥaffat "it encircled" against Q 10:33 حَقَّتْ — mixed, L4 vs L24/L29'],
  ['خلفت', 'khallaftu "I left behind" against Q 38:75 خَلَقْتُ — mixed, L26 vs L29/L30'],
  ['خلفا', 'khalafan "a replacement" against Q 17:49 خَلْقاً — mixed, L7 vs L30'],
]);

const TOKEN = /[ء-يٱےۓً-ْٰ]+/g;
const LETTER = /[ء-يٱےۓً-ْٰ]/;

function normalizeAr(text) {
  return text.normalize('NFC')
    .replace(/\p{Mn}/gu, '').replace(/[ۥۦ]/g, '').replace(/\p{Cf}/gu, '')
    .replace(/ـ/g, '').replace(/[آأإٱ]/g, 'ا').replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي').replace(/[ےۓ]/g, 'ي').replace(/[ؤئ]/g, 'ء').trim();
}

const worksheet = JSON.parse(fs.readFileSync(WORKSHEET, 'utf8'));
const apply = new Map();   // normalised damaged -> normalised proposed
const held = [];
for (const r of worksheet.attested) {
  if (REJECT.has(r.damaged) || HOLD.has(r.damaged)) { held.push(r); continue; }
  apply.set(r.damaged, r.proposed);
}

console.log(`${worksheet.attested.length} attested forms: applying ${apply.size}, holding ${held.length}`);

// --- Walk the prose ---------------------------------------------------------
//
// Substitution is done on the raw, vocalised token: normalise it, look up the
// proposal, and find which raw character carries the differing letter. The
// ḥarakāt of the transcription are left exactly as they are.

function proseSpans(body) {
  const inside = new Uint8Array(body.length);
  const re = /\(([^()]{2,400})\)|«([^»]{2,400})»/g;
  let m;
  while ((m = re.exec(body))) for (let i = m.index; i < m.index + m[0].length; i++) inside[i] = 1;
  return inside;
}

function diffAt(a, b) {
  if (a.length !== b.length) return -1;
  let at = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (at !== -1) return -1;
    at = i;
  }
  return at;
}

const edits = [];   // { lesson, index, from, to, word }
for (let id = 1; id <= 56; id++) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) continue;
  const body = (JSON.parse(fs.readFileSync(file, 'utf8')).arabicBody) || '';
  if (!body) continue;
  const inside = proseSpans(body);

  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(body))) {
    if (inside[m.index]) continue;
    const raw = m[0];
    const n = normalizeAr(raw);
    const proposed = apply.get(n);
    if (!proposed) continue;
    const d = diffAt(n, proposed);
    if (d < 0) continue;

    let seen = -1, rawPos = -1;
    for (let c = 0; c < raw.length; c++) {
      if (normalizeAr(raw[c]) === '') continue;
      seen++;
      if (seen === d) { rawPos = c; break; }
    }
    if (rawPos < 0) continue;
    edits.push({ lesson: id, index: m.index + rawPos, from: raw[rawPos], to: proposed[d], word: raw });
  }
}

const classes = {};
for (const e of edits) classes[`${e.from}→${e.to}`] = (classes[`${e.from}→${e.to}`] || 0) + 1;
const lessons = new Set(edits.map(e => e.lesson));
console.log(`${edits.length} substitutions in ${lessons.size} lessons`);
console.log(`  ${Object.entries(classes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

// --- The hold list, for AK --------------------------------------------------

const md = ['# Held for a lexical decision', ''];
md.push('These nine forms cleared the evidence bar — this OCR is proved to produce each of them —');
md.push('**and** each is ordinary Arabic in its own right, which in Niasse\'s prose is very likely');
md.push('what it is. Frequency cannot separate the two readings and neither can the Qurʾān.');
md.push('');
md.push('Everything else in the attested bucket has been applied.');
md.push('');
md.push('| form | proposed | in prose | proved | why it is held |');
md.push('|---|---|---|---|---|');
for (const r of held) {
  md.push(`| ${r.damaged} | ${r.proposed} | ${r.proseHits} | ${r.provedInQuotations}× | ${REJECT.has(r.damaged) ? '**REJECTED** — ' + REJECT.get(r.damaged) : HOLD.get(r.damaged)} |`);
}
md.push('');
for (const r of held) {
  md.push(`## ${r.damaged} → ${r.proposed}`);
  md.push('');
  md.push(`*${REJECT.get(r.damaged) || HOLD.get(r.damaged)}* · ${r.proseHits}× in prose · the scan is proved to produce this form ${r.provedInQuotations}×`);
  md.push('');
  for (const c of r.contexts) md.push(`- **L${c.lesson}** — ${c.text}`);
  md.push('');
}
fs.writeFileSync(HOLD_MD, md.join('\n'), 'utf8');
console.log(`\nHeld ${held.length} forms (${held.reduce((s, r) => s + r.proseHits, 0)} occurrences) -> ${path.relative(process.cwd(), HOLD_MD)}`);

if (!WRITE) {
  console.log('\nReport only. Re-run with --write to apply.');
  process.exit(0);
}

for (const id of [...lessons].sort((a, b) => a - b)) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const chars = [...lesson.arabicBody];
  let n = 0;
  for (const e of edits.filter(x => x.lesson === id)) {
    if (chars[e.index] !== e.from) continue;
    chars[e.index] = e.to;
    n++;
  }
  const out = chars.join('');
  if (out.length !== lesson.arabicBody.length) throw new Error(`lesson ${id}: length changed`);
  lesson.arabicBody = out;
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + '\n', 'utf8');
  console.log(`  L${id}: ${n}`);
}
console.log(`\nApplied ${edits.length}.`);
