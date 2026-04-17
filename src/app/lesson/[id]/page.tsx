import { getLesson, getAllLessons } from '@/lib/lessons';
import { getReadingNotes } from '@/lib/readingNotes';
import { notFound } from 'next/navigation';
import Panel from '@/components/Panel';
import AudioPanel from '@/components/AudioPanel';
import BilingualText from '@/components/BilingualText';
import InlineCompare from '@/components/InlineCompare';
import SelectionClip from '@/components/SelectionClip';
import Link from 'next/link';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await getLesson(Number(params.id));
  if (!lesson) notFound();

  const readingNotes = getReadingNotes(Number(params.id));
  const usulBaseUrl = 'https://usul.ai/t/ruh-bayan';

  return (
    <main className="w-full px-8 xl:px-16 pb-20 pt-6">
      {/* Work title */}
      <div className="text-center pb-5 mb-5 border-b border-gold/20">
        <div className="font-arabic text-gold font-bold text-xl" dir="rtl">
          فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
        </div>
        <div className="font-english text-white/50 text-sm italic mt-1" dir="ltr">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
        </div>
      </div>

      {/* Lesson heading */}
      <div className="text-center mb-6">
        <div className="font-arabic text-gold font-bold text-2xl" dir="rtl">{lesson.arabicTitle}</div>
        <div className="font-english text-white/60 text-sm mt-1" dir="ltr">
          {lesson.englishTitle} · {lesson.verseRange}
        </div>
      </div>

      {/* 1. Audio */}
      <Panel icon="" titleAr="تسجيل صوتي للشيخ" titleEn="Sheikh Ibrāhīm Niasse — Audio">
        <AudioPanel
          wolofPlaylistId={lesson.wolofPlaylistId}
          arabicPlaylistId={lesson.arabicPlaylistId}
          arabicAudioUrl={lesson.arabicAudioUrl}
          wolofAudioUrl={lesson.wolofAudioUrl}
          sura={lesson.sura}
        />
      </Panel>

      {/* 2. Sheikh's Tafsir */}
      <Panel icon="" titleAr="تفسير الشيخ إبراهيم نياس" titleEn="Sheikh's Tafsīr Text">
        <SelectionClip
          lessonId={lesson.id}
          lessonTitleAr={lesson.arabicTitle}
          lessonTitleEn={lesson.englishTitle}
          verseRange={lesson.verseRange}
          language="ar"
        />
        <SelectionClip
          lessonId={lesson.id}
          lessonTitleAr={lesson.arabicTitle}
          lessonTitleEn={lesson.englishTitle}
          verseRange={lesson.verseRange}
          language="en"
        />
        <BilingualText
          arabicText={lesson.arabicText}
          englishText={lesson.englishText}
          hasEnglish={lesson.hasEnglish}
        />
        <div className="border-t border-white/10 p-4 pb-3" dir="ltr">
          <InlineCompare
            jalalaynText={lesson.jalalaynText ? lesson.jalalaynText.substring(0, 800) + (lesson.jalalaynText.length > 800 ? '...' : '') : undefined}
            usulaiUrl={usulBaseUrl}
          />
        </div>
      </Panel>

      {/* 3. Reading Notes */}
      <Panel icon="" titleAr="ملاحظات القراءة" titleEn="Lesson Summary">
        <div className="p-5" dir="ltr">
          <div className="mb-3 pb-3 border-b border-gold/15">
            <div className="font-english text-white/40 text-xs italic">
              Scholarly notes comparing Niasse to Tafsīr al-Jalālayn and Rūḥ al-Bayān ·
              Amadu Kunateh, Harvard University
            </div>
          </div>
          {readingNotes ? (
            <div
              className="font-english text-white/85 text-sm leading-7 space-y-3"
              dangerouslySetInnerHTML={{ __html: readingNotes }}
            />
          ) : (
            <div className="text-center py-6">
              <p className="font-english text-white/20 italic text-sm">
                Lesson summary forthcoming.
              </p>
              <p className="font-english text-white/12 text-xs mt-2">
                Comparative analysis of Niasse&apos;s tafsīr alongside Jalālayn and Rūḥ al-Bayān, with theological and philological commentary by Amadu Kunateh (Harvard University).
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* 4. Jalalayn */}
      <Panel icon="" titleAr="تفسير الجلالين" titleEn="Tafsīr al-Jalālayn — Full Text">
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-blue-900/30">
            <div>
              <div className="font-arabic text-blue-300 text-sm" dir="rtl">تفسير الجلالين</div>
              <div className="font-english text-white/40 text-xs italic">
                Jalāl al-Dīn al-Maḥallī & Jalāl al-Dīn al-Suyūṭī · English trans. Feras Hamza (2007)
              </div>
            </div>
          </div>
          {lesson.jalalaynText ? (
            <div className="font-english text-sm text-white/85 leading-7 whitespace-pre-wrap text-center jalalayn-text">
              {lesson.jalalaynText}
            </div>
          ) : (
            <p className="font-english text-white/20 italic text-sm">Text forthcoming.</p>
          )}
        </div>
      </Panel>

      {/* 5. Ruh al-Bayan */}
      <Panel icon="" titleAr="رُوحُ الْبَيَانِ" titleEn="Rūḥ al-Bayān">
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-900/30">
            <div>
              <div className="font-arabic text-green-300 text-sm" dir="rtl">رُوحُ الْبَيَانِ</div>
              <div className="font-english text-white/40 text-xs italic">
                Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715)
              </div>
            </div>
            <a href={usulBaseUrl} target="_blank" rel="noopener"
              className="font-english text-xs text-green-400/70 border border-green-500/30 px-3 py-1 rounded-full hover:border-green-400/50 transition-all">
              Open on Usul.ai ↗
            </a>
          </div>
          <p className="font-english text-white/25 italic text-sm">
            {lesson.verseRange} — full Arabic text available at Usul.ai.
          </p>
        </div>
      </Panel>

      {/* Bottom navigation */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gold/15" dir="ltr">
        {lesson.prevId ? (
          <Link href={"/lesson/" + lesson.prevId}
            className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
            ← Lesson {lesson.prevId}
          </Link>
        ) : <span />}
        <Link href="/"
          className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
          ↩ Contents
        </Link>
        {lesson.nextId ? (
          <Link href={"/lesson/" + lesson.nextId}
            className="font-english text-sm text-white border border-gold/40 bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-lg transition-all">
            Lesson {lesson.nextId} →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}
