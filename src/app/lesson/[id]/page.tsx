import { getLesson, getAllLessons } from '@/lib/lessons';
import { getReadingNotes } from '@/lib/readingNotes';
import { notFound, redirect } from 'next/navigation';
import Panel from '@/components/Panel';
import BilingualText from '@/components/BilingualText';
import PanelJumpTabs from '@/components/PanelJumpTabs';
import LessonAudioBar from '@/components/LessonAudioBar';
import OpeningInvocation from '@/components/OpeningInvocation';
import LessonNav from '@/components/LessonNav';
import LessonPageNavigator from '@/components/LessonPageNavigator';
import LessonAnnotationLayer from '@/components/LessonAnnotationLayer';
import SelectionClip from '@/components/SelectionClip';
import LessonCitations from '@/components/LessonCitations';
import Link from 'next/link';
import { SURAH_LIST } from '@/lib/verseRanges';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  // Lesson 57 was a duplicate placeholder for the same suras covered by Lesson 56
  // (Al-Ikhlas / Al-Falaq / Al-Nas) per the Drive table of contents; the tafsir's
  // final lesson is 56, not 57. Redirect any old links.
  if (Number(params.id) === 57) redirect('/lesson/56');

  const lesson = await getLesson(Number(params.id));
  if (!lesson) notFound();

  const readingNotes = getReadingNotes(Number(params.id));
  const usulBaseUrl = 'https://usul.ai/t/ruh-bayan';

  // Jalālayn -- Royal Aal al-Bayt Institute's altafsir.com (tTafsirNo=74 is
  // their internal id for Tafsīr al-Jalālayn), which hosts a full English
  // translation, unlike Usul.ai's Arabic-only text. Deep-link to this
  // lesson's sūra when we can resolve lesson.sura against SURAH_LIST;
  // otherwise fall back to the tafsīr's general landing page.
  const JALALAYN_TAFSIR_NO = 74;
  const jalalaynSuraId = SURAH_LIST.find(s => s.nameEn === lesson.sura)?.id;
  const jalalaynUrl = jalalaynSuraId
    ? `https://www.altafsir.com/Tafasir.asp?tMadhNo=1&tTafsirNo=${JALALAYN_TAFSIR_NO}&tSoraNo=${jalalaynSuraId}&tAyahNo=1&tDisplay=yes&LanguageId=2`
    : `https://www.altafsir.com/Tafasir.asp?tTafsirNo=${JALALAYN_TAFSIR_NO}&tDisplay=yes&LanguageId=2`;

  return (
    <div className="lesson-reading-page flex bg-cream text-ink" style={{minHeight:"calc(100vh - 56px)"}}>
    <main className="flex-1 min-w-0 w-full px-4 xl:px-12 pb-20 pt-3">
      {/* Bibliographic header — work title, lesson heading, vol./page metadata */}
      <div className="text-center pb-4 mb-4 border-b" style={{borderColor:'rgba(13,31,10,0.12)'}}>
        <div className="font-arabic-sans font-bold text-base" dir="rtl" style={{color:'#8a6d1f'}}>
          فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
        </div>
        <div className="font-english text-[11px] italic mt-0.5" dir="ltr" style={{color:'rgba(13,31,10,0.5)'}}>
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
        </div>
      </div>

      {/* Lesson heading */}
      <div className="text-center mb-3">
        <div className="font-arabic-sans font-bold text-xl" dir="rtl" style={{color:'#8a6d1f'}}>{lesson.arabicTitle}</div>
        <div className="font-english text-xs mt-1" dir="ltr" style={{color:'rgba(13,31,10,0.65)'}}>
          {lesson.englishTitle} · {lesson.verseRange}
        </div>
        <div className="font-english text-[10px] mt-1 uppercase tracking-wide" dir="ltr" style={{color:'#8a6d1f'}}>
          Revised 10-vol. Arabic edition · Vol. {lesson.volume ?? '—'}
          {lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ''}
          {!lesson.pageInVolume && lesson.volume ? ' · page to be confirmed' : ''}
        </div>
      </div>

      {/* 1. Shaykh Ibrāhīm's Tafsīr */}

      <PanelJumpTabs lessonId={lesson.id} />
      <LessonAudioBar lessonId={lesson.id} />
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-1.5 text-xs"
        style={{borderBottom:'1px solid rgba(13,31,10,0.1)'}}>
        <a href="/read"
          className="font-english hover:text-gold transition-colors flex items-center gap-1"
          style={{color:'rgba(13,31,10,0.5)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          All Sūrahs
        </a>
      </div>
<Panel icon="" titleAr="تفسير الشيخ إبراهيم نياس" titleEn="Shaykh Ibrāhīm's Tafsīr" panelId="tafsir" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange} defaultOpen={true}>
        {lesson.openingInvocation && (
              <OpeningInvocation html={(lesson as any).openingInvocation} />
            )}
              <BilingualText
          arabicText={lesson.arabicBody || lesson.arabicText}
          englishText={lesson.englishText}
          hasEnglish={lesson.hasEnglish}
          lessonId={lesson.id}
          footnoteOrder={(lesson as any).footnoteOrder}
        />

      </Panel>

      {/* 1b. Citations — full apparatus for this lesson */}
      <Panel icon="" titleAr="الحواشي والمصادر" titleEn="Citations" panelId="citations" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange}>
        <LessonCitations lessonId={lesson.id} />
      </Panel>

      {/* 2. Lesson Overview */}
      <Panel icon="" titleAr="نظرة عامة على الدرس" titleEn="Lesson Overview" panelId="overview" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange}>
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
      
      {/* 4. Jalālayn */}
      <Panel icon="" titleAr="تَفْسِيرُ الْجَلَالَيْنِ" titleEn="Jalālayn" panelId="jalalayn" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange}>
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-900/30">
            <div>
              <div className="font-arabic text-green-300 text-sm" dir="rtl">تَفْسِيرُ الْجَلَالَيْنِ</div>
              <div className="font-english text-white/40 text-xs italic">
                Jalāl al-Dīn al-Maḥallī &amp; Jalāl al-Dīn al-Suyūṭī
              </div>
            </div>
            <a href={jalalaynUrl} target="_blank" rel="noopener"
              className="font-english text-xs text-green-400/70 border border-green-500/30 px-3 py-1 rounded-full hover:border-green-400/50 transition-all">
              Open on Altafsir.com ↗
            </a>
          </div>
          <p className="font-english text-white/25 italic text-sm">
            {lesson.verseRange} — Arabic &amp; English translation available at Altafsir.com (Royal Aal al-Bayt Institute).
          </p>
        </div>
      </Panel>

      {/* 5. Rūḥ al-Bayān */}
      <Panel icon="" titleAr="رُوحُ الْبَيَانِ" titleEn="Rūḥ al-Bayān" panelId="ruh" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange}>
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
            className="font-english text-sm font-semibold text-gold-deep border border-gold-deep/40 bg-gold/15 hover:bg-gold/25 px-4 py-2 rounded-lg transition-all">
            Lesson {lesson.nextId} →
          </Link>
        ) : <span />}
      </div>
    
      <LessonNav lessonId={lesson.id} manzil={lesson.manzil} />
      </main>
    <LessonPageNavigator lessonId={lesson.id} prevId={lesson.prevId} nextId={lesson.nextId} />
    <LessonAnnotationLayer lessonId={lesson.id} lessonTitle={lesson.englishTitle || ""} verseRange={lesson.verseRange || ""} />
    </div>
  );
}
