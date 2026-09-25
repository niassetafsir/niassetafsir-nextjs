'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * "Suggest a reading" on any marked Qur'anic citation.
 *
 * The marks are injected into the Arabic as raw HTML (see
 * src/lib/textInject.ts), because the paragraph is set with
 * dangerouslySetInnerHTML and a React element cannot be put inside one. So this
 * listens at the document instead of rendering a button per citation: one
 * listener for all ~8,500 marks, the same delegation LessonExperience already
 * uses for data-fn footnote links. Each mark carries data-cite -- the
 * (lesson, paragraph, span) triple the whole apparatus is keyed on -- so a
 * click knows exactly which citation it is about.
 *
 * Readers suggest; the editor decides. The form says so, because a reader who
 * thinks they are editing scripture directly would be owed that correction
 * before they typed, not after.
 */

const EDITOR_EMAIL = 'niassetafsirproject@gmail.com';

interface Target {
  cite: string;
  verse: string | null;
  status: string | null;
}

const STATE_SAYS: Record<string, string> = {
  collated: 'This reading has been collated against the muṣḥaf and agrees.',
  diverges: 'The āya is identified, and the printing reads otherwise. Unsettled.',
  unplaced: 'The scan has damaged this past the point where the āya can be identified.',
};

export default function CitationFeedback() {
  const [target, setTarget] = useState<Target | null>(null);
  const [reading, setReading] = useState('');
  const [evidence, setEvidence] = useState('');
  const [name, setName] = useState('');
  const [honey, setHoney] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<number | null | 'sent'>(null);
  const [error, setError] = useState<string | null>(null);
  // null = not asked yet. GET /api/suggest reports whether this deployment can
  // record a suggestion; asking once, when the dialog opens, lets the form offer
  // email as its ORDINARY path rather than as the apology after a failure.
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const firstField = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const open = (el: HTMLElement) => {
      const cite = el.getAttribute('data-cite');
      if (!cite) return;
      setTarget({
        cite,
        verse: el.getAttribute('data-verse'),
        status: el.getAttribute('data-status'),
      });
      setReading(''); setEvidence(''); setName(''); setHoney('');
      setDone(null); setError(null);
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('sup.cite-status[data-cite]');
      if (el) { e.preventDefault(); open(el as HTMLElement); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = (e.target as HTMLElement | null)?.closest?.('sup.cite-status[data-cite]');
      if (el) { e.preventDefault(); open(el as HTMLElement); }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!target || canPost !== null) return;
    fetch('/api/suggest')
      .then(r => r.json())
      .then(d => setCanPost(Boolean(d?.configured)))
      .catch(() => setCanPost(false));
  }, [target, canPost]);

  useEffect(() => {
    if (!target) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setTarget(null); };
    document.addEventListener('keydown', onEsc);
    firstField.current?.focus();
    return () => document.removeEventListener('keydown', onEsc);
  }, [target]);

  if (!target) return null;

  const submit = async () => {
    setSending(true); setError(null);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, reading, evidence, name, website: honey }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(data.number ?? 'sent');
      else setError(data.error || 'Could not send that just now.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSending(false);
    }
  };

  const mailto = `mailto:${EDITOR_EMAIL}?subject=${encodeURIComponent(
    `Reading: ${target.cite}${target.verse ? ` (Q ${target.verse})` : ''}`
  )}&body=${encodeURIComponent(
    `Citation: ${target.cite}\n${target.verse ? `Āya: Q ${target.verse}\n` : ''}\nSuggested reading:\n${reading}\n\nEvidence:\n${evidence}\n`
  )}`;

  const field = 'w-full rounded-lg px-3 py-2 font-english text-[13px] leading-6';
  const fieldStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(138,109,31,0.3)',
    color: 'inherit',
  } as const;

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Suggest a reading"
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) setTarget(null); }}
    >
      <div
        dir="ltr"
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5"
        style={{ background: 'var(--panel-bg, #12180f)', border: '1px solid rgba(138,109,31,0.35)' }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-english text-[15px] font-semibold" style={{ color: 'var(--gold, #C9A84C)' }}>
            Suggest a reading
          </h2>
          <button onClick={() => setTarget(null)} aria-label="Close"
            className="tap font-english text-lg leading-none opacity-50 hover:opacity-90">×</button>
        </div>

        <p className="font-english text-[12px] leading-5 mb-1 opacity-70">
          {target.verse ? <>Q {target.verse} · </> : null}Lesson {target.cite.split(':')[0]}
          <span className="opacity-50"> · {target.cite}</span>
        </p>
        {target.status && STATE_SAYS[target.status] && (
          <p className="font-english text-[12px] leading-5 mb-4 opacity-60">{STATE_SAYS[target.status]}</p>
        )}

        {done !== null ? (
          <div>
            <p className="font-english text-[13px] leading-6 mb-4">
              {canPost === false ? (
                <>Thank you — your mail programme should now be open with the suggestion in it.
                  Send it and the editor will weigh it by hand.</>
              ) : (
                <>Thank you — recorded{typeof done === 'number' ? <> as suggestion #{done}</> : null}. The
                  editor reviews each one by hand.</>
              )}{' '}Nothing changes in the text until he accepts it.
            </p>
            <button onClick={() => setTarget(null)}
              className="tap font-english text-[13px] px-4 py-2 rounded-lg font-semibold"
              style={{ background: 'var(--gold, #C9A84C)', color: '#12180f' }}>Close</button>
          </div>
        ) : (
          <>
            <label className="block font-english text-[12px] mb-1 opacity-80">What should this read?</label>
            <textarea ref={firstField} value={reading} onChange={e => setReading(e.target.value)}
              rows={2} dir="rtl" maxLength={500} className={`${field} mb-3 font-arabic text-[15px]`} style={fieldStyle} />

            <label className="block font-english text-[12px] mb-1 opacity-80">
              On what evidence? <span className="opacity-60">(required — a muṣḥaf, an edition, a parallel passage)</span>
            </label>
            <textarea value={evidence} onChange={e => setEvidence(e.target.value)}
              rows={3} maxLength={2000} className={`${field} mb-3`} style={fieldStyle} />

            <label className="block font-english text-[12px] mb-1 opacity-80">
              Your name <span className="opacity-60">(optional)</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={100}
              className={`${field} mb-4`} style={fieldStyle} />

            {/* Honeypot: off-screen and aria-hidden, so only a form-filling bot finds it. */}
            <input tabIndex={-1} aria-hidden="true" autoComplete="off" value={honey}
              onChange={e => setHoney(e.target.value)} name="website"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

            {error && (
              <p className="font-english text-[12px] leading-5 mb-3" style={{ color: '#e08a8a' }}>
                {error}{' '}
                <a href={mailto} className="underline" style={{ color: 'var(--gold, #C9A84C)' }}>
                  Send it by email instead
                </a>.
              </p>
            )}

            <div className="flex items-center gap-3">
              {canPost === false ? (
                <a href={mailto}
                  onClick={() => setDone('sent')}
                  className="tap font-english text-[13px] px-4 py-2 rounded-lg font-semibold"
                  style={{
                    background: evidence.trim() ? 'var(--gold, #C9A84C)' : 'rgba(201,168,76,0.4)',
                    color: '#12180f',
                    pointerEvents: evidence.trim() ? 'auto' : 'none',
                  }}>
                  Send by email
                </a>
              ) : (
                <button onClick={submit} disabled={sending || !evidence.trim()}
                  className="tap font-english text-[13px] px-4 py-2 rounded-lg font-semibold disabled:opacity-40"
                  style={{ background: 'var(--gold, #C9A84C)', color: '#12180f' }}>
                  {sending ? 'Sending…' : 'Submit'}
                </button>
              )}
              <p className="font-english text-[11px] leading-4 opacity-55">
                Suggestions are reviewed by the editor. Nothing you send changes the text directly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
