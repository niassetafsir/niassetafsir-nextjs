// AK, 27 Nov 2026: a lesson's Arabic commentary is shown only once it has been
// proofread against the printing. The list lives in src/data/arabicProofread.json
// so the build scripts read the same one.
import data from '@/data/arabicProofread.json';

const PROOFREAD = new Set<number>((data as { lessons: number[] }).lessons);

export function arabicPublished(lessonId: number | string | null | undefined): boolean {
  return PROOFREAD.has(Number(lessonId));
}
