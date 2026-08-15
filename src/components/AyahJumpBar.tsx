'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SURAH_LIST, resolveVerseToLesson, maxTranslatedAyah, TRANSLATED_RANGES } from '@/lib/verseRanges';

// Homepage "jump to āyah" widget -- lets a reader go straight to a specific
// verse the way they're used to on Jalālayn-style sites, rather than
// browsing lesson-by-lesson. Scoped strictly to what's actually translated
// (Lessons 1-5: al-Fātiḥa + al-Baqara 1-202); everything else shows a
// "more coming" message instead of a dead link, mirroring how sites like
// tafsir.com handle sūrahs whose tafsīr hasn't been translated yet.
//
// NOT the same thing as /concordance (Verse Concordance) -- that's a
// separate, held-back research apparatus tied to AK's forthcoming Islamic
// Africa (Brill) article. This widget is a plain navigation aid.
export default function AyahJumpBar() {
  const router = useRouter();
  const [surah, setSurah] = useState<number>(1);
  const [ayah, setAyah] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  const surahAvailable = (id: number) => Boolean(TRANSLATED_RANGES[id]);

  const handleGo = () => {
    setNotice(null);
    const ayahNum = parseInt(ayah, 10);
    const surahMeta = SURAH_LIST.find(s => s.id === surah);
    if (!surahMeta || !ayahNum || ayahNum < 1) {
      setNotice('Enter a verse number to jump to.');
      return;
    }
    if (ayahNum > surahMeta.ayahCount) {
      setNotice(`${surahMeta.nameEn} only has ${surahMeta.ayahCount} verses.`);
      return;
    }
    const lessonId = resolveVerseToLesson(surah, ayahNum);
    if (!lessonId) {
      const cap = maxTranslatedAyah(surah);
      setNotice(
        cap
          ? `${surahMeta.nameEn} is translated through verse ${cap} so far — more coming soon.`
          : `${surahMeta.nameEn} hasn't been translated yet — more coming soon.`
      );
      return;
    }
    // scroll:false -- Next's own default post-navigation scroll-to-top was
    // racing the verse-specific scrollIntoView in BilingualText/Panel and
    // usually winning, which is why every jump landed on verse 1 instead
    // of the requested verse. The lesson page owns scroll position here.
    router.push(`/lesson/${lessonId}?panel=tafsir&verse=${surah}:${ayahNum}`, { scroll: false });
  };

  return (
    <div className="mt-3 max-w-xl mx-auto px-2" dir="ltr">
      <p className="font-english text-[10px] uppercase tracking-widest text-gold/50 text-center mb-1.5" style={{letterSpacing:'0.12em'}}>
        Jump to a verse
      </p>
      <div className="flex items-center gap-2 bg-white border-2 border-gold/50 focus-within:border-gold rounded-full px-3 py-2 sm:py-1.5 shadow-lg shadow-black/30 transition-all">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink/50 flex-shrink-0">
          <path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" />
        </svg>
        <select
          value={surah}
          onChange={e => { setSurah(Number(e.target.value)); setNotice(null); }}
          className="font-english text-sm bg-transparent text-ink font-medium flex-1 min-w-0 truncate max-w-[45%] outline-none"
        >
          {SURAH_LIST.map(s => (
            <option key={s.id} value={s.id} className="bg-white text-ink" disabled={!surahAvailable(s.id)}>
              {s.id}. {s.nameEn}{!surahAvailable(s.id) ? ' — soon' : ''}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={ayah}
          onChange={e => { setAyah(e.target.value); setNotice(null); }}
          onKeyDown={e => { if (e.key === 'Enter') handleGo(); }}
          placeholder="verse #"
          className="font-english text-sm bg-transparent text-ink font-medium placeholder:text-ink/40 w-14 sm:w-16 outline-none flex-shrink-0"
        />
        <button
          onClick={handleGo}
          className="font-english text-xs font-semibold text-ink hover:text-white bg-gold/20 hover:bg-gold border border-gold/60 hover:border-gold rounded-full px-3 py-1 flex-shrink-0 transition-all"
        >
          Go
        </button>
      </div>
      <p className={`font-english text-[11px] text-center mt-1.5 min-h-[1.2em] ${notice ? 'text-gold/60' : 'text-white/30'}`}>
        {notice || 'Covers al-Fātiḥa & al-Baqara 1–202 so far — more sūrahs added as they’re translated.'}
      </p>
    </div>
  );
}
