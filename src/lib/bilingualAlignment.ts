// Arabic <-> English paragraph alignment for lessons that have a translation.
//
// Generated. Do not edit the map by hand: run
//
//     node scripts/build-bilingual-alignment.js          # report only
//     node scripts/build-bilingual-alignment.js --write  # rewrite the JSON
//
// and read that script's header for the method. In short: the compiler's
// footnote markers anchor the two texts, because footnote [n] stands at one
// place in the Arabic and the translator carried the same number to the
// corresponding place in the English. The alignment is the translator's own
// evidence, not a similarity this repository inferred.
//
// WHAT WAS TRIED BEFORE, AND WHY IT WAS WRONG
//
// The first attempt paired paragraphs that quoted the same aya. Citation
// overlap is unordered, and an alignment is an order: the pass put AR30 with
// EN28 over Q 27:30 while AR27 -- which it called untranslated -- was EN28,
// both opening on the basmala disagreement. A shared citation shows two
// paragraphs treat related material and nothing more.
//
// The second attempt was hand-drafted against `arabicText` while the lesson
// page passes `arabicBody`, so every index was keyed to the wrong field. It
// was never enabled, and the English has roughly doubled since it was written
// (Lesson 1: 37 paragraphs then, 81 now), so it is gone rather than rebased.
//
// WHAT SHIPS
//
// Lesson 1 only. Lesson 2's English runs well past its Arabic and its last
// three footnotes never reach the translation, so the tail drifts: the name
// audit puts half its tested names 6 to 12 paragraphs from where the
// alignment places them, and it is refused. Lessons 3-5 are partial drafts
// carrying no footnote markers at all, so there is nothing to anchor. All of
// them fall back to the side-by-side columns, which is what the reader saw
// before and is honest about not knowing.
//
// Indexing, which must not drift:
//  - arabicIndices index into `commentaryParagraphs` in BilingualText.tsx --
//    arabicBody split on newlines, blanks dropped, isPoem lines removed. Same
//    as src/lib/arabicCommentary.ts and as VERSE_INDEX paraIndex. 0-based.
//  - englishIndices index into `enParagraphs` -- <p class="en-para"> blocks in
//    document order, footnote paragraphs excluded. 0-based.
//
// tests/corpus.test.js holds both to the invariant that every paragraph on
// each side is placed exactly once and that blocks run in order.

import generated from '@/data/bilingualAlignment.json';

export interface AlignmentBlock {
  /** Arabic commentaryParagraphs indices covered by this block, in order. */
  arabicIndices: number[];
  /** English en-para indices covered by this block, in order. May be empty
   *  (Arabic paragraph with no English translation). */
  englishIndices: number[];
  /** How this pairing was arrived at, in plain words. */
  note?: string;
}

export interface EnglishOnlyGroup {
  /** English en-para indices with no Arabic source, in order. */
  indices: number[];
  note?: string;
}

export interface LessonAlignment {
  blocks: AlignmentBlock[];
  englishOnly: EnglishOnlyGroup[];
}

export const BILINGUAL_ALIGNMENT: Record<number, LessonAlignment> =
  generated as unknown as Record<number, LessonAlignment>;
