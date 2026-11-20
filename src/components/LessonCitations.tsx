'use client';
import { cleanNoteArabic } from '@/lib/noteText';
import { useState, useEffect } from 'react';
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

/**
 * The offline demo has no server to answer a query string, so it reads the
 * same payload from a file written by scripts/build-offline-api.js. Set at
 * build time by scripts/build-offline-demo.sh; unset everywhere else, so the
 * live site is untouched.
 */
const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE === '1';
const source = (lessonId: number) =>
  OFFLINE ? `/data/offline/footnotes-${lessonId}.json` : `/api/footnotes?lessonId=${lessonId}`;

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
    fetch(source(lessonId))
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

      </div>
    );
  }

  return (
    <div className="p-3" dir="ltr">


      {compiler.length > 0 && (
        <section>
          <p className="font-english text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {compiler.length} footnote{compiler.length !== 1 ? 's' : ''} compiled by Muḥammad b. al-Shaykh ʿAbd Allāh al-Tijānī for this lesson —
            numbered continuously through the lesson.
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
                </div>
                <p className="font-arabic text-[13px] leading-6" dir="rtl" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {cleanNoteArabic(fn.arabic)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
