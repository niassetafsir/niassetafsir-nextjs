'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReadAloud from './ReadAloud';
import Link from 'next/link';

/**
 * BookReader: the lesson text set like the printed translation and read a page
 * at a time, as on usul.ai. AK, 28 Nov 2026: "less buttons and clicks", "give
 * the reader the choice", collapses wherever possible, and a site that reads
 * like the book.
 *
 * - The text is cut into pages of roughly equal length, never inside a block.
 *   ?page=N addresses a page; ?para= and ?verse= open the page that holds it.
 * - "Show whole lesson" turns paging off (remembered per browser).
 * - Arrow keys and a horizontal swipe turn the page.
 * - In a translated lesson the Arabic of each passage sits folded under its
 *   English; one setting opens them all.
 * - One quiet menu per passage: copy, cite, share.
 */

export interface ReaderBlock {
  /** Arabic paragraph indices, for anchors (#ar-para-N) and ?para= links. */
  arIdx: number[];
  /** Arabic paragraphs, already marked up on the server. Empty when withheld. */
  ar: string[];
  /** English paragraphs, already marked up on the server. Empty when none. */
  en: string[];
}

interface Props {
  lessonId: number;
  blocks: ReaderBlock[];
  /** True when the lesson has an English translation. */
  translated: boolean;
  /** paraIndex for each of the lesson's own verses, for ?verse= links. */
  verseParas: Record<string, number>;
  prevId?: number | null;
  nextId?: number | null;
  /** Shown above the text on every page of a translated lesson. */
  draftNotice?: boolean;
}

const WORDS_PER_PAGE = 1400;
const AR_CHARS_PER_PAGE = 8000;

function weight(b: ReaderBlock, translated: boolean): number {
  if (translated && b.en.length) return b.en.join(' ').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const ar = b.ar.join(' ').replace(/<[^>]+>/g, '').length;
  return translated ? ar / 6 : ar;
}

function paginate(blocks: ReaderBlock[], translated: boolean): number[][] {
  const limit = translated ? WORDS_PER_PAGE : AR_CHARS_PER_PAGE;
  const pages: number[][] = [];
  let cur: number[] = [];
  let w = 0;
  blocks.forEach((b, i) => {
    const bw = weight(b, translated);
    if (cur.length && w + bw > limit * 1.15) { pages.push(cur); cur = []; w = 0; }
    cur.push(i); w += bw;
  });
  if (cur.length) pages.push(cur);
  return pages;
}

function plain(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, '');
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
}

function PassageMenu({ lessonId, n, text }: { lessonId: number; n: number; text: string }) {
  const [done, setDone] = useState<string | null>(null);
  const url = () => `${window.location.origin}/lesson/${lessonId}?para=${n}`;
  const copy = async (s: string, label: string) => {
    try { await navigator.clipboard.writeText(s); setDone(label); } catch { setDone('Could not copy'); }
    setTimeout(() => setDone(null), 1800);
  };
  return (
    <details className="br-menu">
      <summary aria-label={`Options for passage ${n + 1}`}>⋯</summary>
      <div className="br-menu-pop" role="menu">
        <button type="button" role="menuitem" onClick={() => copy(text, 'Copied')}>Copy text</button>
        <button type="button" role="menuitem" onClick={() => copy(
          `Shaykh Ibrāhīm Niasse, Fī Riyāḍ al-Tafsīr, Lesson ${lessonId}, ¶${n + 1}, trans. Amadu Kunateh, ${url()}`, 'Citation copied')}>Cite</button>
        <button type="button" role="menuitem" onClick={async () => {
          const u = url();
          if (navigator.share) { try { await navigator.share({ url: u }); return; } catch { /* fall through */ } }
          copy(u, 'Link copied');
        }}>Share link</button>
        {done && <span className="br-menu-done" aria-live="polite">{done}</span>}
      </div>
    </details>
  );
}

export default function BookReader({ lessonId, blocks, translated, verseParas, prevId, nextId, draftNotice }: Props) {
  const pages = useMemo(() => paginate(blocks, translated), [blocks, translated]);
  const pageOfBlock = useMemo(() => {
    const m = new Map<number, number>();
    pages.forEach((pg, p) => pg.forEach(bi => m.set(bi, p)));
    return m;
  }, [pages]);
  const blockOfPara = useMemo(() => {
    const m = new Map<number, number>();
    blocks.forEach((b, bi) => b.arIdx.forEach(a => m.set(a, bi)));
    return m;
  }, [blocks]);
  // Plain, diacritic-free text of each block, for "Search this lesson".
  const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
  const searchText = useMemo(() => blocks.map(b => norm([...b.en, ...b.ar].join(' ').replace(/<[^>]+>/g, ' '))), [blocks]); // eslint-disable-line react-hooks/exhaustive-deps
  const lastSearch = useRef<{ q: string; i: number }>({ q: '', i: -1 });

  const [page, setPage] = useState(0);
  const [whole, setWhole] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // Settings and deep links, on the client only (static pages have no query).
  useEffect(() => {
    try {
      setWhole(localStorage.getItem('reader-whole') === '1');
      setArOpen(localStorage.getItem('reader-ar-open') === '1');
    } catch { /* storage unavailable */ }
    const q = new URLSearchParams(window.location.search);
    let para: number | null = null;
    if (q.get('para') !== null) para = Number(q.get('para'));
    else if (q.get('verse') && verseParas[q.get('verse') as string] !== undefined) para = verseParas[q.get('verse') as string];
    if (para !== null && blockOfPara.has(para)) {
      const bi = blockOfPara.get(para) as number;
      setPage(pageOfBlock.get(bi) as number);
      setTarget(bi);
    } else if (q.get('page')) {
      const p = Number(q.get('page')) - 1;
      if (p >= 0 && p < pages.length) setPage(p);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (target === null) return;
    const t = setTimeout(() => document.getElementById(`blk-${target}`)?.scrollIntoView({ block: 'center' }), 200);
    return () => clearTimeout(t);
  }, [target, page, whole]);

  const go = (p: number) => {
    if (p < 0 || p >= pages.length) return;
    setPage(p);
    setTarget(null);
    const u = new URL(window.location.href);
    u.searchParams.set('page', String(p + 1));
    u.searchParams.delete('para'); u.searchParams.delete('verse');
    window.history.replaceState(null, '', u.toString());
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  // "Search this lesson", sent from the side panel. Each Enter goes to the next
  // passage that contains the words, on whatever page it is.
  useEffect(() => {
    const on = (e: Event) => {
      const q = norm(((e as CustomEvent<string>).detail || '').trim());
      if (!q) return;
      const hits = searchText.map((t, i) => (t.includes(q) ? i : -1)).filter(i => i >= 0);
      if (!hits.length) { window.dispatchEvent(new CustomEvent('reader-search-result', { detail: { i: 0, n: 0 } })); return; }
      const k = lastSearch.current.q === q ? (lastSearch.current.i + 1) % hits.length : 0;
      lastSearch.current = { q, i: k };
      const bi = hits[k];
      setPage(pageOfBlock.get(bi) as number);
      setTarget(bi);
      window.dispatchEvent(new CustomEvent('reader-search-result', { detail: { i: k + 1, n: hits.length } }));
    };
    window.addEventListener('reader-search', on);
    return () => window.removeEventListener('reader-search', on);
  }, [searchText, pageOfBlock]); // eslint-disable-line react-hooks/exhaustive-deps

  // Arrow keys and swipe turn the page.
  useEffect(() => {
    if (whole) return;
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') go(page + 1);
      if (e.key === 'ArrowLeft') go(page - 1);
    };
    let x0: number | null = null, y0 = 0;
    const ts = (e: TouchEvent) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 80 && Math.abs(dx) > 2 * Math.abs(dy)) go(page + (dx < 0 ? 1 : -1));
    };
    window.addEventListener('keydown', key);
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchend', te, { passive: true });
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te); };
  }); // re-bound each render so `page` is current

  // For read-aloud: turn the page from a speech callback, using refs so the
  // callback never sees a stale page number.
  const pageRef = useRef(0); pageRef.current = page;
  const wholeRef = useRef(false); wholeRef.current = whole;
  const goRef = useRef(go); goRef.current = go;
  const nextPageRef = useRef(() => {
    if (wholeRef.current || pageRef.current >= pagesLenRef.current - 1) return false;
    goRef.current(pageRef.current + 1);
    return true;
  });
  const pagesLenRef = useRef(0); pagesLenRef.current = pages.length;

  const toggleWhole = () => {
    const v = !whole; setWhole(v);
    try { localStorage.setItem('reader-whole', v ? '1' : '0'); } catch { /* ignore */ }
  };
  const toggleAr = () => {
    const v = !arOpen; setArOpen(v);
    try { localStorage.setItem('reader-ar-open', v ? '1' : '0'); } catch { /* ignore */ }
  };

  const shown = whole ? blocks.map((_, i) => i) : (pages[page] || []);
  const last = whole || page === pages.length - 1;
  const progress = whole ? 100 : Math.round(((page + 1) / pages.length) * 100);
  const hasArabic = blocks.some(b => b.ar.length);

  return (
    <div className="book-reader" ref={top}>
      <div className="br-progress" aria-hidden="true"><div style={{ width: `${progress}%` }} /></div>

      <div className="br-bar" dir="ltr">
        <span>{whole ? 'Whole lesson' : `Page ${page + 1} of ${pages.length}`}</span>
        <span className="br-bar-actions">
          <ReadAloud pageKey={`${page}-${whole}`} nextPage={nextPageRef.current} lang={translated ? 'en' : 'ar'} />
          {translated && hasArabic && (
            <button type="button" onClick={toggleAr}>{arOpen ? 'Fold the Arabic' : 'Open all Arabic'}</button>
          )}
          {pages.length > 1 && (
            <button type="button" onClick={toggleWhole}>{whole ? 'Read page by page' : 'Show whole lesson'}</button>
          )}
        </span>
      </div>

      {draftNotice && <p className="br-draft" dir="ltr">Draft translation</p>}

      {shown.map(bi => {
        const b = blocks[bi];
        const n = b.arIdx[0] ?? bi;
        const enText = b.en.map(plain).join('\n\n');
        return (
          <article key={bi} id={`blk-${bi}`} className={`br-passage${target === bi ? ' br-target' : ''}`}>
            <div className="br-side" dir="ltr">
              <span className="br-num">¶ {n + 1}</span>
              <PassageMenu lessonId={lessonId} n={n} text={enText || b.ar.map(plain).join('\n\n')} />
            </div>
            <div className="br-text">
              {b.arIdx.map(a => <span key={a} id={`ar-para-${a}`} className="br-anchor" />)}
              {translated && b.en.length > 0 ? (
                <>
                  {b.en.map((h, i) => <div key={i} dir="ltr" className="br-en" dangerouslySetInnerHTML={{ __html: h }} />)}
                  {b.ar.length > 0 && (
                    <details className="br-ar-fold" open={arOpen || undefined} key={arOpen ? 'o' : 'c'}>
                      <summary dir="ltr">Arabic of this passage</summary>
                      {b.ar.map((h, i) => <div key={i} dir="rtl" lang="ar" translate="no" className="br-ar" dangerouslySetInnerHTML={{ __html: h }} />)}
                    </details>
                  )}
                </>
              ) : (
                b.ar.map((h, i) => <div key={i} dir="rtl" lang="ar" translate="no" className="br-ar br-ar-main" dangerouslySetInnerHTML={{ __html: h }} />)
              )}
            </div>
          </article>
        );
      })}

      <nav className="br-pager" aria-label="Pages" dir="ltr">
        {whole || page === 0 ? (
          prevId ? <Link href={`/lesson/${prevId}`} className="br-btn">← Lesson {prevId}</Link> : <span />
        ) : (
          <button type="button" className="br-btn" onClick={() => go(page - 1)}>← Previous page</button>
        )}
        {!whole && pages.length > 1 && <span className="br-hint">Arrow keys or swipe to turn</span>}
        {last ? (
          nextId ? <Link href={`/lesson/${nextId}`} className="br-btn br-btn-main">Lesson {nextId} →</Link> : <span />
        ) : (
          <button type="button" className="br-btn br-btn-main" onClick={() => go(page + 1)}>Next page →</button>
        )}
      </nav>
    </div>
  );
}
