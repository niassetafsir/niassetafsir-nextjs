'use client';
import { useEffect, useState } from 'react';

/**
 * The top of the right-hand panel: search inside this lesson, and the other
 * ways to read it (comparison, citations, overview), which used to be a row of
 * tabs above the text.
 */
export default function PanelTools({ hasCompare, hasCitations }: { hasCompare: boolean; hasCitations: boolean }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<{ i: number; n: number } | null>(null);
  const [mode, setMode] = useState('tafsir');
  useEffect(() => {
    const on = (e: Event) => setRes((e as CustomEvent<{ i: number; n: number }>).detail);
    window.addEventListener('reader-search-result', on);
    return () => window.removeEventListener('reader-search-result', on);
  }, []);
  const modes = [
    ['tafsir', 'The lesson'],
    ...(hasCompare ? [['compare', 'Compare with Jalālayn & Rūḥ al-bayān']] : []),
    ...(hasCitations ? [['citations', 'Sources and notes']] : []),
    ['overview', 'Overview'],
  ] as [string, string][];
  const pick = (m: string) => {
    setMode(m);
    window.dispatchEvent(new CustomEvent('lesson-mode', { detail: m }));
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };
  return (
    <div className="bp-tools">
      <form role="search" onSubmit={e => { e.preventDefault(); if (mode !== 'tafsir') pick('tafsir'); window.dispatchEvent(new CustomEvent('reader-search', { detail: q })); }}>
        <label className="bp-label" htmlFor="lesson-search">Search this lesson</label>
        <input id="lesson-search" type="search" value={q} onChange={e => { setQ(e.target.value); setRes(null); }}
          placeholder="A word, in English or Arabic" />
        {res && <span className="bp-search-res" aria-live="polite">{res.n ? `${res.i} of ${res.n} · Enter for next` : 'Not found in this lesson'}</span>}
      </form>
      {modes.length > 1 && (
        <div className="bp-modes">
          {modes.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => pick(id)}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
