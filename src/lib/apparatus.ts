/**
 * Which lessons show their footnote apparatus.
 *
 * The apparatus was broken in two different ways at once, and neither was
 * visible to a reader. Lessons 5 and 6 carried no [N] markers at all, so none
 * of their notes could be reached from the text. Lessons 1-3 carried markers
 * whose footnoteOrder named ids that are not in footnotesData.json -- 47 of
 * Lesson 1's 51 -- so most markers linked to nothing. Across all 56 lessons,
 * 880 of 1,997 notes had no inline anchor, because the markers were inserted
 * when the repo held only the first half of each lesson and nothing re-ran that
 * step after the August recovery restored the rest.
 *
 * Lessons 1-7 have since been rebuilt from AK's verified "Citations Fixed"
 * documents, whose Word footnote elements carry an inline reference at the
 * exact position the compiler keyed each note to -- no inference. Every anchor
 * in Lessons 1-6 was located in the site's text, and 56 of 62 in Lesson 7.
 *
 * The rest stay hidden until their documents are verified the same way. A
 * half-wired apparatus in a critical edition is worse than none: a reader who
 * finds three markers in a lesson reasonably concludes there are three notes,
 * when there are seventy-five.
 *
 * To bring more lessons back: verify the document, run the importer, add the
 * number here.
 */
export const VERIFIED_APPARATUS_LESSONS: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

export function hasApparatus(lessonId: number | undefined | null): boolean {
  return lessonId != null && VERIFIED_APPARATUS_LESSONS.includes(lessonId);
}
