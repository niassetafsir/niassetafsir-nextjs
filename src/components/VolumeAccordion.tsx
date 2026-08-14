'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface VolumeAccordionLesson {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  sura: string;
  hasEnglish: boolean;
}

export interface VolumeAccordionVolume {
  vol: number;
  roman: string;
  arabicOrdinal: string;
  start: number;
  end: number;
  rangeLabel: string;
  lessons: VolumeAccordionLesson[];
}

function VolumeCard({ volume, isOpen, onToggle }: {
  volume: VolumeAccordionVolume;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasLessons = volume.lessons.length > 0;
  return (
    <div className="border border-gold/15 rounded-xl overflow-hidden flex flex-col">
      <div className="w-full bg-gold/8 hover:bg-gold/13 px-4 py-3 flex items-center justify-between transition-colors">
        <Link href={`/volume/${volume.vol}`} className="flex-1 text-center">
          <div className="font-arabic text-gold font-bold text-base leading-snug" dir="rtl">{volume.arabicOrdinal}</div>
          <div className="font-english text-white font-bold text-sm mt-1">
            Volume {volume.vol} <span className="font-normal text-white/60">· Lessons {volume.start}–{volume.end}</span>
          </div>
          <div className="font-english text-white/70 text-xs mt-0.5">{volume.rangeLabel}</div>
        </Link>
        <button onClick={onToggle} aria-label={isOpen ? 'Collapse' : 'Expand'} className="p-1 flex-shrink-0 ml-2">
          <ChevronDown size={16} className={`text-gold/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="flex-1">
          {!hasLessons ? (
            <div className="px-4 py-3 font-english text-white/25 italic text-sm" dir="ltr">
              Further volumes in preparation.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {volume.lessons.map(lesson => (
                <Link key={lesson.id} href={`/lesson/${lesson.id}?panel=tafsir`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold/5 transition-colors group">
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-bg text-xs font-bold flex-shrink-0">
                    {lesson.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-english text-white/60 text-[10px] uppercase tracking-wide mb-0.5">{lesson.englishTitle}</div>
                    <div dir="rtl" className="font-arabic text-gold-light text-sm font-bold group-hover:text-gold transition-colors truncate">{lesson.arabicTitle}</div>
                    <div className="font-english text-white/45 text-xs truncate">{lesson.sura}</div>
                  </div>
                  {lesson.hasEnglish && (
                    <span className="font-english text-xs text-gold/50 border border-gold/20 px-1.5 py-0.5 rounded-full flex-shrink-0">EN</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VolumeAccordion({ volumes }: { volumes: VolumeAccordionVolume[] }) {
  const [openVolumes, setOpenVolumes] = useState<Record<number, boolean>>({});
  const toggle = (vol: number) => setOpenVolumes(prev => ({ ...prev, [vol]: !prev[vol] }));

  return (
    <div dir="ltr" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {volumes.map(v => (
        <VolumeCard
          key={v.vol}
          volume={v}
          isOpen={!!openVolumes[v.vol]}
          onToggle={() => toggle(v.vol)}
        />
      ))}
    </div>
  );
}
