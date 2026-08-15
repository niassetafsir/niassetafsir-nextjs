'use client';
import { useState } from 'react';
import Link from 'next/link';
import { isPoem, injectFootnoteLinks, stripEnFootnotes, highlightEnVerses } from './BilingualText';

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

      <div className="space-y-3 mb-5">
        {arPars.map((p, i) => (
          <p key={i}
            className="font-arabic-sans text-[1.05rem] leading-[2.1] text-gold/90 text-justify"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(p, lesson.id, lesson.footnoteOrder, cursor) }}
          />
        ))}
      </div>

      {enPars.length > 0 && (
        <div className="space-y-3 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }} dir="ltr">
          {enPars.map((p, i) => (
            <p key={i}
              className="font-english text-sm leading-6"
              style={{ color: 'var(--body-sub, rgba(255,255,255,0.75))' }}
              dangerouslySetInnerHTML={{ __html: highlightEnVerses(stripEnFootnotes(p)) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SurahReader({ surahId, nameAr, nameEn, ayahCount, lessons, prevSurah, nextSurah }: SurahReaderProps) {
  const [mode, setMode] = useState<'continuous' | 'paginated'>('continuous');
  const [pageIdx, setPageIdx] = useState(0);

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
