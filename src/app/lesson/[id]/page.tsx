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
import LessonReaderLayout from '@/components/LessonReaderLayout';
import Link from 'next/link';
import { SURAH_LIST } from '@/lib/verseRanges';
import { splitArabicCommentary } from '@/lib/arabicCommentary';
import verseCitations from '@/data/verseCitations.json';
import fs from 'fs';
import path from 'path';
import JalalaynVerseView from '@/components/JalalaynVerseView';
import { getNiasseVerseExcerpts } from '@/lib/niasseVerseExcerpt';

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

  // All 56 lessons' metadata (titles, sūrah, verse range) -- needed by the
  // desktop sidebar and mobile drawer to render the full volume/lesson
  // table of contents (see VolumeLessonTree) instead of bare lesson
  // numbers. Cheap: same data generateStaticParams() already reads per
  // build, and each lesson JSON is imported once and cached by Node either
  // way.
  const lessons = await getAllLessons();

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

  // Real Arabic Jalālayn text, transcribed from al-Maktaba al-Shāmila (see
  // src/data/jalalaynArabic/SOURCE.md). Only sūrah 1 is populated so far --
  // this is an intentional proof of concept, not a partial bug. Falls back
  // to the Altafsir.com outbound link below for every other lesson until
  // more sūrahs are transcribed.
  const jalalaynArPath = jalalaynSuraId
    ? path.join(process.cwd(), 'src/data/jalalaynArabic', String(jalalaynSuraId).padStart(2, '0') + '.txt')
    : null;
  const jalalaynArabicText = jalalaynArPath && fs.existsSync(jalalaynArPath)
    ? fs.readFileSync(jalalaynArPath, 'utf-8')
    : null;

  // Real Arabic Rūḥ al-Bayān text, transcribed from Usul.ai (see
  // src/data/ruhAlBayanArabic/SOURCE.md for provenance and known gaps).
  // Same proof-of-concept scoping as Jalālayn above: only sūrah 1 so far.
  const ruhArPath = jalalaynSuraId
    ? path.join(process.cwd(), 'src/data/ruhAlBayanArabic', String(jalalaynSuraId).padStart(2, '0') + '.txt')
    : null;
  const ruhArabicText = ruhArPath && fs.existsSync(ruhArPath)
    ? fs.readFileSync(ruhArPath, 'utf-8')
    : null;

  // Per-verse Niasse (Arabic + English) excerpts for the Jalālayn/Rūḥ
  // al-Bayān comparison panels -- hand-curated for Lesson 1 / al-Fātiḥa only
  // (see src/lib/lesson1FatihaVerseMap.ts). Replaces the old single
  // lesson-wide excerpt that JalalaynVerseView used to compute itself and
  // show identically under every verse (AK, live-site report, 2026-08-16).
  const niasseByVerse = getNiasseVerseExcerpts(
    lesson.id,
    lesson.arabicBody || lesson.arabicText,
    lesson.hasEnglish ? lesson.englishText : null
  );

  // Split the full Arabic commentary into paragraphs *here*, server-side --
  // see src/lib/arabicCommentary.ts. Full text is published site-wide (AK
  // confirmed 2026-08-16; see CLAUDE.md), so nothing is redacted before this
  // reaches the 'use client' BilingualText component.
  const lessonCitations = (verseCitations as Record<string, Record<string, Record<string, string>>>)[String(lesson.id)];
  const arabicFull = splitArabicCommentary(lesson.arabicBody || lesson.arabicText);

  // Top content: breadcrumb and jump tabs
  const topContent = (
    <>
      <PanelJumpTabs lessonId={lesson.id} lessons={lessons} />
      <LessonAudioBar lessonId={lesson.id} />
      <div className="flex items-center gap-2 px-4 py-1.5 text-xs" style={{borderBottom:'1px solid rgba(13,31,10,0.1)'}}>
        <a href="/read"
          className="font-english hover:text-gold transition-colors flex items-center gap-1"
          style={{color:'rgba(13,31,10,0.5)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          All Sūrahs
        </a>
      </div>
    </>
  );

  // Main content: panels
  const mainContent = (
    <>
      <Panel icon="" titleAr="تفسير الشيخ إبراهيم نياس" titleEn="Shaykh Ibrāhīm's Tafsīr" panelId="tafsir" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange} defaultOpen={true}>
        {lesson.openingInvocation && (
          <OpeningInvocation html={(lesson as any).openingInvocation} />
        )}
        <BilingualText
          poemLines={arabicFull.poemLines}
          arabicParagraphs={arabicFull.paragraphs}
          citations={lessonCitations}
          englishText={lesson.englishText}
          hasEnglish={lesson.hasEnglish}
          lessonId={lesson.id}
          footnoteOrder={(lesson as any).footnoteOrder}
        />
      </Panel>

      <Panel icon="" titleAr="الحواشي والمصادر" titleEn="Citations" panelId="citations" lessonId={lesson.id} lessonTitleEn={lesson.englishTitle} verseRange={lesson.verseRange}>
        <LessonCitations lessonId={lesson.id} />
      </Panel>

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
          {jalalaynArabicText ? (
            <JalalaynVerseView
              jalalaynText={jalalaynArabicText}
              jalalaynLang="ar"
              niasseByVerse={niasseByVerse}
              verseRange={lesson.verseRange}
              lessonTitleEn={lesson.englishTitle}
            />
          ) : (
            <p className="font-english text-white/25 italic text-sm">
              {lesson.verseRange} — Arabic &amp; English translation available at Altafsir.com (Royal Aal al-Bayt Institute). Verse-by-verse Arabic text on this page is being added sūrah by sūrah; not yet reached this one.
            </p>
          )}
        </div>
      </Panel>

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
          {ruhArabicText ? (
            <JalalaynVerseView
              jalalaynText={ruhArabicText}
              jalalaynLang="ar"
              sourceLabelAr="رُوحُ الْبَيَانِ"
              niasseByVerse={niasseByVerse}
              verseRange={lesson.verseRange}
              lessonTitleEn={lesson.englishTitle}
            />
          ) : (
            <p className="font-english text-white/25 italic text-sm">
              {lesson.verseRange} — full Arabic text available at Usul.ai. Verse-by-verse Arabic text on this page is being added sūrah by sūrah; not yet reached this one.
            </p>
          )}
        </div>
      </Panel>
    </>
  );

  // Bottom content: navigation
  const bottomContent = (
    <>
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
    </>
  );

  return (
    <>
      <LessonReaderLayout
        lesson={lesson}
        topContent={topContent}
        bottomContent={bottomContent}
      >
        {mainContent}
      </LessonReaderLayout>
      <LessonPageNavigator lessonId={lesson.id} prevId={lesson.prevId} nextId={lesson.nextId} lessons={lessons} />
      <LessonAnnotationLayer lessonId={lesson.id} lessonTitle={lesson.englishTitle || ""} verseRange={lesson.verseRange || ""} />
    </>
  );
}
