import arabicProofread from '@/data/arabicProofread.json';
import { getVolumeIndex } from '@/lib/volumes';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getLessonIdsForSurah } from '@/lib/surahLessons';
import ReadTableOfContents from '@/components/ReadTableOfContents';
import Link from 'next/link';
import { getEditionFacts } from '@/lib/coverage';

export const metadata = {
  title: 'The 56 Lessons',
  description: 'Fī Riyāḍ al-Tafsīr: the 56 recorded lessons in which Shaykh Ibrāhīm Niasse explained the whole Qurʾān in Ramaḍān 1964, in Arabic with English for Lessons 1–17.',
};

// Full table of contents, styled after usul.ai's expandable reader outline.
// This page (and VolumeLessonTree, which it shares with the desktop sidebar
// and mobile drawer) is now the single place volume → lesson browsing is
// implemented. It used to hand-maintain its own copies of the sūrah list,
// the sūrah→lesson map, and every lesson's verse range and title -- all of
// which already exist as the site's real data (src/data/lessons/*.json via
// getVolumesWithLessons(), and src/lib/verseRanges.ts / surahLessons.ts for
// the sūrah index used by /surah/[id]). Those hardcoded copies are gone;
// this page just reads the real data.
export default async function ReadPage() {
  const volumes = await getVolumeIndex();
  const facts = await getEditionFacts();
  const suras = SURAH_LIST.map(s => ({
    ...s,
    lessonIds: getLessonIdsForSurah(s.id),
  })).filter(s => s.lessonIds.length > 0);

  // The proofread lessons run 1..n; if the list ever has a gap, say nothing
  // rather than claim a range it does not cover.
  const proofread = (arabicProofread as { lessons: number[] }).lessons;
  const arabicRun = proofread.every((id, i) => id === i + 1) ? proofread.length : 0;
  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-english font-semibold text-base mb-0.5"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          The 56 Lessons
        </h1>
        <p className="font-english text-xs italic"
          style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          <em>Fī Riyāḍ al-Tafsīr</em> · Tafsīr of the Noble Qurʾān · 10 volumes · 56 lessons
        </p>
        <p className="font-english text-[13px] leading-relaxed mt-2"
          style={{color:'var(--body-sub, rgba(255,255,255,0.7))'}}>
          Shaykh Ibrāhīm Niasse&rsquo;s recorded lessons on the whole Qurʾān, delivered during Ramaḍān 1964,
          listed in the order of the original teaching.
          {arabicRun > 0 && arabicRun < facts.totalLessons && (
            <> The Arabic text is available for Lessons 1–{arabicRun}.</>
          )}
          {facts.translatedCount > 0 && facts.translatedFirst !== null && facts.translatedLast !== null && (
            <> English translations are available for Lessons {facts.translatedFirst}–{facts.translatedLast} (marked EN).</>
          )}
          {' '}<Link href="/audio" className="text-gold/80 hover:text-gold underline">Recordings</Link> are available for {facts.audioLessons} lessons (marked ♪).
          Search by sūra, lesson title or Qurʾānic verse, or browse the ten volumes below.
        </p>
      </div>

      <ReadTableOfContents volumes={volumes} suras={suras} />
    </main>
  );
}
