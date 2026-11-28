import { getLesson, getAllLessons } from '@/lib/lessons';
import { arabicPublished } from '@/lib/arabicPublished';
import { notFound, redirect } from 'next/navigation';
import LessonExperience from '@/components/LessonExperience';
import lessonRangesData from '@/data/lessonRanges.json';
import { BILINGUAL_ALIGNMENT } from '@/lib/bilingualAlignment';
import { VERSE_INDEX } from '@/lib/verseIndex';
import BilingualText from '@/components/BilingualText';
import MobileLessonDrawer from '@/components/MobileLessonDrawer';
import LessonAudioBar from '@/components/LessonAudioBar';
import TextSizeControl from '@/components/TextSizeControl';
import OpeningInvocation from '@/components/OpeningInvocation';
import LessonNav from '@/components/LessonNav';
import LessonAnnotationLayer from '@/components/LessonAnnotationLayer';
import SelectionClip from '@/components/SelectionClip';
import LessonCitations from '@/components/LessonCitations';
import { hasApparatus } from '@/lib/apparatus';
import Link from 'next/link';
import { SURAH_LIST } from '@/lib/verseRanges';
import { splitArabicCommentary } from '@/lib/arabicCommentary';
import { toLessonIndex } from '@/lib/volumes';
import verseCitations from '@/data/verseCitations.json';
import fs from 'fs';
import path from 'path';
import ComparativeCommentary from '@/components/ComparativeCommentary';
import BookLayout from '@/components/reader/BookLayout';
import BookReader, { type ReaderBlock } from '@/components/reader/BookReader';
import HeadnoteFold from '@/components/reader/HeadnoteFold';
import headnotes from '@/data/headnotes.json';
import { volumesFromLessons } from '@/lib/volumes';
import { injectFootnoteLinks, injectVerseNumbers, highlightEnVerses, stripEnFootnotes } from '@/lib/textInject';
import { getNiasseVerseExcerpts, getNiasseUnits } from '@/lib/niasseVerseExcerpt';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}


// The comparison texts are kept one file per sūra, and the panel only ever
// shows the verses of this lesson. Sending the whole file put all of
// al-Baqara's Jalālayn (270 KB) into every al-Baqara lesson page. Keep the
// [s:v] blocks inside the lesson's range.
const LESSON_RANGES = lessonRangesData as unknown as Record<string, { start: [number, number]; end: [number, number] }>;
function sliceToLesson(text: string, lessonId: number): string {
  const r = LESSON_RANGES[String(lessonId)];
  if (!r) return text;
  const key = (s: number, v: number) => s * 1000 + v;
  const lo = key(r.start[0], r.start[1]);
  const hi = key(r.end[0], r.end[1]);
  const parts = text.split(/(?=\[\d+:\d+\])/);
  return parts.filter(part => {
    const m = part.match(/^\[(\d+):(\d+)\]/);
    if (!m) return false;
    const k = key(Number(m[1]), Number(m[2]));
    return k >= lo && k <= hi;
  }).join('');
}


// The lesson's own verses, in order, each at the first paragraph that takes it
// up: the "Go to verse" menu. Verses quoted from elsewhere are left out.
function jumpVersesFor(lessonId: number): { verse: string; paraIndex: number }[] {
  const r = LESSON_RANGES[String(lessonId)];
  if (!r) return [];
  const key = (s: number, a: number) => s * 1000 + a;
  const lo = key(r.start[0], r.start[1]), hi = key(r.end[0], r.end[1]);
  const first = new Map<string, number>();
  for (const e of VERSE_INDEX[lessonId] ?? []) {
    // "2:38-39" names a run; the menu lists its first verse.
    const m = e.verse.match(/^(\d+):(\d+)/);
    if (!m) continue;
    const s = Number(m[1]), a = Number(m[2]);
    const k = key(s, a);
    if (k < lo || k > hi) continue;
    const v = `${s}:${a}`;
    if (!first.has(v) || e.paraIndex < (first.get(v) as number)) first.set(v, e.paraIndex);
  }
  return Array.from(first.entries())
    .map(([verse, paraIndex]) => ({ verse, paraIndex }))
    .sort((x, y) => {
      const [xs, xa] = x.verse.split(':').map(Number); const [ys, ya] = y.verse.split(':').map(Number);
      return key(xs, xa) - key(ys, ya);
    });
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
    ? sliceToLesson(fs.readFileSync(jalalaynArPath, 'utf-8'), lesson.id)
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
    ? sliceToLesson(fs.readFileSync(jalalaynEnPath, 'utf-8'), lesson.id)
    : null;

  // Real Arabic Rūḥ al-Bayān text, transcribed from Usul.ai (see
  // src/data/ruhAlBayanArabic/SOURCE.md for provenance and known gaps).
  // Same proof-of-concept scoping as Jalālayn above: only sūrah 1 so far.
  const ruhArPath = jalalaynSuraId
    ? path.join(process.cwd(), 'src/data/ruhAlBayanArabic', String(jalalaynSuraId).padStart(2, '0') + '.txt')
    : null;
  const ruhArabicText = ruhArPath && fs.existsSync(ruhArPath)
    ? sliceToLesson(fs.readFileSync(ruhArPath, 'utf-8'), lesson.id)
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

  // The book reader's passages, marked up here so the client receives finished
  // HTML. Footnote numbering runs through the Arabic in order, as in
  // BilingualText.
  const withheld = !arabicPublished(lesson.id);
  const fnOrder = hasApparatus(lesson.id) ? (lesson as any).footnoteOrder : undefined;
  const fnCursor = { i: 0 };
  const arHtml = withheld ? [] : arabicFull.paragraphs.map((p, i) =>
    injectFootnoteLinks(injectVerseNumbers(p, lessonCitations?.[String(i)], undefined, { lessonId: lesson.id, paraIndex: i }), lesson.id, fnOrder, fnCursor));
  const enParas: string[] = [];
  (lesson.englishText || '').split(/(?=<p[^>]*>)/).filter(x => x.startsWith('<p')).forEach(m => {
    if (!/<p[^>]*\bclass="[^"]*\ben-para\b[^"]*"/.test(m)) return;
    if (m.replace(/<[^>]+>/g, '').trim()) enParas.push(highlightEnVerses(stripEnFootnotes(m)));
  });
  const translated = !!lesson.hasEnglish && enParas.length > 0;
  const align = BILINGUAL_ALIGNMENT[lesson.id];
  let readerBlocks: ReaderBlock[] | null = null;
  if (translated && align) {
    readerBlocks = align.blocks.map(b => ({
      arIdx: b.arabicIndices,
      ar: b.arabicIndices.map(i => arHtml[i]).filter(Boolean),
      en: b.englishIndices.map(i => enParas[i]).filter(Boolean),
    }));
    for (const g of align.englishOnly) readerBlocks.push({ arIdx: [], ar: [], en: g.indices.map(i => enParas[i]).filter(Boolean) });
  } else if (!translated && !withheld) {
    readerBlocks = arHtml.map((h, i) => ({ arIdx: [i], ar: [h], en: [] }));
  }
  const jumpVerses = jumpVersesFor(lesson.id);
  const verseParas = Object.fromEntries(jumpVerses.map(v => [v.verse, v.paraIndex]));
  const hn = (headnotes as Record<string, { topics: string[]; body: string[]; author: string }>)[String(lesson.id)];

  // Top content: breadcrumb and jump tabs
  // One slim bar above the lesson (AK, 28 Nov 2026): the lessons drawer on
  // phones and tablets (the right-hand panel does that job on a desktop), the
  // recording, and text size.
  const topContent = (
    <div className="bp-topbar" dir="ltr">
      <span className="lg:hidden"><MobileLessonDrawer lessonId={lesson.id} lessons={lessonIndex} /></span>
      <div style={{ flex: 1, minWidth: 0 }}><LessonAudioBar lessonId={lesson.id} /></div>
      <TextSizeControl />
    </div>
  );


  // Main content: panels
  const mainContent = (
    <>
    <LessonExperience
      hasTranslation={!!lesson.hasEnglish}
      tafsir={<>
        {lesson.openingInvocation && (
          <OpeningInvocation html={(lesson as any).openingInvocation} />
        )}
        {!arabicPublished(lesson.id) && !(lesson.hasEnglish && (lesson.englishText || '').trim().length > 200) ? (
          <div className="p-6 font-english text-white/60 text-sm" dir="ltr">
            This lesson can be heard in the recording above.
          </div>
        ) : readerBlocks ? (
          <BookReader
            lessonId={lesson.id}
            blocks={readerBlocks}
            translated={translated}
            verseParas={verseParas}
            prevId={lesson.prevId}
            nextId={lesson.nextId}
            draftNotice={translated}
          />
        ) : <BilingualText
          englishOnly={!arabicPublished(lesson.id)}
          poemLines={arabicFull.poemLines}
          arabicParagraphs={arabicFull.paragraphs}
          citations={lessonCitations}
          englishText={lesson.englishText}
          hasEnglish={lesson.hasEnglish}
          lessonId={lesson.id}
          footnoteOrder={hasApparatus(lesson.id) ? (lesson as any).footnoteOrder : undefined}
          alignment={BILINGUAL_ALIGNMENT[lesson.id]}
          verseEntries={VERSE_INDEX[lesson.id] ?? []}
          jumpVerses={jumpVersesFor(lesson.id)}
        />}
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
      hideCitations={!hasApparatus(lesson.id)}
      hideCompare={!jalalaynArabicText && !ruhArabicText}
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
              Lesson overview
            </div>
          </div>
          {/* All 56 lessons carry a summary, so the "forthcoming" fallback that
              used to sit here could never render. A lesson that somehow lacks
              one now shows nothing rather than a promise. */}
          {lesson.lessonSummary && (
            <p className="font-english text-sm leading-7" style={{color:'var(--body-text, rgba(255,255,255,0.75))'}}>
              {lesson.lessonSummary}
            </p>
          )}

        </div>
      </>}
    />
    </>
  );

  // Bottom content: navigation
  const bottomContent = (
    <>
      {!readerBlocks && <div className="flex justify-between items-center mt-10 pt-6 border-t border-gold/15" dir="ltr">
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
      </div>}
      {!readerBlocks && <LessonNav lessonId={lesson.id} manzil={lesson.manzil} />}
    </>
  );

  return (
    <>
      <BookLayout
        lesson={{ id: lesson.id, verseRange: lesson.verseRange, sura: lesson.sura, volume: lesson.volume, hasEnglish: lesson.hasEnglish }}
        volumes={volumesFromLessons(lessonIndex) as any}
        jumpVerses={jumpVerses}
        topContent={topContent}
        headnote={hn ? <HeadnoteFold lessonId={lesson.id} topics={hn.topics} body={hn.body} author={hn.author} /> : null}
        bottomContent={bottomContent}
        hasCompare={!!(jalalaynArabicText || ruhArabicText)}
        hasCitations={hasApparatus(lesson.id)}
      >
        {mainContent}
      </BookLayout>
      <LessonAnnotationLayer lessonId={lesson.id} lessonTitle={lesson.englishTitle || ""} verseRange={lesson.verseRange || ""} />
    </>
  );
}
