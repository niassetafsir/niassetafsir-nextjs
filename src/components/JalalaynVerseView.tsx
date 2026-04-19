'use client';
import { useState, useEffect } from 'react';

interface JalalaynVerseViewProps {
  jalalaynText: string;
  niasseBody: string;
  verseRange: string;
  lessonTitleEn: string;
}

function parseJalalayn(text: string): Array<{key: string; surah: number; verse: number; content: string}> {
  const blocks = text.split(/(\[\d+:\d+\])/);
  const result = [];
  for (let i = 1; i < blocks.length - 1; i += 2) {
    const keyMatch = blocks[i].match(/\[(\d+):(\d+)\]/);
    if (keyMatch) {
      result.push({
        key: blocks[i],
        surah: parseInt(keyMatch[1]),
        verse: parseInt(keyMatch[2]),
        content: blocks[i + 1]?.trim() || '',
      });
    }
  }
  return result;
}

export default function JalalaynVerseView({ jalalaynText, niasseBody, verseRange, lessonTitleEn }: JalalaynVerseViewProps) {
  const [openNiasse, setOpenNiasse] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  
  const verses = parseJalalayn(jalalaynText);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && verses.length > 0) {
      const decoded = decodeURIComponent(q).toLowerCase().slice(0, 20);
      const match = verses.find(v => v.content.toLowerCase().includes(decoded));
      if (match) {
        setHighlightKey(match.key);
        setTimeout(() => {
          const id = 'jal-' + match.key.replace(/[\[\]:]/g, '-');
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
      }
    }
  }, []);
  
  const niasseExcerpt = niasseBody.replace(/<[^>]+>/g, '').slice(0, 1200);
  
  if (verses.length === 0) return (
    <div className="font-english text-xs leading-6 whitespace-pre-wrap" style={{color:'rgba(255,255,255,0.7)'}} dir="ltr">
      {jalalaynText}
    </div>
  );

  return (
    <div className="space-y-1.5" dir="ltr">
      {verses.map((v) => {
        const isHighlighted = highlightKey === v.key;
        const niasseOpen = openNiasse === v.key;
        const elemId = 'jal-' + v.key.replace(/[\[\]:]/g, '-');
        
        return (
          <div key={v.key} id={elemId}
            className={'rounded-lg border transition-all ' + (isHighlighted ? 'border-gold/50 bg-gold/8' : 'border-white/8')}>
            {/* Verse marker */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
              <span className="font-english text-[10px] font-semibold" style={{color:'rgba(201,168,76,0.7)'}}>{v.key}</span>
            </div>
            {/* Jalalayn commentary */}
            <div className="px-3 py-2 font-english text-xs leading-6" style={{color:'rgba(255,255,255,0.7)'}} dir="ltr">
              {v.content}
            </div>
            {/* Niasse expandable block */}
            <div className="border-t border-gold/10">
              <button
                onClick={() => setOpenNiasse(niasseOpen ? null : v.key)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gold/5 transition-colors text-left"
              >
                <span className="font-arabic text-[11px]" dir="rtl" style={{color:'rgba(201,168,76,0.6)'}}>الشيخ إبراهيم نياس</span>
                <span className="font-english text-[10px] italic flex-1" style={{color:'rgba(255,255,255,0.3)'}}>
                  · Commentary on {verseRange}
                </span>
                <span className="text-gold/30 text-[10px]">{niasseOpen ? '▲' : '▼'}</span>
              </button>
              {niasseOpen && (
                <div className="px-3 pb-3 border-t border-gold/8" style={{background:'rgba(201,168,76,0.04)'}}>
                  <p className="font-english text-[10px] mt-2 mb-2 italic" dir="ltr"
                    style={{color:'rgba(255,255,255,0.25)'}}>
                    Shaykh Ibrāhīm&apos;s commentary covers the lesson range ({verseRange})
                  </p>
                  <div className="font-arabic text-sm leading-7" dir="rtl"
                    style={{color:'rgba(255,255,255,0.75)'}}>
                    {niasseExcerpt}
                    {niasseBody.replace(/<[^>]+>/g, '').length > 1200 && (
                      <span className="font-english text-[10px] italic" style={{color:'rgba(255,255,255,0.25)'}}>
                        {' '}[continued in the Tafsīr panel]
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
