// Which English a reader sees for a passage outside Fī Riyāḍ al-Tafsīr.
//
// AK, 15 Nov 2026: the other works appear in Arabic only until he has verified
// the translation. corpus.json's textEn for those works is mostly a one-line
// description of the passage written while building the dossiers, not a
// translation, so it is withheld from the public pages. English shows when
//   - src/data/translations.json has the passage with status "verified", or
//   - the work is listed there under verifiedWorks (AK's own translation, as
//     with the Mawsūʿa fatāwā).
// Fī Riyāḍ al-Tafsīr is untouched: its English comes from the lesson files.

import data from '@/data/translations.json';

type Entry = { en: string; status: 'draft' | 'verified' };
// publishDrafts (AK, 15 Nov 2026: "live now, no label"): drafts show as they
// are while he verifies; status still records which ones he has checked.
const T = data as unknown as { verifiedWorks: string[]; publishDrafts?: boolean; passages: Record<string, Entry> };
const VERIFIED_WORKS = new Set(T.verifiedWorks);

export function publicEnglish(locusId: string, workId: string | undefined, textEn: string | undefined): string | undefined {
  if (!workId || workId === 'fi-riyad') return textEn;
  const t = T.passages[locusId];
  if (t && t.en && (t.status === 'verified' || T.publishDrafts)) return t.en;
  if (VERIFIED_WORKS.has(workId)) return textEn;
  return undefined;
}

export function isVerifiedWork(workId: string): boolean {
  return VERIFIED_WORKS.has(workId);
}

const SUMMARY_NOTE = 'The English is a summary of how he uses the verse here, not a translation of the passage.';

/** The dossiers' note "the English is a summary…" describes text the site no
 *  longer shows; once the summary is withheld, say what the reader needs. */
export function publicNote(note: string | undefined, englishShown: boolean): string | undefined {
  if (note === SUMMARY_NOTE) return englishShown ? undefined : 'English translation in preparation.';
  return note;
}
