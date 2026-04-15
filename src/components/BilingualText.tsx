'use client';
import { useState } from 'react';

type View = 'both' | 'arabic' | 'english';

interface BilingualTextProps {
  arabicText: string;
  englishText: string | null;
  hasEnglish: boolean;
}

export default function BilingualText({ arabicText, englishText, hasEnglish }: BilingualTextProps) {
  const [view, setView] = useState<View>('both');

  const arParagraphs = arabicText.split('\n').filter(p => p.trim());
  
  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-2 p-3 border-b border-white/10" dir="ltr">
        <span className="font-english text-xs text-white/40 self-center">View:</span>
        {(['both', 'arabic', 'english'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`font-english text-xs px-3 py-1 rounded-full border transition-all ${
              view === v
                ? 'bg-gold text-bg border-gold font-semibold'
                : 'border-gold/20 text-white/50 hover:border-gold/40 hover:text-white/70'
            }`}
          >
            {v === 'both' ? 'Arabic + English' : v === 'arabic' ? 'Arabic only' : 'English only'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`${view === 'both' ? 'grid grid-cols-2 md:grid-cols-2' : 'grid grid-cols-1'} gap-0`}>
        {/* Arabic column */}
        {view !== 'english' && (
          <div
            dir="rtl"
            className={`p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify ${
              view === 'both' ? 'border-l border-gold/20' : ''
            }`}
          >
            {arParagraphs.map((p, i) => (
              <p key={i} className="mb-3">{p}</p>
            ))}
          </div>
        )}

        {/* English column */}
        {view !== 'arabic' && (
          <div
            dir="ltr"
            className="p-5 font-english text-[16px] leading-[1.9] text-white"
          >
            {hasEnglish && englishText ? (
              <div dangerouslySetInnerHTML={{ __html: englishText }} />
            ) : (
              <p className="text-white/20 italic text-sm text-center mt-8">
                English translation forthcoming.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
