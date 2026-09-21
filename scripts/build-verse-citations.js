#!/usr/bin/env node
/**
 * Turns translation-drafts/verse-match-report.json (the full working
 * report, all match types, private/dev-only) into two small PRODUCTION
 * data files actually shipped to the site -- using ONLY the high-confidence
 * tiers named in SHIPPED_TIERS below. 'fuzzy' matches are left
 * out here on purpose: spot-checking (2026-08-16) showed the fuzzy pass
 * correctly rescues citations mangled by OCR noise most of the time, but
 * also occasionally misattributes short liturgical/formulaic phrases to
 * an unrelated verse -- not a bar worth clearing for something printed as
 * a definite verse number next to Niasse's text on a public page.
 * 'ambiguous' is excluded for the stronger reason that the matcher has said
 * outright it cannot tell which āya of several is meant.
 *
 * Output 1: src/data/verseCitations.json
 *   { "<lessonId>": { "<paraIndex>": { "<spanIndex>": "<verse>" } } }
 *   Used to print a small inline verse-number badge right after each
 *   matched citation -- see injectVerseNumbers() in BilingualText.tsx and
 *   the citations param on redactToQuranicFragments() in arabicCommentary.ts (formerly quranicFragments.ts).
 *
 * Output 2: src/data/verseIndexAuto.json
 *   { "<lessonId>": [ { verse, paraIndex, uncertain: true }, ... ] }
 *   What makes /verse/{surah}/{ayah} resolve to a passage of commentary, and
 *   what drives the verse-jump bar and ?verse= deep links.
 *
 *   This is a DIFFERENT question from the citation above it, and it stopped
 *   inheriting the citation's answer. A span prints one number and can witness
 *   several āyāt; the index now takes match-verses.js's `attests` -- every āya
 *   the span carries word for word -- on top of the matched citation, and from
 *   every span, including the ones the matcher called 'ambiguous' or could not
 *   identify at all. Rows resting on a quotation the compiler did not bracket
 *   are flagged `editorial`, as add-editorial-verse-index.js flags its own.
 *
 *   SHIPPED_TIERS does not gate any of this, and could not: an āya is in the
 *   index because the passage demonstrably holds its text, not because a tier
 *   was confident enough to set a number in type.
 *
 * Run with: node scripts/build-verse-citations.js
 * (Run AFTER match-verses.js -- this reads its output, doesn't compute
 * matches itself.)
 */

const fs = require('fs');
const path = require('path');

const REPORT_FILE = path.join(__dirname, '..', 'translation-drafts', 'verse-match-report.json');
const CITATIONS_OUT = path.join(__dirname, '..', 'src', 'data', 'verseCitations.json');
const INDEX_OUT = path.join(__dirname, '..', 'src', 'data', 'verseIndexAuto.json');

if (!fs.existsSync(REPORT_FILE)) {
  console.error(`Missing ${path.relative(process.cwd(), REPORT_FILE)} -- run node scripts/match-verses.js first.`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));

// The tiers this file is willing to print as a definite āya number.
//
// 'substring' -- the clause sits verbatim in one āya and nothing rivals it.
// 'pair'      -- the clause genuinely runs across one āya boundary.
// 'enclosed'  -- the clause sits inside one āya, found by the pair pass while
//                it was testing adjacent windows, and agreed by every window
//                that contains it. See the pass 2 comment in match-verses.js.
//                Removing 'enclosed' from this set is the whole of the revert.
const SHIPPED_TIERS = new Set(['substring', 'pair', 'enclosed']);

const citations = {};
const indexByLesson = {};
let fromProseAttest = 0;

// WHICH PARAGRAPH AN ĀYA IS SENT TO.
//
// A citation keeps the rule it always had: the earliest paragraph of the lesson
// that cites it. Attestation does not, because earliest is the wrong tie-break
// for it. An incipit doubles as the sūra's NAME, and a lesson's preliminary
// matter uses the name over and over before any commentary begins. Lesson 56
// quotes "قل هو الله أحد" at ¶1 as a heading, then at ¶3, ¶4, ¶8, ¶10, ¶11,
// ¶15, ¶16, ¶17 and ¶18 inside ḥadīth on the merits of reciting it -- four
// words every time -- while the lemma-by-lemma treatment at ¶19 and ¶24 quotes
// it running on into 112:2 and 112:3. Earliest sent the reader to the heading.
//
// So an attested āya goes to the paragraph that quotes it at the greatest
// length, earliest breaking ties. Both rules are arbitrary among paragraphs
// that satisfy the same containment test; the longer quotation is the better
// guess at where the āya is treated rather than merely named.
//
// A citation always outranks an attestation for the same āya, which keeps every
// row that existed before attestation was added exactly where it was.
function offerParagraph(map, verse, paraIndex, run) {
  const cur = map.get(verse);
  if (!cur || run > cur.run || (run === cur.run && paraIndex < cur.paraIndex)) {
    map.set(verse, { paraIndex, run });
  }
}

for (const lessonId of Object.keys(report)) {
  const { spans, paraAttests } = report[lessonId];
  const lessonCitations = {};
  const seenVerseParas = new Map(); // verse -> earliest paraIndex it is CITED at
  const attestedParas = new Map();  // verse -> longest-quoted paragraph, brackets
  const editorialParas = new Map(); // verse -> longest-quoted paragraph, prose

  for (const s of spans) {
    // --- the verse index: every āya the span carries -----------------------
    //
    // A span prints one number and can witness several āyāt, and until now the
    // index inherited the citation's single answer: a span running al-Fātiḥa
    // 1:2 to 1:6 put one āya in the index and left four verse pages empty over
    // commentary in plain view, and a span the matcher called 'ambiguous'
    // printed nothing and credited nothing even where it plainly held one of
    // the rivals whole. `attests` is match-verses.js's separate answer to the
    // separate question -- which āyāt does this stretch carry, word for word
    // -- and the index takes it whatever the citation tier said, including for
    // spans that matched nothing at all.
    //
    // It never reaches lessonCitations. What prints is `match` and only
    // `match`, on the tiers named above, exactly as before.
    for (const a of (s.attests || [])) {
      offerParagraph(attestedParas, a.verse, s.paraIndex, a.run || 0);
    }

    if (!s.match) continue;
    if (!SHIPPED_TIERS.has(s.match.type)) continue;

    const paraKey = String(s.paraIndex);
    (lessonCitations[paraKey] = lessonCitations[paraKey] || {})[String(s.spanIndex)] = s.match.verse;

    // A 'pair' match verse looks like "75:18-75:19" -- split for the jump
    // index so both verses get an entry (both are genuinely quoted here).
    const verses = s.match.verse.includes('-') ? s.match.verse.split('-') : [s.match.verse];
    for (const v of verses) {
      if (!seenVerseParas.has(v) || seenVerseParas.get(v) > s.paraIndex) {
        seenVerseParas.set(v, s.paraIndex);
      }
    }
  }

  // Quotations the compiler did not bracket, carried word for word by the
  // paragraph and by none of its brackets. Same flag add-editorial-verse-index.js
  // uses, and for the same reason: the printing does not declare these, the
  // project identified them, and the badge has to say which it is looking at.
  for (const [paraIndex, list] of Object.entries(paraAttests || {})) {
    for (const a of list) {
      if (seenVerseParas.has(a.verse) || attestedParas.has(a.verse)) continue;
      offerParagraph(editorialParas, a.verse, Number(paraIndex), a.run || 0);
    }
  }

  if (Object.keys(lessonCitations).length > 0) citations[lessonId] = lessonCitations;

  const rows = [
    ...[...seenVerseParas.entries()].map(([verse, paraIndex]) => ({ verse, paraIndex, uncertain: true })),
    ...[...attestedParas.entries()]
      .filter(([verse]) => !seenVerseParas.has(verse))
      .map(([verse, at]) => ({ verse, paraIndex: at.paraIndex, uncertain: true })),
    ...[...editorialParas.entries()].map(([verse, at]) => ({ verse, paraIndex: at.paraIndex, editorial: true })),
  ];
  if (rows.length) {
    indexByLesson[lessonId] = rows.sort(
      (a, b) => a.paraIndex - b.paraIndex || a.verse.localeCompare(b.verse, undefined, { numeric: true }));
  }
  fromProseAttest += editorialParas.size;
}

fs.writeFileSync(CITATIONS_OUT, JSON.stringify(citations), 'utf8');
fs.writeFileSync(INDEX_OUT, JSON.stringify(indexByLesson, null, 2), 'utf8');

const citedLessons = Object.keys(citations).length;
const totalCited = Object.values(citations).reduce(
  (sum, l) => sum + Object.values(l).reduce((s2, p) => s2 + Object.keys(p).length, 0), 0
);
console.log(`Wrote ${totalCited} inline citation numbers across ${citedLessons} lessons -> ${path.relative(process.cwd(), CITATIONS_OUT)}`);
const indexRows = Object.values(indexByLesson).reduce((n, l) => n + l.length, 0);
const distinct = new Set(Object.values(indexByLesson).flat().map(e => e.verse)).size;
console.log(`Wrote verse-jump index for ${Object.keys(indexByLesson).length} lessons -> ${path.relative(process.cwd(), INDEX_OUT)}`);
console.log(`  ${indexRows} rows, ${distinct} distinct āyāt (${((distinct / 6236) * 100).toFixed(1)}% of the muṣḥaf)`);
console.log(`  ${fromProseAttest} of the rows rest on an unbracketed quotation and are flagged editorial.`);
