'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Lexicon panel over a Qurʾānic āya.
//
// WHAT IS AND IS NOT CLAIMED HERE. A word is underlined only when
// src/data/verseRoots.json carries a root for it, which is only where the
// Quranic Arabic Corpus supplies one. Particles, proper nouns and the handful
// of Warsh-only words carry none and are rendered plain. A word with no
// underline is a word this edition is not offering to gloss -- silence rather
// than a guess. Niasse's own commentary has no such annotation at all and is
// deliberately untouched by this component; see
// claude/lexicon-hover-commentary.md for the measurement that settled it (a
// light stemmer gets the root right 64% of the time, which on a critical
// edition is worse than saying nothing).
//
// PROVENANCE. The lexicon texts come from a compiled corpus that names no
// printed edition, so the panel cites work and headword but never a page, and
// labels itself a reading aid. Jurjānī's Taʿrīfāt, which does have a citable
// edition, is a separate layer and not served here.
//
// PAYLOAD. Nothing is bundled. Each card is a ~2 KB fetch of
// /data/lex/{root}.json, made on first hover or tap and then cached for the
// life of the page. src/lib/volumes.ts documents what happens when reference
// data is shipped into a client bundle instead; this avoids that.

export interface LexCard {
  root: string;
  freq: number;
  mufradat?: { headword: string; via: string; gloss: string; citations?: { q: string; ref: string }[] };
  maqayis?: { headword: string; gloss: string };
  lane?: { headword: string; gloss: string };
}

export default function RootPanel({
  words,
  roots,
}: {
  /** The āya's words, in order, exactly as verse_text.json stores them. */
  words: string[];
  /** One entry per word: its root, or null where the corpus supplies none. */
  roots: (string | null)[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const [card, setCard] = useState<LexCard | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const cache = useRef(new Map<string, LexCard>());
  const seq = useRef(0);

  const open = useCallback(async (root: string) => {
    if (root === active) return;
    setActive(root);
    const hit = cache.current.get(root);
    if (hit) { setCard(hit); setState('idle'); return; }
    const mine = ++seq.current;
    setState('loading');
    setCard(null);
    try {
      const res = await fetch(`/data/lex/${encodeURIComponent(root)}.json`);
      if (!res.ok) throw new Error(String(res.status));
      const data: LexCard = await res.json();
      cache.current.set(root, data);
      // A slower fetch for an earlier word must not overwrite a later one.
      if (mine === seq.current) { setCard(data); setState('idle'); }
    } catch {
      if (mine === seq.current) setState('error');
    }
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setActive(null); setCard(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div>
      <p
        className="font-arabic text-[26px] leading-[2.1] mb-3 text-right"
        dir="rtl"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.92))' }}
      >
        {words.map((w, i) => {
          const r = roots[i] ?? null;
          if (!r) return <span key={i}>{w}{' '}</span>;
          const on = r === active;
          return (
            <span key={i}>
              <button
                type="button"
                onMouseEnter={() => open(r)}
                onFocus={() => open(r)}
                onClick={() => (on ? (setActive(null), setCard(null)) : open(r))}
                aria-expanded={on}
                aria-label={`Lexicon for ${w}, root ${r}`}
                className="tap font-arabic"
                style={{
                  font: 'inherit',
                  background: on ? 'rgba(201,168,76,0.16)' : 'transparent',
                  borderBottom: `1.5px solid ${on ? 'var(--gold, #C9A84C)' : 'rgba(201,168,76,0.28)'}`,
                  color: 'inherit',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {w}
              </button>{' '}
            </span>
          );
        })}
      </p>

      {active && (
        <aside
          aria-live="polite"
          className="mb-6 rounded-sm px-4 py-4"
          style={{ border: '1px solid var(--border, rgba(201,168,76,0.25))' }}
        >
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span
              className="font-english text-[10px] tracking-[0.13em] uppercase"
              style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}
            >
              Lexicon · reading aid
            </span>
            <button
              type="button"
              onClick={() => { setActive(null); setCard(null); }}
              className="tap font-english text-[11px] hover:text-gold"
              style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}
            >
              Close
            </button>
          </div>

          <div className="font-arabic text-[30px] leading-tight tracking-[0.06em] text-right" dir="rtl">
            {active}
          </div>

          {state === 'loading' && (
            <p className="font-english text-[13px] mt-2" style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}>
              Loading…
            </p>
          )}
          {state === 'error' && (
            <p className="font-english text-[13px] mt-2" style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}>
              No entry could be loaded for this root.
            </p>
          )}

          {card && (
            <>
              <p
                className="font-english text-[11px] mt-1 mb-3"
                style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}
              >
                {card.freq} occurrence{card.freq === 1 ? '' : 's'} in the Qurʾān
              </p>

              <Entry title="al-Rāghib, Mufradāt" d={card.mufradat} />
              <Entry title="Ibn Fāris, Maqāyīs" d={card.maqayis} />
              <Entry title="Lane" d={card.lane} ltr />

              {card.mufradat?.citations?.length ? (
                <>
                  <div
                    className="font-english text-[10px] tracking-[0.13em] uppercase mt-4 mb-2"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}
                  >
                    Cited āyāt
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {card.mufradat.citations.slice(0, 8).map(c => (
                      <Link
                        key={c.ref}
                        href={`/verse/${c.ref.replace(':', '/')}`}
                        className="tap font-english text-[11px] px-2 py-1 rounded-sm hover:text-gold"
                        style={{ border: '1px solid var(--border, rgba(201,168,76,0.25))' }}
                      >
                        {c.ref}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              <p
                className="font-english text-[11px] mt-4 pt-3"
                style={{
                  color: 'var(--body-faint, rgba(255,255,255,0.6))',
                  borderTop: '1px solid var(--border, rgba(201,168,76,0.25))',
                }}
              >
                Lexicon entries are given without page reference: the digitised texts
                name no printed edition. Treat them as a reading aid, not as the
                edition&rsquo;s apparatus.
              </p>
            </>
          )}
        </aside>
      )}
    </div>
  );
}

function Entry({
  title,
  d,
  ltr,
}: {
  title: string;
  d?: { headword: string; gloss: string; via?: string };
  ltr?: boolean;
}) {
  if (!d?.gloss) return null;
  return (
    <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--border, rgba(201,168,76,0.25))' }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-english text-[13px]">{title}</span>
        <span className="font-arabic text-[19px] text-gold" dir="rtl">{d.headword}</span>
      </div>
      {/* Whether the headword was reached directly or derived from the root is
          stated, not hidden: كون opens Rāghib's كان, and a reader checking the
          print should know that. */}
      {d.via && (
        <div
          className="font-english text-[10px] tracking-[0.08em] uppercase mt-1"
          style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}
        >
          {d.via === 'exact' ? 'direct headword' : 'derived headword'}
        </div>
      )}
      <p
        className={ltr ? 'font-english text-[14px] leading-relaxed mt-2' : 'font-arabic text-[17px] leading-[1.9] mt-2 text-right'}
        dir={ltr ? 'ltr' : 'rtl'}
      >
        {d.gloss}
      </p>
    </div>
  );
}
