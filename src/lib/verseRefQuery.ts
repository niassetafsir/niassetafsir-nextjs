// Reading a verse reference out of a free-text query.
//
// Why this exists: /search matched the query against one field, the body prose
// of each indexed paragraph. A reader typing "36:39" -- which is how anyone
// who works with the Qur'an writes a reference -- got "No results found",
// because no paragraph of Niasse's Arabic or its English translation contains
// the literal string "36:39". The verse page for it already existed and
// rendered correctly; nothing pointed at it.
//
// Accepts the forms people actually type: "36:39", "36 : 39", "Q 36:39",
// "Q. 36:39", "36.39", "36/39", and a range like "2:255-256" (the range's
// first verse is what gets resolved -- the verse page is per-verse).

import { SURAH_LIST, type SurahMeta } from './verseRanges';

export interface VerseRef {
  surah: number;
  ayah: number;
  /** Present when the surah number is valid. */
  meta: SurahMeta | null;
  /** True when the surah exists but has fewer ayahs than the one asked for. */
  ayahOutOfRange: boolean;
  /** The end of a range query like "2:255-256", for display only. */
  ayahEnd: number | null;
}

const PATTERN = /^(?:q\.?\s*)?(\d{1,3})\s*[:.\/]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?$/i;

export function parseVerseRef(raw: string): VerseRef | null {
  const m = PATTERN.exec(raw.trim());
  if (!m) return null;

  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  const ayahEnd = m[3] ? Number(m[3]) : null;

  // A surah number outside 1-114 is not a verse reference at all -- more
  // likely a page number or a date fragment. Say nothing rather than offer a
  // link that leads nowhere.
  if (surah < 1 || surah > 114 || ayah < 1) return null;

  const meta = SURAH_LIST.find(s => s.id === surah) ?? null;
  return {
    surah,
    ayah,
    meta,
    ayahOutOfRange: !!meta && ayah > meta.ayahCount,
    ayahEnd: ayahEnd && ayahEnd > ayah ? ayahEnd : null,
  };
}
