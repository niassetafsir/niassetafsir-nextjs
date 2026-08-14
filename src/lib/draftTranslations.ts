// Lessons whose English translation is a first draft, not yet reviewed
// word-for-word against the Arabic. Remove an id here once AK has reviewed
// and confirmed it.
export const DRAFT_TRANSLATION_LESSONS: number[] = [3, 4, 5];

export function isDraftTranslation(lessonId: number): boolean {
  return DRAFT_TRANSLATION_LESSONS.includes(lessonId);
}
