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

// ---- Text preparation, keeping a map back to the page ----
// Each spoken character remembers which characters of the page it came from,
// so the word being spoken can be highlighted where it sits on the page.

type Ch = { c: string; a: number; b: number }; // a..b = span in the page text
type Part = { text: string; map: Ch[] };       // one sentence, as spoken
type Item = { el: HTMLElement; nodes: { node: Text; start: number }[]; parts: Part[] };

const SKIP = 'sup, .fn-superscript, .en-footnotes, a[data-fn]';

function textNodes(el: HTMLElement) {
  const nodes: { node: Text; start: number }[] = [];
  let raw = '';
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: n => ((n.parentElement?.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    nodes.push({ node: n as Text, start: raw.length });
    raw += (n as Text).data;
  }
  return { nodes, raw };
}

function replaceAll(chs: Ch[], re: RegExp, rep: (m: RegExpExecArray) => string): Ch[] {
  const str = chs.map(x => x.c).join('');
  const out: Ch[] = []; let last = 0; let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(str))) {
    out.push(...chs.slice(last, m.index));
    const a = chs[m.index].a, b = chs[m.index + m[0].length - 1].b;
    for (const c of rep(m)) out.push({ c, a, b });
    last = m.index + m[0].length;
    if (!m[0].length) re.lastIndex++;
  }
  out.push(...chs.slice(last));
  return out;
}

function prepare(raw: string, lang: 'en' | 'ar'): Ch[] {
  let chs: Ch[] = [];
  // Footnote numbers like [1] stay on the page but are not read out.
  const skip = new Set<number>();
  const fnRe = /\[\d+\]/g; let fm: RegExpExecArray | null;
  while ((fm = fnRe.exec(raw))) for (let k = 0; k < fm[0].length; k++) skip.add(fm.index + k);
  for (let i = 0; i < raw.length; i++) {
    if (skip.has(i)) continue;
    const ch = raw[i];
    if (lang === 'en') {
      if (/[ʿʾʻʼ‘\[\]«»]/.test(ch)) continue;
      for (const c of ch.normalize('NFD').replace(/[̀-ͯ]/g, '')) chs.push({ c, a: i, b: i + 1 });
    } else {
      chs.push({ c: /[﴿﴾«»]/.test(ch) ? ' ' : ch, a: i, b: i + 1 });
    }
  }
  if (lang === 'en') {
    chs = replaceAll(chs, /\(Q\.\s*(\d+):(\d+)\s*[–-]\s*(\d+)\)/g, m => `(Quran ${m[1]}, verses ${m[2]} to ${m[3]})`);
    chs = replaceAll(chs, /\(Q\.\s*(\d+):(\d+)\)/g, m => `(Quran ${m[1]}, verse ${m[2]})`);
    chs = replaceAll(chs, /\bQ\.\s*(\d+):(\d+)/g, m => `Quran ${m[1]}, verse ${m[2]}`);
  }
  // collapse whitespace
  const out: Ch[] = [];
  for (const x of chs) {
    const sp = /\s/.test(x.c);
    if (sp && (!out.length || out[out.length - 1].c === ' ')) continue;
    out.push(sp ? { ...x, c: ' ' } : x);
  }
  while (out.length && out[out.length - 1].c === ' ') out.pop();
  return out;
}

function sentences(chs: Ch[]): Part[] {
  const str = chs.map(x => x.c).join('');
  const parts: Part[] = [];
  const push = (a: number, b: number) => {
    while (a < b && str[a] === ' ') a++;
    while (b > a && str[b - 1] === ' ') b--;
    if (b > a) parts.push({ text: str.slice(a, b), map: chs.slice(a, b) });
  };
  let start = 0;
  const re = /[.?!؟:;](?=\s)/g; let m: RegExpExecArray | null;
  const cut = (end: number) => {
    let a = start;
    while (end - a > 240) {
      const seg = str.slice(a, a + 240);
      const c = seg.lastIndexOf(',') > 80 ? seg.lastIndexOf(',') + 1 : seg.lastIndexOf(' ') > 0 ? seg.lastIndexOf(' ') : 240;
      push(a, a + c); a += c;
    }
    push(a, end); start = end;
  };
  while ((m = re.exec(str))) cut(m.index + 1);
  cut(str.length);
  return parts;
}

function rangeFor(item: Item, a: number, b: number): Range | null {
  const at = (i: number) => {
    let k = item.nodes.length - 1;
    while (k > 0 && item.nodes[k].start > i) k--;
    const n = item.nodes[k];
    return { node: n.node, off: Math.max(0, Math.min(n.node.data.length, i - n.start)) };
  };
  try {
    const s = at(a), e = at(b);
    const r = document.createRange();
    r.setStart(s.node, s.off); r.setEnd(e.node, e.off);
    return r;
  } catch { return null; }
}

// CSS Custom Highlight API: marks words without touching the page's markup.
// Browsers without it still get the passage highlight.
type HL = { set: (k: string, h: unknown) => void; delete: (k: string) => void };
function highlights(): HL | null {
  const c = (globalThis as unknown as { CSS?: { highlights?: HL } }).CSS;
  return c?.highlights && typeof (globalThis as unknown as { Highlight?: unknown }).Highlight === 'function' ? c.highlights : null;
}
function mark(name: string, r: Range | null) {
  const h = highlights(); if (!h) return;
  if (!r) { h.delete(name); return; }
  const H = (globalThis as unknown as { Highlight: new (r: Range) => unknown }).Highlight;
  h.set(name, new H(r));
}

function pageElements(lang: 'en' | 'ar'): HTMLElement[] {
  const sel = lang === 'en' ? '.book-reader .br-en' : '.book-reader .br-ar-main';
  return Array.from(document.querySelectorAll<HTMLElement>(sel));
}

export default function ReadAloud({ pageKey, nextPage, lang }: Props) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [rate, setRate] = useState(1);
  const pos = useRef({ el: 0, s: 0 });
  const queue = useRef<Item[]>([]);
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

  const unmark = () => { document.querySelectorAll('.br-speaking').forEach(n => n.classList.remove('br-speaking')); mark('br-word', null); mark('br-sent', null); };

  const build = () => {
    queue.current = pageElements(lang).map(el => { const { nodes, raw } = textNodes(el); return { el, nodes, parts: sentences(prepare(raw, lang)) }; }).filter(q => q.parts.length);
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
    const part = item.parts[s];
    const span = (i: number, j: number) => {
      const a = part.map[Math.max(0, Math.min(part.map.length - 1, i))].a;
      const b = part.map[Math.max(0, Math.min(part.map.length - 1, j - 1))].b;
      return rangeFor(item, a, b);
    };
    mark('br-word', null);
    mark('br-sent', span(0, part.map.length));
    const u = new SpeechSynthesisUtterance(part.text);
    u.onboundary = (ev: SpeechSynthesisEvent) => {
      if (my !== run.current || ev.name !== 'word') return;
      const i = ev.charIndex;
      let j = ev.charLength ? i + ev.charLength : i;
      if (!ev.charLength) while (j < part.text.length && !/[\s,.;:?!—]/.test(part.text[j])) j++;
      if (j > i) mark('br-word', span(i, j));
    };
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
