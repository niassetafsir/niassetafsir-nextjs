'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Footnote {
  id: string;
  lessonId: number;
  num: number;
  arabic: string;
  scholar: string | null;
  work: string | null;
  sourceType: string;
  genre: string;
  enHeader: string;
  enTranslation: string | null;
  volRef?: string;
}

const GENRE_COLORS: Record<string, string> = {
  'Hadith Sciences': 'border-blue-500/40 text-blue-300/80 bg-blue-500/8',
  'Tafsīr': 'border-green-500/40 text-green-300/80 bg-green-500/8',
  'Theology': 'border-amber-500/40 text-amber-300/80 bg-amber-500/8',
  'Sufism': 'border-purple-500/40 text-purple-300/80 bg-purple-500/8',
  'Quranic Sciences': 'border-teal-500/40 text-teal-300/80 bg-teal-500/8',
  'Fiqh': 'border-orange-500/40 text-orange-300/80 bg-orange-500/8',
  'Linguistics': 'border-cyan-500/40 text-cyan-300/80 bg-cyan-500/8',
  'History & Narrative': 'border-rose-500/40 text-rose-300/80 bg-rose-500/8',
  'Ethics': 'border-lime-500/40 text-lime-300/80 bg-lime-500/8',
  'Other': 'border-white/20 text-white/40 bg-white/5',
};

type FilterMode = 'all' | 'scholar' | 'genre' | 'lesson';

export default function FootnotesPage() {
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FilterMode>('scholar');
  const [active, setActive] = useState<string>('all');
  const [search, setSearch] = useState('');
  const highlightRef = useRef<string | null>(null);

  useEffect(() => {
    fetch('/data/footnotes.json').then(r => r.json()).then(d => {
      setFootnotes(d);
      setLoading(false);
    });
    // Check URL hash for direct footnote link
    if (window.location.hash) {
      highlightRef.current = window.location.hash.slice(1);
      // Show all so the target is visible
      setMode('all');
      setActive('all');
      setTimeout(() => {
        const el = document.getElementById(window.location.hash.slice(1));
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  }, []);

  // Build filter options
  const scholars = Array.from(new Set(footnotes.map(f => f.scholar).filter(Boolean))).sort() as string[];
  const genres = Array.from(new Set(footnotes.map(f => f.genre))).sort();
  const lessons = Array.from(new Set(footnotes.map(f => f.lessonId))).sort((a,b) => a-b);

  // Scholar frequency
  const scholarCount: Record<string, number> = {};
  footnotes.forEach(f => { if (f.scholar) scholarCount[f.scholar] = (scholarCount[f.scholar]||0)+1; });

  const filtered = footnotes.filter(f => {
    if (search && !f.arabic.includes(search) && !(f.scholar||'').toLowerCase().includes(search.toLowerCase()) && !(f.enHeader||'').toLowerCase().includes(search.toLowerCase())) return false;
    if (active === 'all') return true;
    if (mode === 'scholar') return f.scholar === active;
    if (mode === 'genre') return f.genre === active;
    if (mode === 'lesson') return f.lessonId === parseInt(active);
    return true;
  });

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">الحواشي والمصادر</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.5)'}}>
          Footnotes & Citations
        </p>
        <p className="font-english text-xs mb-5" style={{color:'rgba(255,255,255,0.25)'}}>
          {footnotes.length} footnotes compiled by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī
        </p>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search footnotes…"
          className="w-full max-w-md border border-gold/25 rounded-xl px-4 py-2.5 font-english text-sm outline-none focus:border-gold/50 bg-white/5 placeholder-white/20 mx-auto block"
          style={{ color: 'inherit' }}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['scholar','genre','lesson'] as FilterMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setActive('all'); }}
            className={`font-english text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${
              mode === m ? 'border-gold/50 text-gold bg-gold/10' : 'border-white/15 text-white/40 hover:border-white/30'
            }`}>
            By {m}
          </button>
        ))}
        <button onClick={() => setActive('all')}
          className={`font-english text-xs px-3 py-1.5 rounded-lg border transition-all ${
            active === 'all' ? 'border-gold/50 text-gold bg-gold/10' : 'border-white/15 text-white/40 hover:border-white/30'
          }`}>
          Show All ({footnotes.length})
        </button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar filter list */}
        {active !== 'all' || mode !== 'all' ? (
          <div className="w-44 flex-shrink-0 space-y-1">
            {mode === 'scholar' && scholars.sort((a,b) => (scholarCount[b]||0)-(scholarCount[a]||0)).map(s => (
              <button key={s} onClick={() => setActive(active === s ? 'all' : s)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-english transition-all ${
                  active === s ? 'bg-gold/15 text-gold' : 'text-white/45 hover:bg-white/5 hover:text-white/70'
                }`}>
                <div className="truncate">{s}</div>
                <div className="text-[10px] opacity-60">{scholarCount[s]} ref{scholarCount[s]!==1?'s':''}</div>
              </button>
            ))}
            {mode === 'genre' && genres.map(g => {
              const count = footnotes.filter(f => f.genre === g).length;
              const colors = GENRE_COLORS[g] || GENRE_COLORS['Other'];
              return (
                <button key={g} onClick={() => setActive(active === g ? 'all' : g)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-english transition-all border ${
                    active === g ? `${colors} border-opacity-100` : 'border-transparent text-white/45 hover:bg-white/5'
                  }`}>
                  <div className="truncate">{g}</div>
                  <div className="text-[10px] opacity-60">{count}</div>
                </button>
              );
            })}
            {mode === 'lesson' && lessons.map(l => {
              const count = footnotes.filter(f => f.lessonId === l).length;
              return (
                <button key={l} onClick={() => setActive(active === String(l) ? 'all' : String(l))}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-english transition-all ${
                    active === String(l) ? 'bg-gold/15 text-gold' : 'text-white/45 hover:bg-white/5'
                  }`}>
                  Lesson {l} <span className="opacity-50">({count})</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Main footnote list */}
        <div className="flex-1 space-y-2">
          {loading ? (
            <p className="text-center py-12 animate-pulse font-english" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
          ) : (
            <>
              <p className="font-english text-xs mb-1" style={{color:'rgba(255,255,255,0.2)'}}>
                {filtered.length} footnote{filtered.length!==1?'s':''}
                {active !== 'all' && ` · filtered by ${mode}: ${active}`}
              </p>
              <p className="font-english text-[10px] mb-3 italic" style={{color:'rgba(255,255,255,0.15)'}}>
                Footnotes numbered as in the physical edition — numbers restart on each page of the original.
              </p>
              {filtered.map(fn => {
                const isHighlighted = fn.id === highlightRef.current;
                const genreColor = GENRE_COLORS[fn.genre] || GENRE_COLORS['Other'];
                return (
                  <div
                    key={fn.id}
                    id={fn.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isHighlighted ? 'border-gold/60 bg-gold/8' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/lesson/${fn.lessonId}?panel=tafsir`}
                          className="font-english text-[10px] text-gold/60 hover:text-gold border border-gold/20 px-1.5 py-0.5 rounded transition-colors">
                          Lesson {fn.lessonId} · fn. {fn.num}{fn.id.split('-').length > 3 ? ` (occ. ${fn.id.split('-').pop()})` : ''}
                        </Link>
                        {fn.volRef && (
                          <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                            {fn.volRef}
                          </span>
                        )}
                        {fn.scholar && (
                          <span className="font-english text-xs font-semibold" style={{color:'rgba(255,255,255,0.8)'}}>
                            {fn.scholar}
                          </span>
                        )}
                        {fn.work && (
                          <span className="font-english text-xs italic" style={{color:'rgba(255,255,255,0.4)'}}>
                            {fn.work}
                          </span>
                        )}
                      </div>
                      <span className={`font-english text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${genreColor}`}>
                        {fn.genre}
                      </span>
                    </div>

                    {/* Arabic text — Muḥammad ibn al-Shaykh verbatim */}
                    <p className="font-arabic text-sm leading-7 mb-2" dir="rtl"
                      style={{color:'rgba(255,255,255,0.8)'}}>
                      {fn.arabic}
                    </p>

                    {/* English */}
                    <div className="border-t border-white/8 pt-2 mt-2">
                      {fn.enTranslation ? (
                        <p className="font-english text-xs leading-6" style={{color:'rgba(255,255,255,0.6)'}}>
                          {fn.enTranslation}
                        </p>
                      ) : (
                        <p className="font-english text-xs italic" style={{color:'rgba(255,255,255,0.25)'}}>
                          <strong className="not-italic">{fn.enHeader}</strong>
                          {fn.enHeader !== '[Citation]' && ' · '}
                          [Translation pending]
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
