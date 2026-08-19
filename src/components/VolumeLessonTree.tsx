'use client';
import Link from 'next/link';
import { useState } from 'react';

// Single shared volume → lesson tree, in the spirit of usul.ai's expandable
// table-of-contents sidebar. Used in three places that used to each
// hand-roll their own volume-expand/lesson-list logic against a duplicated
// or partial copy of the same data: the desktop reading sidebar
// (LessonPageNavigator, density="compact"), the mobile lessons drawer
// (MobileLessonDrawer, density="comfortable" + search), and the full /read
// table-of-contents page (density="comfortable" + search). All three now
// read the same lesson data (src/data/lessons/*.json via getAllLessons())
// grouped by src/lib/volumes.ts's VOLUME_META -- there is exactly one place
// volume boundaries and lesson titles/sūrah/verse-range are defined.

export interface TreeLesson {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  sura: string;
  verseRange: string;
  hasEnglish: boolean;
}

export interface TreeVolume {
  vol: number;
  roman: string;
  arabicOrdinal: string;
  start: number;
  end: number;
  rangeLabel: string;
  lessons: TreeLesson[];
}

interface VolumeLessonTreeProps {
  volumes: TreeVolume[];
  currentLessonId?: number;
  onNavigate?: () => void;
  density?: 'compact' | 'comfortable';
  search?: boolean;
}

export default function VolumeLessonTree({
  volumes,
  currentLessonId,
  onNavigate,
  density = 'comfortable',
  search = false,
}: VolumeLessonTreeProps) {
  const currentVolume = volumes.find(
    v => currentLessonId != null && currentLessonId >= v.start && currentLessonId <= v.end
  )?.vol;
  const [openVolumes, setOpenVolumes] = useState<Record<number, boolean>>(
    currentVolume != null ? { [currentVolume]: true } : {}
  );
  const [query, setQuery] = useState('');
  const compact = density === 'compact';

  const q = query.trim().toLowerCase();
  const matches = (l: TreeLesson) =>
    !q ||
    l.sura.toLowerCase().includes(q) ||
    l.englishTitle.toLowerCase().includes(q) ||
    l.arabicTitle.includes(query.trim()) ||
    l.verseRange.toLowerCase().includes(q) ||
    String(l.id) === q;

  const toggle = (vol: number) => setOpenVolumes(prev => ({ ...prev, [vol]: !prev[vol] }));

  return (
    <div dir="ltr">
      {search && (
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search sūrah, title, or verse…"
          className="w-full mb-3 rounded-lg px-3 py-2 text-sm font-english"
          style={{
            background: 'var(--tree-input-bg)',
            border: '1px solid var(--tree-input-border)',
            color: 'var(--tree-input-text)',
            outline: 'none',
          }}
        />
      )}
      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {volumes.map(v => {
          const lessons = v.lessons.filter(matches);
          if (q && lessons.length === 0) return null;
          const open = q ? true : !!openVolumes[v.vol];
          const containsCurrent = currentLessonId != null && currentLessonId >= v.start && currentLessonId <= v.end;
          return (
            <div key={v.vol}>
              <button
                onClick={() => toggle(v.vol)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-md transition-colors"
                style={{
                  color: containsCurrent ? 'var(--tree-accent)' : 'var(--tree-mid)',
                  background: containsCurrent ? 'rgba(138,109,31,0.08)' : 'transparent',
                }}
              >
                <span className={'font-english font-semibold ' + (compact ? 'text-[7px]' : 'text-xs')}>
                  Volume {v.vol}{' '}
                  <span className="font-normal" style={{ color: 'var(--tree-faint)' }}>
                    · {v.start}–{v.end}
                  </span>
                </span>
                <span className={compact ? 'text-[9px]' : 'text-xs'}>{open ? '▾' : '▸'}</span>
              </button>
              {!compact && open && (
                <div className="px-2 pb-1 font-english text-[10px] italic" style={{ color: 'var(--tree-faint)' }}>
                  {v.rangeLabel}
                </div>
              )}
              {open && (
                <div className={compact ? 'flex flex-wrap gap-1 px-1 py-1' : 'space-y-0.5 pb-1'}>
                  {lessons.map(l => {
                    const isCurrent = l.id === currentLessonId;
                    return (
                      <Link
                        key={l.id}
                        href={`/lesson/${l.id}`}
                        onClick={onNavigate}
                        className={
                          compact
                            ? 'font-english text-[7px] w-5 h-5 flex items-center justify-center rounded transition-colors'
                            : 'flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors group'
                        }
                        style={
                          compact
                            ? {
                                background: isCurrent ? 'var(--tree-accent)' : 'var(--tree-chip-bg)',
                                color: isCurrent ? '#F5EDD6' : 'var(--tree-mid)',
                              }
                            : {
                                background: isCurrent ? 'rgba(138,109,31,0.12)' : 'transparent',
                              }
                        }
                        title={compact ? `${l.englishTitle} · ${l.sura}` : undefined}
                      >
                        {compact ? (
                          l.id
                        ) : (
                          <>
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{
                                background: isCurrent ? 'var(--tree-accent)' : 'var(--tree-chip-bg)',
                                color: isCurrent ? '#F5EDD6' : 'var(--tree-faint)',
                              }}
                            >
                              {l.id}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span
                                className="block font-english text-xs truncate group-hover:underline"
                                style={{ color: 'var(--tree-strong)' }}
                              >
                                {l.englishTitle}
                              </span>
                              <span className="block font-english text-[10px] truncate" style={{ color: 'var(--tree-faint)' }}>
                                {l.sura} · {l.verseRange}
                              </span>
                            </span>
                            {l.hasEnglish && (
                              <span
                                className="font-english text-[9px] flex-shrink-0 border rounded-full px-1.5 py-0.5"
                                style={{ color: 'rgba(138,109,31,0.8)', borderColor: 'rgba(138,109,31,0.3)' }}
                              >
                                EN
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
