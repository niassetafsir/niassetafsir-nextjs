// How far each English translation actually goes.
//
// Established 16 September 2026 by aligning each lesson's English against its
// Arabic paragraph by paragraph. An earlier version of this file was built from
// character ratios instead, and every one of its three judgements about where a
// translation stops was wrong in some part. A ratio can tell you that English
// is missing; it cannot tell you which verse it stops at, and it cannot tell
// the difference between a translation that ends early and one that ends early
// AND skips passages in the middle. Two of the three do both.
//
// None of this is hidden from the reader by choice. A reader who finds three
// paragraphs of Lesson 5 and no note concludes the translation is finished and
// thin; the note tells them where it stops, where the Arabic goes on to, and
// which verses alongside have no English at all.

/** Reviewed word-for-word against the Arabic by AK. */
export const COMPLETE_TRANSLATION_LESSONS: number[] = [1, 2];

/** A first draft, not yet reviewed word-for-word against the Arabic. */
export const DRAFT_TRANSLATION_LESSONS: number[] = [3, 4, 5];

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
 * Translations that cover only part of their lesson. Keyed by lesson id.
 *
 * Lesson 3. The English runs from the start to Arabic paragraph 26 and stops
 * there, having translated it in full -- E31 renders the closing clause
 * (`ولكن الثانية شكر لله تبارك وتعالى`) as "the second prostration was an act
 * of thanksgiving". It does not break mid-sentence. Paragraphs 27 to 69 -- 43
 * of 70, beginning with Iblīs's shubha against the command to prostrate --
 * have no English. The Arabic's last Qurʾānic lemma is Q 2:59 (paragraph 65
 * glosses 2:57, 2:58 and 2:59 in turn); paragraphs 66 to 69 carry the
 * wilderness narrative on past it without quoting further.
 *
 * Lesson 4. Arabic paragraphs 14 to 16 have no English: E10 glosses paragraph
 * 13 and then jumps to paragraph 17, taking the Sabbath transgressors with it.
 * Q 2:66 (`فجعلناها نكالا لما بين يديها وما خلفها`) is dropped entirely, and
 * so is the passage that divides the townspeople into three groups -- which is
 * why E10's "a third group" arrives in English with no antecedent.
 *
 * Lesson 5. Two gaps. The first runs from the end of paragraph 27 through the
 * first part of paragraph 29: the ḥadīth `لا تفضلوني على يونس بن متى` and the
 * doctrine built on it, that the human being is khalīfa of God's Essence,
 * attributes and acts. The second runs from the end of paragraph 43 through
 * the first part of paragraph 45 and takes the lemma of Q 2:127 and the whole
 * of Q 2:128 with it. The prayer `ربنا تقبل منا` still reaches the English,
 * but through the Kaʿba narrative at paragraph 53, not through its own gloss.
 */
export const PARTIAL_TRANSLATIONS: Record<number, PartialTranslation> = {
  3: {
    endsAt: 'Q 2:34, at the close of the angels\' second prostration',
    arabicEndsAt: 'Q 2:59',
  },
  4: {
    endsAt: 'Q 2:71, in the middle of the narrative of the cow',
    arabicEndsAt: 'Q 2:105',
    gaps: [
      'Q 2:66',
      'the account of the Sabbath transgressors that divides the town into three groups',
    ],
  },
  5: {
    endsAt: 'Q 2:127, at the prayer over the building of the Kaʿba',
    arabicEndsAt: 'Q 2:202',
    gaps: [
      'Q 2:128',
      'the excursus at Q 2:115 on the human being as khalīfa',
    ],
  },
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
