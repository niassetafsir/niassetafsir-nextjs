#!/usr/bin/env node
/**
 * Builds the decision worksheet for ق/ف damage left standing in Niasse's own
 * prose -- the part the Qurʾān cannot adjudicate, because the words are his.
 *
 * find-qaf-fa-ocr.js and repair-ocr-from-quran.js both stop at the quotation
 * brackets: inside them the Qurʾān is the authority and a divergence from it
 * is an error by definition; outside them nothing is entitled to overrule
 * Niasse. That left roughly 2,300 suspect tokens in the prose.
 *
 * WHY THE OBVIOUS TEST FAILS
 *
 * "One ق/ف swap turns this into a Qurʾānic word" is right about فال → قال 145
 * times and wrong about لقي → لفي 31 times, and the two look identical to it,
 * because لَقِيَ is ordinary Arabic that happens not to occur in the muṣḥaf in
 * that spelling. Frequency does not separate them either: a damaged form is
 * common precisely BECAUSE the damage is systematic, so لفد occurs 45 times
 * against لقد's 63 and the ratio says nothing.
 *
 * THE EVIDENCE THAT DOES SEPARATE THEM
 *
 * 2,156 corrections have already been made inside quotations, every one
 * confirmed by the āya being quoted. Each is a demonstrated fact about this
 * OCR: it turns THIS word into THAT word. Where a prose token matches a pair
 * already proved that way, the misreading is attested in the source itself,
 * repeatedly, under Qurʾānic control. Where it does not, nothing here vouches
 * for it.
 *
 * That is what splits لقي from فالوا. فالوا → قالوا was proved 74 times against
 * the muṣḥaf; لقي → لفي was never proposed inside a quotation, let alone
 * confirmed. Same for الطرق → الطرف and عرق → عرف, the other false alarms.
 *
 * WHAT THIS IS AND IS NOT
 *
 * A triage that makes lexical work tractable -- a few dozen judgements rather
 * than two thousand lookups. Not a verdict. Even a well-attested pair can be
 * wrong in a particular clause, where Niasse chose a word that happens to
 * collide with a form the OCR also produces, which is why every form is
 * printed with its contexts rather than offered as a batch.
 *
 * And the caution no count can encode: that a reading is attested in Lane is
 * not warrant to emend. The proposed form has to be attested IN THE REQUIRED
 * MORPHOLOGY, to fit the clause syntactically and semantically, and the
 * confusion has to be plausible for this source -- which for a Maghribī
 * printing read by a Mashriqī-trained OCR, it generally is.
 *
 *   node scripts/build-prose-ocr-worksheet.js
 *     -> translation-drafts/prose-ocr-worksheet.md    (for reading)
 *     -> translation-drafts/prose-ocr-worksheet.json  (machine-readable)
 *
 * The proved-pair table is rebuilt on each run by diffing the current lessons
 * against the text as it stood before any repair -- read out of git at
 * BASELINE_REV, not kept as a second copy of the corpus -- so it stays true as
 * more repairs are made.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
// The text as it stood before any OCR repair: commit d363dc1, the Warsh switch.
// Read out of git rather than kept as a second copy of the corpus -- the point
// is a diff, and git already holds every revision. Override with BASELINE_REV.
const BASELINE_REV = process.env.BASELINE_REV || 'd363dc1';
const OUT_JSON = path.join(__dirname, '..', 'translation-drafts', 'prose-ocr-worksheet.json');
const OUT_MD = path.join(__dirname, '..', 'translation-drafts', 'prose-ocr-worksheet.md');

const CONTEXT_WORDS = 7;
const STRONG = 3;
const TOKEN = /[ء-يٱےۓً-ْٰ]+/g;
const LETTER = /[ء-يٱےۓً-ْٰ]/;

function normalizeAr(text) {
  return text.normalize('NFC')
    .replace(/\p{Mn}/gu, '').replace(/[ۥۦ]/g, '').replace(/\p{Cf}/gu, '')
    .replace(/ـ/g, '').replace(/[آأإٱ]/g, 'ا').replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي').replace(/[ےۓ]/g, 'ي').replace(/[ؤئ]/g, 'ء').trim();
}

// --- The corpus -------------------------------------------------------------

const lessons = [];
for (let id = 1; id <= 56; id++) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) continue;
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  const body = lesson.arabicBody || lesson.arabicText || '';
  if (body) lessons.push({ id, body });
}

const corpusFreq = new Map();
for (const { body } of lessons) {
  for (const t of body.match(TOKEN) || []) {
    const n = normalizeAr(t);
    if (n.length >= 3) corpusFreq.set(n, (corpusFreq.get(n) || 0) + 1);
  }
}

// --- What the in-quotation repairs already proved about this OCR ------------

const proved = new Map();
let provedTotal = 0;
let baselineOk = true;

function baselineBody(id) {
  const rel = `src/data/lessons/${String(id).padStart(2, '0')}.json`;
  try {
    const raw = execFileSync('git', ['show', `${BASELINE_REV}:${rel}`], {
      cwd: path.join(__dirname, '..'), maxBuffer: 1 << 28, encoding: 'utf8',
    });
    const l = JSON.parse(raw);
    return l.arabicBody || l.arabicText || '';
  } catch { return null; }
}

for (const { id, body } of lessons) {
  const before = baselineBody(id);
  if (before === null) { baselineOk = false; continue; }
  if (before.length !== body.length) continue;   // not a substitution-only diff
  for (let i = 0; i < before.length; i++) {
    if (before[i] === body[i]) continue;
    let s = i, e = i;
    while (s > 0 && LETTER.test(before[s - 1])) s--;
    while (e < before.length - 1 && LETTER.test(before[e + 1])) e++;
    const wa = normalizeAr(before.slice(s, e + 1)), wb = normalizeAr(body.slice(s, e + 1));
    if (!wa || !wb || wa === wb) continue;
    proved.set(`${wa}|${wb}`, (proved.get(`${wa}|${wb}`) || 0) + 1);
    provedTotal++;
  }
}
if (!baselineOk || !proved.size) {
  console.warn(`! could not read the baseline text at ${BASELINE_REV}.`);
  console.warn('  Forms will read as unproved. Set BASELINE_REV to a revision predating the repairs.');
}

// --- The gate ---------------------------------------------------------------

const verseText = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'verse_text.json'), 'utf8'));
const quranWords = new Set();
for (const k of Object.keys(verseText)) {
  for (const w of normalizeAr(verseText[k].ar).split(/\s+/)) if (w.length > 2) quranWords.add(w);
}

const proseOf = body => body.replace(/\(([^()]{2,400})\)|«([^»]{2,400})»/g, m => ' '.repeat(m.length));

const forms = new Map();

for (const { id, body } of lessons) {
  const words = [];
  let m;
  const prose = proseOf(body);
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(prose))) words.push(m[0]);

  for (let i = 0; i < words.length; i++) {
    const raw = words[i];
    const n = normalizeAr(raw);
    if (n.length < 3 || !/[قف]/.test(n) || quranWords.has(n)) continue;

    for (let c = 0; c < n.length; c++) {
      if (n[c] !== 'ق' && n[c] !== 'ف') continue;
      const alt = n.slice(0, c) + (n[c] === 'ق' ? 'ف' : 'ق') + n.slice(c + 1);
      if (!quranWords.has(alt)) continue;

      const key = `${n}|${alt}`;
      if (!forms.has(key)) {
        forms.set(key, {
          damaged: n, proposed: alt, direction: `${n[c]} → ${alt[c]}`,
          provedInQuotations: proved.get(key) || 0,
          damagedInCorpus: corpusFreq.get(n) || 0,
          proposedInCorpus: corpusFreq.get(alt) || 0,
          proseHits: 0, lessons: new Set(), contexts: [],
        });
      }
      const rec = forms.get(key);
      rec.proseHits++;
      rec.lessons.add(id);
      if (rec.contexts.length < 6) {
        const before = words.slice(Math.max(0, i - CONTEXT_WORDS), i).join(' ');
        const after = words.slice(i + 1, Math.min(words.length, i + CONTEXT_WORDS + 1)).join(' ');
        const text = `${before} ⟦${raw}⟧ ${after}`;
        if (!rec.contexts.some(x => x.text === text)) rec.contexts.push({ lesson: id, text });
      }
    }
  }
}

// --- Bucket by the evidence -------------------------------------------------

const attested = [], thin = [], unproved = [];
for (const rec of forms.values()) {
  rec.lessons = [...rec.lessons].sort((a, b) => a - b);
  if (rec.provedInQuotations >= STRONG) attested.push(rec);
  else if (rec.provedInQuotations > 0) thin.push(rec);
  else unproved.push(rec);
}
const byProved = (a, b) => b.provedInQuotations - a.provedInQuotations || b.proseHits - a.proseHits;
attested.sort(byProved); thin.sort(byProved);
unproved.sort((a, b) => b.proseHits - a.proseHits);
const sum = rs => rs.reduce((s, r) => s + r.proseHits, 0);

// --- Write ------------------------------------------------------------------

fs.writeFileSync(OUT_JSON, JSON.stringify({ attested, thin, unproved }, null, 2), 'utf8');

const md = [];
const P = l => md.push(l);

P('# ق/ف in the prose — decision worksheet');
P('');
P('Generated by `scripts/build-prose-ocr-worksheet.js`. **Nothing here has been applied.**');
P('');
P('Every ق/ف repair *inside* a Qurʾānic quotation has already been made and proved against the');
P("muṣḥaf. What follows is the remainder: suspect tokens in Niasse's own prose, where the Qurʾān");
P('has no standing and the decision is lexical.');
P('');
P('A token appears here only if the Qurʾān does not spell it that way **and** one ق/ف swap turns');
P('it into a word the Qurʾān does spell. That gate produces the real errors and the false alarms');
P('alike — right about فال → قال, wrong about لقي → لفي — and frequency cannot separate them,');
P('because a damaged form is common precisely *because* the damage is systematic: لفد occurs 45');
P("times against لقد's 63, and the ratio says nothing.");
P('');
P('## What sorts them');
P('');
P(`${provedTotal.toLocaleString('en-US')} corrections have already been made inside quotations, each confirmed by the āya being`);
P(`quoted, across ${proved.size.toLocaleString('en-US')} distinct word pairs. Every one is a demonstrated fact about this OCR: it turns`);
P('*this* word into *that* word. Where a prose token matches a pair proved that way, the misreading');
P('is attested in the source itself, repeatedly, under Qurʾānic control. Where it does not, nothing');
P('here vouches for it.');
P('');
P('| bucket | forms | occurrences | standing |');
P('|---|---|---|---|');
P(`| **Attested** | ${attested.length} | ${sum(attested)} | this exact pair proved ≥${STRONG}× inside quotations |`);
P(`| **Thinly attested** | ${thin.length} | ${sum(thin)} | proved once or twice — suggestive, not settled |`);
P(`| **Unproved** | ${unproved.length} | ${sum(unproved)} | never confirmed anywhere; **the lexicon cases** |`);
P('');
P('Triage, not a verdict. Even a well-attested pair can be wrong in a particular clause — a word');
P('Niasse chose that happens to collide with a form the OCR also produces — so contexts are printed');
P('rather than a batch offered.');
P('');
P('And the caution no count can encode: **attested in Lane is not warrant to emend.** The proposed');
P('form has to be attested *in the required morphology*, to fit the clause syntactically and');
P('semantically, and the confusion has to be plausible for this source — which for a Maghribī');
P('printing read by a Mashriqī-trained OCR, it generally is.');
P('');

function table(rows, limit) {
  P('| damaged | proposed | in prose | proved in quotations | damaged in corpus | proposed in corpus | lessons |');
  P('|---|---|---|---|---|---|---|');
  for (const r of rows.slice(0, limit)) {
    const ls = r.lessons.length > 6 ? `${r.lessons.slice(0, 6).join(', ')} +${r.lessons.length - 6}` : r.lessons.join(', ');
    P(`| ${r.damaged} | ${r.proposed} | ${r.proseHits} | ${r.provedInQuotations || '—'} | ${r.damagedInCorpus} | ${r.proposedInCorpus} | ${ls} |`);
  }
  if (rows.length > limit) P(`| … | | | | | | *${rows.length - limit} more, in the JSON* |`);
  P('');
}

function contexts(rows, limit) {
  for (const r of rows.slice(0, limit)) {
    P(`### ${r.damaged} → ${r.proposed} · ${r.proseHits}× in prose · proved ${r.provedInQuotations || 0}× in quotations`);
    P('');
    for (const c of r.contexts) P(`- **L${c.lesson}** — ${c.text}`);
    P('');
  }
}

P('## Attested — the OCR is known to make this substitution');
P('');
P('Each pair was corrected inside a quotation and the āya confirmed it, the number of times shown.');
P('Read the contexts before applying: the warrant is that the misreading happens, not that it');
P('happened here.');
P('');
table(attested, 200);
contexts(attested, 60);

P('## Thinly attested — proved once or twice');
P('');
P('Suggestive. One confirmation is a small sample, and ضيقا/ضيفا is a reminder that both spellings');
P('can be words.');
P('');
table(thin, 200);
contexts(thin, 25);

P('## Unproved — nothing vouches for these');
P('');
P('The lexicon cases: Lane, EJTAAL or Bāḥith, and the clause. Here is where لقي/لفي, الطرق/الطرف');
P('and عرق/عرف land — the damaged form is ordinary Arabic and the swap only looks plausible because');
P('the Qurʾān happens to use the other spelling.');
P('');
table(unproved, 250);
contexts(unproved, 40);

fs.writeFileSync(OUT_MD, md.join('\n'), 'utf8');

console.log(`attested   ${String(attested.length).padStart(4)} forms  ${String(sum(attested)).padStart(5)} occurrences   <- the OCR is known to do this`);
console.log(`thin       ${String(thin.length).padStart(4)} forms  ${String(sum(thin)).padStart(5)} occurrences   <- proved once or twice`);
console.log(`unproved   ${String(unproved.length).padStart(4)} forms  ${String(sum(unproved)).padStart(5)} occurrences   <- Lane / EJTAAL / Bahith`);
console.log(`\nbuilt against ${proved.size} proved word pairs from ${provedTotal} in-quotation corrections`);
console.log(`\nWrote ${path.relative(process.cwd(), OUT_MD)}`);
console.log(`      ${path.relative(process.cwd(), OUT_JSON)}`);
