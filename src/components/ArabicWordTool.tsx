'use client';
import { useState, useRef, useEffect } from 'react';

interface WordData {
  word: string;
  root?: string;
  pos?: string;
  gloss?: string;
  loading: boolean;
  error?: string;
}

interface ArabicWordToolProps {
  text: string;
}

async function lookupWord(word: string): Promise<WordData> {
  // Clean the word (remove diacritics, punctuation)
  const clean = word.replace(/[\u064B-\u065F\u0670\u0610-\u061A«»،؛؟!,.]/g, '').trim();
  if (!clean || clean.length < 2) throw new Error('Word too short');

  // Try Quranic Arabic Corpus morphology API
  try {
    const res = await fetch(
      `https://api.qurananalysis.com/analysis/?chapter=1&verse=1&word=${encodeURIComponent(clean)}&arabic=true`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.morphology) {
        return {
          word: clean,
          root: data.morphology?.root || undefined,
          pos: data.morphology?.tag || undefined,
          gloss: data.morphology?.gloss || undefined,
          loading: false
        };
      }
    }
  } catch { /* fall through to basic analysis */ }

  // Fallback: basic morphological hints
  const roots: Record<string, {root: string, gloss: string}> = {
    'الله': {root: 'اله', gloss: 'God, the one God'},
    'رحمن': {root: 'رحم', gloss: 'Intensely merciful, the Most Gracious'},
    'رحيم': {root: 'رحم', gloss: 'Especially merciful, Most Merciful'},
    'حمد': {root: 'حمد', gloss: 'praise, commendation'},
    'رب': {root: 'ربب', gloss: 'Lord, master, sustainer'},
    'عالم': {root: 'علم', gloss: 'world, realm; one who knows'},
    'ملك': {root: 'ملك', gloss: 'king, master, possessor'},
    'دين': {root: 'دين', gloss: 'religion, judgment, way of life'},
    'صراط': {root: 'صرط', gloss: 'path, road, way'},
    'مستقيم': {root: 'قوم', gloss: 'straight, upright, correct'},
    'قرآن': {root: 'قرأ', gloss: 'recitation, the Quran'},
    'تفسير': {root: 'فسر', gloss: 'explanation, exegesis, commentary'},
    'علم': {root: 'علم', gloss: 'knowledge, science, learning'},
    'قلب': {root: 'قلب', gloss: 'heart, core, center'},
    'نور': {root: 'نور', gloss: 'light, illumination'},
    'كتاب': {root: 'كتب', gloss: 'book, scripture, writing'},
    'نبي': {root: 'نبأ', gloss: 'prophet, one who brings news'},
    'رسول': {root: 'رسل', gloss: 'messenger, apostle'},
    'صلاة': {root: 'صلو', gloss: 'prayer, blessing, connection'},
    'إيمان': {root: 'أمن', gloss: 'faith, belief, security'},
    'تقوى': {root: 'وقي', gloss: 'God-consciousness, piety, protection'},
  };

  // Try to find a match
  for (const [key, val] of Object.entries(roots)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { word: clean, root: val.root, gloss: val.gloss, loading: false };
    }
  }

  // Extract likely root (rough heuristic for 3-letter roots)
  const stripped = clean.replace(/^(ال|وال|فال|بال|كال|لل)/, '').replace(/[وة]$/, '');
  if (stripped.length >= 3) {
    return {
      word: clean,
      root: stripped.substring(0, 3),
      gloss: 'Classical Arabic — search in Lane\'s Lexicon for full definition',
      loading: false
    };
  }

  return { word: clean, gloss: 'Click "Search in tafsīr" to find all occurrences', loading: false };
}

export default function ArabicWordTool({ text }: ArabicWordToolProps) {
  const [popup, setPopup] = useState<{word: string, x: number, y: number} | null>(null);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null);
        setWordData(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleWordClick = async (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const word = selection?.toString().trim() || '';
    if (!word || word.length < 2) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ word, x: rect.left, y: rect.bottom + window.scrollY + 8 });
    setWordData({ word, loading: true });

    try {
      const data = await lookupWord(word);
      setWordData(data);
    } catch {
      setWordData({ word, loading: false, error: 'Could not look up this word' });
    }
  };

  return (
    <div className="relative">
      <div
        dir="rtl"
        className="font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify cursor-text select-text"
        onMouseUp={handleWordClick}
        dangerouslySetInnerHTML={{ __html: text }}
      />

      {popup && wordData && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-bg border border-gold/30 rounded-xl shadow-2xl p-4 max-w-xs"
          style={{ top: Math.min(popup.y, window.innerHeight - 200), left: Math.max(8, Math.min(popup.x, window.innerWidth - 320)) }}
        >
          <div className="font-arabic text-gold text-lg font-bold mb-2 text-right" dir="rtl">
            {wordData.word}
          </div>

          {wordData.loading ? (
            <p className="font-english text-white/40 text-xs animate-pulse">Looking up...</p>
          ) : wordData.error ? (
            <p className="font-english text-white/40 text-xs italic">{wordData.error}</p>
          ) : (
            <div className="space-y-1.5" dir="ltr">
              {wordData.root && (
                <div className="flex gap-2">
                  <span className="font-english text-white/40 text-xs w-16 flex-shrink-0">Root:</span>
                  <span className="font-arabic text-gold/80 text-sm" dir="rtl">{wordData.root}</span>
                </div>
              )}
              {wordData.pos && (
                <div className="flex gap-2">
                  <span className="font-english text-white/40 text-xs w-16 flex-shrink-0">Type:</span>
                  <span className="font-english text-white/70 text-xs">{wordData.pos}</span>
                </div>
              )}
              {wordData.gloss && (
                <div className="flex gap-2">
                  <span className="font-english text-white/40 text-xs w-16 flex-shrink-0">Gloss:</span>
                  <span className="font-english text-white/85 text-xs leading-5">{wordData.gloss}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gold/15 flex gap-2">
            <a
              href={`/search?q=${encodeURIComponent(wordData.word)}`}
              className="font-english text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/50 px-2 py-1 rounded-md transition-all"
            >
              Search in tafsīr
            </a>
            <button
              onClick={() => { setPopup(null); setWordData(null); }}
              className="font-english text-xs text-white/30 hover:text-white/60 ml-auto"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
