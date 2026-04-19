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

  // Skip opening prayer lines — start commentary at first substantive paragraph
  const niasseClean = niasseBody.replace(/<[^>]+>/g, '');
  // Find where actual commentary begins (after the opening invocation poem)
  const commentaryStart = Math.max(
    niasseClean.indexOf('ينبغي'),
    niasseClean.indexOf('قال'),
    niasseClean.indexOf('وقال'),
    300
  );
  const niasseExcerpt = niasseClean.slice(commentaryStart, commentaryStart + 1200).trim();

  if (verses.length === 0) return (
    <div className="font-english text-xs leading-6 whitespace-pre-wrap" style={{color:'rgba(255,255,255,0.7)'}} dir="ltr">
      {jalalaynText}
    </div>
  );

  return (
    <div className="space-y-2" dir="ltr">
      {verses.map((v) => {
        const isHighlighted = highlightKey === v.key;
        const niasseOpen = openNiasse === v.key;
        const elemId = 'jal-' + v.key.replace(/[\[\]:]/g, '-');

        return (
          <div key={v.key} id={elemId}
            className={'rounded-xl border-2 overflow-hidden transition-all ' + (isHighlighted ? 'border-gold/60' : 'border-blue-900/30')}>

            {/* Verse marker */}
            <div className="flex items-center gap-2 px-3 py-1.5" style={{background:'rgba(30,58,100,0.3)'}}>
              <span className="font-english text-[11px] font-bold" style={{color:'rgba(147,197,253,0.8)'}}>{v.key}</span>
              <span className="font-english text-[10px]" style={{color:'rgba(147,197,253,0.4)'}}>Jalālayn commentary</span>
            </div>

            {/* Jalalayn text */}
            <div className="px-4 py-3 font-english text-xs leading-6" style={{color:'rgba(255,255,255,0.7)', background:'rgba(30,58,100,0.15)'}} dir="ltr">
              {v.content}
            </div>

            {/* Niasse button — styled as primary */}
            <button
              onClick={() => setOpenNiasse(niasseOpen ? null : v.key)}
              className="w-full text-left transition-all"
              style={{
                borderTop: '2px solid rgba(201,168,76,0.5)',
                background: niasseOpen ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.06)',
              }}
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                {/* Gold indicator bar */}
                <div style={{width:3, height:28, background:'#C9A84C', borderRadius:2, flexShrink:0}} />
                <div className="flex-1 min-w-0">
                  {/* Arabic name */}
                  <div className="font-arabic text-base font-bold" dir="rtl"
                    style={{color:'#C9A84C', lineHeight:1.4}}>
                    الشيخ إبراهيم نياس
                  </div>
                  {/* Transliteration + scope */}
                  <div className="font-english text-[11px] mt-0.5" style={{color:'rgba(201,168,76,0.7)'}}>
                    Shaykh Ibrāhīm Niasse · <em>Fī Riyāḍ al-Tafsīr</em> · {verseRange}
                  </div>
                </div>
                <div className="font-english text-xs flex-shrink-0" style={{color:'rgba(201,168,76,0.6)'}}>
                  {niasseOpen ? 'Close ▲' : 'Read ▼'}
                </div>
              </div>
            </button>

            {/* Niasse commentary — expanded */}
            {niasseOpen && (
              <div style={{
                background: 'rgba(201,168,76,0.08)',
                borderTop: '1px solid rgba(201,168,76,0.2)',
              }}>
                {/* Header */}
                <div className="px-4 pt-3 pb-1">
                  <div className="font-english text-[11px] italic" style={{color:'rgba(201,168,76,0.5)'}}>
                    Shaykh Ibrāhīm&apos;s commentary covers the lesson range ({verseRange})
                  </div>
                </div>
                {/* Arabic text */}
                <div className="px-4 pb-4 font-arabic text-base leading-8" dir="rtl"
                  style={{color:'rgba(255,255,255,0.88)'}}>
                  {niasseExcerpt}
                  {niasseClean.length > commentaryStart + 1200 && (
                    <span className="font-english text-[10px] italic ml-2" style={{color:'rgba(201,168,76,0.5)'}}>
                      [continued in the Tafsīr panel]
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
