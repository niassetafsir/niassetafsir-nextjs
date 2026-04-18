'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ThemeLesson {
  lessonId: number;
  lessonTitleEn: string;
  lessonTitleAr: string;
  verseRange: string;
  score: number;
  volume?: number;
  pageInVolume?: number | null;
}

type ThemeIndex = Record<string, ThemeLesson[]>;

const THEME_DESC: Record<string, { ar: string; desc: string; color: string }> = {



  'Sufism':         { ar: 'التصوف', desc: 'Ṭarīqa, walāya, fanāʾ, baqāʾ, fayḍa, tarbiya', color: 'border-purple-500/40 text-purple-300/80 bg-purple-500/5' },
  'Fiqh & Law':     { ar: 'الفقه والشريعة', desc: 'Legal rulings, ḥalāl/ḥarām, worship obligations', color: 'border-orange-500/40 text-orange-300/80 bg-orange-500/5' },
  'Quranic Sciences':{ ar: 'علوم القرآن', desc: 'Inimitability, qirāʾāt, exegetical method, tafsīr theory', color: 'border-green-500/40 text-green-300/80 bg-green-500/5' },
  'Prophethood':    { ar: 'النبوة والرسالة', desc: 'Prophets, companions, revelation, miracles', color: 'border-blue-500/40 text-blue-300/80 bg-blue-500/5' },
  'Spiritual Ethics':{ ar: 'الأخلاق الروحية', desc: 'Sincerity, piety, patience, gratitude, repentance', color: 'border-rose-500/40 text-rose-300/80 bg-rose-500/5' },
  'History & Narrative':{ ar: 'القصص والتاريخ', desc: 'Prophetic narratives, Israelites, historical accounts', color: 'border-cyan-500/40 text-cyan-300/80 bg-cyan-500/5' },
};

export default function ThemesPage() {
  const [index, setIndex] = useState<ThemeIndex>({});
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/themes.json').then(r => r.json()).then(d => {
      setIndex(d);
      setLoading(false);
    });
  }, []);

  const themes = Object.keys(THEME_DESC).filter(t => index[t]);
  const activeData = active ? (index[active] || []).sort((a,b) => b.score - a.score) : [];

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">الفهرس الموضوعي</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.45)'}}>
          Thematic Index
        </p>
        <p className="font-english text-xs mb-6" style={{color:'rgba(255,255,255,0.25)'}}>
          Browse the tafsīr by subject — theology, anthropology, cosmology, Sufism, law, and more
        </p>
        <p className="font-english text-[11px] italic" style={{color:'rgba(255,255,255,0.2)'}}>
          Thematic tagging is computational and preliminary — subject to editorial revision.
          Lessons may appear under multiple themes.
        </p>
      </div>

      {loading ? (
        <p className="text-center py-12 animate-pulse font-english" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
      ) : (
        <div className="flex gap-5">
          {/* Theme grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-fit flex-1">
            {themes.map(theme => {
              const meta = THEME_DESC[theme];
              const lessons = index[theme] || [];
              const isActive = active === theme;
              return (
                <button key={theme}
                  onClick={() => setActive(isActive ? null : theme)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isActive ? meta.color + ' border-opacity-100' : 'border-white/10 hover:border-white/20'
                  }`}>
                  <div className="font-arabic text-base mb-0.5" dir="rtl"
                    style={{color: isActive ? 'inherit' : 'rgba(255,255,255,0.75)'}}>{meta.ar}</div>
                  <div className="font-english font-semibold text-sm mb-1"
                    style={{color: isActive ? 'inherit' : 'rgba(255,255,255,0.85)'}}>{theme}</div>
                  <div className="font-english text-xs"
                    style={{color:'rgba(255,255,255,0.35)'}}>{meta.desc}</div>
                  <div className="font-english text-[11px] mt-2"
                    style={{color:'rgba(255,255,255,0.3)'}}>{lessons.length} lessons</div>
                </button>
              );
            })}
          </div>

          {/* Lesson list for active theme */}
          {active && (
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-20">
                <div className={`rounded-xl border p-3 mb-3 ${THEME_DESC[active]?.color}`}>
                  <div className="font-english text-sm font-semibold">{active}</div>
                  <div className="font-arabic text-sm" dir="rtl">{THEME_DESC[active]?.ar}</div>
                  <div className="font-english text-[11px] mt-1" style={{color:'rgba(255,255,255,0.5)'}}>
                    {activeData.length} lessons
                  </div>
                </div>
                <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                  {activeData.map(l => (
                    <Link key={l.lessonId} href={`/lesson/${l.lessonId}?panel=tafsir`}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg border border-white/8 hover:border-gold/30 hover:bg-gold/5 transition-all group">
                      <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {l.lessonId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-english text-xs group-hover:text-gold transition-colors truncate"
                          style={{color:'rgba(255,255,255,0.7)'}}>
                          {l.lessonTitleEn}
                        </div>
                        <div className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                          {l.volume ? `Vol. ${l.volume}${l.pageInVolume ? `, p. ${l.pageInVolume}` : ''}` : ''}
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
      )}
    </main>
  );
}
