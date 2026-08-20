'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookmarks, removeBookmark, type Bookmark } from '@/lib/bookmarks';
import { getClips, removeClip, exportClips, type Clip } from '@/lib/clips';

/**
 * One page for everything a reader has saved.
 *
 * /bookmarks and /clips were 113 lines each and described one action to the
 * reader: "keep this passage". They differed in what came back -- a bookmark
 * kept the lesson's Arabic and English, a clip kept the selected text with a
 * Chicago citation built for it -- but that is a property of the saved item,
 * not a reason to make someone remember which of two pages they used.
 *
 * The two storage keys are deliberately NOT merged. They hold different shapes
 * and they live in readers' browsers, so merging them would silently discard
 * whatever someone had already saved. Both are read here and shown in one list,
 * newest first, each item saying which kind it is.
 */

type Item =
  | { kind: 'clip'; at: number; data: Clip }
  | { kind: 'bookmark'; at: number; data: Bookmark };

export default function SavedPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => {
    const all: Item[] = [
      ...getClips().map(c => ({ kind: 'clip' as const, at: c.timestamp, data: c })),
      ...getBookmarks().map(b => ({ kind: 'bookmark' as const, at: b.timestamp, data: b })),
    ].sort((a, b) => b.at - a.at);
    setItems(all);
  };

  // localStorage is not available during render on the server, and reading it
  // in render would be a hydration mismatch. null means "not read yet", which
  // is why the empty state waits for the first effect.
  useEffect(load, []);

  const drop = (it: Item) => {
    if (it.kind === 'clip') removeClip(it.data.id); else removeBookmark(it.data.id);
    load();
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const exportAll = () => {
    const blob = new Blob([exportClips()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'niassetafsir-saved.txt';
    a.click();
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-8 sm:py-12" dir="ltr">
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <div>
          <h1 className="font-english text-2xl font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
            Saved
          </h1>
          <p className="font-arabic text-base mt-0.5" dir="rtl" style={{ color: 'var(--gold, #C9A84C)' }}>المحفوظات</p>
        </div>
        {items && items.length > 0 && (
          <button onClick={exportAll}
            className="font-english text-sm px-4 py-2.5 rounded-lg border transition-all flex-shrink-0"
            style={{ borderColor: 'rgba(201,168,76,0.3)', color: 'var(--gold, #C9A84C)' }}>
            Export
          </button>
        )}
      </div>

      {items === null ? null : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-english text-base mb-2" style={{ color: 'var(--body-sub, rgba(255,255,255,0.5))' }}>
            Nothing saved yet.
          </p>
          <p className="font-english text-sm mb-7" style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
            Select any passage while reading to keep it, with a citation.
          </p>
          <Link href="/lesson/1"
            className="inline-block font-english text-base px-5 py-3 rounded-lg border transition-all"
            style={{ borderColor: 'rgba(201,168,76,0.3)', color: 'var(--gold, #C9A84C)' }}>
            Start reading
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(it => {
            const id = it.data.id;
            const lessonId = it.data.lessonId;
            const titleAr = it.kind === 'clip' ? it.data.lessonTitleAr : it.data.lessonTitleAr;
            const text = it.kind === 'clip' ? it.data.text : it.data.arabicText;
            const isAr = it.kind === 'clip' ? it.data.language === 'ar' : true;
            return (
              <li key={id} className="rounded-xl border p-4" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-english text-[10px] px-2 py-0.5 rounded uppercase tracking-wide"
                    style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold, #C9A84C)' }}>
                    {it.kind === 'clip' ? 'Clip · cited' : 'Bookmark'}
                  </span>
                  <Link href={`/lesson/${lessonId}`} className="font-arabic text-sm font-bold hover:opacity-80" dir="rtl"
                    style={{ color: 'var(--gold, #C9A84C)' }}>
                    {titleAr}
                  </Link>
                  <button onClick={() => drop(it)} aria-label="Remove"
                    className="ml-auto w-11 h-11 -my-2 -mr-2 flex items-center justify-center rounded-lg text-lg flex-shrink-0"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
                    ✕
                  </button>
                </div>

                <p className={(isAr ? 'font-arabic text-[15px] leading-8' : 'font-english text-sm leading-7') + ' mb-3'}
                  dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--body-text, rgba(255,255,255,0.85))' }}>
                  {text}
                </p>

                {it.kind === 'clip' && (
                  <>
                    <p className="font-english text-xs leading-6 mb-3" style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
                      {it.data.citation}
                    </p>
                    <button onClick={() => copy(`${it.data.text}\n\n${it.data.citation}`, id)}
                      className="font-english text-sm px-4 py-2.5 rounded-lg border transition-all"
                      style={{ borderColor: 'rgba(201,168,76,0.28)', color: 'var(--gold, #C9A84C)' }}>
                      {copied === id ? 'Copied' : 'Copy with citation'}
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
