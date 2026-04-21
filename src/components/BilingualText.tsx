'use client';
import { useState, useEffect } from 'react';
import ArabicWordTool from '@/components/ArabicWordTool';

type View = 'bilingual' | 'arabic' | 'english' | 'french' | 'wolof' | 'hausa';

interface BilingualTextProps {
  arabicText: string;
  englishText: string | null;
  hasEnglish: boolean;
  lessonId?: number;
}

const LANG_TABS: { id: View; label: string }[] = [
  { id: 'arabic',   label: 'عربي' },
  { id: 'english',  label: 'English' },
  { id: 'french',   label: 'Français' },
  { id: 'wolof',    label: 'Wolof' },
  { id: 'hausa',    label: 'Hausa' },
];

// Poem pattern — the opening invocation present in every lesson
const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;



function stripEnFootnotes(html: string): string {
  // Remove the compiled footnote block (en-footnotes div) from display
  // Keep only the inline superscript links in body text
  return html.replace(/<div class="en-footnotes"[\s\S]*?<\/div>\s*(?=<|$)/g, '')
             .replace(/<div class="en-footnotes"[\s\S]*/g, '');
}

function injectFootnoteLinks(text: string, lessonId?: number): string {
  if (!lessonId) return text;

  // Strip inline bibliographic refs like "تفسير القرطبي ج35/" before [N]
  // Uses Unicode code points to avoid regex literal issues in TSX
  // Strip inline bibliographic citations: "scholartitle ج35/" or "188-185/" before [N]
  // Only matches short citation refs (1-5 Arabic words + vol/page), not Quranic verses
  const bibPattern = /(?:[؀-ۿ]+\s+){0,4}[؀-ۿ]*\s*(?:ج\s*\d[\d\s/]*|\d+\s*[-–]\s*\d+\s*\/\s*\d*)\s*(?=\[\d+\])/g;
  let result = text.replace(bibPattern, '');

  // Convert [N] to footnote superscript links
  result = result.replace(/\[(\d+)\]/g, (_match, num) => {
    const id = `fn-${lessonId}-${num}`;
    return `<a href="/footnotes#${id}" class="fn-superscript" title="View footnote ${num}">[${num}]</a>`;
  });

  // Wrap Quranic verse citations «...» in colour span
  result = result.replace(/\u00ab([^\u00bb]{3,300})\u00bb/g, (_match, verse) => {
    return `<span class="quranic-verse">\u00ab${verse}\u00bb</span>`;
  });

  return result;
}

function isPoem(text: string) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
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

export default function BilingualText({ arabicText, englishText, hasEnglish, lessonId }: BilingualTextProps) {
  const [view, setView] = useState<View>('bilingual');
  const [highlightQuery, setHighlightQuery] = useState<string>('');
  const [highlightedPara, setHighlightedPara] = useState<number>(-1);

  const allArParagraphs = arabicText.split('\n').filter(p => p.trim());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const decodedQ = decodeURIComponent(q);
      setHighlightQuery(decodedQ);
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
      const commentaryParagraphsList = allArParagraphs.filter(p => !POEM_PATTERN.test(p.trim()) && !BASMALA_PATTERN.test(p.trim()));
      const idx = commentaryParagraphsList.findIndex(p => normalizeAr(p).includes(normQ));
      if (idx >= 0) {
        setHighlightedPara(idx);
        setTimeout(() => {
          const el = document.getElementById(`ar-para-${idx}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Separate poem/invocation lines from commentary paragraphs
  const poemLines = allArParagraphs.filter(p => isPoem(p));
  const commentaryParagraphs = allArParagraphs.filter(p => !isPoem(p));

  // Parse English paragraphs for mobile paragraph interleaving
  const enParagraphs: string[] = [];
  if (englishText) {
    const matches = englishText.split(/(?=<p[^>]*>)/).filter(s => s.startsWith('<p'));
    matches.forEach(m => {
      const text = m.replace(/<[^>]+>/g, '').trim();
      if (text) enParagraphs.push(m);
    });
  }

  const showBilingual = view === 'bilingual';

  return (
    <div>
      {/* Controls */}
      <div className="p-3 border-b border-white/10 space-y-2" dir="ltr">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Layout:</span>
          <TabBtn label="⇌ Bilingual" active={showBilingual} onClick={() => setView('bilingual')} />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Language:</span>
          {LANG_TABS.map(tab => (
            <TabBtn key={tab.id} label={tab.label} active={view === tab.id} onClick={() => setView(tab.id as View)} />
          ))}
        </div>
      </div>

      {/* Opening poem / invocation — displayed full-width, centered, before columns */}
      {poemLines.length > 0 && (showBilingual || view === 'arabic') && (
        <div className="px-6 py-4 border-b border-gold/10 text-center bg-gold/3">
          {poemLines.map((line, i) => (
            <div key={i} className="font-arabic text-gold/80 text-base leading-9" dir="rtl"
              dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
      )}

      {/* Bilingual view */}
      {showBilingual && (
        <>
          {/* Desktop: two columns */}
          <div className="hidden md:grid md:grid-cols-2 gap-0">
            <div dir="rtl" className="p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify border-l border-gold/15">
              {commentaryParagraphs.map((p, i) => (
                <p key={i} id={`ar-para-${i}`} className={`mb-3 transition-colors rounded-sm ${highlightedPara === i ? 'bg-gold/15 px-2 -mx-2' : ''}`} dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(p, lessonId) }} />
              ))}
            </div>
            <div dir="ltr" className="p-5">
              {hasEnglish && englishText ? (
                <div className="font-english text-[16px] leading-[1.9] text-white" dangerouslySetInnerHTML={{ __html: stripEnFootnotes(englishText || '') }} />
              ) : (
                <ComingSoonNote lang="english" />
              )}
            </div>
          </div>

          {/* Mobile: paragraph-by-paragraph interleaved (poem already extracted above) */}
          <div className="md:hidden divide-y divide-white/5">
            {commentaryParagraphs.map((p, i) => (
              <div key={i} className="px-4 py-3">
                <div dir="rtl" className="font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify mb-2"
                  dangerouslySetInnerHTML={{ __html: injectFootnoteLinks(p, lessonId) }} />
                {hasEnglish && enParagraphs[i] ? (
                  <div
                    dir="ltr"
                    className="font-english text-[15px] leading-[1.85] text-white/80 italic border-l-2 border-gold/20 pl-3"
                    dangerouslySetInnerHTML={{ __html: stripEnFootnotes(enParagraphs[i]) }}
                  />
                ) : i === 0 && !hasEnglish ? (
                  <p className="font-english text-white/20 text-xs italic pl-3" dir="ltr">
                    English translation forthcoming.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Arabic only */}
      {view === 'arabic' && (
        <div className="p-5 text-center" dir="rtl">
          <ArabicWordTool text={commentaryParagraphs.map(p => `<p class="mb-4 text-center leading-loose">${p}</p>`).join('')} />
        </div>
      )}

      {/* English only */}
      {view === 'english' && (
        <div dir="ltr" className="p-5 max-w-2xl mx-auto">
          {hasEnglish && englishText ? (
            <div className="font-english text-[16px] leading-[2.0]" style={{color:'var(--body-text, rgba(255,255,255,0.88))', textAlign:'left'}} dangerouslySetInnerHTML={{ __html: stripEnFootnotes(englishText || '') }} />
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
