'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isPoem, injectFootnoteLinks, injectVerseNumbers, stripEnFootnotes, highlightEnVerses } from './BilingualText';

export interface SurahLessonData {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  verseRange: string;
  sura: string;
  arabicBody: string;
  englishText: string | null;
  hasEnglish: boolean;
  footnoteOrder?: string[];
  /** paraIndex -> spanIndex -> "surah:ayah", high-confidence matches only --
   *  see src/data/verseCitations.json / scripts/build-verse-citations.js. */
  citations?: Record<string, Record<string, string>>;
}

interface SurahReaderProps {
  surahId: number;
  nameAr: string;
  nameEn: string;
  ayahCount: number;
  lessons: SurahLessonData[];
  prevSurah: { id: number; nameEn: string } | null;
  nextSurah: { id: number; nameEn: string } | null;
}

function arabicParagraphs(raw: string): string[] {
  return raw.split('\n').filter(p => p.trim()).filter(p => !isPoem(p));
}

function englishParagraphs(html: string): string[] {
  const matches = html.split(/(?=<p[^>]*>)/).filter(s => s.startsWith('<p'));
  return matches.filter(m => /<p[^>]*\bclass="[^"]*\ben-para\b[^"]*"/.test(m));
}

function LessonBlock({ lesson }: { lesson: SurahLessonData }) {
  const cursor = { i: 0 };
  const arPars = arabicParagraphs(lesson.arabicBody);
  const enPars = lesson.hasEnglish && lesson.englishText ? englishParagraphs(lesson.englishText) : [];

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-english text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
          style={{ color: 'rgba(201,168,76,0.7)', borderColor: 'rgba(201,168,76,0.25)' }}>
          Lesson {lesson.id}
        </span>
        <span className="font-english text-[11px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
          {lesson.verseRange}
        </span>
      </div>

      {/* Side by side, not stacked -- there's no verified paragraph-level
          Arabic<->English alignment for any lesson yet (BILINGUAL_ALIGNMENT
          is empty), so pairing by raw paragraph index would misrepresent
          the correspondence. This mirrors the same "two boxes" fallback
          BilingualText.tsx already uses on the lesson pages for the same
          reason -- full texts side by side, no false pairing implied. */}
      <div className={enPars.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}>
        {enPars.length > 0 && (
          <div className="border rounded-lg p-4 order-2 md:order-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} dir="ltr">
            <p className="font-english text-gold/60 text-[10px] uppercase tracking-wide mb-2">English translation</p>
            <div className="space-y-3">
              {enPars.map((p, i) => (
                // A <div> here, not a <p>: `p` is already a complete
                // "<p class="en-para">...</p>" string (see englishParagraphs()
                // above), and nesting a real <p> around dangerouslySetInnerHTML
                // markup that itself starts with <p> is invalid HTML -- the
                // browser silently closes the outer <p> early, producing a DOM
                // that doesn't match what React rendered and throwing a
                // hydration error on every load. Confirmed via the React dev
                // warning (2026-08-16): "Prop `dangerouslySetInnerHTML` did
                // not match. Server: "" Client: "<p class=\"en-para\">...".
                // Matches the working pattern in BilingualText.tsx, which
                // wraps the identical kind of string in a <div> for the same
                // reason.
                <div key={i}
                  className="font-english text-sm leading-6"
                  style={{ color: 'var(--body-sub, rgba(255,255,255,0.75))' }}
                  dangerouslySetInnerHTML={{ __html: highlightEnVerses(stripEnFootnotes(p)) }}
                />
              ))}
            </div>
          </div>
        )}
        <div className={enPars.length > 0 ? 'border rounded-lg p-4 order-1 md:order-2' : ''}
          style={enPars.length > 0 ? { borderColor: 'rgba(255,255,255,0.08)' } : undefined}
          dir="rtl">
          {enPars.length > 0 && (
            <p className="font-english text-gold/60 text-[10px] uppercase tracking-wide mb-2" dir="ltr">Arabic commentary</p>
          )}
          <div className="space-y-3">
            {arPars.map((p, i) => {
              const withVerseNums = injectVerseNumbers(p, lesson.citations?.[String(i)]);
              return (
                <p key={i}
                  className="font-arabic-sans text-[1.05rem] leading-[2.1] text-gold/90 text-justify"
                  dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(withVerseNums, lesson.id, lesson.footnoteOrder, cursor) }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SurahReader({ surahId, nameAr, nameEn, ayahCount, lessons, prevSurah, nextSurah }: SurahReaderProps) {
  const [mode, setMode] = useState<'continuous' | 'paginated'>('continuous');
  const [pageIdx, setPageIdx] = useState(0);

  // Previous/Next lesson only swaps content in place -- nothing else
  // scrolls the page, so without this a reader who's scrolled down into
  // one lesson lands mid-page in the next one instead of at its start.
  useEffect(() => {
    if (mode === 'paginated') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pageIdx, mode]);

  const multiLesson = lessons.length > 1;

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <Link href="/read" className="font-english text-xs flex items-center gap-1 mb-4"
        style={{ color: 'rgba(201,168,76,0.6)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Reading
      </Link>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="font-arabic text-gold text-3xl font-bold mb-1" dir="rtl">{nameAr}</div>
        <h1 className="font-english text-xl font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
          {nameEn}
        </h1>
        <p className="font-english text-xs mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
          {ayahCount} verses · {lessons.length} lesson{lessons.length > 1 ? 's' : ''} of commentary
        </p>
      </div>

      {/* Mode toggle -- only meaningful when there's more than one lesson to page through */}
      {multiLesson && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('continuous')}
            className={`font-english text-xs px-3 py-1.5 rounded-full border transition-all ${mode === 'continuous' ? 'bg-gold text-bg border-gold font-semibold' : 'border-gold/20 text-white/45 hover:border-gold/40'}`}
          >
            Continuous
          </button>
          <button
            onClick={() => setMode('paginated')}
            className={`font-english text-xs px-3 py-1.5 rounded-full border transition-all ${mode === 'paginated' ? 'bg-gold text-bg border-gold font-semibold' : 'border-gold/20 text-white/45 hover:border-gold/40'}`}
          >
            By Lesson
          </button>
        </div>
      )}

      {/* Reading area */}
      {mode === 'continuous' || !multiLesson ? (
        lessons.map(lesson => <LessonBlock key={lesson.id} lesson={lesson} />)
      ) : (
        <>
          <LessonBlock lesson={lessons[pageIdx]} />
          <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setPageIdx(i => Math.max(0, i - 1))}
              disabled={pageIdx === 0}
              className="font-english text-xs px-3 py-1.5 rounded-lg border disabled:opacity-30 transition-all"
              style={{ borderColor: 'rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.85)' }}
            >
              ← Previous lesson
            </button>
            <span className="font-english text-[11px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
              {pageIdx + 1} / {lessons.length}
            </span>
            <button
              onClick={() => setPageIdx(i => Math.min(lessons.length - 1, i + 1))}
              disabled={pageIdx === lessons.length - 1}
              className="font-english text-xs px-3 py-1.5 rounded-lg border disabled:opacity-30 transition-all"
              style={{ borderColor: 'rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.85)' }}
            >
              Next lesson →
            </button>
          </div>
        </>
      )}

      {/* Prev / next sūrah */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {prevSurah ? (
          <Link href={`/surah/${prevSurah.id}`}
            className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-2 rounded-lg transition-all">
            ← {prevSurah.nameEn}
          </Link>
        ) : <span />}
        <Link href="/read"
          className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-2 rounded-lg transition-all">
          ↩ All Sūrahs
        </Link>
        {nextSurah ? (
          <Link href={`/surah/${nextSurah.id}`}
            className="font-english text-xs font-semibold text-gold-deep border border-gold-deep/40 bg-gold/15 hover:bg-gold/25 px-3 py-2 rounded-lg transition-all">
            {nextSurah.nameEn} →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}
