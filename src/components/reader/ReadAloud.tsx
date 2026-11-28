'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * "Listen to this page": reads the page aloud with the reader's own browser
 * voice (the Web Speech API), so it costs nothing and needs no server.
 *
 * - Reads the English of the current page, passage by passage, and highlights
 *   the passage being read. Arabic-only lessons are read in Arabic when the
 *   device has an Arabic voice; otherwise the button is not shown.
 * - At the end of a page it turns the page and carries on, to the end of the
 *   lesson.
 * - Text goes to the voice in short sentences: Chrome silently stops long
 *   utterances after about fifteen seconds.
 * - Pause is a cancel that remembers the sentence, because pause/resume is
 *   unreliable on Android and Safari. Resume starts that sentence again.
 */

type Props = {
  /** Changes whenever the page on screen changes. */
  pageKey: string;
  /** Turn to the next page. Returns false at the end of the lesson. */
  nextPage: () => boolean;
  /** 'en' for translated lessons, 'ar' for Arabic-only ones. */
  lang: 'en' | 'ar';
};

const RATES = [0.8, 1, 1.2, 1.5];
const RATE_KEY = 'reader-listen-rate';

function pickVoice(lang: 'en' | 'ar'): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(lang));
  if (!all.length) return null;
  const prefer = lang === 'en'
    ? [/natural/i, /google uk english male/i, /google uk english/i, /daniel/i, /google us english/i, /samantha/i, /en-gb/i]
    : [/natural/i, /google/i, /maged|tarik|laila/i];
  for (const re of prefer) {
    const v = all.find(x => re.test(x.name) || re.test(x.lang));
    if (v) return v;
  }
  return all.find(v => v.default) || all[0];
}

// Make the transliterated English speakable: drop macrons and ʿayn/hamza
// marks, read Qur'an references as words, and drop editorial brackets.
function speakable(s: string, lang: 'en' | 'ar'): string {
  if (lang === 'ar') return s.replace(/[﴿﴾«»]/g, ' ').replace(/\s+/g, ' ').trim();
  return s
    .replace(/\(Q\.\s*(\d+):(\d+)\s*[–-]\s*(\d+)\)/g, '(Qurʾān $1, verses $2 to $3)')
    .replace(/\(Q\.\s*(\d+):(\d+)\)/g, '(Qurʾān $1, verse $2)')
    .replace(/\bQ\.\s*(\d+):(\d+)/g, 'Qurʾān $1, verse $2')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[ʿʾʻʼ‘]/g, '')
    .replace(/[[\]«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(s: string): string[] {
  const out: string[] = [];
  for (const part of s.split(/(?<=[.?!؟:;])\s+/)) {
    let p = part.trim();
    while (p.length > 240) {
      const cut = p.lastIndexOf(',', 240) > 80 ? p.lastIndexOf(',', 240) + 1 : p.lastIndexOf(' ', 240);
      out.push(p.slice(0, cut).trim());
      p = p.slice(cut).trim();
    }
    if (p) out.push(p);
  }
  return out;
}

function pageElements(lang: 'en' | 'ar'): HTMLElement[] {
  const sel = lang === 'en' ? '.book-reader .br-en' : '.book-reader .br-ar-main';
  return Array.from(document.querySelectorAll<HTMLElement>(sel));
}

function textOf(el: HTMLElement): string {
  const c = el.cloneNode(true) as HTMLElement;
  c.querySelectorAll('sup, .fn-superscript, .en-footnotes, a[data-fn]').forEach(n => n.remove());
  return c.textContent || '';
}

export default function ReadAloud({ pageKey, nextPage, lang }: Props) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [rate, setRate] = useState(1);
  const pos = useRef({ el: 0, s: 0 });
  const queue = useRef<{ el: HTMLElement; parts: string[] }[]>([]);
  const playing = useRef(false);
  const rateRef = useRef(1);
  const run = useRef(0); // bumps on every stop, so stale callbacks do nothing

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const check = () => setSupported(!!pickVoice(lang));
    check();
    window.speechSynthesis.addEventListener('voiceschanged', check);
    try { const r = Number(localStorage.getItem(RATE_KEY)); if (RATES.includes(r)) { setRate(r); rateRef.current = r; } } catch { /* ignore */ }
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', check);
      window.speechSynthesis.cancel();
    };
  }, [lang]);

  const unmark = () => document.querySelectorAll('.br-speaking').forEach(n => n.classList.remove('br-speaking'));

  const build = () => {
    queue.current = pageElements(lang).map(el => ({ el, parts: sentences(speakable(textOf(el), lang)) })).filter(q => q.parts.length);
  };

  const speakNext = useCallback(() => {
    const my = run.current;
    const synth = window.speechSynthesis;
    const { el, s } = pos.current;
    const item = queue.current[el];
    if (!item) {
      // End of page: turn it and carry on, or stop at the end of the lesson.
      unmark();
      if (nextPage()) { pos.current = { el: 0, s: 0 }; return; } // the pageKey effect resumes
      playing.current = false; setState('idle'); return;
    }
    if (s === 0) {
      unmark();
      item.el.classList.add('br-speaking');
      item.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const u = new SpeechSynthesisUtterance(item.parts[s]);
    const v = pickVoice(lang);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'en' ? 'en-GB' : 'ar';
    u.rate = rateRef.current;
    u.onend = () => {
      if (my !== run.current || !playing.current) return;
      pos.current = s + 1 < item.parts.length ? { el, s: s + 1 } : { el: el + 1, s: 0 };
      speakNext();
    };
    u.onerror = u.onend;
    synth.speak(u);
  }, [lang, nextPage]);

  // A new page while listening: read it from the top.
  useEffect(() => {
    if (!playing.current) return;
    const t = setTimeout(() => { build(); pos.current = { el: 0, s: 0 }; speakNext(); }, 450);
    return () => clearTimeout(t);
  }, [pageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    window.speechSynthesis.cancel();
    run.current++;
    if (state === 'idle') { build(); pos.current = { el: 0, s: 0 }; }
    playing.current = true; setState('playing');
    speakNext();
  };
  const pause = () => {
    run.current++; playing.current = false;
    window.speechSynthesis.cancel(); setState('paused');
  };
  const stop = () => {
    run.current++; playing.current = false;
    window.speechSynthesis.cancel(); unmark(); setState('idle');
  };
  const changeRate = (r: number) => {
    setRate(r); rateRef.current = r;
    try { localStorage.setItem(RATE_KEY, String(r)); } catch { /* ignore */ }
    if (playing.current) { run.current++; window.speechSynthesis.cancel(); playing.current = true; speakNext(); }
  };

  if (!supported) return null;

  return (
    <span className={`br-listen${state !== 'idle' ? ' br-listen-on' : ''}`} role="group" aria-label="Read aloud">
      {state === 'playing' ? (
        <button type="button" onClick={pause} aria-label="Pause reading">❚❚ Pause</button>
      ) : (
        <button type="button" onClick={play} aria-label={state === 'paused' ? 'Resume reading' : 'Listen to this page'}>
          ▶ {state === 'paused' ? 'Resume' : 'Listen'}
        </button>
      )}
      {state !== 'idle' && (
        <>
          <button type="button" onClick={stop} aria-label="Stop reading">■ Stop</button>
          <select value={rate} onChange={e => changeRate(Number(e.target.value))} aria-label="Reading speed">
            {RATES.map(r => <option key={r} value={r}>{r}×</option>)}
          </select>
        </>
      )}
    </span>
  );
}
