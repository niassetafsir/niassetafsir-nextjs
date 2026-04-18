'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ThemeLesson {
  lessonId: number;
  lessonTitleEn: string;
  lessonTitleAr: string;
  verseRange: string;
  score: number;
  bodyScore: number;
  volume?: number;
  pageInVolume?: number | null;
  anchor?: string | null;
}

interface TaxonomyMeta {
  ar: string;
  desc: string;
}

interface ThemesData {
  themes: Record<string, ThemeLesson[]>;
  taxonomy: Record<string, TaxonomyMeta>;
}

const CATEGORY_COLORS: Record<string, string> = {
  '1': 'border-cyan-500/40 text-cyan-200/80 bg-cyan-500/8',
  '2': 'border-blue-500/40 text-blue-200/80 bg-blue-500/8',
  '3': 'border-amber-500/40 text-amber-200/80 bg-amber-500/8',
  '4': 'border-orange-500/40 text-orange-200/80 bg-orange-500/8',
  '5': 'border-red-500/40 text-red-200/80 bg-red-500/8',
  '6': 'border-rose-500/40 text-rose-200/80 bg-rose-500/8',
  '7': 'border-gold/40 text-gold/80 bg-gold/8',
  '8': 'border-yellow-500/40 text-yellow-200/80 bg-yellow-500/8',
  '9': 'border-teal-500/40 text-teal-200/80 bg-teal-500/8',
  '10': 'border-green-500/40 text-green-200/80 bg-green-500/8',
  '11': 'border-purple-500/40 text-purple-200/80 bg-purple-500/8',
  '12': 'border-indigo-500/40 text-indigo-200/80 bg-indigo-500/8',
};

function getCatNum(key: string) {
  return key.split('.')[0].trim();
}

export default function ThemesPage() {
  const [data, setData] = useState<ThemesData | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/themes.json').then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (!data || loading) return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-center">
      <p className="font-english animate-pulse" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
    </main>
  );

  const { themes, taxonomy } = data;
  const activeData = active ? themes[active] || [] : [];
  const activeMeta = active ? taxonomy[active] : null;

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">فهرس علوم التفسير</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.45)'}}>
          Tafsīr Sciences Index
        </p>
        <p className="font-english text-xs mb-5" style={{color:'rgba(255,255,255,0.25)'}}>
          12 categories drawn from classical ʿulūm al-tafsīr · semantic classification of Niasse's commentary
        </p>
      </div>

      <div className="flex gap-5">
        {/* Category grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(taxonomy).map(([key, meta]) => {
              const lessons = themes[key] || [];
              const catNum = getCatNum(key);
              const color = CATEGORY_COLORS[catNum] || 'border-white/15 text-white/60';
              const isActive = active === key;
              const strongCount = lessons.filter(l => l.bodyScore >= 2).length;
              return (
                <button key={key}
                  onClick={() => setActive(isActive ? null : key)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isActive ? color : 'border-white/10 hover:border-white/20'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-english text-xs font-bold mb-0.5" style={{
                        color: isActive ? 'inherit' : 'rgba(255,255,255,0.4)'
                      }}>
                        {key.split('.')[0]}.
                      </div>
                      <div className="font-english text-sm font-semibold" style={{
                        color: isActive ? 'inherit' : 'rgba(255,255,255,0.85)'
                      }}>
                        {key.split('. ')[1]}
                      </div>
                      <div className="font-arabic text-xs mt-0.5" dir="rtl" style={{color:'rgba(255,255,255,0.4)'}}>
                        {meta.ar}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                        {lessons.length} lessons
                      </div>
                      {strongCount > 0 && (
                        <div className="font-english text-[9px]" style={{color:'rgba(201,168,76,0.5)'}}>
                          {strongCount} primary
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-english text-[11px] mt-1.5 leading-4" style={{
                    color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'
                  }}>
                    {meta.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 border border-white/8 rounded-xl">
            <p className="font-english text-[11px]" style={{color:'rgba(255,255,255,0.25)'}}>
              <strong style={{color:'rgba(255,255,255,0.4)'}}>Primary</strong> = strong presence in Niasse&apos;s own commentary.
              Detection is computational and subject to editorial review.
            </p>
          </div>
        </div>

        {/* Lesson list */}
        {active && activeMeta && (
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className={`rounded-xl border p-3 mb-3 ${CATEGORY_COLORS[getCatNum(active)] || ''}`}>
                <div className="font-english text-sm font-semibold">{active.split('. ')[1]}</div>
                <div className="font-arabic text-sm mt-0.5" dir="rtl">{activeMeta.ar}</div>
                <div className="font-english text-[10px] mt-1" style={{color:'rgba(255,255,255,0.5)'}}>
                  {activeData.length} lessons · click to go to relevant passage
                </div>
              </div>
              <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                {activeData.map((l, i) => (
                  <Link key={i}
                    href={`/lesson/${l.lessonId}?panel=tafsir${l.anchor ? '&q=' + encodeURIComponent(l.anchor) : ''}`}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-white/8 hover:border-gold/30 hover:bg-gold/5 transition-all group">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: l.bodyScore >= 2 ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.1)',
                        color: l.bodyScore >= 2 ? '#C9A84C' : 'rgba(255,255,255,0.4)'
                      }}>
                      {l.lessonId}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-english text-xs group-hover:text-gold transition-colors truncate"
                        style={{color:'rgba(255,255,255,0.7)'}}>
                        {l.lessonTitleEn}
                      </div>
                      <div className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                        {l.volume ? `Vol. ${l.volume}` : ''}{l.bodyScore >= 2 ? ' · primary' : ''}
                      </div>
                    </div>
                    <span className="text-gold/25 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
