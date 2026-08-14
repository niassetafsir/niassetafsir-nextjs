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
    router.push(`/lesson/${lessonId}?panel=tafsir&verse=${surah}:${ayahNum}`);
  };

  return (
    <div className="mt-2 max-w-xl mx-auto" dir="ltr">
      <div className="flex items-center gap-2 bg-white/4 border border-white/10 focus-within:border-gold/25 rounded-full px-3 py-1.5 transition-all">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/25 flex-shrink-0">
          <path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" />
        </svg>
        <select
          value={surah}
          onChange={e => { setSurah(Number(e.target.value)); setNotice(null); }}
          className="font-english text-sm bg-transparent text-white/70 flex-shrink-0 max-w-[40%] outline-none"
        >
          {SURAH_LIST.map(s => (
            <option key={s.id} value={s.id} className="bg-[#0D1F0A]" disabled={!surahAvailable(s.id)}>
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
          className="font-english text-sm bg-transparent text-white/70 placeholder:text-white/20 w-16 outline-none"
        />
        <button
          onClick={handleGo}
          className="font-english text-xs text-gold/70 hover:text-gold border border-gold/25 hover:border-gold/50 rounded-full px-3 py-1 flex-shrink-0 transition-all"
        >
          Go
        </button>
      </div>
      {notice ? (
        <p className="font-english text-[11px] text-white/35 text-center mt-1.5">{notice}</p>
      ) : (
        <p className="font-english text-[11px] text-white/20 text-center mt-1.5">
          Covers al-Fātiḥa &amp; al-Baqara 1–202 so far — more sūrahs added as they&apos;re translated.{' '}
          <a href="/search" className="text-white/30 hover:text-white/50 underline underline-offset-2">Or search text</a>
        </p>
      )}
    </div>
  );
}
