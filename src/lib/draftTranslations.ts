// How far each English translation actually goes.
//
// Rewritten 16 October 2026. Lessons 1 to 8 now carry a single English
// translation of the whole body text: 676 paragraphs against 676 Arabic
// paragraphs, one to one, 99,195 words, verbatim and clause by clause in one
// convention. Nothing is passed over and nothing stops early, so the gap
// bookkeeping this file used to carry is gone.
//
// What replaced what. Until today lessons 1 and 2 carried an English that AK
// had reviewed word for word, and lessons 3 to 5 a freer draft that stopped
// partway. That earlier rendering was paraphrastic -- in places fuller than
// the Arabic it translated, listing names of the Qurʾān in Lesson 1 that the
// Arabic does not list -- and it stopped at Q 2:34 in Lesson 3, Q 2:71 in
// Lesson 4 and Q 2:127 in Lesson 5. It is preserved in git history at
// 91c1087. The translation now in place is verbatim throughout, which is what
// the print edition requires, but it has NOT been reviewed word for word by
// AK. That is why every lesson is marked a draft below, lessons 1 and 2
// included: they have gained consistency and lost a review.
//
// The body is complete. The apparatus is not. Each lesson's footnotes remain
// in Arabic in `arabicFootnotes`, and the body English carries 319 bracketed
// markers that point into them. Lesson 2 is the exception: ten footnotes were
// translated and are kept, now gathered as endnotes at the foot of the lesson
// rather than interleaved. A reader who follows a marker in any other lesson
// reaches Arabic, so the note below says so rather than leaving them to find
// out.

/** Reviewed word-for-word against the Arabic by AK. None yet, since the
 *  verbatim translation replaced the two that had been. */
export const COMPLETE_TRANSLATION_LESSONS: number[] = [];

/** Complete in coverage, verbatim in method, not yet reviewed by AK. */
export const DRAFT_TRANSLATION_LESSONS: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export interface PartialTranslation {
  /** Where the English stops, in the reader's terms. */
  endsAt: string;
  /** Where the Arabic goes on to. */
  arabicEndsAt: string;
  /**
   * Passages the Arabic commentates that the English passes over entirely,
   * BEFORE the point it breaks off. Without these a reader takes everything
   * above the break for a continuous translation.
   */
  gaps?: string[];
}

/**
 * Translations that cover only part of their lesson, keyed by lesson id.
 *
 * Empty since 16 October 2026: no lesson's English now stops before its
 * Arabic does. Kept, with its consumers in coverage.ts and BilingualText.tsx,
 * because lessons 9 to 56 are still untranslated and the next lesson to be
 * drafted may well land here first.
 */
export const PARTIAL_TRANSLATIONS: Record<number, PartialTranslation> = {};

/** Lessons whose footnote apparatus is still only in Arabic. */
export const UNTRANSLATED_APPARATUS_LESSONS: number[] = [1, 3, 4, 5, 6, 7, 8];

export function isDraftTranslation(lessonId: number): boolean {
  return DRAFT_TRANSLATION_LESSONS.includes(lessonId);
}

export function partialTranslation(lessonId: number): PartialTranslation | null {
  return PARTIAL_TRANSLATIONS[lessonId] ?? null;
}

export function isCompleteTranslation(lessonId: number): boolean {
  return COMPLETE_TRANSLATION_LESSONS.includes(lessonId);
}

export function hasUntranslatedApparatus(lessonId: number): boolean {
  return UNTRANSLATED_APPARATUS_LESSONS.includes(lessonId);
}
