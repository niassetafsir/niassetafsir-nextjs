'use client';
import { useState, useEffect } from 'react';

interface JalalaynVerseViewProps {
  jalalaynText: string;
  niasseBody: string;
  niasseEnglish?: string | null;
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

export default function JalalaynVerseView({ jalalaynText, niasseBody, niasseEnglish, verseRange, lessonTitleEn }: JalalaynVerseViewProps) {
  const [openNiasse, setOpenNiasse] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const verses = parseJalalayn(jalalaynText);
  const hasEnglish = !!niasseEnglish;

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

  // Extract Niasse Arabic commentary (skip opening prayer)
  const niasseClean = niasseBody.replace(/<[^>]+>/g, '');
  const commentaryStart = Math.max(
    niasseClean.indexOf('ينبغي'),
    niasseClean.indexOf('قال'),
    300
  );
  const niasseArExcerpt = niasseClean.slice(commentaryStart, commentaryStart + 1000).trim();

  // Extract English excerpt if available
  const niasseEnClean = niasseEnglish ? niasseEnglish.replace(/<[^>]+>/g, '').slice(0, 1000).trim() : '';

  if (verses.length === 0) return (
    <div className="font-english text-xs leading-6 whitespace-pre-wrap" style={{color:'var(--body-text, rgba(255,255,255,0.75))'}} style={{color:'var(--body-text, rgba(255,255,255,0.7))'}} dir="ltr">
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
            <div className="flex items-center gap-2 px-3 py-1.5" style={{background:'rgba(30,58,100,0.15)'}}>
              <span className="font-english text-[11px] font-bold" style={{color:'rgba(147,197,253,0.8)'}}>{v.key}</span>
              <span className="font-english text-[10px]" style={{color:'rgba(147,197,253,0.4)'}}>Jalālayn</span>
            </div>

            {/* Jalalayn text */}
            <div className="px-4 py-3 font-english text-xs leading-6" style={{color:'rgba(255,255,255,0.7)', background:'rgba(30,58,100,0.15)'}} dir="ltr">
              {v.content}
            </div>

            {/* Niasse trigger button */}
            <button
              onClick={() => setOpenNiasse(niasseOpen ? null : v.key)}
              className="w-full text-left transition-all"
              style={{
                borderTop: '2px solid rgba(201,168,76,0.5)',
                background: niasseOpen ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.06)',
              }}
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <div style={{width:3, height:28, background:'#C9A84C', borderRadius:2, flexShrink:0}} />
                <div className="flex-1 min-w-0">
                  <div className="font-arabic text-base font-bold" dir="rtl" style={{color:'#C9A84C', lineHeight:1.4}}>
                    الشيخ إبراهيم نياس
                  </div>
                  <div className="font-english text-[11px] mt-0.5" style={{color:'rgba(201,168,76,0.7)'}}>
                    Shaykh Ibrāhīm Niasse · <em>Fī Riyāḍ al-Tafsīr</em>
                    {hasEnglish && <span style={{color:'rgba(201,168,76,0.5)'}}> · AR + EN</span>}
                  </div>
                </div>
                <div className="font-english text-xs flex-shrink-0" style={{color:'rgba(201,168,76,0.6)'}}>
                  {niasseOpen ? '✕ Close' : 'Read ▼'}
                </div>
              </div>
            </button>

            {/* Expanded Niasse commentary — bilingual if available */}
            {niasseOpen && (
              <div style={{background:'rgba(201,168,76,0.07)', borderTop:'1px solid rgba(201,168,76,0.2)'}}>
                {/* Header with close */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="font-english text-[11px] italic" style={{color:'rgba(201,168,76,0.5)'}}>
                    Commentary covering {verseRange}
                  </div>
                  <button
                    onClick={() => setOpenNiasse(null)}
                    className="font-english text-[11px] hover:text-gold transition-colors"
                    style={{color:'rgba(201,168,76,0.5)'}}
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Bilingual columns (if English available) or Arabic only */}
                {hasEnglish ? (
                  <div className="grid grid-cols-2 gap-0 pb-4" style={{borderTop:'1px solid rgba(201,168,76,0.1)'}}>
                    {/* Arabic column */}
                    <div className="px-4 pt-3 font-arabic text-sm leading-8" dir="rtl"
                      style={{color:'rgba(255,255,255,0.88)', borderRight:'1px solid rgba(201,168,76,0.15)'}}>
                      {niasseArExcerpt}
                      {niasseClean.length > commentaryStart + 1000 && (
                        <span className="font-english text-[10px] italic" style={{color:'rgba(201,168,76,0.4)'}}>
                          {' '}[continues…]
                        </span>
                      )}
                    </div>
                    {/* English column */}
                    <div className="px-4 pt-3 font-english text-sm leading-7" dir="ltr"
                      style={{color:'rgba(255,255,255,0.75)'}}>
                      {niasseEnClean}
                      {(niasseEnglish || '').replace(/<[^>]+>/g, '').length > 1000 && (
                        <span className="italic text-[10px]" style={{color:'rgba(201,168,76,0.4)'}}>
                          {' '}[continues…]
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pb-4 font-arabic text-sm leading-8" dir="rtl"
                    style={{color:'rgba(255,255,255,0.88)'}}>
                    {niasseArExcerpt}
                    {niasseClean.length > commentaryStart + 1000 && (
                      <span className="font-english text-[10px] italic" style={{color:'rgba(201,168,76,0.4)'}}>
                        {' '}[continues in Tafsīr panel]
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
