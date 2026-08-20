import { getLesson, getAllLessons } from '@/lib/lessons';
import { notFound } from 'next/navigation';
import DisablePrintWrapper from '@/components/DisablePrintWrapper';
import { splitArabicCommentary } from '@/lib/arabicCommentary';
import { injectFootnoteLinks, injectVerseNumbers } from '@/lib/textInject';
import verseCitations from '@/data/verseCitations.json';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const lesson = await getLesson(Number(params.id));
  if (!lesson) return {};
  return { title: lesson.englishTitle };
}

export default async function PrintPage({ params }: { params: { id: string } }) {
  const lesson = await getLesson(Number(params.id));
  if (!lesson) return notFound();

  const volStr = lesson.volume
    ? `Vol. ${lesson.volume}${lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ''}`
    : '';

  // Full Arabic commentary text, published in full site-wide (AK confirmed
  // 2026-08-16 -- see CLAUDE.md, "Full Arabic commentary text published
  // site-wide"). This page previously computed `body` but never rendered
  // it -- an orphaned leftover from when the Arabic side of the print
  // edition was pulled for a since-resolved rights question.
  const arabicFull = splitArabicCommentary((lesson as any).arabicBody || lesson.arabicText);
  const lessonCitations = (verseCitations as Record<string, Record<string, Record<string, string>>>)[String(lesson.id)];
  const footnoteOrder = (lesson as any).footnoteOrder as string[] | undefined;
  const fnCursor = { i: 0 };
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const citationAr = `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, comp. Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed. (n.p., n.d.)${volStr ? ', ' + volStr : ''}, ${lesson.englishTitle} (${lesson.verseRange}). Digital ed., ed. Amadu Kunateh. niassetafsir.org. Accessed ${today}.`;

  // NOTE: this page used to render its own <html>/<head>/<body> to get a
  // fully independent, clean document look -- but Next.js's App Router only
  // allows the ROOT layout (src/app/layout.tsx) to declare those tags. A
  // nested page also declaring them produced invalid, doubly-nested HTML
  // that the browser silently restructured on parse, which didn't match
  // what React expected and threw a hydration error (#418/#423) on every
  // lesson's print page. Fixed 2026-08-16: this is now a normal page inside
  // the root layout; SiteNav/PersistentNav/SiteFooter all opt out of this
  // route (see those components + the body:has() rule in globals.css) so
  // the page still looks like a clean, independent document on screen.
  return (
    <DisablePrintWrapper>
      <div className="lesson-print-page">
      {/* EB Garamond used to load here too, and never applied to anything: the
          .lesson-print-page rule below set the sans-serif Arabic face, so the
          serif was downloaded on every print view and rendered nothing. Amiri
          now carries both scripts, matching the screen. */}
      <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      {/* dangerouslySetInnerHTML, not a JSX text child: React's SSR output
          HTML-entity-encodes apostrophes inside a plain {`...`} text child
          (e.g. 'IBM Plex Sans Arabic' -> &#x27;IBM Plex Sans Arabic&#x27;),
          but <style> is a raw-text element in the browser's own parser, so
          the client's actual text content stays un-encoded -- a genuine
          "Text content did not match" hydration error on every load
          (confirmed 2026-08-16). dangerouslySetInnerHTML is inserted as raw
          HTML on both passes, sidestepping the mismatch entirely. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .lesson-print-page { font-family: 'Amiri', 'Noto Naskh Arabic', serif; font-size: 12pt; line-height: 1.8; font-size-adjust: ex-height 0.52; color: #111; background: white; padding: 2.5cm; max-width: 21cm; margin: 0 auto; }
        .lesson-print-page .work-title { text-align: center; font-size: 10pt; color: #666; margin-bottom: 0.3cm; letter-spacing: 0.03em; }
        .lesson-print-page .lesson-title-ar { font-size-adjust: none; text-align: center; font-family: 'Amiri', serif; font-size: 18pt; color: #7B5C14; direction: rtl; margin-bottom: 0.2cm; }
        .lesson-print-page .lesson-title-en { text-align: center; font-size: 11pt; color: #444; margin-bottom: 0.1cm; }
        .lesson-print-page .vol-ref { text-align: center; font-size: 9pt; color: #888; margin-bottom: 0.6cm; }
        .lesson-print-page hr { border: none; border-top: 1px solid #C9A84C; margin: 0.5cm 0; opacity: 0.4; }
        .lesson-print-page .poem-block { font-size-adjust: none; text-align: center; font-family: 'Amiri', serif; direction: rtl; font-size: 13pt; color: #7B5C14; line-height: 2.0; margin-bottom: 0.6cm; }
        .lesson-print-page .body-ar { font-size-adjust: none; font-family: 'Amiri', serif; direction: rtl; text-align: justify; font-size: 13pt; line-height: 2.1; margin-top: 0.3cm; }
        .lesson-print-page .body-ar p { margin-bottom: 0.5cm; }
        .lesson-print-page .body-en { font-size: 12pt; line-height: 1.9; margin-top: 0.8cm; padding-top: 0.6cm; border-top: 1px solid #ddd; }
        .lesson-print-page .body-en p { margin-bottom: 0.5cm; }
        .lesson-print-page .section-label { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.05em; color: #7B5C14; margin-bottom: 0.2cm; }
        .lesson-print-page .fn-link { color: #7B5C14; text-decoration: none; font-size: 8pt; vertical-align: super; }
        .lesson-print-page sup { font-size: 8pt; vertical-align: super; }
        .lesson-print-page .no-en { color: #aaa; font-style: italic; font-size: 10pt; }
        .lesson-print-page .citation-block { margin-top: 1cm; padding-top: 0.5cm; border-top: 1px solid #ddd; font-size: 9pt; color: #555; }
        .lesson-print-page .citation-label { font-weight: bold; margin-bottom: 0.2cm; color: #7B5C14; }
        .lesson-print-page .print-btn { display: none !important; }
        @media print { * { display: none !important; } body::before { content: "Printing disabled. This is a digital companion to the official published translation only."; display: block; font-size: 14pt; text-align: center; padding: 2cm; color: #7B5C14; font-weight: bold; } }
      `}} />

      {/* PrintButton removed: PDF/print saving is disabled per user requirement (2026-08-17). This site is a digital companion to the user's published translations only. */}

      <div className="work-title">Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm · فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ</div>
      <div className="lesson-title-ar">{lesson.arabicTitle}</div>
      <div className="lesson-title-en">{lesson.englishTitle}</div>
      <div className="vol-ref">{lesson.verseRange}{volStr ? ` · Arabic compiled edition, ${volStr}` : ''}</div>
      <hr />

      {arabicFull.poemLines.length > 0 && (
        <div className="poem-block">
          {arabicFull.poemLines.map((line, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
      )}

      <div className="section-label">Arabic Commentary — Shaykh Ibrāhīm Niasse</div>
      <div className="body-ar">
        {arabicFull.paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{
            __html: injectFootnoteLinks(injectVerseNumbers(p, lessonCitations?.[String(i)]), lesson.id, footnoteOrder, fnCursor)
          }} />
        ))}
      </div>

      <div className="section-label">English Translation</div>
      <div className="body-en">
        {lesson.hasEnglish && lesson.englishText ? (
          <div dangerouslySetInnerHTML={{ __html: lesson.englishText }} />
        ) : (
          <p className="no-en">English translation forthcoming. The complete bilingual print edition (Arabic/English) is in preparation — Amadu Kunateh, Founder, Translator &amp; Digital Editor.</p>
        )}
      </div>

      <div className="citation-block">
        <div className="citation-label">Cite this lesson:</div>
        <div>{citationAr}</div>
      </div>
    </div>
    </DisablePrintWrapper>
  );
}
