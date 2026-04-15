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
      <div className="flex gap-2 p-3 border-b border-white/10 flex-wrap" dir="ltr">
        <span className="font-english text-xs text-white/35 self-center mr-1">View:</span>
        {(['both', 'arabic', 'english'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`font-english text-xs px-3 py-1 rounded-full border transition-all ${
              view === v
                ? 'bg-gold text-bg border-gold font-semibold'
                : 'border-gold/20 text-white/45 hover:border-gold/40 hover:text-white/65'
            }`}
          >
            {v === 'both' ? 'Arabic + English' : v === 'arabic' ? 'Arabic only' : 'English only'}
          </button>
        ))}
      </div>

      {/* Columns */}
      <div className={`${view === 'both' ? 'grid grid-cols-1 md:grid-cols-2' : 'grid grid-cols-1'}`}>
        {/* Arabic */}
        {view !== 'english' && (
          <div
            dir="rtl"
            className={`p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify ${
              view === 'both' ? 'border-b md:border-b-0 md:border-l border-gold/15' : ''
            }`}
          >
            {arParagraphs.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
          </div>
        )}

        {/* English */}
        {view !== 'arabic' && (
          <div dir="ltr" className="p-5">
            {hasEnglish && englishText ? (
              <div
                className="font-english text-[16px] leading-[1.9] text-white"
                dangerouslySetInnerHTML={{ __html: englishText }}
              />
            ) : (
              <p className="font-english text-white/20 italic text-sm mt-8 text-center">
                English translation forthcoming.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
