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

// Reading a sūra NAME out of a free-text query.
//
// Why this exists: a reader looking for what the Shaykh said about al-Wāqiʿa
// typed "surah waqiah" and got nothing. Three things stood in the way. The
// search folded Arabic diacritics but not the transliteration's, so "waqiah"
// never met "Wāqiʿa"; it matched only body prose, never a lesson's title; and
// the Arabic sūra names are nowhere in the index, since a lesson's Arabic title
// is its number — الدرس التاسع والأربعون — not the sūras it covers.
//
// So the name is answered by routing, as a verse reference is. Accepts what
// people type: "waqiah", "al-waqia", "Sūrat al-Wāqiʿa", "surah 56", "الواقعة".

/** Fold a query or a name to bare letters: no diacritics in either script, no
 *  hamza or ʿayn, no definite article, no 'sura' and no tāʾ marbūṭa. */
export function foldName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')          // Latin combining marks: ā ī ū ḥ ṣ ḍ ṭ ẓ
    .replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, '')  // Arabic marks
    .replace(/[\u02BE\u02BF\u02BC\u02BB\u2018\u2019'`]/g, '')         // ʾ ʿ and friends
    .toLowerCase()
    // the word for sūra goes first, before ة is folded to ه and stops matching
    .replace(/\b(?:suratu|surat|surah|sura)\b/g, ' ')
    .replace(/\u0633\u0648\u0631[\u0629\u0647\u062A]?/g, ' ')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\bal[\s-]?/g, ' ')
    .replace(/\u0627\u0644(?=\S)/g, '')
    .replace(/[^a-z\u0621-\u064A]/g, '')
    // tāʾ marbūṭa reaches English as -a, -ah or -at: level them
    .replace(/(?<=[a-z])[ht]$/, '');
}

export interface SurahNameHit {
  surah: number;
  meta: SurahMeta;
  /** True when the query gave a number rather than a name. */
  byNumber: boolean;
}

export function parseSurahName(raw: string): SurahNameHit | null {
  const q = raw.trim();
  if (!q) return null;

  const byNum = /^(?:(?:surat|surah|sura)\s*|سورة\s*)(\d{1,3})$/i.exec(q);
  if (byNum) {
    const meta = SURAH_LIST.find(s => s.id === Number(byNum[1]));
    return meta ? { surah: meta.id, meta, byNumber: true } : null;
  }

  const f = foldName(q);
  if (f.length < 3) return null;            // 'nas', 'tin' are the shortest names
  const exact = SURAH_LIST.filter(s => foldName(s.nameEn) === f || foldName(s.nameAr) === f);
  if (exact.length === 1) return { surah: exact[0].id, meta: exact[0], byNumber: false };
  // A reader may type only part of the name, or add a word: accept a unique
  // prefix, but never a bare substring, which would make 'nas' match al-Nisāʾ.
  const pre = SURAH_LIST.filter(s => foldName(s.nameEn).startsWith(f) || foldName(s.nameAr).startsWith(f));
  if (pre.length === 1) return { surah: pre[0].id, meta: pre[0], byNumber: false };
  return null;
}
