import editionRaw from '@/data/edition2022.json';

// Where things sit in the printed edition this site follows.
//
// Fī Riyāḍ al-Tafsīr exists in two printings from the same house: Tunis 2010
// in SIX volumes, which is what Brigaglia (2013), Ogunnaike (2018) and Wright
// (2024) all cite, and Tunis, December 2022 in TEN, which is the copy this
// site was transcribed from. Pagination restarts at p. 3 in every 2022 volume,
// so no page reference resolves without its volume, and no 2010 page reference
// resolves against the 2022 set at all. Until a concordance exists, the honest
// move is to cite the printing we actually hold and say which one it is.
//
// The table itself is AK's transcription of the printed table of contents.
// Summing each volume's last listed heading gives a floor of 2,073 pages
// across the ten volumes; Seesemann records the 2010 six-volume set at 2,351
// pages (374 + 413 + 402 + 354 + 416 + 392). Since every volume runs on past
// its final heading, the two totals are consistent: 2022 is the same text
// redivided, not an expanded edition.

export interface EditionRef {
  volume: number;
  page: number;
}

interface EditionData {
  _source: string;
  _caveats: string[];
  edition: {
    work: string;
    witness: string;
    publisher: string;
    place: string;
    year: string;
    volumes: number;
  };
  lessons: Record<string, EditionRef>;
  suras: Record<string, EditionRef & { name: string }>;
}

const edition = editionRaw as unknown as EditionData;

export const EDITION_LABEL = 'Tūnis 2022, 10 vols.';

/** Where a lesson OPENS. The lesson runs on past this page. */
export function lessonRef(lessonId: number): EditionRef | null {
  return edition.lessons[String(lessonId)] ?? null;
}

/** Where a sūra's heading appears in the printed edition. */
export function suraRef(surah: number): EditionRef | null {
  return edition.suras[String(surah)] ?? null;
}

export function formatRef(ref: EditionRef | null): string | null {
  return ref ? `vol. ${ref.volume}, p. ${ref.page}` : null;
}
