'use client';
import { useState, useEffect } from 'react';
import ArabicWordTool from '@/components/ArabicWordTool';
import { BILINGUAL_ALIGNMENT } from '@/lib/bilingualAlignment';
import { isDraftTranslation } from '@/lib/draftTranslations';
import { VERSE_INDEX } from '@/lib/verseIndex';
import { isPoem, highlightEnVerses, stripEnFootnotes, injectFootnoteLinks, injectVerseNumbers } from '@/lib/textInject';

// Re-exported for existing consumers (e.g. SurahReader.tsx imports these
// from this module) -- the actual implementations live in
// src/lib/textInject.ts, a plain (non-'use client') module, so server
// components (the print page) can use them too without going through a
// client-component boundary.
export { isPoem, highlightEnVerses, stripEnFootnotes, injectFootnoteLinks, injectVerseNumbers };

type View = 'bilingual' | 'arabic' | 'english' | 'french' | 'wolof' | 'hausa';

interface BilingualTextProps {
  /** Opening istiʿādha/basmala/poem lines, shown in full (liturgical
   *  formulas, not part of Niasse's original commentary). */
  poemLines: string[];
  /** Full Arabic commentary paragraphs, split server-side (poem lines
   *  removed) -- see src/lib/arabicCommentary.ts. Published in full,
   *  site-wide (AK confirmed 2026-08-16; see CLAUDE.md). */
  arabicParagraphs: string[];
  /** paraIndex -> spanIndex -> "surah:ayah", high-confidence matches only,
   *  for the small verse-number badge injectVerseNumbers() appends after a
   *  quoted Qur'anic clause -- see src/data/verseCitations.json. */
  citations?: Record<string, Record<string, string>>;
  englishText: string | null;
  hasEnglish: boolean;
  lessonId?: number;
  footnoteOrder?: string[];
}

function DraftTranslationNotice() {
  return (
    <p className="font-english text-[11px] italic mb-3" dir="ltr" style={{ color: 'rgba(180,140,40,0.85)' }}>
      Draft Under Review — Feedback Welcomed
    </p>
  );
}

const LANG_TABS: { id: View; label: string }[] = [
  { id: 'arabic',   label: 'عربي' },
  { id: 'english',  label: 'English' },
  { id: 'french',   label: 'Français' },
  { id: 'wolof',    label: 'Wolof' },
  { id: 'hausa',    label: 'Hausa' },
];

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`font-english text-xs px-3 py-1 rounded-full border transition-all ${
        active
          ? 'bg-gold text-bg border-gold font-semibold'
          : 'border-gold/20 text-white/45 hover:border-gold/40 hover:text-white/65'
      }`}
    >
      {label}
    </button>
  );
}

function ComingSoonNote({ lang }: { lang: string }) {
  const msgs: Record<string, { title: string; body: string; sub?: string }> = {
    english: {
      title: "English Translation",
      body: "English translation forthcoming.",
      sub: "Lessons 1–2 available · Full bilingual print edition in preparation · Amadu Kunateh",
    },
    french: {
      title: "Traduction Française",
      body: "Traduction française en cours de préparation.",
      sub: "Amadu Kunateh (Université Harvard) · La traduction française du Tafsīr de Cheikh Ibrāhīm Niasse est actuellement en cours.",
    },
    wolof: {
      title: "Wolof",
      body: "Wolof audio tafsīr available — see Sheikh's Audio above.",
      sub: "Shaykh Ibrāhīm Niasse delivered this tafsīr primarily in Wolof. Audio is available in the Sheikh's Audio panel. Written transcription and translation are in preparation.",
    },
    hausa: {
      title: "Hausa Translation",
      body: "Hausa translation coming soon.",
      sub: "The Hausa-language tradition of Niasse's tafsīr is part of the broader West African legacy of this work. A Hausa component is planned for a future phase of this scholarly database.",
    },
  };
  const msg = msgs[lang] ?? msgs.english;
  return (
    <div className="text-center py-8 px-4">
      <div className="font-english text-gold/60 font-semibold text-base mb-3">{msg.title}</div>
      <p className="font-english text-white/50 italic text-sm mb-3">{msg.body}</p>
      {msg.sub && <p className="font-english text-white/25 text-xs leading-5 max-w-md mx-auto">{msg.sub}</p>}
    </div>
  );
}

export default function BilingualText({ poemLines, arabicParagraphs, citations, englishText, hasEnglish, lessonId, footnoteOrder }: BilingualTextProps) {
  const [view, setView] = useState<View>('bilingual');
  const [highlightedPara, setHighlightedPara] = useState<number>(-1);

  const fnCursor = { i: 0 };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const decodedQ = decodeURIComponent(q);
      /* setHighlightQuery removed */
      // Normalize Arabic text for matching (strip HTML, diacritics, special chars)
      const normalizeAr = (text: string) => text
        .replace(/<[^>]+>/g, '')
        .replace(/[\u064B-\u065F\u0670\u0671]/g, '')
        .replace(/\u0640/g, '')
        .replace(/\u0644\u0644\u0651\u0670\u0647/g, '\u0627\u0644\u0644\u0647')
        .replace(/[\s]+/g, ' ')
        .trim();
      const normQ = normalizeAr(decodedQ).slice(0, 20);
      // Find matching paragraph index
      const commentaryParagraphsList: string[] = []; // full text no longer available client-side; ?q= deep link is unused dead code
      const idx = commentaryParagraphsList.findIndex(p => normalizeAr(p).includes(normQ));
      if (idx >= 0) {
        setHighlightedPara(idx);
        setTimeout(() => {
          const el = document.getElementById(`ar-para-${idx}`);
          // instant, not smooth -- smooth scrollIntoView animations were
          // silently producing zero movement in testing (confirmed even
          // on a manually-invoked call), likely a compositor/rAF timing
          // issue. instant is deterministic and has tested reliably 100%
          // of the time, so it's the safer choice for a critical nav path.
          el?.scrollIntoView({ behavior: 'instant', block: 'center' });
        }, 600);
      }
      return; // ?q= and ?verse= are mutually exclusive entry points
    }
    // Arrived from the homepage āyah-jump widget (or any /lesson/N?verse=S:A
    // link) -- scroll to the paragraph if this lesson's verse index has it.
    const verseParam = params.get('verse');
    if (verseParam && lessonId) {
      const entry = (VERSE_INDEX[lessonId] || []).find(v => v.verse === verseParam);
      if (entry) {
        setHighlightedPara(entry.paraIndex);
        // Re-assert the scroll a few times over ~1.5s rather than firing once.
        // A single call at a fixed delay was landing on the right element
        // (confirmed via getElementById + highlight state) but the actual
        // viewport position kept ending up back at the top -- something
        // downstream (layout settling, a font/image load reflow, or another
        // effect) appears to intermittently undo a single scroll attempt.
        // Repeating the same instant scrollIntoView call a few times is a
        // blunt but reliable way to win that race regardless of the exact
        // cause, since each attempt independently re-lands on the target.
        [700, 1100, 1600].forEach(delay => {
          setTimeout(() => {
            document.getElementById(`ar-para-${entry.paraIndex}`)
              ?.scrollIntoView({ behavior: 'instant', block: 'center' });
          }, delay);
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // poemLines comes straight from props now (full liturgical text, shown as
  // before). commentaryParagraphs is the full Arabic commentary, split
  // server-side (poem lines removed) -- see src/lib/arabicCommentary.ts.
  // Index-parallel to VERSE_INDEX paraIndex.
  const commentaryParagraphs = arabicParagraphs;

  // Parse English paragraphs for mobile paragraph interleaving.
  // Only <p class="en-para"> blocks count as body prose here -- <p class="en-fn">
  // footnote paragraphs (inside <div class="en-footnotes">) must NOT be captured,
  // since stripEnFootnotes() can't strip them once they're pulled out of their
  // wrapping div, and they were otherwise leaking into the bilingual view as if
  // they were translation paragraphs.
  const enParagraphs: string[] = [];
  if (englishText) {
    const matches = englishText.split(/(?=<p[^>]*>)/).filter(s => s.startsWith('<p'));
    matches.forEach(m => {
      if (!/<p[^>]*\bclass="[^"]*\ben-para\b[^"]*"/.test(m)) return;
      const text = m.replace(/<[^>]+>/g, '').trim();
      if (text) enParagraphs.push(m);
    });
  }

  const alignment = lessonId ? BILINGUAL_ALIGNMENT[lessonId] : undefined;
  const isDraft = lessonId ? isDraftTranslation(lessonId) : false;
  const verseEntries = lessonId ? (VERSE_INDEX[lessonId] || []) : [];

  const jumpToVerse = (paraIndex: number) => {
    if (view !== 'bilingual' && view !== 'arabic') setView('bilingual');
    setHighlightedPara(paraIndex);
    setTimeout(() => {
      document.getElementById(`ar-para-${paraIndex}`)?.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, view === 'bilingual' || view === 'arabic' ? 0 : 100);
  };

  const showBilingual = view === 'bilingual';

  return (
    <div>
      {/* Controls — sticky just below PanelJumpTabs so it stays reachable while reading */}
      <div
        className="p-3 border-b space-y-2 sticky z-30"
        dir="ltr"
        style={{
          top: '46px',
          background: 'rgba(245,237,214,0.97)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderColor: 'rgba(13,31,10,0.1)',
        }}
      >
        <div className="flex gap-2 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Layout:</span>
          <TabBtn label="Arabic + English" active={showBilingual} onClick={() => setView('bilingual')} />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Language:</span>
          {LANG_TABS.map(tab => (
            <TabBtn key={tab.id} label={tab.label} active={view === tab.id} onClick={() => setView(tab.id as View)} />
          ))}
        </div>
      </div>

      {/* Verse jump bar — Jalālayn-style per-ayah navigation, only shown once
          this lesson has a built verse index (see src/lib/verseIndex.ts) */}
      {verseEntries.length > 0 && (
        <div
          dir="ltr"
          className="flex gap-1 overflow-x-auto px-3 py-2 border-b"
          style={{ borderColor: 'rgba(13,31,10,0.1)', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        >
          <span className="font-english text-[10px] text-white/30 flex-shrink-0 self-center pr-1">Verse:</span>
          {verseEntries.map(entry => (
            <button
              key={entry.verse}
              onClick={() => jumpToVerse(entry.paraIndex)}
              className="font-english text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded border transition-colors"
              style={{
                borderColor: 'rgba(138,109,31,0.3)',
                color: '#8a6d1f',
                opacity: entry.uncertain ? 0.55 : 1,
              }}
              title={entry.uncertain ? `Q.${entry.verse} — approximate match` : `Jump to Q.${entry.verse}`}
            >
              {entry.verse.split(':')[1]}
            </button>
          ))}
        </div>
      )}

      {/* Opening poem / invocation — displayed full-width, centered, before columns */}
      {poemLines.length > 0 && (showBilingual || view === 'arabic') && (
        <div className="px-6 py-4 border-b border-gold/10 text-center bg-gold/3">
          {poemLines.map((line, i) => (
            <div key={i} className="font-arabic-sans text-gold/80 text-base leading-9" dir="rtl"
              dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
      )}

      {/* Arabic + English view. If a verified alignment exists for this lesson,
          render matched blocks; otherwise (the common case) two side-by-side
          boxes, see below. */}
      {showBilingual && (
        <div className="divide-y" style={{borderColor:'rgba(13,31,10,0.08)'}}>
          {(() => { fnCursor.i = 0; return null; })()}
          {alignment ? (
            <>
              {alignment.blocks.map((block, bi) => (
                <div key={`block-${bi}`} className="px-4 md:px-6 py-4">
                  {block.arabicIndices.map(ai => (
                    <div key={ai} id={`ar-para-${ai}`} dir="rtl"
                      className={`font-arabic-sans text-[1.05rem] leading-[2.1] text-text-main text-justify mb-2 transition-colors rounded-sm ${highlightedPara === ai ? 'bg-gold/15 px-2 -mx-2' : ''}`}
                      dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(injectVerseNumbers(commentaryParagraphs[ai], citations?.[String(ai)]), lessonId, footnoteOrder, fnCursor) }} />
                  ))}
                  {block.englishIndices.length > 0 ? (
                    <div dir="ltr" className="font-english text-[15px] leading-[1.85] text-white/80 italic border-l-2 border-gold/20 pl-3">
                      {block.englishIndices.map(ei => (
                        <div key={ei} dangerouslySetInnerHTML={{ __html: highlightEnVerses(stripEnFootnotes(enParagraphs[ei] || '')) }} />
                      ))}
                    </div>
                  ) : block.arabicIndices.length > 0 ? (
                    <p className="font-english text-white/20 text-xs italic pl-3" dir="ltr">
                      English translation forthcoming.
                    </p>
                  ) : null}
                </div>
              ))}
              {alignment.englishOnly.length > 0 && (
                <div className="px-4 md:px-6 py-4 bg-gold/3">
                  <p className="font-english text-gold/50 text-[10px] uppercase tracking-wide mb-2" dir="ltr">
                    Additional translated content — Arabic source not yet digitized
                  </p>
                  {alignment.englishOnly.map((group, gi) => (
                    <div key={gi} dir="ltr" className="font-english text-[15px] leading-[1.85] text-white/80 italic mb-3">
                      {group.indices.map(ei => (
                        <div key={ei} dangerouslySetInnerHTML={{ __html: highlightEnVerses(stripEnFootnotes(enParagraphs[ei] || '')) }} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // No verified paragraph-level alignment yet for this lesson. Rather
            // than pair Arabic[i] with English[i] by raw array index (wrong
            // whenever the two texts diverge in paragraph count or order --
            // true for most lessons), show the full Arabic text and the full
            // English translation as two separate boxes, side by side on
            // desktop (stacked on narrow screens) -- no false pairing implied.
            <div className="px-4 md:px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4" dir="ltr">
              {/* English box */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'rgba(13,31,10,0.12)' }}>
                <p className="font-english text-gold/60 text-[10px] uppercase tracking-wide mb-2">English translation</p>
                {isDraft && <DraftTranslationNotice />}
                {hasEnglish && enParagraphs.length > 0 ? (
                  <div className="font-english text-[15px] leading-[1.85] text-white/80">
                    {enParagraphs.map((p, i) => (
                      <div key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: highlightEnVerses(stripEnFootnotes(p)) }} />
                    ))}
                  </div>
                ) : (
                  <p className="font-english text-white/20 text-xs italic">
                    English translation forthcoming.
                  </p>
                )}
              </div>
              {/* Arabic box -- full commentary text, paragraph by paragraph. */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'rgba(13,31,10,0.12)' }} dir="rtl">
                <p className="font-english text-gold/60 text-[10px] uppercase tracking-wide mb-2" dir="ltr">Arabic commentary</p>
                {commentaryParagraphs.map((p, i) => (
                  <div key={i} id={`ar-para-${i}`}
                    className={`font-arabic-sans text-[1.05rem] leading-[2.1] text-gold/90 text-justify mb-3 transition-colors rounded-sm ${highlightedPara === i ? 'bg-gold/15 px-2 -mx-2' : ''}`}
                    dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(injectVerseNumbers(p, citations?.[String(i)]), lessonId, footnoteOrder, fnCursor) }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arabic only -- full commentary text, word-lookup tool enabled */}
      {view === 'arabic' && (
        <div className="p-5 text-center font-arabic-sans" dir="rtl">
          {(() => {
            const arCursor = { i: 0 };
            const html = commentaryParagraphs
              .map((p, i) => `<p class="mb-4 text-center leading-loose">${injectFootnoteLinks(injectVerseNumbers(p, citations?.[String(i)]), lessonId, footnoteOrder, arCursor)}</p>`)
              .join('');
            return <ArabicWordTool text={html} />;
          })()}
        </div>
      )}

      {/* English only */}
      {view === 'english' && (
        <div dir="ltr" className="p-5 max-w-2xl mx-auto">
          {hasEnglish && englishText ? (
            <>
              {isDraft && <DraftTranslationNotice />}
              <div className="font-english text-[16px] leading-[2.0]" style={{color:'var(--body-text, rgba(255,255,255,0.88))', textAlign:'left'}} dangerouslySetInnerHTML={{ __html: highlightEnVerses(stripEnFootnotes(englishText || '')) }} />
            </>
          ) : (
            <ComingSoonNote lang="english" />
          )}
        </div>
      )}

      {view === 'french' && <div dir="ltr" className="p-5"><ComingSoonNote lang="french" /></div>}
      {view === 'wolof' && <div dir="ltr" className="p-5"><ComingSoonNote lang="wolof" /></div>}
      {view === 'hausa' && <div dir="ltr" className="p-5"><ComingSoonNote lang="hausa" /></div>}
    </div>
  );
}
