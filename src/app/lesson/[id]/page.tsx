import { getLesson, getAllLessons } from '@/lib/lessons';
import { getReadingNotes } from '@/lib/readingNotes';
import { notFound } from 'next/navigation';
import Panel from '@/components/Panel';
import JalalaynVerseView from '@/components/JalalaynVerseView';
import BilingualText from '@/components/BilingualText';
import InlineCompare from '@/components/InlineCompare';
import PanelJumpTabs from '@/components/PanelJumpTabs';
import LessonAudioBar from '@/components/LessonAudioBar';
import LessonNav from '@/components/LessonNav';
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
    <main className="w-full px-8 xl:px-16 pb-20 pt-3">
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
      <div className="text-center mb-4">
        <div className="font-arabic text-gold font-bold text-2xl" dir="rtl">{lesson.arabicTitle}</div>
        <div className="font-english text-sm mt-1" dir="ltr" style={{color:"var(--lesson-header-sub, rgba(255,255,255,0.6))"}}>
          {lesson.englishTitle} · {lesson.verseRange}
        </div>
        <div className="font-english text-xs mt-1" dir="ltr" style={{color:"var(--lesson-header-faint, rgba(255,255,255,0.3))"}}>
          Revised 10-vol. Arabic edition · Vol. {lesson.volume ?? '—'}
          {lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ''}
          {!lesson.pageInVolume && lesson.volume ? ' · page to be confirmed' : ''}
        </div>
      </div>

      {/* 1. Shaykh Ibrāhīm's Tafsīr */}
      
      <PanelJumpTabs />
      <LessonAudioBar lessonId={lesson.id} />
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-1.5 text-xs"
        style={{borderBottom:'1px solid rgba(201,168,76,0.1)'}}>
        <a href="/read"
          className="font-english hover:text-gold transition-colors flex items-center gap-1"
          style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          All Sūrahs
        </a>
      </div>
<Panel icon="" titleAr="تفسير الشيخ إبراهيم نياس" titleEn="Shaykh Ibrāhīm's Tafsīr" panelId="tafsir" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange}>
        <BilingualText
          arabicText={lesson.arabicBody || lesson.arabicText}
          englishText={lesson.englishText}
          hasEnglish={lesson.hasEnglish}
          lessonId={lesson.id}
        />

      </Panel>

      {/* 2. Lesson Overview */}
      <Panel icon="" titleAr="نظرة عامة على الدرس" titleEn="Lesson Overview">
        <div className="p-5" dir="ltr">
          <div className="mb-3 pb-3 border-b border-gold/15">
            <div className="font-english text-white/40 text-xs italic">
              Lesson overview · Amadu Kunateh, Founder, Translator & Digital Editor
            </div>
          </div>
          {readingNotes ? (
            <div
              className="font-english text-white/85 text-sm leading-7 space-y-3"
              dangerouslySetInnerHTML={{ __html: readingNotes }}
            />
          ) : lesson.lessonSummary ? (
            <div>
              <p className="font-english text-sm leading-7" style={{color:'var(--body-text, rgba(255,255,255,0.75))'}}>
                {lesson.lessonSummary}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-english text-white/20 italic text-sm">
                Lesson overview forthcoming.
              </p>
              <p className="font-english text-white/12 text-xs mt-2">
                Comparative analysis of Shaykh Ibrāhīm&apos;s tafsīr alongside Jalālayn and Rūḥ al-Bayān, with theological and philological commentary by Amadu Kunateh (Harvard University).
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* 3. Audio */}
      
      {/* 5. Rūḥ al-Bayān */}
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
    
      <LessonNav lessonId={lesson.id} manzil={lesson.manzil} />
      </main>
  );
}
