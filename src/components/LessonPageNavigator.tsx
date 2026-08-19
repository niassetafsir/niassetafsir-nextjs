'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { List, Search, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { volumesFromLessons, type LessonIndexEntry } from '@/lib/volumes';
import VolumeLessonTree from '@/components/VolumeLessonTree';

interface LessonPageNavigatorProps {
  lessonId: number;
  prevId?: number | null;
  nextId?: number | null;
  lessons: LessonIndexEntry[];
}

export default function LessonPageNavigator({ lessonId, prevId, nextId, lessons }: LessonPageNavigatorProps) {
  const router = useRouter();
  const [jumpValue, setJumpValue] = useState('');
  const [showJump, setShowJump] = useState(false);
  const volumes = volumesFromLessons(lessons);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    if (n >= 1 && n <= 56) {
      router.push(`/lesson/${n}`);
      setJumpValue('');
    }
  };

  return (
    <aside
      dir="ltr"
      className="hidden lg:block flex-shrink-0 sticky self-start overflow-y-auto"
      style={{
        top: '56px',
        width: '104px',
        maxHeight: 'calc(100vh - 56px)',
        borderLeft: '1px solid rgba(13,31,10,0.1)',
        background: '#F5EDD6',
      }}
    >
      <div className="px-2 py-2 space-y-2.5">
        {/* Icon row */}
        <div className="flex items-center gap-2 pb-3" style={{borderBottom: '1px solid rgba(13,31,10,0.1)'}}>
          <span
            className="flex items-center justify-center w-5 h-5 rounded-md"
            style={{ background: 'rgba(138,109,31,0.12)', color: '#8a6d1f' }}
            title="Reading view"
            aria-current="true"
          >
            <List size={13} />
          </span>
          <Link
            href="/search"
            className="flex items-center justify-center w-5 h-5 rounded-md transition-colors hover:bg-black/5"
            style={{ color: 'rgba(13,31,10,0.55)' }}
            title="Search"
          >
            <Search size={13} />
          </Link>
          <button
            type="button"
            onClick={() => setShowJump(v => !v)}
            className="flex items-center justify-center w-5 h-5 rounded-md transition-colors hover:bg-black/5"
            style={{ color: showJump ? '#8a6d1f' : 'rgba(13,31,10,0.55)', background: showJump ? 'rgba(138,109,31,0.12)' : 'transparent' }}
            title="Jump to lesson"
          >
            <Hash size={13} />
          </button>
        </div>

        {/* Jump to lesson (toggle) */}
        {showJump && (
          <form onSubmit={handleJump} className="space-y-1.5">
            <label className="font-english text-[8px] uppercase tracking-wide block font-normal" style={{color:'#8a6d1f'}}>
              Jump to lesson
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={56}
                value={jumpValue}
                onChange={e => setJumpValue(e.target.value)}
                placeholder={String(lessonId)}
                className="font-english text-[10px] w-10 px-1 py-1 rounded-md"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(13,31,10,0.2)',
                  color: '#0D1F0A',
                }}
                autoFocus
              />
              <button
                type="submit"
                className="font-english text-[10px] px-1 py-1 rounded-md transition-colors"
                style={{ background: '#8a6d1f', color: '#F5EDD6' }}
              >
                Go
              </button>
            </div>
          </form>
        )}

        {/* Prev / next */}
        <div className="flex items-center justify-between gap-2">
          {prevId ? (
            <Link
              href={`/lesson/${prevId}`}
              className="flex-1 flex items-center justify-center gap-1 font-english text-[10px] py-1 rounded-md transition-colors"
              style={{ border: '1px solid rgba(13,31,10,0.15)', color: 'rgba(13,31,10,0.7)' }}
              title={`Lesson ${prevId}`}
            >
              <ChevronLeft size={11} /> Prev
            </Link>
          ) : <span className="flex-1" />}
          {nextId ? (
            <Link
              href={`/lesson/${nextId}`}
              className="flex-1 flex items-center justify-center gap-1 font-english text-[10px] py-1 rounded-md transition-colors"
              style={{ border: '1px solid rgba(13,31,10,0.15)', color: 'rgba(13,31,10,0.7)' }}
              title={`Lesson ${nextId}`}
            >
              Next <ChevronRight size={11} />
            </Link>
          ) : <span className="flex-1" />}
        </div>

        {/* Volumes -- shared tree, same data as /read and the mobile drawer */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-english text-[8px] uppercase tracking-wide font-normal" style={{color:'#8a6d1f'}}>
              Volumes
            </p>
            <Link href="/read" className="font-english text-[7px] underline" style={{color:'rgba(138,109,31,0.7)'}}>
              Full contents
            </Link>
          </div>
          <VolumeLessonTree volumes={volumes} currentLessonId={lessonId} density="compact" />
        </div>
      </div>
    </aside>
  );
}
