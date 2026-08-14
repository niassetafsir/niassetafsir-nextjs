'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { VOLUME_META } from '@/lib/volumes';

// Volume boundaries -- single source of truth in src/lib/volumes.ts
const VOLUMES = VOLUME_META;

export default function MobileLessonDrawer({ lessonId }: { lessonId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const currentVolume = VOLUMES.find(v => lessonId >= v.start && lessonId <= v.end)?.vol;
  const [openVolume, setOpenVolume] = useState<number | null>(currentVolume ?? null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Re-sync the auto-expanded volume whenever the drawer is opened or the lesson changes
  useEffect(() => {
    if (open) setOpenVolume(currentVolume ?? null);
  }, [open, currentVolume]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    if (n >= 1 && n <= 56) {
      setOpen(false);
      setJumpValue('');
      router.push(`/lesson/${n}`);
    }
  };

  return (
    <>
      <button
        dir="ltr"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-1.5 font-english text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full border transition-all flex-shrink-0"
        style={{ borderColor: 'rgba(138,109,31,0.35)', color: '#8a6d1f', background: 'transparent' }}
        aria-label="Browse lessons"
      >
        <Menu size={12} />
        Lessons
      </button>

      {mounted && open && createPortal(
        <div dir="ltr" className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(13,31,10,0.45)' }}
          />
          {/* Slide-in panel */}
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, left: 0,
              width: '86%', maxWidth: '340px',
              background: '#F5EDD6',
              display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'rgba(13,31,10,0.12)' }}>
              <div>
                <p className="font-arabic-sans font-bold text-xs" dir="rtl" style={{ color: '#8a6d1f' }}>الدروس</p>
                <p className="font-english text-[10px]" style={{ color: 'rgba(13,31,10,0.45)' }}>Lessons</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full border transition-all"
                style={{ borderColor: 'rgba(13,31,10,0.15)', color: 'rgba(13,31,10,0.6)' }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Jump to lesson */}
            <form onSubmit={handleJump} className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(13,31,10,0.12)' }}>
              <input
                type="number"
                min={1}
                max={56}
                value={jumpValue}
                onChange={e => setJumpValue(e.target.value)}
                placeholder={`Jump to lesson (current: ${lessonId})`}
                className="font-english text-xs flex-1 min-w-0 px-2.5 py-1.5 rounded-md"
                style={{ background: '#fff', border: '1px solid rgba(13,31,10,0.2)', color: '#0D1F0A' }}
              />
              <button type="submit"
                className="font-english text-xs px-3 py-1.5 rounded-md flex-shrink-0"
                style={{ background: '#8a6d1f', color: '#F5EDD6' }}>
                Go
              </button>
            </form>

            {/* Scrollable volume/lesson list */}
            <div className="flex-1 overflow-y-auto py-2">
              {VOLUMES.map(v => {
                const isOpen = openVolume === v.vol;
                const containsCurrent = lessonId >= v.start && lessonId <= v.end;
                return (
                  <div key={v.vol}>
                    <button
                      onClick={() => setOpenVolume(isOpen ? null : v.vol)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2.5"
                      style={{
                        color: containsCurrent ? '#8a6d1f' : 'rgba(13,31,10,0.75)',
                        background: containsCurrent ? 'rgba(138,109,31,0.08)' : 'transparent',
                        borderLeft: containsCurrent ? '3px solid #8a6d1f' : '3px solid transparent',
                      }}
                    >
                      <span className="font-english text-[7px] font-semibold">
                        Volume {v.vol} <span className="font-normal text-[7px]" style={{ color: 'rgba(13,31,10,0.4)' }}>· Lessons {v.start}–{v.end}</span>
                      </span>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {isOpen && (
                      <div className="pb-1">
                        {Array.from({ length: v.end - v.start + 1 }, (_, i) => v.start + i).map(n => (
                          <Link
                            key={n}
                            href={`/lesson/${n}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 pl-8 pr-4 py-2 font-english text-xs"
                            style={{
                              background: n === lessonId ? '#8a6d1f' : 'transparent',
                              color: n === lessonId ? '#F5EDD6' : 'rgba(13,31,10,0.7)',
                              fontWeight: n === lessonId ? 600 : 400,
                            }}
                          >
                            Lesson {n}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
