'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { EditorNote } from '@/lib/editorNotes';

/**
 * Two apparatuses in one panel, never merged.
 *
 * The compiler's notes are documentary -- where a ḥadīth comes from, in which
 * collection, at which number. The editor's are interpretive -- what debate
 * Niasse is entering, whom he is answering. A reader has to be able to tell at
 * a glance which of the two he is reading, and whose judgement he is being
 * asked to accept, so the editor's notes take the gold rule and carry their
 * author's name on every one. See src/lib/editorNotes.ts.
 */

interface Footnote {
  id: string;
  lessonId: number;
  num: number;
  displayNum?: number;
  arabic: string;
  scholar: string | null;
  work: string | null;
  sourceType: string;
  genre: string;
  enTranslation: string | null;
  volRef?: string;
  voice?: 'compiler';
}

const EDITOR = 'Amadu Kunateh';

const INTERVENTION_LABEL: Record<string, string> = {
  debate: 'Debate',
  response: 'Response',
  doctrine: 'Doctrine',
  source: 'Source identified',
  divergence: 'Divergence',
  context: 'Context',
  terminology: 'Terminology',
};

export default function LessonCitations({ lessonId }: { lessonId: number }) {
  const [compiler, setCompiler] = useState<Footnote[] | null>(null);
  const [editor, setEditor] = useState<EditorNote[]>([]);

  useEffect(() => {
    // Scoped to this lesson server-side, instead of downloading the full
    // ~2000-entry corpus on every panel open just to filter it client-side --
    // see src/app/api/footnotes/route.ts.
    fetch(`/api/footnotes?lessonId=${lessonId}`)
      .then(r => r.json())
      .then((d: { compiler: Footnote[]; editor: EditorNote[] }) => {
        setCompiler(d.compiler ?? []);
        setEditor(d.editor ?? []);
      })
      .catch(() => { setCompiler([]); setEditor([]); });
  }, [lessonId]);

  if (compiler === null) {
    return (
      <div className="p-5 text-center">
        <p className="font-english text-white/25 text-xs italic animate-pulse">Loading citations…</p>
      </div>
    );
  }

  if (compiler.length === 0 && editor.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="font-english text-white/25 text-xs italic">
          No compiler footnotes have been indexed for this lesson yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3" dir="ltr">

      {editor.length > 0 && (
        <section className="mb-6">
          <h3 className="font-english text-[11px] uppercase tracking-wider text-gold/70 mb-1">
            Editor&apos;s notes
          </h3>
          <p className="font-english text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {editor.length} note{editor.length !== 1 ? 's' : ''} by {EDITOR}, placing this lesson&apos;s
            argument in the tradition it addresses. Not in the printed edition.
          </p>
          <div className="space-y-2">
            {editor.map(n => (
              <div key={n.id} id={`editornote-${n.id}`}
                className="rounded-lg p-2.5 border-l-2"
                style={{ borderColor: 'rgba(201,168,76,0.55)', background: 'rgba(201,168,76,0.05)' }}>
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="font-english text-[10px] text-gold/70 border border-gold/25 px-1.5 py-0.5 rounded">
                    {INTERVENTION_LABEL[n.intervention] ?? n.intervention}
                  </span>
                  <span className="font-english text-[10px] italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {EDITOR}
                  </span>
                </div>
                {n.anchorText && (
                  <p className="font-arabic text-[12.5px] leading-6 mb-1.5" dir="rtl"
                    style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {n.anchorText}
                  </p>
                )}
                <p className="font-english text-[12.5px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {n.en}
                </p>
                {n.ar && (
                  <p className="font-arabic text-[13px] leading-6 mt-1.5" dir="rtl"
                    style={{ color: 'rgba(255,255,255,0.72)' }}>
                    {n.ar}
                  </p>
                )}
                {n.refs && n.refs.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {n.refs.map((r, i) => (
                      <li key={i} className="font-english text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        <span className="italic">{r.work}</span>
                        {r.cite && <span>, {r.cite}</span>}
                        {r.note && <span style={{ opacity: 0.75 }}> — {r.note}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {compiler.length > 0 && (
        <section>
          {editor.length > 0 && (
            <h3 className="font-english text-[11px] uppercase tracking-wider mb-1"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Compiler&apos;s apparatus
            </h3>
          )}
          <p className="font-english text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {compiler.length} footnote{compiler.length !== 1 ? 's' : ''} compiled by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī for this lesson —
            numbered as in the physical edition (numbers restart on each printed page).{' '}
            <Link href={`/footnotes?mode=lesson&lesson=${lessonId}`} className="text-gold/70 hover:text-gold underline">
              Open full Critical Apparatus view ↗
            </Link>
          </p>
          <div className="space-y-2">
            {compiler.map(fn => (
              <div key={fn.id} id={`citepanel-${fn.id}`} className="border border-white/10 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="font-english text-[10px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded">
                    fn. {fn.displayNum ?? fn.num}
                  </span>
                  {fn.scholar && (
                    <span className="font-english text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{fn.scholar}</span>
                  )}
                  {fn.work && (
                    <span className="font-english text-[11px] italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{fn.work}</span>
                  )}
                  {fn.volRef && (
                    <span className="font-english text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{fn.volRef}</span>
                  )}
                  <a href={`/footnotes#${fn.id}`} className="font-english text-[10px] text-gold/50 hover:text-gold ml-auto">
                    View in apparatus →
                  </a>
                </div>
                <p className="font-arabic text-[13px] leading-6" dir="rtl" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {fn.arabic}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
