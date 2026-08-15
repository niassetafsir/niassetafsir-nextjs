'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SURAH_LIST } from '@/lib/verseRanges';

// Homepage "read a sūrah" widget -- companion to AyahJumpBar. AyahJumpBar
// jumps to one specific verse, but only within lessons that have an English
// translation (Lessons 1-5 today). This widget covers all 114 sūrahs and
// always has somewhere to land, because /surah/[id] shows the full Arabic
// commentary continuously even where no English translation exists yet
// (see src/app/surah/[id]/page.tsx, src/components/SurahReader.tsx).
export default function SurahPickerBar() {
  const router = useRouter();
  const [surah, setSurah] = useState<number>(1);

  const handleGo = () => {
    router.push(`/surah/${surah}`);
  };

  return (
    <div className="mt-3 max-w-xl mx-auto px-2" dir="ltr">
      <p className="font-english text-[10px] uppercase tracking-widest text-gold/50 text-center mb-1.5" style={{ letterSpacing: '0.12em' }}>
        Read a sūrah
      </p>
      <div className="flex items-center gap-2 bg-white border-2 border-gold/50 focus-within:border-gold rounded-full px-3 py-2 sm:py-1.5 shadow-lg shadow-black/30 transition-all">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink/50 flex-shrink-0">
          <path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" />
        </svg>
        <select
          value={surah}
          onChange={e => setSurah(Number(e.target.value))}
          className="font-english text-sm bg-transparent text-ink font-medium flex-1 min-w-0 truncate outline-none"
        >
          {SURAH_LIST.map(s => (
            <option key={s.id} value={s.id} className="bg-white text-ink">
              {s.id}. {s.nameEn}
            </option>
          ))}
        </select>
        <button
          onClick={handleGo}
          className="font-english text-xs font-semibold text-ink hover:text-white bg-gold/20 hover:bg-gold border border-gold/60 hover:border-gold rounded-full px-3 py-1 flex-shrink-0 transition-all"
        >
          Read
        </button>
      </div>
      <p className="font-english text-[11px] text-center mt-1.5 min-h-[1.2em] text-white/30">
        Continuous Arabic commentary, every sūrah — English where translated.
      </p>
    </div>
  );
}
