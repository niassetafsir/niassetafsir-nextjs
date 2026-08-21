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
 * the damaged spelling is one. Nine of the 83 are words in their own right,
 * and in Niasse's prose that is very likely what they are:
 *
 *     قلما   qallamā, "rarely" -- 15 occurrences, and a commentator's word
 *     قلا    qalā, "he detested" -- Q 93:3, وَمَا قَلَىٰ
 *     حفت    ḥaffat, "it encircled" -- the false positive that started this
 *     خلفت   khalafat, "she succeeded"
 *     خلفا   khalafan, "a successor" -- and Q 7:169 uses خَلْف this way
 *     فوه    fūhu, "his mouth"
 *     فوم    fūm -- Q 2:61's وَفُومِهَا
 *     قمن    qamin, "worthy of", as in قَمِنٌ بأن
 *     الفي   ambiguous: al-fayʾ, or ulfiya
 *
 * Each is also a form the scan really does produce, which is why they cleared
 * the evidence bar. Frequency cannot separate the two readings, and neither
 * can the Qurʾān; only a lexicon and the clause can. They are listed in
 * translation-drafts/prose-ocr-hold.md with their contexts.
 *
 * Held forms are not a defect in the bucketing. They are what the bucketing is
 * for -- it reduced 605 lexicon decisions to nine that actually matter.
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

/** Damaged forms that are also ordinary Arabic. Held for AK's judgement. */
const HOLD = new Map([
  ['قلما', 'qallamā, "rarely" — a commentator\'s word, and common in this text'],
  ['قلا', 'qalā, "he detested" — Q 93:3 وَمَا قَلَىٰ'],
  ['حفت', 'ḥaffat, "it encircled" — the false positive that started this'],
  ['خلفت', 'khalafat, "she succeeded / left behind"'],
  ['خلفا', 'khalafan, "a successor" — Q 7:169 uses خَلْف in just this sense'],
  ['فوه', 'fūhu, "his mouth"'],
  ['فوم', 'fūm — Q 2:61 وَفُومِهَا'],
  ['قمن', 'qamin, "worthy of", as in قَمِنٌ بأن'],
  ['الفي', 'ambiguous — al-fayʾ (shade, spoils) or ulfiya'],
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
  if (HOLD.has(r.damaged)) { held.push(r); continue; }
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
  md.push(`| ${r.damaged} | ${r.proposed} | ${r.proseHits} | ${r.provedInQuotations}× | ${HOLD.get(r.damaged)} |`);
}
md.push('');
for (const r of held) {
  md.push(`## ${r.damaged} → ${r.proposed}`);
  md.push('');
  md.push(`*${HOLD.get(r.damaged)}* · ${r.proseHits}× in prose · the scan is proved to produce this form ${r.provedInQuotations}×`);
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
