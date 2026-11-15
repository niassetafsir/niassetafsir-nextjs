'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Ask the Tafsīr, in his words: the answer to a question, made only of his
 * text (and, labelled, the Jalālayn he reads out, the editor, or a student).
 * Fetched after the page loads, so the search results never wait for it.
 * See src/lib/askTafsir.ts.
 */

type Voice = 'niasse' | 'jalalayn' | 'editor' | 'student' | 'reported';
interface Quote { ar: string; voice: Voice; en?: string; source: string; where: string; href: string }
interface Answer { available: boolean; limited?: boolean; error?: string; none: boolean; quotes: Quote[] }

const FAINT = 'var(--body-faint, rgba(232,232,224,0.45))';
const SUB = 'var(--body-sub, rgba(232,232,224,0.70))';
const TEXT = 'var(--body-text, rgba(232,232,224,0.90))';
const GOLD = 'var(--gold, #C9A84C)';
const LINE = 'rgba(138,109,31,0.22)';

const VOICE: Record<Voice, string> = {
  niasse: 'Shaykh Ibrāhīm',
  jalalayn: 'The Jalālayn, as he reads it out',
  editor: 'The editor’s note',
  student: 'His student',
  reported: 'His words, as his student reports them',
};

export default function AskPanel({ q }: { q: string }) {
  const [a, setA] = useState<Answer | null>(null);

  useEffect(() => {
    let live = true;
    setA(null);
    fetch(`/api/ask?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(j => { if (live) setA(j as Answer); })
      .catch(() => { if (live) setA({ available: true, none: false, error: 'network', quotes: [] }); });
    return () => { live = false; };
  }, [q]);

  if (a && !a.available) return null;

  return (
    <section className="mt-8 rounded-xl border px-5 py-5" style={{ borderColor: 'rgba(138,109,31,0.4)', background: 'rgba(138,109,31,0.06)' }}
      aria-live="polite">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="font-english text-lg font-semibold" style={{ color: TEXT }}>Ask the Tafsīr</h2>
        <span className="font-arabic text-lg" dir="rtl" style={{ color: GOLD }}>اسأل التفسير</span>
      </div>
      <p className="font-english text-[13px] mb-4" style={{ color: FAINT }}>
        The answer in his own words: passages chosen from his text, each checked against it and linked to where it stands.
      </p>

      {!a && <p className="font-english text-sm" style={{ color: SUB }}>Finding his words…</p>}
      {a?.limited && <p className="font-english text-sm" style={{ color: SUB }}>Too many questions for now. Please try again in an hour; the passages below are still here.</p>}
      {a && !a.limited && a.error && <p className="font-english text-sm" style={{ color: SUB }}>This could not be answered just now. The passages below are still here.</p>}
      {a && !a.limited && !a.error && a.none && (
        <p className="font-english text-sm" style={{ color: SUB }}>He does not take this up in the texts on this site.</p>
      )}

      {a && a.quotes.length > 0 && (
        <ol className="space-y-5">
          {a.quotes.map((x, i) => (
            <li key={i}>
              <p className="font-english text-[12.5px] mb-1" style={{ color: FAINT }}>
                <span className="font-semibold" style={{ color: x.voice === 'niasse' ? GOLD : SUB }}>{VOICE[x.voice]}</span>
                {' · '}{x.source}{x.where ? ` · ${x.where}` : ''}
              </p>
              <blockquote className="font-arabic text-[18px] leading-[2.05] border-r-2 pr-3" dir="rtl" lang="ar"
                style={{ color: TEXT, borderColor: x.voice === 'niasse' ? GOLD : LINE }}>
                «{x.ar}»
              </blockquote>
              {x.en && (
                <details className="mt-1">
                  <summary className="font-english text-[12.5px] cursor-pointer" style={{ color: SUB }}>
                    English of this paragraph (draft translation)
                  </summary>
                  <p className="font-english text-[14px] leading-relaxed mt-1" style={{ color: SUB }}>{x.en}</p>
                </details>
              )}
              <Link href={x.href} className="inline-block font-english text-[13px] font-medium mt-1 py-1 transition-opacity hover:opacity-75" style={{ color: GOLD }}>
                Read it in place →
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
