import data from '@/data/fatwaVerseExcerpts.json';

/**
 * Per-verse cuts from the Mawsūʿa fatāwā.
 *
 * The twelve tafsīr answers and §20 used to publish in full — 50,559 characters
 * of English on the verse pages. They now publish as excerpts: the locus default
 * lives in corpus.json (textAr/textEn), and this file overrides it for the āyāt
 * the answer actually expounds, so a reader who arrives at Q 30:22 reads the
 * passage on the difference of colours rather than the opening on the quṭb.
 *
 * Permission for the work is confirmed; the cut is an editorial choice. The full
 * Arabic and AK's full English are kept in translation-drafts/, which nothing
 * imports.
 *
 * Keys are `surah:ayahStart` — the START of the link's range, since that is what
 * verseLinks records and what the verse page resolves by.
 */

type Cut = { ar?: string | null; en?: string | null };

const EXCERPTS = (data as { excerpts: Record<string, Record<string, Cut>> }).excerpts;

export function fatwaVerseExcerpt(
  locusId: string,
  surah: number,
  ayah: number,
): Cut | null {
  return EXCERPTS[locusId]?.[`${surah}:${ayah}`] ?? null;
}

/** Whether this locus publishes as an excerpt at all. */
export function hasFatwaExcerpt(locusId: string): boolean {
  return locusId in EXCERPTS;
}
