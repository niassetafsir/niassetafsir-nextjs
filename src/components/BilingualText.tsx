'use client';
import { useState } from 'react';

type View = 'bilingual' | 'arabic' | 'english' | 'french' | 'wolof' | 'hausa';

interface BilingualTextProps {
  arabicText: string;
  englishText: string | null;
  hasEnglish: boolean;
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
      sub: "Amadu Kunateh (Harvard University) · Lessons 1–2 available · Full edition in preparation for Brill Academic Publishers",
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

export default function BilingualText({ arabicText, englishText, hasEnglish }: BilingualTextProps) {
  const [view, setView] = useState<View>('bilingual');

  const allArParagraphs = arabicText.split('\n').filter(p => p.trim());
  
  // Separate poem/invocation lines from commentary paragraphs
  const poemLines = allArParagraphs.filter(p => isPoem(p));
  const commentaryParagraphs = allArParagraphs.filter(p => !isPoem(p));

  // Parse English paragraphs for mobile paragraph interleaving
  const enParagraphs: string[] = englishText
    ? (englishText.match(/<p[^>]*>.*?<\/p>/gs) ?? []).filter((p: string) => p.replace(/<[^>]+>/g, '').trim())
    : [];

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
            <div key={i} className="font-arabic text-gold/80 text-base leading-9" dir="rtl">
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Bilingual view */}
      {showBilingual && (
        <>
          {/* Desktop: two columns */}
          <div className="hidden md:grid md:grid-cols-2 gap-0">
            <div dir="rtl" className="p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify border-l border-gold/15">
              {commentaryParagraphs.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
            </div>
            <div dir="ltr" className="p-5">
              {hasEnglish && englishText ? (
                <div className="font-english text-[16px] leading-[1.9] text-white" dangerouslySetInnerHTML={{ __html: englishText }} />
              ) : (
                <ComingSoonNote lang="english" />
              )}
            </div>
          </div>

          {/* Mobile: paragraph-by-paragraph interleaved (poem already extracted above) */}
          <div className="md:hidden divide-y divide-white/5">
            {commentaryParagraphs.map((p, i) => (
              <div key={i} className="px-4 py-3">
                <div dir="rtl" className="font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify mb-2">
                  {p}
                </div>
                {hasEnglish && enParagraphs[i] ? (
                  <div
                    dir="ltr"
                    className="font-english text-[15px] leading-[1.85] text-white/80 italic border-l-2 border-gold/20 pl-3"
                    dangerouslySetInnerHTML={{ __html: enParagraphs[i] }}
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
        <div dir="rtl" className="p-5 font-arabic text-[1.1rem] leading-[2.2] text-text-main text-justify">
          {commentaryParagraphs.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
        </div>
      )}

      {/* English only */}
      {view === 'english' && (
        <div dir="ltr" className="p-5">
          {hasEnglish && englishText ? (
            <div className="font-english text-[16px] leading-[1.9] text-white" dangerouslySetInnerHTML={{ __html: englishText }} />
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
