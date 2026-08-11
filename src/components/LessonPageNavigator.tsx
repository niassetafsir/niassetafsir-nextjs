'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { List, Search, ChevronLeft, ChevronRight, ChevronDown, Hash } from 'lucide-react';

// Volume → lesson-range table, verified against the `volume` field in
// src/data/lessons/*.json (2026-08-11). Lesson 57 in the data is a duplicate
// placeholder that redirects to Lesson 56 (see app/lesson/[id]/page.tsx), so
// Volume X's real range is 51–56, not 51–57.
const VOLUMES: { vol: number; start: number; end: number }[] = [
  { vol: 1,  start: 1,  end: 6 },
  { vol: 2,  start: 7,  end: 12 },
  { vol: 3,  start: 13, end: 19 },
  { vol: 4,  start: 20, end: 25 },
  { vol: 5,  start: 26, end: 30 },
  { vol: 6,  start: 31, end: 35 },
  { vol: 7,  start: 36, end: 40 },
  { vol: 8,  start: 41, end: 45 },
  { vol: 9,  start: 46, end: 50 },
  { vol: 10, start: 51, end: 56 },
];

interface LessonPageNavigatorProps {
  lessonId: number;
  prevId?: number | null;
  nextId?: number | null;
}

export default function LessonPageNavigator({ lessonId, prevId, nextId }: LessonPageNavigatorProps) {
  const router = useRouter();
  const [jumpValue, setJumpValue] = useState('');
  const [showJump, setShowJump] = useState(false);
  const currentVolume = VOLUMES.find(v => lessonId >= v.start && lessonId <= v.end)?.vol;
  const [openVolume, setOpenVolume] = useState<number | null>(currentVolume ?? null);

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

        {/* Volumes */}
        <div>
          <p className="font-english text-[8px] uppercase tracking-wide mb-1.5 font-normal" style={{color:'#8a6d1f'}}>
            Volumes
          </p>
          <div className="space-y-1">
            {VOLUMES.map(v => {
              const isOpen = openVolume === v.vol;
              const containsCurrent = lessonId >= v.start && lessonId <= v.end;
              return (
                <div key={v.vol}>
                  <button
                    onClick={() => setOpenVolume(isOpen ? null : v.vol)}
                    className="w-full flex items-center justify-between gap-1 px-1 py-1 rounded transition-colors"
                    style={{
                      color: containsCurrent ? '#8a6d1f' : 'rgba(13,31,10,0.7)',
                      background: containsCurrent ? 'rgba(138,109,31,0.08)' : 'transparent',
                    }}
                  >
                    <span className="font-english text-[10px] font-normal">
                      Vol. {v.vol}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-english text-[9px]" style={{color:'rgba(13,31,10,0.45)'}}>
                        {v.start}–{v.end}
                      </span>
                      <ChevronDown size={11} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="flex flex-wrap gap-1 px-1 py-1">
                      {Array.from({ length: v.end - v.start + 1 }, (_, i) => v.start + i).map(n => (
                        <Link
                          key={n}
                          href={`/lesson/${n}`}
                          className="font-english text-[9px] w-5 h-5 flex items-center justify-center rounded transition-colors"
                          style={{
                            background: n === lessonId ? '#8a6d1f' : 'rgba(13,31,10,0.05)',
                            color: n === lessonId ? '#F5EDD6' : 'rgba(13,31,10,0.75)',
                          }}
                        >
                          {n}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
