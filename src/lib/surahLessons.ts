// Sūrah → lesson-range mapping for the /surah/[id] continuous-reading view.
//
// Mirrors the curated SURA_TO_LESSON / SURA_LESSON_END tables already in
// src/app/read/page.tsx (kept in sync manually -- see that file for the
// full derivation notes). "Begins" here means the first lesson where the
// sūrah is the lesson's PRIMARY subject (matches lesson.sura), not merely
// the first lesson whose tail end happens to touch its opening verses --
// e.g. Lesson 20 ("Q. 7:171-8:40") technically reaches into the first 40
// verses of al-Anfāl, but al-Anfāl's substantive commentary only begins at
// Lesson 21, so that's where this table starts it. This matches what
// readers already see in Browse-by-Sūrah on /read.

const SURA_TO_LESSON: Record<number, number> = {
  1:1, 2:2, 3:8, 4:11, 5:14, 6:16, 7:18, 8:21, 9:22, 10:24,
  11:25, 12:26, 13:28, 14:28, 15:29, 16:30, 17:30, 18:31, 19:32, 20:32,
  21:33, 22:34, 23:35, 24:35, 25:36, 26:37, 27:37, 28:38, 29:39, 30:39,
  31:39, 32:40, 33:40, 34:41, 35:41, 36:42, 37:42, 38:43, 39:43, 40:44,
  41:44, 42:45, 43:45, 44:45, 45:46, 46:46, 47:46, 48:46, 49:47, 50:47,
  51:47, 52:48, 53:48, 54:48, 55:49, 56:49, 57:49, 58:50, 59:50, 60:50,
  61:50, 62:51, 63:51, 64:51, 65:51, 66:51, 67:52, 68:52, 69:52, 70:52,
  71:52, 72:53, 73:53, 74:53, 75:53, 76:53, 77:53, 78:54, 79:54, 80:54,
  81:54, 82:54, 83:54, 84:54, 85:54, 86:54, 87:55, 88:55, 89:55, 90:55,
  91:55, 92:55, 93:55, 94:55, 95:55, 96:55, 97:55, 98:55, 99:55, 100:55,
  101:55, 102:55, 103:55, 104:55, 105:55, 106:55, 107:55, 108:55, 109:55, 110:55,
  111:55, 112:56, 113:56, 114:56,
};

const SURA_LESSON_END: Record<number, number> = {
  2:7, 3:10, 4:13, 5:16, 7:20, 9:23, 11:26, 12:27, 20:33, 21:34,
  24:36, 27:38, 31:40, 33:41, 35:42, 37:43, 41:45, 44:46, 48:47, 51:48,
};

/** Ordered list of lesson ids covering a given sūrah (inclusive range). */
export function getLessonIdsForSurah(surahId: number): number[] {
  const start = SURA_TO_LESSON[surahId];
  if (!start) return [];
  const end = SURA_LESSON_END[surahId] || start;
  const ids: number[] = [];
  for (let id = start; id <= end; id++) ids.push(id);
  return ids;
}

export function getAdjacentSurahIds(surahId: number): { prev: number | null; next: number | null } {
  return {
    prev: surahId > 1 ? surahId - 1 : null,
    next: surahId < 114 ? surahId + 1 : null,
  };
}
