'use client';
import { useState } from 'react';

type View = 'arabic' | 'english' | 'french' | 'wolof' | 'hausa';

interface BilingualTextProps {
  arabicText: string;
  englishText: string | null;
  hasEnglish: boolean;
}

const TABS: { id: View; label: string; flag: string }[] = [
  { id: 'arabic', label: 'عربي', flag: '🕌' },
  { id: 'english', label: 'English', flag: '🇬🇧' },
  { id: 'french', label: 'Français', flag: '🇫🇷' },
  { id: 'wolof', label: 'Wolof', flag: '🌍' },
  { id: 'hausa', label: 'Hausa', flag: '🌍' },
];

export default function BilingualText({ arabicText, englishText, hasEnglish }: BilingualTextProps) {
  const [view, setView] = useState<'both' | View>('both');
  const arParagraphs = arabicText.split('\n').filter(p => p.trim());

  // "Both" = Arabic + English side by side
  const isBoth = view === 'both';

  return (
    <div>
      {/* View toggle — top row */}
      <div className="p-3 border-b border-white/10 space-y-2" dir="ltr">
        {/* Bilingual toggle */}
        <div className="flex gap-2 flex-wrap">
          <span className="font-english text-xs text-white/30 self-center">Layout:</span>
          <button
            onClick={() => setView('both')}
            className={`font-english text-xs px-3 py-1 rounded-full border transition-all ${
              isBoth
                ? 'bg-gold text-bg border-gold font-semibold'
                : 'border-gold/20 text-white/45 hover:border-gold/40'
            }`}
          >
            ⇌ Bilingual
          </button>
        </div>
        {/* Language tabs */}
        <div className="flex gap-1.5 flex-wrap">
          <span className="font-english text-xs text-white/30 self-center">Language:</span>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`font-english text-xs px-3 py-1 rounded-full border transition-all ${
                view === tab.id && !isBoth
                  ? 'bg-gold text-bg border-gold font-semibold'
                  : 'border-gold/20 text-white/45 hover:border-gold/40'
              }`}
            >
              {tab.flag} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isBoth ? (
        /* Bilingual: Arabic + English side by side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div dir="rtl" className="p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify border-b md:border-b-0 md:border-l border-gold/15">
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
      ) : view === 'arabic' ? (
        <div dir="rtl" className="p-5 font-arabic text-[1.1rem] leading-[2.2] text-text-main text-justify">
          {arParagraphs.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
        </div>
      ) : view === 'english' ? (
        <div dir="ltr" className="p-5">
          {hasEnglish && englishText ? (
            <div className="font-english text-[16px] leading-[1.9] text-white" dangerouslySetInnerHTML={{ __html: englishText }} />
          ) : (
            <ComingSoonNote lang="english" />
          )}
        </div>
      ) : view === 'french' ? (
        <div dir="ltr" className="p-5">
          <ComingSoonNote lang="french" />
        </div>
      ) : view === 'wolof' ? (
        <div dir="ltr" className="p-5">
          <ComingSoonNote lang="wolof" />
        </div>
      ) : view === 'hausa' ? (
        <div dir="ltr" className="p-5">
          <ComingSoonNote lang="hausa" />
        </div>
      ) : null}
    </div>
  );
}

function ComingSoonNote({ lang }: { lang: string }) {
  const messages: Record<string, { title: string; body: string; sub?: string }> = {
    english: {
      title: "English Translation",
      body: "English translation forthcoming.",
      sub: "Amadu Kunateh (Harvard University) · Lessons 1–2 available · Full edition in preparation for Brill Academic Publishers",
    },
    french: {
      title: "Traduction Française",
      body: "Traduction française en cours de préparation.",
      sub: "Amadu Kunateh (Université Harvard) · La traduction française du Tafsīr de Cheikh Ibrāhīm Niasse est actuellement en préparation.",
    },
    wolof: {
      title: "Wolof",
      body: "Wolof audio tafsīr available — see Sheikh's Audio above.",
      sub: "Shaykh Ibrāhīm Niasse delivered this tafsīr primarily in Wolof. Audio recordings are available in the Sheikh's Audio panel. Written transcription and translation are in preparation as a future phase of this project.",
    },
    hausa: {
      title: "Hausa Translation",
      body: "Hausa translation coming soon.",
      sub: "The Hausa-language tradition of Niasse's tafsīr is part of the broader legacy of this work across West Africa. A Hausa component is planned for a future phase of this scholarly database.",
    },
  };

  const msg = messages[lang] ?? messages.english;

  return (
    <div className="text-center py-8 px-4">
      <div className="font-english text-gold/60 font-semibold text-base mb-3">{msg.title}</div>
      <p className="font-english text-white/50 italic text-sm mb-3">{msg.body}</p>
      {msg.sub && (
        <p className="font-english text-white/25 text-xs leading-5 max-w-md mx-auto">{msg.sub}</p>
      )}
    </div>
  );
}
