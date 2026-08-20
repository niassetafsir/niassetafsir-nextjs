'use client';
import { useState, useEffect, type ReactNode } from 'react';

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

const MODES: { id: LessonMode; en: string; ar: string; hint: string }[] = [
  { id: 'tafsir',    en: 'Tafsīr',     ar: 'التفسير',        hint: 'Shaykh Ibrāhīm, with translation' },
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
}

export default function LessonExperience({ tafsir, compare, citations, overview, hideCitations }: Props) {
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

  // Inline footnote markers were plain links to /footnotes#id, so clicking [1]
  // mid-sentence navigated the reader out of the lesson -- while the Citations
  // panel, one tab away on this same page, was already rendering that exact
  // footnote with id="citepanel-{id}". The target existed; nothing pointed at
  // it.
  //
  // Delegated here rather than in BilingualText because the markers are
  // injected as HTML strings in several places and this component wraps all of
  // them. Modified clicks are left alone -- cmd, ctrl, shift and middle-click
  // should still open the apparatus in a tab -- and with JS off the href
  // behaves exactly as before.
  const openFootnote = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as HTMLElement).closest?.('[data-fn]');
    const id = link?.getAttribute('data-fn');
    if (!id) return;
    e.preventDefault();
    setMode('citations');
    // The panel fetches its footnotes, so the target is not in the DOM yet.
    // Re-assert rather than firing once -- the same approach the verse
    // deep-link in BilingualText uses, for the same reason.
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
              <span className="font-arabic-sans block text-[13px] font-bold leading-tight" dir="rtl">
                {m.ar}
              </span>
              <span className="font-english block text-[12.5px] font-semibold leading-tight mt-0.5">
                {m.en}
              </span>
              <span
                className="font-english hidden sm:block text-[10px] leading-tight mt-1"
                style={{ color: on ? 'rgba(13,31,10,0.65)' : 'var(--body-faint, rgba(232,232,224,0.45))' }}
              >
                {m.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">{body}</div>
    </div>
  );
}
