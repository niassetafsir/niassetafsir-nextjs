'use client';
import Link from 'next/link';

interface LessonNavProps {
  lessonId: number;
  totalLessons?: number;
  lessonTitle?: string;
  manzil?: number;
}

export default function LessonNav({ lessonId, totalLessons = 57, lessonTitle, manzil }: LessonNavProps) {
  const hasPrev = lessonId > 1;
  const hasNext = lessonId < totalLessons;

  return (
    <div
      className="sticky bottom-12 z-40 mx-4 mb-2 rounded-2xl flex items-center justify-between px-4 py-2.5 gap-3"
      style={{
        background: 'var(--panel-header-bg, rgba(18,12,6,0.96))',
        border: '1px solid rgba(201,168,76,0.2)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Prev */}
      {hasPrev ? (
        <Link
          href={`/lesson/${lessonId - 1}`}
          className="flex items-center gap-1.5 font-english text-xs font-semibold transition-all hover:text-gold"
          style={{ color: 'rgba(201,168,76,0.8)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Lesson {lessonId - 1}
        </Link>
      ) : (
        <span className="w-20" />
      )}

      {/* Centre — lesson indicator */}
      <div className="text-center flex-1">
        <p className="font-english text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(201,168,76,0.5)' }}>
          Lesson {lessonId} of {totalLessons}
        </p>
        {manzil && (
          <p className="font-english text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Manzil {manzil}
          </p>
        )}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={`/lesson/${lessonId + 1}`}
          className="flex items-center gap-1.5 font-english text-xs font-semibold transition-all hover:text-gold"
          style={{ color: 'rgba(201,168,76,0.8)' }}
        >
          Lesson {lessonId + 1}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Link>
      ) : (
        <span className="w-20" />
      )}
    </div>
  );
}
