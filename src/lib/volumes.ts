import { Lesson } from './types';
import { getAllLessons } from './lessons';

// Volume → lesson-range table for the revised ten-volume compiled Arabic
// edition (Majmaʿ al-Yamāma, Tunis 2010), verified against the `volume`
// field in src/data/lessons/*.json. This is the single source of truth for
// volume boundaries -- previously this table (or a subset of it) was
// hand-copied into MobileLessonDrawer.tsx, LessonPageNavigator.tsx, and
// about/arabic-edition/page.tsx independently. Sūra-range labels below are
// taken from the Volume Catalogue on the Arabic Edition page, the site's
// own existing (and most complete) description of each volume's contents.
//
// Lesson 57 in the data is a placeholder for suras already covered by
// Lesson 56 (see app/lesson/[id]/page.tsx redirect), so Volume X's real
// range is 51-56, not 51-57.
export interface VolumeMeta {
  vol: number;
  roman: string;
  arabicOrdinal: string;
  start: number;
  end: number;
  rangeLabel: string;
}

export const VOLUME_META: VolumeMeta[] = [
  { vol: 1,  roman: 'I',    arabicOrdinal: 'الجزء الأول',   start: 1,  end: 6,  rangeLabel: 'Al-Istiʿādha · al-Fātiḥa – al-Baqara (Q. 1:1–2:252)' },
  { vol: 2,  roman: 'II',   arabicOrdinal: 'الجزء الثاني',  start: 7,  end: 12, rangeLabel: 'Al-Baqara – Al-Nisāʾ (Q. 2:253–4:147)' },
  { vol: 3,  roman: 'III',  arabicOrdinal: 'الجزء الثالث',  start: 13, end: 19, rangeLabel: 'Al-Nisāʾ – Al-Aʿrāf (Q. 4:148–7:170)' },
  { vol: 4,  roman: 'IV',   arabicOrdinal: 'الجزء الرابع',  start: 20, end: 25, rangeLabel: 'Al-Aʿrāf – Hūd (Q. 7:171–11:83)' },
  { vol: 5,  roman: 'V',    arabicOrdinal: 'الجزء الخامس',  start: 26, end: 30, rangeLabel: 'Hūd – Al-Naḥl (Q. 11:84–17:111)' },
  { vol: 6,  roman: 'VI',   arabicOrdinal: 'الجزء السادس',  start: 31, end: 35, rangeLabel: 'Al-Kahf – Al-Nūr' },
  { vol: 7,  roman: 'VII',  arabicOrdinal: 'الجزء السابع',  start: 36, end: 40, rangeLabel: 'Al-Nūr – Al-Aḥzāb' },
  { vol: 8,  roman: 'VIII', arabicOrdinal: 'الجزء الثامن',  start: 41, end: 45, rangeLabel: 'Al-Aḥzāb – Al-Dukhān' },
  { vol: 9,  roman: 'IX',   arabicOrdinal: 'الجزء التاسع',  start: 46, end: 50, rangeLabel: 'Al-Dukhān – Al-Ṣaff' },
  { vol: 10, roman: 'X',    arabicOrdinal: 'الجزء العاشر',  start: 51, end: 56, rangeLabel: 'Al-Jumuʿa – Al-Nās' },
];

export function getVolumeMeta(vol: number): VolumeMeta | undefined {
  return VOLUME_META.find(v => v.vol === vol);
}

export function volumeForLesson(lessonId: number): VolumeMeta | undefined {
  return VOLUME_META.find(v => lessonId >= v.start && lessonId <= v.end);
}

export interface VolumeWithLessons extends VolumeMeta {
  lessons: Lesson[];
}

// The only fields VolumeLessonTree actually renders (see its TreeLesson
// interface). Everything else on a Lesson -- arabicBody, englishText,
// jalalaynText, footnotes -- is dead weight to the tree.
//
// This exists because passing full Lesson objects into a client component
// serialises them into the RSC flight payload. Both lesson-page trees are
// client components, so /lesson/[id] was shipping the complete text of all
// 56 lessons twice: 11,808,973 characters of script on /lesson/2, a page
// with almost nothing on it. /read did the same once, at 9.6 MB. Much of
// this site's readership is on mobile data in West Africa, where that is
// not a page-speed statistic but a cost barrier.
export interface LessonIndexEntry {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  sura: string;
  verseRange: string;
  hasEnglish: boolean;
}

export function toLessonIndex(lessons: Lesson[]): LessonIndexEntry[] {
  return lessons.map(l => ({
    id: l.id,
    arabicTitle: l.arabicTitle,
    englishTitle: l.englishTitle,
    sura: l.sura,
    verseRange: l.verseRange,
    hasEnglish: l.hasEnglish,
  }));
}

export interface VolumeWithLessonIndex extends VolumeMeta {
  lessons: LessonIndexEntry[];
}

// Pure, sync version of the grouping below -- for call sites (e.g.
// app/lesson/[id]/page.tsx) that have already called getAllLessons() once
// and shouldn't re-import all 56 lesson JSON files a second time just to
// get the same lessons grouped by volume.
export function volumesFromLessons<T extends { id: number }>(
  allLessons: T[]
): (VolumeMeta & { lessons: T[] })[] {
  return VOLUME_META.map(v => ({
    ...v,
    lessons: allLessons.filter(l => l.id >= v.start && l.id <= v.end),
  }));
}

// Slim counterpart to getVolumesWithLessons, for the three trees that cross
// a client-component boundary. Use this one unless the caller genuinely
// needs lesson bodies server-side (e.g. /volume/[id], which reads
// lessonSummary and never passes lessons to a client component).
export async function getVolumeIndex(): Promise<VolumeWithLessonIndex[]> {
  return volumesFromLessons(toLessonIndex(await getAllLessons()));
}

// Groups the live lesson data (title, summary, etc. -- read directly from
// src/data/lessons/*.json) by volume, so volume pages never fall out of
// sync with lesson content the way the old manzil pages did.
export async function getVolumesWithLessons(): Promise<VolumeWithLessons[]> {
  const allLessons = await getAllLessons();
  return volumesFromLessons(allLessons);
}

export function truncateSummary(text: string | undefined | null, maxLen = 128): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  let cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);
  return cut + '…';
}
