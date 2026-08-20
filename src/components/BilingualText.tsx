'use client';
import { useState, useEffect } from 'react';
import ArabicWordTool from '@/components/ArabicWordTool';
import { BILINGUAL_ALIGNMENT } from '@/lib/bilingualAlignment';
import { isDraftTranslation } from '@/lib/draftTranslations';
import { VERSE_INDEX } from '@/lib/verseIndex';
import { SURAH_LIST } from '@/lib/verseRanges';
import { isPoem, highlightEnVerses, stripEnFootnotes, injectFootnoteLinks, injectVerseNumbers } from '@/lib/textInject';

// Re-exported for existing consumers (e.g. SurahReader.tsx imports these
// from this module) -- the actual implementations live in
// src/lib/textInject.ts, a plain (non-'use client') module, so server
// components (the print page) can use them too without going through a
// client-component boundary.
export { isPoem, highlightEnVerses, stripEnFootnotes, injectFootnoteLinks, injectVerseNumbers };

// 'french' | 'wolof' | 'hausa' were members here and each had a render branch
// and a ComingSoonNote. No lesson in the corpus has text in any of them, so
// every branch was unreachable except by clicking a chip that promised
// something the archive does not hold. Add a member back with its text.
type View = 'bilingual' | 'arabic' | 'english';

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

/* Five languages used to appear here as five identical chips. Counted across
   all 56 lesson files: Arabic has text in 56, English in 5, and French, Wolof
   and Hausa in none -- there is no field for French or Hausa text at all. So
   three chips led to a "coming soon" panel on every lesson in the corpus and
   English led to one on 51 of 56.

   The languages stay visible, because the plan is worth announcing: a reader
   should see that this edition intends French, Wolof and Hausa. What changes is
   that a language you cannot read is no longer dressed as a button. Buttons are
   for text that exists; everything else is a label, which is what it always was
   underneath.

   Wolof will read oddly against the audio, and that is accurate. Thirty lessons
   carry a wolofPlaylistId and the tafsīr was delivered in Wolof, but the written
   transcription is the thing in preparation; the recordings are on "Listen while
   reading" and /audio, where they belong. */
const LANG_TABS: { id: View; label: string }[] = [
  { id: 'arabic',  label: 'عربي' },
  { id: 'english', label: 'English' },
];

const PLANNED_LANGS = ['Français', 'Wolof', 'Hausa'] as const;

/** Highest lesson number with a substantive English translation. Drives both
 *  the status line and the ComingSoonNote, so the two cannot drift apart --
 *  the note read "Lessons 1–2 available" while five lessons had a translation.
 *  Update as the translation advances. */
const TRANSLATED_THROUGH = 5;

/** A language named but not yet readable. Deliberately not a <button>: it has
 *  no action, so it gets no affordance, no hover, no focus ring and no place in
 *  the tab order. Screen readers get the same distinction the eye does. */
function PlannedLang({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      className="font-english text-xs px-3 py-1 rounded-full border border-dashed cursor-default"
      style={{ borderColor: 'rgba(138,109,31,0.28)', color: 'rgba(138,109,31,0.6)' }}
    >
      {label}
    </span>
  );
}

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
      sub: `Lessons 1–${TRANSLATED_THROUGH} available · Full bilingual print edition in preparation · Amadu Kunateh`,
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
  // Opening on 'bilingual' regardless of whether a translation exists gave 51
  // of 56 lessons a two-column layout in which one column said "English
  // translation forthcoming" -- half the reading width spent on an absence.
  // Those lessons open on the Arabic, full width.
  const [view, setView] = useState<View>(
    hasEnglish && (englishText || '').trim().length > 200 ? 'bilingual' : 'arabic'
  );
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

  // What this lesson actually has, rather than what the project intends to
  // have. `hasEnglish` alone is not enough: several lessons carry the flag with
  // a stub or an empty string behind it, which is how "English translation
  // forthcoming" ended up behind a chip that claimed a translation.
  const hasTranslation = hasEnglish && (englishText || '').trim().length > 200;
  const langTabs = LANG_TABS.filter(t => t.id === 'arabic' || hasTranslation);

  // Fold the flat index into contiguous same-sūra runs, so the jump bar can
  // label each one. A new group opens whenever the sūra changes, which keeps
  // a lesson that returns to an earlier sūra honest rather than merging two
  // separate passes into one heading.
  const verseGroups = verseEntries.reduce<
    { surah: number; name: string; entries: typeof verseEntries }[]
  >((groups, entry) => {
    const surah = Number(entry.verse.split(':')[0]);
    const last = groups[groups.length - 1];
    if (last && last.surah === surah) {
      last.entries.push(entry);
    } else {
      groups.push({
        surah,
        name: SURAH_LIST.find(s => s.id === surah)?.nameEn ?? `Sūra ${surah}`,
        entries: [entry],
      });
    }
    return groups;
  }, []);

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
        {/* The Layout row held a single button labelled "Arabic + English" with
            nothing to switch to, on every lesson. It appears now only when
            there is in fact a second column to lay out. */}
        {hasTranslation && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="font-english text-xs text-white/30">Layout:</span>
            <TabBtn label="Arabic + English" active={showBilingual} onClick={() => setView('bilingual')} />
          </div>
        )}
        {/* Readable languages first, as buttons. Then the ones this edition
            intends, as labels -- dashed outline, no hover, no tab stop. The
            reader can see the whole plan and can also see, without clicking,
            which parts of it exist. */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Language:</span>
          {langTabs.map(tab => (
            <TabBtn key={tab.id} label={tab.label} active={view === tab.id} onClick={() => setView(tab.id as View)} />
          ))}
          {!hasTranslation && (
            <PlannedLang
              label="English"
              title={`English translation in progress — lessons 1–${TRANSLATED_THROUGH} are done`}
            />
          )}
          {PLANNED_LANGS.map(label => (
            <PlannedLang key={label} label={label}
              title={label === 'Wolof'
                ? 'Delivered in Wolof; the recordings are under “Listen while reading”. Written transcription in preparation.'
                : `${label} translation in preparation`} />
          ))}
          <span className="font-english text-[11px] pl-1" style={{ color: 'rgba(138,109,31,0.55)' }}>
            dashed = in preparation
          </span>
        </div>
      </div>

      {/* Verse jump bar — Jalālayn-style per-ayah navigation, only shown once
          this lesson has a built verse index (see src/lib/verseIndex.ts).

          Grouped by sūra, and it has to be. A lesson can cross a sūra boundary,
          and the chip carries only the āya number, so Lesson 1 (Q 1:1–2:5)
          rendered as "1 2 3 4 5 6 7 1 2 3 4 5" -- twelve identical chips, two
          of them labelled 1, with nothing to say the sequence restarts or what
          it restarts into. Runs are contiguous because VERSE_INDEX is ordered
          by position in the commentary, so a plain fold over the list gives the
          groups; it does not assume one run per sūra. */}
      {verseGroups.length > 0 && (
        <div
          dir="ltr"
          className="flex gap-1 overflow-x-auto px-3 py-2 border-b items-center"
          style={{ borderColor: 'rgba(13,31,10,0.1)', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        >
          {verseGroups.map((group, gi) => (
            <div key={`${group.surah}-${gi}`} className="flex gap-1 items-center flex-shrink-0">
              {gi > 0 && (
                <span aria-hidden className="flex-shrink-0 self-stretch mx-1.5 border-l"
                  style={{ borderColor: 'rgba(138,109,31,0.25)' }} />
              )}
              <span className="font-english text-[10px] flex-shrink-0 self-center pr-1 whitespace-nowrap"
                style={{ color: 'rgba(138,109,31,0.75)' }}>
                {group.name}
              </span>
              {group.entries.map(entry => (
                <button
                  key={entry.verse}
                  onClick={() => jumpToVerse(entry.paraIndex)}
                  className="font-english text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded border transition-colors"
                  style={{
                    borderColor: 'rgba(138,109,31,0.3)',
                    color: '#8a6d1f',
                    opacity: entry.uncertain ? 0.55 : 1,
                  }}
                  title={entry.uncertain ? `Q. ${entry.verse} — approximate match` : `Jump to Q. ${entry.verse}`}
                >
                  {entry.verse.split(':')[1]}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Opening poem / invocation — displayed full-width, centered, before columns */}
      {poemLines.length > 0 && (showBilingual || view === 'arabic') && (
        <div className="px-6 py-4 border-b border-gold/10 text-center bg-gold/3">
          {poemLines.map((line, i) => (
            <div key={i} className="font-arabic text-base leading-9" dir="rtl"
              /* The opening invocation is liturgical formula rather than
                 commentary, so a warmer colour is defensible -- but gold/80 on
                 cream is 1.5:1, which is not a stylistic choice, it is text a
                 reader has to squint at. --gold inside the reader resolves to
                 #8a6d1f: still gold, and 4.19:1. */
              style={{ color: 'var(--gold, #8a6d1f)' }}
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
                      className={`font-arabic text-[1.1rem] leading-[2.2] text-text-main text-justify mb-2 transition-colors rounded-sm ${highlightedPara === ai ? 'bg-gold/15 px-2 -mx-2' : ''}`}
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
                    className={`font-arabic text-[1.1rem] leading-[2.2] text-justify mb-3 transition-colors rounded-sm ${highlightedPara === i ? 'bg-gold/15 px-2 -mx-2' : ''}`}
                    /* Was text-gold/90. Gold on the cream reader measures 1.82:1 --
                       WCAG AA wants 4.5 for body text, and this is the body text:
                       three million characters of it, the surface a reader spends
                       almost all their time on. Gold is the site's accent and
                       belongs on chrome. The reader already declares its own ink,
                       --body-text, which measures 10.68:1 on the same cream. */
                    style={{ color: 'var(--body-text, rgba(13,31,10,0.88))' }}
                    dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(injectVerseNumbers(p, citations?.[String(i)]), lessonId, footnoteOrder, fnCursor) }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arabic only -- full commentary text, word-lookup tool enabled */}
      {view === 'arabic' && (
        <div className="p-5 text-center font-arabic" dir="rtl">
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

    </div>
  );
}
