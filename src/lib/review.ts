/**
 * Which lessons have been read against the printed volume.
 *
 * The Arabic of all 56 lessons is transcribed and published. That is not the
 * same as checked: the transcription came from a scan, and the scan of this
 * printing's Maghribī hand confuses the dotted letters -- fāʾ for qāf, nūn for
 * rāʾ, bāʾ for fāʾ. Roughly five words in a thousand still carry that damage,
 * and the repair scripts reach only the ones an āya or the corpus can settle.
 * The rest need the volume open beside the screen.
 *
 * AK has read Lessons 1-8 that way. The other 48 are published as they stand,
 * and the lesson page says so, because a reader who cannot tell a checked text
 * from an unchecked one will quote the unchecked one as though it were
 * established. Hiding them would be worse: the text is no further from the
 * printing than Lessons 1-8 were before he read them, and it is already
 * deposited, indexed and in use by the translation team.
 *
 * As each lesson is read, add it here.
 */
export const REVIEWED_LESSONS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export function isReviewed(lessonId: number | undefined | null): boolean {
  return lessonId != null && REVIEWED_LESSONS.includes(lessonId);
}
