'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NiasseEvidence {
  type: string;
  lesson: number;
  volume?: number;
  page?: number | null;
  arabic_quote: string;
  translation_note: string;
  verseRange: string;
}

interface ApparatusEvidence {
  fn_id: string;
  lesson: number;
  arabic_quote: string;
  note: string;
}

interface GlossaryEntry {
  term: string;
  arabic: string;
  plural: string;
  definition: string;
  definition_pending?: boolean;
  lessons: number[];
  related: string[];
  niasse_evidence?: NiasseEvidence[];
  apparatus_evidence?: ApparatusEvidence[];
}

export default function GlossaryPage() {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/glossary.json').then(r => r.json()).then(d => { setEntries(d); setLoading(false); });
  }, []);

  const filtered = entries.filter(e =>
    !search ||
    e.term.toLowerCase().includes(search.toLowerCase()) ||
    e.arabic.includes(search) ||
    e.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">المصطلحات</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.4)'}}>
          Glossary of Key Terms in Niasse's Tafsīr
        </p>
        <p className="font-english text-xs mb-5" style={{color:'rgba(255,255,255,0.25)'}}>
          Technical vocabulary as Niasse employs it — theological, Sufi, and Quranic
        </p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms…"
          className="w-full max-w-sm border border-gold/25 rounded-xl px-4 py-2.5 font-english text-sm outline-none focus:border-gold/50 bg-white/5 placeholder-white/20 mx-auto block"
          style={{ color: 'inherit' }}
        />
      </div>

      {loading ? (
        <p className="text-center py-12 animate-pulse font-english" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const isOpen = expanded === entry.term;
            return (
              <div key={entry.term} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : entry.term)}
                  className="w-full text-left px-4 py-3 hover:bg-gold/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-english font-semibold text-sm text-gold">{entry.term}</span>
                      <span className="font-arabic text-base" dir="rtl" style={{color:'rgba(255,255,255,0.6)'}}>{entry.arabic}</span>
                      {entry.plural && (
                        <span className="font-english text-xs italic" style={{color:'rgba(255,255,255,0.25)'}}>pl. {entry.plural}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>
                        {entry.lessons.length} lesson{entry.lessons.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-gold/30 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {!isOpen && (
                    <p className="font-english text-xs mt-1.5 line-clamp-2" style={{color: entry.definition_pending ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.4)', lineHeight:'1.6', fontStyle: entry.definition_pending ? 'italic' : 'normal'}}>
                      {entry.definition_pending ? 'Definition in preparation — Quranic evidence available' : entry.definition.slice(0, 120) + '…'}
                    </p>
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/8">
                    {entry.definition_pending ? (
                      <p className="font-english text-xs italic mt-3 p-3 border border-gold/20 rounded-lg" style={{color:'rgba(201,168,76,0.6)', background:'rgba(201,168,76,0.05)'}}>
                        Definition in preparation. Drawing on Muḥammad al-Mishri&apos;s commentary and Niasse&apos;s own usage in the tafsīr below.
                      </p>
                    ) : (
                      <p className="font-english text-sm leading-7 mt-3" style={{color:'rgba(255,255,255,0.75)'}}>
                        {entry.definition}
                      </p>
                    )}

                    {entry.related.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Related:</span>
                        {entry.related.map(r => (
                          <button key={r} onClick={(e) => { e.stopPropagation(); setExpanded(r); setSearch(''); }}
                            className="font-english text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/50 px-2 py-0.5 rounded transition-colors">
                            {r}
                          </button>
                        ))}
                      </div>

                    )}

                    {/* Niasse's own words */}
                    {entry.niasse_evidence && entry.niasse_evidence.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gold/15">
                        <p className="font-english text-[11px] font-semibold mb-2" style={{color:'rgba(201,168,76,0.8)'}}>
                          IN NIASSE'S OWN WORDS
                        </p>
                        <div className="space-y-3">
                          {entry.niasse_evidence.map((ev, i) => (
                            <div key={i} className="border-l-2 border-gold/30 pl-3">
                              <p className="font-arabic text-sm leading-7" dir="rtl" style={{color:'rgba(255,255,255,0.8)'}}>
                                «{ev.arabic_quote}»
                              </p>
                              <p className="font-english text-xs italic mt-0.5" style={{color:'rgba(255,255,255,0.45)'}}>
                                "{ev.translation_note}"
                              </p>
                              <Link href={`/lesson/${ev.lesson}?panel=tafsir&q=${encodeURIComponent(ev.arabic_quote.slice(0,25))}`}
                                className="font-english text-[10px] text-gold/50 hover:text-gold mt-0.5 inline-block transition-colors">
                                Lesson {ev.lesson}{ev.volume ? ` · Vol. ${ev.volume}${ev.page ? `, p. ${ev.page}` : ''}` : ''} · {ev.verseRange} →
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compiler apparatus citations */}
                    {entry.apparatus_evidence && entry.apparatus_evidence.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/8">
                        <p className="font-english text-[11px] font-semibold mb-2" style={{color:'rgba(255,255,255,0.35)'}}>
                          IN THE CRITICAL APPARATUS
                        </p>
                        <div className="space-y-2">
                          {entry.apparatus_evidence.map((ev, i) => (
                            <div key={i} className="border-l-2 border-white/15 pl-3">
                              <p className="font-arabic text-xs leading-6" dir="rtl" style={{color:'rgba(255,255,255,0.5)'}}>
                                «{ev.arabic_quote}»
                              </p>
                              <p className="font-english text-[10px] italic mt-0.5" style={{color:'rgba(255,255,255,0.3)'}}>
                                {ev.note}
                              </p>
                              <Link href={`/footnotes#${ev.fn_id}`}
                                className="font-english text-[10px] text-gold/40 hover:text-gold mt-0.5 inline-block transition-colors">
                                See footnote [{ev.fn_id}] →
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-white/8">
                      <p className="font-english text-[11px] mb-2" style={{color:'rgba(255,255,255,0.3)'}}>All appearances:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.lessons.map(n => (
                          <Link key={n} href={`/lesson/${n}?panel=tafsir`}
                            className="font-english text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/50 px-2 py-0.5 rounded transition-colors">
                            Lesson {n}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-gold/15 text-center">
        <p className="font-english text-xs" style={{color:'rgba(255,255,255,0.2)'}}>
          Definitions reflect Niasse's usage in <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>.
          Terms and lesson links will expand as the translation develops.
        </p>
      </div>
    </main>
  );
}
