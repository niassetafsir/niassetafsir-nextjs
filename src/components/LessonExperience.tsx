'use client';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cleanNoteArabic } from '@/lib/noteText';

/**
 * LessonExperience — the four ways to read a lesson, offered at the top.
 *
 * Replaces a stack of four collapsed <Panel> accordions. Every panel was shut
 * by default, so arriving at a lesson showed four closed bars and no text, and
 * a reader had to guess which to open. The two things almost everyone wants --
 * Niasse's own text, and the comparison against Jalālayn and Rūḥ al-Bayān --
 * were as buried as the two they rarely want.
 *
 * So the choice is made explicit and made first. Niasse is selected on arrival,
 * because the edition is his text and everything else is apparatus.
 *
 * The translation controls (layout, language) are not duplicated here: they
 * live at the top of BilingualText, which means they appear directly beneath
 * these tabs whenever Niasse is the active mode, and are absent when it isn't
 * -- which is the correct behaviour, since they do not apply to the other three.
 *
 * Deep links are preserved. ?panel=tafsir|compare|citations|overview selects a
 * mode on arrival, so existing links from the search results and elsewhere
 * still land in the right place.
 *
 * NOT CARRIED OVER from <Panel>: the "Cite this commentary" bar that appeared
 * when ?verse= was present. It was only ever reachable from /concordance, which
 * now returns notFound(), so it is dead in practice. If the concordance comes
 * back, the citation affordance should come back with it -- deliberately, not
 * by accident.
 */

export type LessonMode = 'tafsir' | 'compare' | 'citations' | 'overview';

// The tafsīr tab used to read "Shaykh Ibrāhīm, with translation" on every
// lesson. Five of the fifty-six have a translation. On the other fifty-one the
// label was simply false, and it was the first thing a reader saw.
const MODES: { id: LessonMode; en: string; ar: string; hint: string }[] = [
  { id: 'tafsir',    en: 'Tafsīr',     ar: 'التفسير',        hint: 'Shaykh Ibrāhīm' },
  { id: 'compare',   en: 'Comparison', ar: 'المقارنة',       hint: 'Jalālayn & Rūḥ al-Bayān' },
  { id: 'citations', en: 'Citations',  ar: 'الحواشي',        hint: 'Sources and footnotes' },
  { id: 'overview',  en: 'Overview',   ar: 'نظرة عامة',      hint: 'Editor’s introduction' },
];

interface Props {
  tafsir: ReactNode;
  compare: ReactNode;
  citations: ReactNode;
  overview: ReactNode;
  /** Lessons whose apparatus is not yet verified show no Citations tab at all
   *  -- see src/lib/apparatus.ts. Offering the tab and then showing a panel
   *  with three of seventy-five notes in it is the misleading case. */
  hideCitations?: boolean;
  /** True only for the five lessons that actually carry English. */
  hasTranslation?: boolean;
}

interface NoteRow { id: string; num?: number; displayNum?: number; arabic: string }

export default function LessonExperience({ tafsir, compare, citations, overview, hideCitations, hasTranslation }: Props) {
  const [mode, setMode] = useState<LessonMode>('tafsir');
  const modes = hideCitations ? MODES.filter(m => m.id !== 'citations') : MODES;

  // Read the deep link on the client only -- the server has no query string
  // during static generation, and reading it during render would be a
  // hydration mismatch.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('panel');
    // ?panel=citations on a lesson without a verified apparatus falls back to
    // the tafsir rather than selecting a tab that is not rendered.
    if (p && modes.some(m => m.id === p)) setMode(p as LessonMode);
  }, [hideCitations]); // eslint-disable-line react-hooks/exhaustive-deps

  // The compiler's notes are served where they are anchored (AK, 13 Nov 2026).
  // A click on [n] opens the note in a card at the marker, in his Arabic and
  // under his name, and the reader stays in the text. The Citations tab still
  // gathers the lesson's notes in one place; the card links to it.
  //
  // Modified clicks are left alone, and without JS the marker's href opens the
  // Citations panel at the note (see src/lib/textInject.ts).
  const notes = useRef<Map<string, NoteRow> | null>(null);
  const [card, setCard] = useState<{ id: string; top: number; left: number; note?: NoteRow } | null>(null);

  useEffect(() => {
    if (!card) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setCard(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [card]);

  const openFootnote = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as HTMLElement).closest?.('[data-fn]') as HTMLElement | null;
    const id = link?.getAttribute('data-fn');
    if (!link || !id) return;
    e.preventDefault();
    const r = link.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 12));
    const top = r.bottom + window.scrollY + 6;
    const cached = notes.current?.get(id);
    setCard({ id, top, left, note: cached });
    if (notes.current) return;
    const lessonId = Number(id.split('-')[1]);
    if (!Number.isFinite(lessonId)) return;
    fetch(`/api/footnotes?lessonId=${lessonId}`)
      .then(res => res.json())
      .then((d: { compiler?: NoteRow[] }) => {
        notes.current = new Map((d.compiler ?? []).map(n => [n.id, n]));
        setCard(c => (c && c.id === id ? { ...c, note: notes.current!.get(id) } : c));
      })
      .catch(() => { notes.current = new Map(); });
  };

  const showInPanel = (id: string) => {
    setCard(null);
    setMode('citations');
    // The panel fetches its notes, so the target is not in the DOM yet.
    [80, 300, 700, 1200].forEach(delay => {
      setTimeout(() => {
        const el = document.getElementById(`citepanel-${id}`);
        if (!el) return;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.style.transition = 'background-color 0.4s';
        el.style.backgroundColor = 'rgba(201,168,76,0.18)';
        setTimeout(() => { el.style.backgroundColor = ''; }, 1600);
      }, delay);
    });
  };

  const body =
    mode === 'tafsir' ? tafsir :
    mode === 'compare' ? compare :
    mode === 'citations' && !hideCitations ? citations : overview;

  return (
    <div dir="ltr" onClick={openFootnote}>
      {card && typeof document !== 'undefined' && createPortal(
        <>
          <div onClick={() => setCard(null)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} aria-hidden />
          <div role="dialog" aria-label="Compiler's note"
            style={{ position: 'absolute', top: card.top, left: card.left, width: Math.min(420, window.innerWidth - 24), maxHeight: '60vh', zIndex: 61 }}
            className="rounded-xl border border-gold/30 bg-bg shadow-2xl p-3 overflow-y-auto"
            /* A long note scrolls inside the card rather than running off the screen. */
           >
            <div className="flex items-center gap-2 mb-1.5" dir="ltr">
              <span className="font-english text-[11px] text-gold/80">
                Compiler&apos;s note {card.note?.displayNum ?? card.note?.num ?? card.id.split('-')[2]}
              </span>
              <button type="button" onClick={() => setCard(null)} aria-label="Close note"
                className="ml-auto font-english text-xs text-white/50 hover:text-white/80 px-1">✕</button>
            </div>
            {card.note ? (
              <p className="font-arabic text-[14px] leading-7" dir="rtl" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {cleanNoteArabic(card.note.arabic)}
              </p>
            ) : (
              <p className="font-english text-xs italic text-white/40">Loading…</p>
            )}
            <p className="font-english text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }} dir="ltr">
              Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, in the Majmaʿ al-Yamāma printing ·{' '}
              <button type="button" onClick={() => showInPanel(card.id)} className="text-gold/70 hover:text-gold underline">
                all notes on this lesson
              </button>
            </p>
          </div>
        </>,
        document.body
      )}
      {/*
        Two columns on a phone, four across from 640px. A horizontally
        scrolling strip was the alternative and is worse here: with only four
        options, anything off-screen is an option the reader never learns
        exists, and the whole point is that all four are visible at once.
      */}
      <div
        role="tablist"
        aria-label="Choose how to read this lesson"
        className={`grid grid-cols-2 gap-1.5 mb-4 ${hideCitations ? 'sm:grid-cols-3' : 'sm:grid-cols-4'}`}
      >
        {modes.map(m => {
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={on}
              onClick={() => setMode(m.id)}
              className="rounded-lg px-3 py-2.5 text-left transition-colors"
              style={{
                border: '1px solid ' + (on ? 'var(--gold, #C9A84C)' : 'rgba(138,109,31,0.28)'),
                background: on ? 'var(--gold, #C9A84C)' : 'transparent',
                color: on ? '#0D1F0A' : 'var(--body-text, rgba(232,232,224,0.85))',
              }}
            >
              <span className="font-arabic-sans block text-[13px] font-bold leading-tight" dir="rtl" translate="no">
                {m.ar}
              </span>
              <span className="font-english block text-[12.5px] font-semibold leading-tight mt-0.5">
                {m.en}
              </span>
              <span
                className="font-english hidden sm:block text-[10px] leading-tight mt-1"
                style={{ color: on ? 'rgba(13,31,10,0.65)' : 'var(--body-faint, rgba(232,232,224,0.45))' }}
              >
                {m.id === 'tafsir' && hasTranslation ? 'Shaykh Ibrāhīm, with translation' : m.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">{body}</div>
    </div>
  );
}
