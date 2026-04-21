'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Occurrence {
  lessonId: number;
  volume: number;
  page: number;
  paraIndex: number;
  arabicTitle: string;
  englishTitle: string;
  context: string;
  matchedForm: string;
}

interface TermEntry {
  term: string;
  arabic: string;
  plural: string;
  related: string[];
  occurrences: Occurrence[];
  occurrenceCount: number;
}

export default function ConcordancePage() {
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/data/term_concordance.json').then(r => r.json()).then(setTerms);
  }, []);

  const filtered = terms.filter(t =>
    !search ||
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.arabic.includes(search)
  );

  const selectedTerm = terms.find(t => t.term === selected);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <div className="font-arabic text-gold text-xl mb-1" dir="rtl">فهرس المصطلحات</div>
        <h1 className="font-english text-white text-2xl font-semibold">Concordance of Terms</h1>
        <p className="font-english text-sm mt-2 leading-6" style={{color:'rgba(255,255,255,0.4)'}}>
          A textual index of key theological and Sufi terms as they appear in Niasse&apos;s text — 
          where each term occurs, in context, with direct links to the passage.
          Interpretive definitions are reserved for the forthcoming scholarly edition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Term list */}
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Search terms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-white/15 rounded-lg px-3 py-2 font-english text-sm bg-white/5 outline-none focus:border-gold/40 mb-3"
            style={{color:'inherit'}}
          />
          <div className="space-y-1">
            {filtered.map(t => (
              <button
                key={t.term}
                onClick={() => setSelected(t.term === selected ? null : t.term)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                  selected === t.term
                    ? 'border-gold/50 bg-gold/8'
                    : 'border-white/8 hover:border-white/20 bg-white/3 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-english text-sm font-semibold" style={{color: selected === t.term ? '#C9A84C' : 'rgba(255,255,255,0.8)'}}>
                      {t.term}
                    </span>
                    <span className="font-arabic text-xs ml-2" dir="rtl" style={{color:'rgba(255,255,255,0.35)'}}>
                      {t.arabic}
                    </span>
                  </div>
                  <span className="font-english text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{color:'rgba(201,168,76,0.6)', borderColor:'rgba(201,168,76,0.2)'}}>
                    {t.occurrenceCount}
                  </span>
                </div>
                {t.related && t.related.length > 0 && (
                  <div className="font-english text-[10px] mt-0.5" style={{color:'rgba(255,255,255,0.2)'}}>
                    See also: {t.related.slice(0,3).join(', ')}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="font-english text-[10px] mt-3 italic" style={{color:'rgba(255,255,255,0.15)'}}>
            {terms.reduce((a,t) => a + t.occurrenceCount, 0)} total occurrences indexed across 30 lessons
          </p>
        </div>

        {/* Occurrence panel */}
        <div className="md:col-span-2">
          {!selectedTerm ? (
            <div className="border border-white/8 rounded-xl p-8 text-center">
              <div className="font-arabic text-gold/30 text-3xl mb-3" dir="rtl">المصطلحات</div>
              <p className="font-english text-white/25 text-sm">
                Select a term to view its occurrences in Niasse&apos;s text
              </p>
            </div>
          ) : (
            <div>
              <div className="border border-gold/25 rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-english text-white font-semibold text-lg">{selectedTerm.term}</h2>
                    <div className="font-arabic text-gold text-base mt-0.5" dir="rtl">{selectedTerm.arabic}</div>
                    {selectedTerm.plural && (
                      <div className="font-english text-xs mt-1" style={{color:'rgba(255,255,255,0.3)'}}>
                        Plural: <span className="font-arabic" dir="rtl">{selectedTerm.plural}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-english text-sm font-bold text-gold border border-gold/30 px-3 py-1 rounded-lg flex-shrink-0">
                    {selectedTerm.occurrenceCount} occ.
                  </span>
                </div>
                {selectedTerm.related && selectedTerm.related.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/8 flex flex-wrap gap-1">
                    <span className="font-english text-[10px] text-white/30 mr-1">See also:</span>
                    {selectedTerm.related.map(r => (
                      <button key={r}
                        onClick={() => setSelected(r)}
                        className="font-english text-[10px] border border-white/15 hover:border-gold/40 px-2 py-0.5 rounded transition-colors"
                        style={{color:'rgba(255,255,255,0.45)'}}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTerm.occurrences.length === 0 ? (
                <div className="text-center py-8 border border-white/8 rounded-xl">
                  <p className="font-english text-white/25 text-sm italic">
                    No occurrences found in the current text corpus.
                  </p>
                  <p className="font-english text-white/15 text-xs mt-1">
                    This term may appear in lessons not yet digitised (Vol. 6–10).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTerm.occurrences.map((occ, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <Link
                          href={`/lesson/${occ.lessonId}?panel=tafsir&q=${encodeURIComponent(occ.context.slice(0,30))}`}
                          className="font-english text-[11px] text-gold/60 hover:text-gold border border-gold/20 px-2 py-0.5 rounded transition-colors"
                        >
                          Lesson {occ.lessonId} · Vol. {occ.volume}{occ.page ? `, p. ${occ.page}` : ''}
                        </Link>
                        <span className="font-arabic text-xs text-white/30" dir="rtl">{occ.arabicTitle}</span>
                      </div>
                      <p className="font-arabic text-sm leading-7 text-right" dir="rtl"
                        style={{color:'rgba(255,255,255,0.75)'}}
                        dangerouslySetInnerHTML={{
                          __html: occ.context.replace(
                            new RegExp(occ.matchedForm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g'),
                            `<mark style="background:rgba(201,168,76,0.25);color:#C9A84C;border-radius:2px;padding:0 1px">${occ.matchedForm}</mark>`
                          )
                        }}
                      />
                      {/* English translation below Arabic */}
                      {(occ as any).englishExcerpt ? (
                        <p className="font-english text-xs leading-5 mt-1.5 italic border-t border-white/8 pt-1.5"
                          style={{color:'rgba(255,255,255,0.45)'}}>
                          {(occ as any).englishExcerpt}
                        </p>
                      ) : (
                        <p className="font-english text-[10px] mt-1.5 border-t border-white/5 pt-1"
                          style={{color:'rgba(255,255,255,0.2)'}}>
                          English translation forthcoming
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
