// How far each English translation actually goes.
//
// Measured 15 September 2026 against the Arabic body of each lesson. Lessons 1
// and 2 run at 1.7-2.0 English characters per Arabic character and end where
// the Arabic ends. Lessons 4 and 5 run at 0.69 and 0.81 and stop in mid
// narrative: 65 Arabic paragraphs against 15 English in Lesson 4, 127 against
// 28 in Lesson 5. Lesson 4 breaks off at the cow narrative around Q 2:72 --
// the same point the *Arabic* used to stop before it was re-extracted in
// 4651bdc. The Arabic was repaired; the English was not.
//
// These are not hidden. A reader who finds three paragraphs of Lesson 5 and no
// note concludes the translation is finished and thin; the note tells them
// where it stops and that the Arabic goes further.

/** Reviewed word-for-word against the Arabic by AK. */
export const COMPLETE_TRANSLATION_LESSONS: number[] = [1, 2];

/** A first draft, not yet reviewed word-for-word against the Arabic. */
export const DRAFT_TRANSLATION_LESSONS: number[] = [3, 4, 5];

export interface PartialTranslation {
  /** Where the English stops, in the reader's terms. */
  endsAt: string;
  /** Where the Arabic goes on to. */
  arabicEndsAt: string;
}

/**
 * Translations that cover only part of their lesson. Keyed by lesson id.
 *
 * Lesson 3 was left out of this list on 15 September on the strength of a
 * measurement, not a reading: its English ends on the prostration, and the
 * prostration appears twice in its range — to Ādam at Q 2:34 and at the gate
 * in Q 2:58 — so the character ratio was read as gaps in the middle. Aligning
 * the two texts paragraph by paragraph settles it: English E32 translates
 * Arabic A27 and stops mid-sentence there, and A28 to A70 — 43 of the 70
 * paragraphs, 48% of the characters — have no English at all. It breaks off
 * like the others.
 */
export const PARTIAL_TRANSLATIONS: Record<number, PartialTranslation> = {
  3: { endsAt: 'Q 2:34, mid-sentence on the angels\' prostration to Ādam', arabicEndsAt: 'Q 2:57' },
  4: { endsAt: 'Q 2:71, in the middle of the narrative of the cow', arabicEndsAt: 'Q 2:105' },
  5: { endsAt: 'Q 2:127, at Ibrāhīm and Ismāʿīl raising the foundations', arabicEndsAt: 'Q 2:202' },
};

export function isDraftTranslation(lessonId: number): boolean {
  return DRAFT_TRANSLATION_LESSONS.includes(lessonId);
}

export function partialTranslation(lessonId: number): PartialTranslation | null {
  return PARTIAL_TRANSLATIONS[lessonId] ?? null;
}

export function isCompleteTranslation(lessonId: number): boolean {
  return COMPLETE_TRANSLATION_LESSONS.includes(lessonId);
}
