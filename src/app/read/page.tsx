import { getVolumesWithLessons } from '@/lib/volumes';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getLessonIdsForSurah } from '@/lib/surahLessons';
import ReadTableOfContents from '@/components/ReadTableOfContents';

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
  const volumes = await getVolumesWithLessons();
  const suras = SURAH_LIST.map(s => ({
    ...s,
    lessonIds: getLessonIdsForSurah(s.id),
  })).filter(s => s.lessonIds.length > 0);

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-english font-semibold text-base mb-0.5"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          Table of Contents
        </h1>
        <p className="font-english text-xs italic"
          style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm · 10 volumes · 56 lessons · Shaykh Ibrāhīm Niasse
        </p>
      </div>

      <ReadTableOfContents volumes={volumes} suras={suras} />
    </main>
  );
}
