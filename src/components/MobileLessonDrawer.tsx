'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { volumesFromLessons, type LessonIndexEntry } from '@/lib/volumes';
import VolumeLessonTree from '@/components/VolumeLessonTree';

/**
 * The lesson drawer. No longer phone-only.
 *
 * It was lg:hidden because desktop had LessonPageNavigator, a 104px sticky
 * aside carrying the same volume -> lesson tree. That aside was built for the
 * two-column reader; once the reader became a single centred column it had
 * nothing to sit beside and fell to the bottom of the page as a narrow strip.
 * Rather than reinstate a sidebar the layout no longer wants, the aside is
 * gone and this drawer covers every width -- one lesson browser instead of
 * two, reachable from the top bar on any screen.
 */
export default function MobileLessonDrawer({ lessonId, lessons }: { lessonId: number; lessons: LessonIndexEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const volumes = volumesFromLessons(lessons);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
        className="flex items-center gap-1.5 font-english text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full border transition-all flex-shrink-0"
        style={{ borderColor: 'rgba(138,109,31,0.35)', color: '#8a6d1f', background: 'transparent' }}
        aria-label="Browse lessons"
      >
        <Menu size={12} />
        Lessons
      </button>

      {mounted && open && createPortal(
        <div dir="ltr" style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
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
              // This panel is cream in both themes, so VolumeLessonTree inside
              // it always needs ink, whatever the theme sets at :root.
              ['--tree-strong' as string]: '#0D1F0A',
              ['--tree-mid' as string]: 'rgba(13,31,10,0.75)',
              ['--tree-faint' as string]: 'rgba(13,31,10,0.55)',
              ['--tree-chip-bg' as string]: 'rgba(13,31,10,0.08)',
              ['--tree-accent' as string]: '#8a6d1f',
              ['--tree-input-bg' as string]: 'rgba(255,255,255,0.92)',
              ['--tree-input-border' as string]: 'rgba(13,31,10,0.15)',
              ['--tree-input-text' as string]: '#0D1F0A',
            } as React.CSSProperties}
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

            {/* Scrollable volume/lesson tree -- same shared component as the
                desktop sidebar and the full /read table of contents */}
            <div className="flex-1 overflow-y-auto py-2 px-2">
              <VolumeLessonTree
                volumes={volumes}
                currentLessonId={lessonId}
                density="comfortable"
                search
                onNavigate={() => setOpen(false)}
              />
              <Link
                href="/read"
                onClick={() => setOpen(false)}
                className="block text-center font-english text-xs underline mt-3 mb-1"
                style={{ color: 'rgba(138,109,31,0.8)' }}
              >
                Full table of contents →
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
