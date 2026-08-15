import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/lessons';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getLessonIdsForSurah, getAdjacentSurahIds } from '@/lib/surahLessons';
import SurahReader, { SurahLessonData } from '@/components/SurahReader';
import verseCitations from '@/data/verseCitations.json';

export async function generateStaticParams() {
  return SURAH_LIST.map(s => ({ id: String(s.id) }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const surahId = Number(params.id);
  const meta = SURAH_LIST.find(s => s.id === surahId);
  if (!meta) return {};
  return {
    title: `Sūrat ${meta.nameEn} — Tafsīr`,
    description: `Shaykh Ibrāhīm Niasse's tafsīr of Sūrat ${meta.nameEn} (${meta.nameAr}), ${meta.ayahCount} verses, continuous reading view.`,
  };
}

export default async function SurahPage({ params }: { params: { id: string } }) {
  const surahId = Number(params.id);
  const meta = SURAH_LIST.find(s => s.id === surahId);
  if (!meta) notFound();

  const lessonIds = getLessonIdsForSurah(surahId);
  if (lessonIds.length === 0) notFound();

  const lessons = (await Promise.all(lessonIds.map(id => getLesson(id))))
    .filter((l): l is NonNullable<typeof l> => l !== null)
    .map((l): SurahLessonData => ({
      id: l.id,
      arabicTitle: l.arabicTitle,
      englishTitle: l.englishTitle,
      verseRange: l.verseRange,
      sura: l.sura,
      // Full, unredacted Arabic commentary -- AK has confirmed rights to
      // display it in full for this reading view (2026-08-15), unlike the
      // citation-fragment-only redaction used on /lesson/[id] pages.
      arabicBody: l.arabicBody || l.arabicText || '',
      englishText: l.englishText,
      hasEnglish: !!l.hasEnglish,
      footnoteOrder: l.footnoteOrder,
      // High-confidence (substring/pair) verse matches for this lesson --
      // see scripts/build-verse-citations.js. paraIndex -> spanIndex -> verse.
      citations: (verseCitations as Record<string, Record<string, Record<string, string>>>)[String(l.id)],
    }));

  if (lessons.length === 0) notFound();

  const { prev, next } = getAdjacentSurahIds(surahId);
  const prevMeta = prev ? SURAH_LIST.find(s => s.id === prev) : null;
  const nextMeta = next ? SURAH_LIST.find(s => s.id === next) : null;

  return (
    <SurahReader
      surahId={surahId}
      nameAr={meta.nameAr}
      nameEn={meta.nameEn}
      ayahCount={meta.ayahCount}
      lessons={lessons}
      prevSurah={prevMeta ? { id: prevMeta.id, nameEn: prevMeta.nameEn } : null}
      nextSurah={nextMeta ? { id: nextMeta.id, nameEn: nextMeta.nameEn } : null}
    />
  );
}
