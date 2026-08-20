import { getLesson, getAllLessons } from '@/lib/lessons';
import { getReadingNotes } from '@/lib/readingNotes';
import { notFound, redirect } from 'next/navigation';
import LessonExperience from '@/components/LessonExperience';
import BilingualText from '@/components/BilingualText';
import PanelJumpTabs from '@/components/PanelJumpTabs';
import LessonAudioBar from '@/components/LessonAudioBar';
import OpeningInvocation from '@/components/OpeningInvocation';
import LessonNav from '@/components/LessonNav';
import LessonAnnotationLayer from '@/components/LessonAnnotationLayer';
import SelectionClip from '@/components/SelectionClip';
import LessonCitations from '@/components/LessonCitations';
import LessonReaderLayout from '@/components/LessonReaderLayout';
import Link from 'next/link';
import { SURAH_LIST } from '@/lib/verseRanges';
import { splitArabicCommentary } from '@/lib/arabicCommentary';
import { toLessonIndex } from '@/lib/volumes';
import verseCitations from '@/data/verseCitations.json';
import fs from 'fs';
import path from 'path';
import ComparativeCommentary from '@/components/ComparativeCommentary';
import { getNiasseVerseExcerpts, getNiasseUnits } from '@/lib/niasseVerseExcerpt';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  // 57.json was a 128-character placeholder duplicating Lesson 56's own sūras
  // (Al-Ikhlas / Al-Falaq / Al-Nas) and has been deleted. While it existed, its
  // explicit "Q. 112:1-114:6" outranked the chain in build-lesson-ranges.py and
  // took those three sūras from the session that actually treats them, leaving
  // Lesson 56 covering no āya at all. The tafsir's final lesson is 56. This
  // redirect stays for old links.
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

  // Our own English Jalālayn, translated from the Arabic above for this
  // project. NOT lesson.jalalaynText, which was verified 2026-08-19 against
  // altafsir.com to be Feras Hamza's translation, © 2007 Royal Aal al-Bayt
  // Institute — see src/data/jalalaynEnglish/SOURCE.md, and the independence
  // check in scripts/jalalayn-en-independence.mjs.
  const jalalaynEnPath = jalalaynSuraId
    ? path.join(process.cwd(), 'src/data/jalalaynEnglish', String(jalalaynSuraId).padStart(2, '0') + '.txt')
    : null;
  const jalalaynEnglishText = jalalaynEnPath && fs.existsSync(jalalaynEnPath)
    ? fs.readFileSync(jalalaynEnPath, 'utf-8')
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

  // The unit partition drives the paged presentation in ComparativeCommentary.
  // Null for every lesson without a hand-curated segmentation -- i.e. all but
  // the first -- and those fall back to the verse rail, which asserts no
  // segmentation and needs only the [s:v] markers in the text files.
  const niasseUnits = getNiasseUnits(
    lesson.id,
    lesson.arabicBody || lesson.arabicText,
    lesson.hasEnglish ? lesson.englishText : null
  );

  // Split the full Arabic commentary into paragraphs *here*, server-side --
  // see src/lib/arabicCommentary.ts. Full text is published site-wide (AK
  // confirmed 2026-08-16; see CLAUDE.md), so nothing is redacted before this
  // reaches the 'use client' BilingualText component.
  // Slim view of the lesson list for the navigation drawer.
  // PanelJumpTabs (via MobileLessonDrawer) is a client component, so whatever
  // is handed to them is serialised into the RSC flight payload. Passing the
  // full Lesson objects shipped the complete text of all 56 lessons twice on
  // every lesson page -- ~19 MB. The trees render six fields; send six.
  const lessonIndex = toLessonIndex(lessons);

  const lessonCitations = (verseCitations as Record<string, Record<string, Record<string, string>>>)[String(lesson.id)];
  const arabicFull = splitArabicCommentary(lesson.arabicBody || lesson.arabicText);

  // Top content: breadcrumb and jump tabs
  const topContent = (
    <>
      {/* "All Sūrahs" used to occupy a full-width band of its own directly
          below the drawer bar, which held one button. Three stacked
          single-purpose rows -- drawer, audio, breadcrumb -- came to 137px
          before the lesson's own title. The breadcrumb rides in the drawer
          bar's spare width now. */}
      <PanelJumpTabs
        lessonId={lesson.id}
        lessons={lessonIndex}
        trailing={
          <a href="/read"
            className="tap font-english hover:text-gold transition-colors flex items-center gap-1 text-xs"
            style={{color:'var(--body-faint, rgba(232,232,224,0.45))'}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            All Sūrahs
          </a>
        }
      />
      <LessonAudioBar lessonId={lesson.id} />
    </>
  );

  // Main content: panels
  const mainContent = (
    <LessonExperience
      tafsir={<>
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
      </>}
      compare={<>
        <div className="p-5" dir="ltr">
          <ComparativeCommentary
            jalalaynText={jalalaynArabicText}
            // Our own translation from the Arabic. Never lesson.jalalaynText,
            // which is Feras Hamza's -- see the note above the file read.
            jalalaynEnText={jalalaynEnglishText}
            ruhText={ruhArabicText}
            niasseByVerse={niasseByVerse}
            units={niasseUnits}
            verseRange={lesson.verseRange}
            jalalaynUrl={jalalaynUrl}
            usulUrl={usulBaseUrl}
          />
        </div>
      </>}
      citations={<>
        <LessonCitations lessonId={lesson.id} />
      </>}
      overview={<>
        {/* Summary and notes are different things and are no longer alternatives.
            This panel used to try the note first and fall back to the summary,
            which meant a lesson with a note would have shown no overview at all
            -- and, since every note was null, the branch never ran. The summary
            describes what the lesson covers; a note argues about it. */}
        <div className="p-5" dir="ltr">
          <div className="mb-3 pb-3 border-b border-gold/15">
            <div className="font-english text-white/40 text-xs italic">
              Lesson overview · Amadu Kunateh, Founder, Translator & Digital Editor
            </div>
          </div>
          {lesson.lessonSummary ? (
            <p className="font-english text-sm leading-7" style={{color:'var(--body-text, rgba(255,255,255,0.75))'}}>
              {lesson.lessonSummary}
            </p>
          ) : (
            <p className="font-english text-white/20 italic text-sm text-center py-6">
              Lesson overview forthcoming.
            </p>
          )}

          {readingNotes.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gold/15">
              <div className="font-english text-white/40 text-xs italic mb-4">
                Research notes · working observations, not settled positions
              </div>
              <div className="space-y-6">
                {readingNotes.map(note => (
                  <article key={note.id}>
                    <h3 className="font-english text-sm font-semibold mb-1"
                      style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
                      {note.title}
                    </h3>
                    <div className="font-english text-xs mb-2" style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                      {new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="font-english text-sm leading-7"
                      style={{color:'var(--body-sub, rgba(255,255,255,0.75))'}}
                      dangerouslySetInnerHTML={{ __html: note.body }} />
                    <div className="flex gap-2 flex-wrap mt-3">
                      {note.tags.map(tag => (
                        <span key={tag} className="font-english text-[10px] px-2 py-0.5 rounded"
                          style={{ background: 'rgba(201,168,76,0.10)', color: 'rgba(138,109,31,0.85)',
                                   border: '1px solid rgba(201,168,76,0.20)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </>}
    />
  );

  // Bottom content: navigation
  const bottomContent = (
    <>
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gold/15" dir="ltr">
        {lesson.prevId ? (
          <Link href={"/lesson/" + lesson.prevId}
            className="tap font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
            ← Lesson {lesson.prevId}
          </Link>
        ) : <span />}
        <Link href="/"
          className="tap font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
          ↩ Contents
        </Link>
        {lesson.nextId ? (
          <Link href={"/lesson/" + lesson.nextId}
            className="tap font-english text-sm font-semibold text-gold-deep border border-gold-deep/40 bg-gold/15 hover:bg-gold/25 px-4 py-2 rounded-lg transition-all">
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
      <LessonAnnotationLayer lessonId={lesson.id} lessonTitle={lesson.englishTitle || ""} verseRange={lesson.verseRange || ""} />
    </>
  );
}
