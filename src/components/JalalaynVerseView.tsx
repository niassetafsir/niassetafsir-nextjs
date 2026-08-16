'use client';
import { useState, useEffect } from 'react';

interface JalalaynVerseViewProps {
  jalalaynText: string;
  jalalaynLang?: 'ar' | 'en';
  sourceLabel?: string;
  sourceLabelAr?: string;
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

export default function JalalaynVerseView({ jalalaynText, jalalaynLang = 'en', sourceLabel = 'Jalālayn', sourceLabelAr, niasseBody, niasseEnglish, verseRange, lessonTitleEn }: JalalaynVerseViewProps) {
  const jalIsArabic = jalalaynLang === 'ar';
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
    <div className={(jalIsArabic ? 'font-arabic-sans text-sm leading-8' : 'font-english text-xs leading-6') + ' whitespace-pre-wrap'}
      style={{color:'rgba(13,31,10,0.85)'}} dir={jalIsArabic ? 'rtl' : 'ltr'}>
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
            <div className="flex items-center gap-2 px-3 py-1.5" style={{background:'rgba(29,78,216,0.08)'}}>
              <span className="font-english text-[11px] font-bold" style={{color:'#1d4ed8'}}>{v.key}</span>
              <span className="font-english text-[10px]" style={{color:'rgba(29,78,216,0.5)'}}>
                {sourceLabelAr ? <span className="font-arabic-sans" dir="rtl">{sourceLabelAr}</span> : sourceLabel}
              </span>
            </div>

            {/* Source commentary text */}
            <div className={(jalIsArabic ? 'font-arabic-sans text-sm leading-8' : 'font-english text-xs leading-6') + ' px-4 py-3'}
              style={{color:'rgba(13,31,10,0.8)', background:'rgba(29,78,216,0.06)'}} dir={jalIsArabic ? 'rtl' : 'ltr'}>
              {v.content}
            </div>

            {/* Niasse trigger button */}
            <button
              onClick={() => setOpenNiasse(niasseOpen ? null : v.key)}
              className="w-full text-left transition-all"
              style={{
                borderTop: '2px solid rgba(138,109,31,0.5)',
                background: niasseOpen ? 'rgba(138,109,31,0.12)' : 'rgba(138,109,31,0.06)',
              }}
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <div style={{width:3, height:28, background:'#8a6d1f', borderRadius:2, flexShrink:0}} />
                <div className="flex-1 min-w-0">
                  <div className="font-arabic-sans text-base font-bold" dir="rtl" style={{color:'#8a6d1f', lineHeight:1.4}}>
                    الشيخ إبراهيم نياس
                  </div>
                  <div className="font-english text-[11px] mt-0.5" style={{color:'rgba(138,109,31,0.8)'}}>
                    Shaykh Ibrāhīm Niasse · <em>Fī Riyāḍ al-Tafsīr</em>
                    {hasEnglish && <span style={{color:'rgba(138,109,31,0.6)'}}> · AR + EN</span>}
                  </div>
                </div>
                <div className="font-english text-xs flex-shrink-0" style={{color:'rgba(138,109,31,0.7)'}}>
                  {niasseOpen ? '✕ Close' : 'Read ▼'}
                </div>
              </div>
            </button>

            {/* Expanded Niasse commentary — bilingual if available */}
            {niasseOpen && (
              <div style={{background:'rgba(138,109,31,0.06)', borderTop:'1px solid rgba(138,109,31,0.2)'}}>
                {/* Header with close */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="font-english text-[11px] italic" style={{color:'rgba(13,31,10,0.5)'}}>
                    Commentary covering {verseRange}
                  </div>
                  <button
                    onClick={() => setOpenNiasse(null)}
                    className="font-english text-[11px] hover:text-gold transition-colors"
                    style={{color:'rgba(138,109,31,0.7)'}}
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Bilingual columns (if English available) or Arabic only */}
                {hasEnglish ? (
                  <div className="grid grid-cols-2 gap-0 pb-4" style={{borderTop:'1px solid rgba(138,109,31,0.15)'}}>
                    {/* Arabic column */}
                    <div className="px-4 pt-3 font-arabic-sans text-sm leading-8" dir="rtl"
                      style={{color:'#0D1F0A', borderRight:'1px solid rgba(138,109,31,0.15)'}}>
                      {niasseArExcerpt}
                      {niasseClean.length > commentaryStart + 1000 && (
                        <span className="font-english text-[10px] italic" style={{color:'rgba(13,31,10,0.4)'}}>
                          {' '}[continues…]
                        </span>
                      )}
                    </div>
                    {/* English column */}
                    <div className="px-4 pt-3 font-english text-sm leading-7" dir="ltr"
                      style={{color:'rgba(13,31,10,0.8)'}}>
                      {niasseEnClean}
                      {(niasseEnglish || '').replace(/<[^>]+>/g, '').length > 1000 && (
                        <span className="italic text-[10px]" style={{color:'rgba(13,31,10,0.4)'}}>
                          {' '}[continues…]
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pb-4 font-arabic-sans text-sm leading-8" dir="rtl"
                    style={{color:'#0D1F0A'}}>
                    {niasseArExcerpt}
                    {niasseClean.length > commentaryStart + 1000 && (
                      <span className="font-english text-[10px] italic" style={{color:'rgba(13,31,10,0.4)'}}>
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
