// AK, 27 Nov 2026: the Arabic of Lessons 31–56 is withheld from every page
// until it has been proofread against the printing. Lessons 1–30 show it.
export const ARABIC_PUBLISHED_THROUGH = 30;

export function arabicPublished(lessonId: number | string | null | undefined): boolean {
  const n = Number(lessonId);
  return Number.isFinite(n) && n >= 1 && n <= ARABIC_PUBLISHED_THROUGH;
}
