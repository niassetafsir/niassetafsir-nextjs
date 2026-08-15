#!/usr/bin/env node
/**
 * Turns translation-drafts/verse-match-report.json (the full working
 * report, all match types, private/dev-only) into two small PRODUCTION
 * data files actually shipped to the site -- using ONLY substring/pair
 * type matches (the two high-confidence tiers). 'fuzzy' matches are left
 * out here on purpose: spot-checking (2026-08-16) showed the fuzzy pass
 * correctly rescues citations mangled by OCR noise most of the time, but
 * also occasionally misattributes short liturgical/formulaic phrases to
 * an unrelated verse -- not a bar worth clearing for something printed as
 * a definite verse number next to Niasse's text on a public page.
 *
 * Output 1: src/data/verseCitations.json
 *   { "<lessonId>": { "<paraIndex>": { "<spanIndex>": "<verse>" } } }
 *   Used to print a small inline verse-number badge right after each
 *   matched citation -- see injectVerseNumbers() in BilingualText.tsx and
 *   the citations param on redactToQuranicFragments() in quranicFragments.ts.
 *
 * Output 2: src/data/verseIndexAuto.json
 *   { "<lessonId>": [ { verse, paraIndex, uncertain: true }, ... ] }
 *   Extends the hand-curated VERSE_INDEX (src/lib/verseIndex.ts, currently
 *   only lessons 1-3) to every lesson that has confirmed matches, for the
 *   verse-jump bar and ?verse= deep links. Lessons already hand-curated in
 *   verseIndex.ts are left alone; see the merge logic there.
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

const citations = {};
const indexByLesson = {};

for (const lessonId of Object.keys(report)) {
  const { spans } = report[lessonId];
  const lessonCitations = {};
  const seenVerseParas = new Map(); // verse -> earliest paraIndex it's quoted at

  for (const s of spans) {
    if (!s.match) continue;
    if (s.match.type !== 'substring' && s.match.type !== 'pair') continue;

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

  if (Object.keys(lessonCitations).length > 0) citations[lessonId] = lessonCitations;

  if (seenVerseParas.size > 0) {
    indexByLesson[lessonId] = [...seenVerseParas.entries()]
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([verse, paraIndex]) => ({ verse, paraIndex, uncertain: true }));
  }
}

fs.writeFileSync(CITATIONS_OUT, JSON.stringify(citations), 'utf8');
fs.writeFileSync(INDEX_OUT, JSON.stringify(indexByLesson, null, 2), 'utf8');

const citedLessons = Object.keys(citations).length;
const totalCited = Object.values(citations).reduce(
  (sum, l) => sum + Object.values(l).reduce((s2, p) => s2 + Object.keys(p).length, 0), 0
);
console.log(`Wrote ${totalCited} inline citation numbers across ${citedLessons} lessons -> ${path.relative(process.cwd(), CITATIONS_OUT)}`);
console.log(`Wrote verse-jump index for ${Object.keys(indexByLesson).length} lessons -> ${path.relative(process.cwd(), INDEX_OUT)}`);
