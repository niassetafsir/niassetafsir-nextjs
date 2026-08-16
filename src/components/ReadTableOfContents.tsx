'use client';
import Link from 'next/link';
import { useState } from 'react';
import VolumeLessonTree, { TreeVolume } from '@/components/VolumeLessonTree';

interface SurahEntry {
  id: number;
  nameAr: string;
  nameEn: string;
  ayahCount: number;
  lessonIds: number[];
}

interface ReadTableOfContentsProps {
  volumes: TreeVolume[];
  suras: SurahEntry[];
}

export default function ReadTableOfContents({ volumes, suras }: ReadTableOfContentsProps) {
  const [showSuras, setShowSuras] = useState(false);

  return (
    <div className="space-y-5">

      {/* Primary TOC: volume -> lesson, with sūrah/verse-range search built in.
          Same tree component as the desktop sidebar and mobile drawer -- this
          is just the full-page, searchable version of it. */}
      <div>
        <VolumeLessonTree volumes={volumes} density="comfortable" search />
      </div>

      {/* Secondary index: jump straight to a sūrah's continuous reading view.
          A genuinely different lookup (by sūrah, across lesson boundaries)
          from the volume/lesson tree above, so it stays as its own section
          rather than a second copy of the same tree -- but the data is real
          (SURAH_LIST + getLessonIdsForSurah, the same index /surah/[id]
          uses), not a separately hand-maintained list. */}
      <div className="border rounded-xl overflow-hidden" style={{borderColor:'rgba(201,168,76,0.2)'}}>
        <button onClick={() => setShowSuras(!showSuras)}
          className="w-full flex items-center justify-between px-4 py-3 font-english text-sm font-semibold transition-all"
          style={{background:'var(--panel-header-bg, rgba(13,20,10,0.95))', color:'rgba(201,168,76,0.85)'}}>
          <span>Jump to Sūrah (continuous reading view)</span>
          <span className="text-xs">{showSuras ? '▲' : '▸'}</span>
        </button>
        {showSuras && (
          <div className="p-3" style={{background:'var(--panel-body-bg, rgba(13,20,10,0.5))'}}>
            <div className="grid grid-cols-3 gap-1">
              {suras.map(s => (
                <Link key={s.id} href={`/surah/${s.id}`}
                  className="flex flex-col px-2 py-1.5 rounded-lg border transition-all text-left"
                  style={{borderColor: 'rgba(201,168,76,0.2)', background:'transparent'}}>
                  <span className="font-english text-[9px]" style={{color:'rgba(201,168,76,0.5)'}}>{s.id}</span>
                  <span className="font-english text-[10px] leading-tight"
                    style={{color: 'var(--body-text, rgba(255,255,255,0.85))'}}>
                    {s.nameEn.length > 12 ? s.nameEn.slice(0,11)+'…' : s.nameEn}
                  </span>
                  <span className="font-english text-[9px]" style={{color:'rgba(201,168,76,0.4)'}}>
                    L{s.lessonIds[0]}{s.lessonIds.length > 1 ? `–${s.lessonIds[s.lessonIds.length-1]}` : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
