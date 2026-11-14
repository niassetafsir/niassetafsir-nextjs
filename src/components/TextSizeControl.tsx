'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * Reading size for the two scripts, set separately.
 *
 * Separately because they are not one knob. Amiri at 1.1rem and the English
 * face at 15px look balanced to someone who reads both fluently; a reader who
 * is working through the Arabic with effort wants it larger while leaving the
 * translation where it is, and a reader using the translation as the text
 * wants the reverse. One slider would force them to move together and satisfy
 * neither.
 *
 * The sizes are CSS custom properties on <html>, so nothing re-renders when
 * they change: the two reading classes in globals.css read the variables and
 * the browser reflows. Line height is derived rather than stored, because a
 * fixed leading that suits 15px crowds 21px -- Arabic especially, where the
 * descenders and the vowel marks need the room.
 */

const AR = '--reading-ar-size';
const EN = '--reading-en-size';
const KEY = 'niassetafsir:reading-size';

// rem for Arabic, px for English: the defaults the reader already shipped
// with, kept exactly, so an untouched control changes nothing.
const AR_STEPS = ['0.95rem', '1.05rem', '1.1rem', '1.25rem', '1.4rem', '1.6rem'];
const EN_STEPS = ['13px', '14px', '15px', '16.5px', '18.5px', '21px'];
const DEFAULT = 2;

type Sizes = { ar: number; en: number };

function clamp(n: number) {
  return Math.max(0, Math.min(AR_STEPS.length - 1, n));
}

function apply({ ar, en }: Sizes) {
  const r = document.documentElement;
  r.style.setProperty(AR, AR_STEPS[clamp(ar)]);
  r.style.setProperty(EN, EN_STEPS[clamp(en)]);
}

export default function TextSizeControl() {
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<Sizes>({ ar: DEFAULT, en: DEFAULT });

  // Restore before the reader notices. The try/catch is not defensive
  // decoration: localStorage throws outright in a private window on some
  // browsers, and a reader in one should still get a working page.
  useEffect(() => {
    let next: Sizes = { ar: DEFAULT, en: DEFAULT };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p?.ar === 'number' && typeof p?.en === 'number') {
          next = { ar: clamp(p.ar), en: clamp(p.en) };
        }
      }
    } catch { /* no stored preference; the defaults are the shipped sizes */ }
    setSizes(next);
    apply(next);
  }, []);

  const bump = useCallback((which: keyof Sizes, by: number) => {
    setSizes(prev => {
      const next = { ...prev, [which]: clamp(prev[which] + by) };
      apply(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* unavailable */ }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = { ar: DEFAULT, en: DEFAULT };
    setSizes(next);
    apply(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* unavailable */ }
  }, []);

  const atDefault = sizes.ar === DEFAULT && sizes.en === DEFAULT;

  const Row = ({ label, sub, which }: { label: string; sub: string; which: keyof Sizes }) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex flex-col">
        <span className="font-english text-[12.5px] font-semibold" style={{ color: 'var(--body-text, rgba(232,232,224,0.9))' }}>
          {label}
        </span>
        <span className="font-english text-[10.5px]" style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          {sub}
        </span>
      </span>
      <span className="flex items-center gap-1 flex-none">
        <button
          onClick={() => bump(which, -1)}
          disabled={sizes[which] === 0}
          aria-label={`Smaller ${label.toLowerCase()}`}
          className="tap w-7 h-7 rounded-md font-english text-[13px] leading-none disabled:opacity-30 transition-colors"
          style={{ border: '1px solid rgba(201,168,76,0.35)', color: 'var(--body-text, rgba(232,232,224,0.85))' }}>
          A−
        </button>
        {/* The step, spoken for a screen reader rather than left as a bare
            number that means nothing out of context. */}
        <span className="font-english text-[10px] tabular-nums w-7 text-center"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}
          aria-live="polite">
          {sizes[which] + 1}/{AR_STEPS.length}
        </span>
        <button
          onClick={() => bump(which, 1)}
          disabled={sizes[which] === AR_STEPS.length - 1}
          aria-label={`Larger ${label.toLowerCase()}`}
          className="tap w-7 h-7 rounded-md font-english text-[15px] leading-none disabled:opacity-30 transition-colors"
          style={{ border: '1px solid rgba(201,168,76,0.35)', color: 'var(--body-text, rgba(232,232,224,0.85))' }}>
          A+
        </button>
      </span>
    </div>
  );

  return (
    <div className="relative flex-none" dir="ltr">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Text size"
        className="tap font-english flex items-center gap-1 text-xs hover:text-gold transition-colors"
        style={{ color: open ? 'var(--gold, #C9A84C)' : 'var(--body-faint, rgba(232,232,224,0.45))' }}>
        <span aria-hidden style={{ fontSize: '10px' }}>A</span>
        <span aria-hidden style={{ fontSize: '14px', lineHeight: 1 }}>A</span>
        <span className="sr-only">Text size</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-64 rounded-xl p-3 z-50 shadow-2xl"
          style={{
            background: 'var(--sticky-bg, rgba(13,31,10,0.98))',
            border: '1px solid rgba(201,168,76,0.25)',
            backdropFilter: 'blur(10px)',
          }}>
          <Row label="Arabic" sub="The tafsīr itself" which="ar" />
          <div style={{ height: 1, background: 'rgba(201,168,76,0.15)', margin: '2px 0' }} />
          <Row label="English" sub="The translation" which="en" />
          <button
            onClick={reset}
            disabled={atDefault}
            className="tap font-english text-[10.5px] mt-2 disabled:opacity-30 hover:text-gold transition-colors"
            style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
            Reset to the printed proportions
          </button>
        </div>
      )}
    </div>
  );
}
