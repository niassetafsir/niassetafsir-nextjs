#!/usr/bin/env node
'use strict';
/**
 * What the site is entitled to say about each bracketed Qur'anic citation.
 *
 * The lessons carry 15,611 bracketed spans. Printing a verse number beside one
 * is already a claim -- that this passage is that aya -- and build-verse-citations.js
 * makes it only for the tiers match-verses.js ships. This file makes the OTHER
 * claim, the one about the TEXT: has the printing been collated against the
 * mushaf, and did it agree?
 *
 * Four states, and the boundary between them is evidence, not confidence:
 *
 *   collated   The span is identified at a shipped tier AND its letters sit
 *              verbatim inside the aya once the printing's own alif, hamza-seat
 *              and mark practice is folded away. Nothing here is outstanding.
 *
 *   diverges   Identified at a shipped tier, and the letters do NOT sit in the
 *              aya. This is the state that needs a reader. It does not say the
 *              printing is wrong: a compiler quoting from memory, a partial aya
 *              and a scan that dropped a letter all land here, and no rule
 *              reaching only the span can tell them apart.
 *
 *   unplaced   Four words or more, and the matcher could not say which aya it
 *              is -- no match at all, or only a `fuzzy`/`ambiguous` guess it
 *              declines to ship. Usually the scan damaged the span past
 *              recognition. Nothing has been collated because there is nothing
 *              to collate it against.
 *
 *   (omitted)  Under four words and unplaced. A two-word lemma the commentary
 *              is about to gloss is not a citation making a claim, and marking
 *              7,040 of them would drown the ones that matter. They are counted
 *              on the about page and left unmarked in the text.
 *
 * The key is the triple (lessonId, paraIndex, spanIndex) -- positional, and
 * computed by match-verses.js's own extraction, so it is the same key
 * src/lib/textInject.ts recounts at render time. See CLAUDE.md: the regexes,
 * the poem filter and the paragraph split exist in several files and have to
 * stay identical, or a marker lands on the wrong citation.
 *
 * Run after match-verses.js, beside build-verse-citations.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REPORT = path.join(ROOT, 'translation-drafts', 'verse-match-report.json');
const VERSES = path.join(ROOT, 'src', 'data', 'verse_text.json');
const OUT = path.join(ROOT, 'src', 'data', 'verseCitationStatus.json');

const SHIPPED_TIERS = new Set(['substring', 'pair', 'enclosed']);
const MIN_WORDS_TO_MARK = 4;

// Fold what belongs to the printing rather than to the text: vowels and the
// rest of the marks, the alif family onto one alif, the ya family (including a
// hamza seat) onto one ya, waw-with-hamza onto waw. What survives is the
// letter skeleton both copies must share if they are the same words.
// WHAT BELONGS TO THE PRINTING, AND WHAT BELONGS TO THE TEXT
//
// Vowels and the rest of the marks are the printing's. So is alif practice,
// and that one needs care, because getting it wrong moves citations between
// "collated" and "diverges" by the hundred.
//
// The reference writes some alifs as a superscript (U+0670): `rajiun` is ra +
// superscript alif + jim. The printing may write the same alif plene, with a
// real alif, or may not write it at all. Both are that printing's convention
// and neither is a divergence. Deleting the superscript published the plene
// spellings as divergences; expanding it to a real alif published the
// unwritten ones instead. So the superscript is neither deleted nor expanded:
// the reference word is built BOTH ways and the span may match either.
//
// What this deliberately does NOT do is drop alifs altogether. That would hide
// a real difference -- Q 1:4 is `malik` in this riwaya and `malik` with an
// alif in the printing, which is a reading worth seeing, not noise to fold
// away. An optional superscript is a convention; a written alif is evidence.
//
// The Arabic comma (U+060C) also survived the first fold, because it sits
// inside the Arabic block the last filter keeps, so a word with a comma stuck
// to it differed from the same word without one. Arabic punctuation is
// stripped before comparing.
const MARKS = /[ً-ٟۖ-ۭـࣰ-ࣲ]/g;
const AR_PUNCT = /[،؍؛؞؟٪-٭۔۝۞۩]/g;
const SUPERSCRIPT_ALIF = 'ٰ';
// A private-use placeholder, so a superscript alif can survive the fold as
// something distinguishable and become an optional alif at the end.
const OPT = '';

function letters(s, keepSuperscript) {
  return s
    .normalize('NFD')
    .replace(/ٰ/g, keepSuperscript ? OPT : '')
    .replace(MARKS, '')
    .replace(AR_PUNCT, '')
    .replace(/[آأإاٱ]/g, 'ا')
    .replace(/[ىيےئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ء/g, 'ا')
    .replace(new RegExp(`[^؀-ۿ ${OPT}]`, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fold(s) {
  return letters(s, false);
}

// Does the span stand in the aya, allowing the printing its own alif practice?
//
// The reference writes some alifs as a superscript; the printing may write any
// one of them plene or leave it unwritten, and it is inconsistent WITHIN a
// single word -- `ya-musa` appears with the second alif written and the first
// not. So neither deleting every superscript nor expanding every superscript
// is right. Each is independently optional, so the reference is expanded into
// every combination and the span has to stand in one of them.
//
// Only alifs the REFERENCE marks as superscript are optional. An alif the
// printing writes where the reference has none stays a difference -- Q 1:4 is
// `malik` in this riwaya against the printing's `malik` with an alif, and that
// is a reading worth seeing, not noise to fold away.
//
// 2^n combinations, so it is capped. Past the cap the two end-points are
// tested -- every superscript written, or none -- which is what this did
// before and is strictly weaker. The cap is reported by the caller rather than
// passed over in silence.
const MAX_OPTIONAL_ALIFS = 14;
let cappedSpans = 0;

function standsIn(spanText, refText) {
  const span = fold(spanText);
  if (!span) return false;
  const marked = letters(refText, true);
  const n = (marked.match(//g) || []).length;

  if (n === 0) return marked.includes(span);

  if (n > MAX_OPTIONAL_ALIFS) {
    cappedSpans += 1;
    return marked.replace(//g, 'ا').includes(span)
        || marked.replace(//g, '').includes(span);
  }

  for (let bits = 0; bits < (1 << n); bits++) {
    let k = 0;
    const variant = marked.replace(//g, () => ((bits >> k++) & 1 ? 'ا' : ''));
    if (variant.includes(span)) return true;
  }
  return false;
}

const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
const verses = JSON.parse(fs.readFileSync(VERSES, 'utf8'));

// "2:255" -> that aya. "27:30-27:31" -> both, joined in order, so a span
// running across the boundary is collated against the text it actually spans.
// null when any aya named is absent from the reference.
function referenceText(key) {
  const parts = String(key).split('-');
  const texts = [];
  for (const raw of parts) {
    const p = raw.trim();
    if (!verses[p]) return null;
    texts.push(verses[p].ar);
  }
  return texts.join(' ');
}

const out = {};
const tally = { collated: 0, diverges: 0, unplaced: 0, omitted: 0, missingRef: 0 };

for (const lessonId of Object.keys(report).sort((a, b) => Number(a) - Number(b))) {
  for (const s of report[lessonId].spans) {
    const words = s.text.trim().split(/\s+/).filter(Boolean).length;
    const placed = s.match && SHIPPED_TIERS.has(s.match.type);

    let status;
    if (placed) {
      // A `pair` match names a RANGE -- "27:30-27:31" -- because the span runs
      // across an aya boundary. Its reference text is the two ayat joined, and
      // reading the range as a single key is how 421 sound matches came back as
      // "the reference lacks this aya".
      const ref = referenceText(s.match.verse);
      if (ref === null) {
        // A shipped match naming an aya the reference does not hold is a bug in
        // the matcher, not a state of the printing. Counted, never rendered.
        tally.missingRef += 1;
        continue;
      }
      status = standsIn(s.text, ref) ? 'collated' : 'diverges';
    } else if (words >= MIN_WORDS_TO_MARK) {
      status = 'unplaced';
    } else {
      tally.omitted += 1;
      continue;
    }

    tally[status] += 1;
    const L = String(lessonId);
    const P = String(s.paraIndex);
    out[L] = out[L] || {};
    out[L][P] = out[L][P] || {};
    out[L][P][String(s.spanIndex)] = status;
  }
}

fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');

const marked = tally.collated + tally.diverges + tally.unplaced;
const total = marked + tally.omitted + tally.missingRef;
console.log(`Wrote citation status for ${Object.keys(out).length} lessons -> src/data/verseCitationStatus.json`);
console.log(`  ${total} bracketed spans read`);
console.log(`  collated  ${tally.collated}\tidentified, and the printing agrees with the mushaf`);
console.log(`  diverges  ${tally.diverges}\tidentified, and it does not -- needs a reading`);
console.log(`  unplaced  ${tally.unplaced}\t${MIN_WORDS_TO_MARK}+ words the matcher cannot place`);
console.log(`  unmarked  ${tally.omitted}\tunder ${MIN_WORDS_TO_MARK} words and unplaced: lemmata, not claims`);
if (tally.missingRef) console.log(`  WARNING   ${tally.missingRef} shipped matches name an aya the reference lacks`);
if (cappedSpans) console.log(`  note      ${cappedSpans} span(s) had more than ${MAX_OPTIONAL_ALIFS} optional alifs and got the weaker two-way test`);
