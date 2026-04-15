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

function TabBtn({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
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
  const arParagraphs = arabicText.split('\n').filter(p => p.trim());

  // For bilingual mode: try to pair Arabic paragraphs with English paragraphs
  // On desktop: two columns. On mobile: interleaved paragraph-by-paragraph.
  const enParagraphs: string[] = [];
  if (englishText) {
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) {
      div.innerHTML = englishText;
      div.querySelectorAll('p').forEach(p => {
        if (p.textContent?.trim()) enParagraphs.push(p.outerHTML);
      });
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="p-3 border-b border-white/10 space-y-2" dir="ltr">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Layout:</span>
          <TabBtn id="bilingual" label="⇌ Bilingual" active={view === 'bilingual'} onClick={() => setView('bilingual')} />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="font-english text-xs text-white/30">Language:</span>
          {LANG_TABS.map(tab => (
            <TabBtn key={tab.id} id={tab.id} label={tab.label} active={view === tab.id} onClick={() => setView(tab.id as View)} />
          ))}
        </div>
      </div>

      {/* Bilingual view */}
      {view === 'bilingual' && (
        <>
          {/* Desktop: two columns */}
          <div className="hidden md:grid md:grid-cols-2 gap-0">
            <div dir="rtl" className="p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify border-l border-gold/15">
              {arParagraphs.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
            </div>
            <div dir="ltr" className="p-5">
              {hasEnglish && englishText ? (
                <div className="font-english text-[16px] leading-[1.9] text-white" dangerouslySetInnerHTML={{ __html: englishText }} />
              ) : (
                <ComingSoonNote lang="english" />
              )}
            </div>
          </div>

          {/* Mobile: interleaved paragraphs */}
          <div className="md:hidden">
            {arParagraphs.map((ar, i) => (
              <div key={i} className="border-b border-white/5 last:border-0">
                <div dir="rtl" className="px-4 pt-4 pb-2 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify">
                  {ar}
                </div>
                {hasEnglish && enParagraphs[i] ? (
                  <div
                    dir="ltr"
                    className="px-4 pb-4 pt-1 font-english text-[15px] leading-[1.85] text-white/80 italic border-l-2 border-gold/20 ml-4"
                    dangerouslySetInnerHTML={{ __html: enParagraphs[i] }}
                  />
                ) : hasEnglish ? null : (
                  i === 0 ? (
                    <div className="px-4 pb-3 font-english text-white/20 text-xs italic" dir="ltr">
                      English translation forthcoming.
                    </div>
                  ) : null
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Single language views */}
      {view === 'arabic' && (
        <div dir="rtl" className="p-5 font-arabic text-[1.1rem] leading-[2.2] text-text-main text-justify">
          {arParagraphs.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
        </div>
      )}
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
