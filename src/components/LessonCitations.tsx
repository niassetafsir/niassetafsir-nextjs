'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Footnote {
  id: string;
  lessonId: number;
  num: number;
  displayNum?: number;
  arabic: string;
  scholar: string | null;
  work: string | null;
  sourceType: string;
  genre: string;
  enTranslation: string | null;
  volRef?: string;
}

export default function LessonCitations({ lessonId }: { lessonId: number }) {
  const [footnotes, setFootnotes] = useState<Footnote[] | null>(null);

  useEffect(() => {
    fetch('/data/footnotes.json')
      .then(r => r.json())
      .then((all: Footnote[]) => {
        setFootnotes(all.filter(f => f.lessonId === lessonId));
      })
      .catch(() => setFootnotes([]));
  }, [lessonId]);

  if (footnotes === null) {
    return (
      <div className="p-5 text-center">
        <p className="font-english text-white/25 text-xs italic animate-pulse">Loading citations…</p>
      </div>
    );
  }

  if (footnotes.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="font-english text-white/25 text-xs italic">
          No compiler footnotes have been indexed for this lesson yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5" dir="ltr">
      <p className="font-english text-xs mb-4" style={{color:'rgba(255,255,255,0.35)'}}>
        {footnotes.length} footnote{footnotes.length !== 1 ? 's' : ''} compiled by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī for this lesson —
        numbered as in the physical edition (numbers restart on each printed page).{' '}
        <Link href={`/footnotes?mode=lesson&lesson=${lessonId}`} className="text-gold/70 hover:text-gold underline">
          Open full Critical Apparatus view ↗
        </Link>
      </p>
      <div className="space-y-3">
        {footnotes.map(fn => (
          <div key={fn.id} id={`citepanel-${fn.id}`} className="border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-english text-[10px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded">
                fn. {fn.displayNum ?? fn.num}
              </span>
              {fn.scholar && (
                <span className="font-english text-xs font-semibold" style={{color:'rgba(255,255,255,0.8)'}}>{fn.scholar}</span>
              )}
              {fn.work && (
                <span className="font-english text-xs italic" style={{color:'rgba(255,255,255,0.4)'}}>{fn.work}</span>
              )}
              {fn.volRef && (
                <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>{fn.volRef}</span>
              )}
              <a href={`/footnotes#${fn.id}`} className="font-english text-[10px] text-gold/50 hover:text-gold ml-auto">
                View in apparatus →
              </a>
            </div>
            <p className="font-arabic text-sm leading-7" dir="rtl" style={{color:'rgba(255,255,255,0.78)'}}>
              {fn.arabic}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
