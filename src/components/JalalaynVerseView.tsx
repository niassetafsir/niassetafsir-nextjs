'use client';
import { useState, useEffect } from 'react';

interface NiasseVerseExcerpt {
  ar: string | null;
  en: string | null;
}

interface JalalaynVerseViewProps {
  jalalaynText: string;
  jalalaynLang?: 'ar' | 'en';
  sourceLabel?: string;
  sourceLabelAr?: string;
  // Per-verse Niasse (Arabic + English) excerpts, keyed by "surah:verse"
  // (e.g. "1:5") -- see src/lib/niasseVerseExcerpt.ts. null/undefined, or a
  // missing key, means no verse-specific excerpt has been hand-curated yet
  // for this lesson/verse; the "read Niasse" trigger is hidden rather than
  // falling back to a generic lesson-wide excerpt shown under every verse,
  // which was the bug this replaces (AK, live-site report, 2026-08-16: the
  // same Niasse excerpt was repeating under every Jalālayn/Rūḥ al-Bayān
  // verse, and its Arabic/English halves didn't correspond to each other).
  niasseByVerse?: Record<string, NiasseVerseExcerpt> | null;
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

export default function JalalaynVerseView({ jalalaynText, jalalaynLang = 'en', sourceLabel = 'Jalālayn', sourceLabelAr, niasseByVerse, verseRange, lessonTitleEn }: JalalaynVerseViewProps) {
  const jalIsArabic = jalalaynLang === 'ar';
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
        const excerpt = niasseByVerse?.[v.key];
        const hasNiasse = !!(excerpt && (excerpt.ar || excerpt.en));

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

            {hasNiasse ? (
              <>
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
                        Shaykh Ibrāhīm Niasse · <em>Fī Riyāḍ al-Tafsīr</em> on {v.key}
                        {excerpt?.en && <span style={{color:'rgba(138,109,31,0.6)'}}> · AR + EN</span>}
                      </div>
                    </div>
                    <div className="font-english text-xs flex-shrink-0" style={{color:'rgba(138,109,31,0.7)'}}>
                      {niasseOpen ? '✕ Close' : 'Read ▼'}
                    </div>
                  </div>
                </button>

                {/* Expanded Niasse commentary — bilingual if available, this verse's excerpt only */}
                {niasseOpen && (
                  <div style={{background:'rgba(138,109,31,0.06)', borderTop:'1px solid rgba(138,109,31,0.2)'}}>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="font-english text-[11px] italic" style={{color:'rgba(13,31,10,0.5)'}}>
                        Commentary on {v.key} (within {verseRange})
                      </div>
                      <button
                        onClick={() => setOpenNiasse(null)}
                        className="font-english text-[11px] hover:text-gold transition-colors"
                        style={{color:'rgba(138,109,31,0.7)'}}
                      >
                        ✕ Close
                      </button>
                    </div>

                    {excerpt?.ar && excerpt?.en ? (
                      <div className="grid grid-cols-2 gap-0 pb-4" style={{borderTop:'1px solid rgba(138,109,31,0.15)'}}>
                        <div className="px-4 pt-3 font-arabic-sans text-sm leading-8 whitespace-pre-line" dir="rtl"
                          style={{color:'#0D1F0A', borderRight:'1px solid rgba(138,109,31,0.15)'}}>
                          {excerpt.ar}
                        </div>
                        <div className="px-4 pt-3 font-english text-sm leading-7 whitespace-pre-line" dir="ltr"
                          style={{color:'rgba(13,31,10,0.8)'}}>
                          {excerpt.en}
                        </div>
                      </div>
                    ) : excerpt?.ar ? (
                      <div className="px-4 pb-4 pt-3 font-arabic-sans text-sm leading-8 whitespace-pre-line" dir="rtl"
                        style={{color:'#0D1F0A', borderTop:'1px solid rgba(138,109,31,0.15)'}}>
                        {excerpt.ar}
                        <div className="font-english text-[10px] italic mt-2" dir="ltr" style={{color:'rgba(13,31,10,0.4)'}}>
                          English translation not yet available for this verse — see the full bilingual Tafsīr panel above for context.
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 pb-4 pt-3 font-english text-sm leading-7" dir="ltr"
                        style={{color:'rgba(13,31,10,0.8)', borderTop:'1px solid rgba(138,109,31,0.15)'}}>
                        {excerpt?.en}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-2 font-english text-[10px] italic"
                style={{color:'rgba(13,31,10,0.35)', borderTop:'1px solid rgba(13,31,10,0.08)'}}>
                Verse-specific Shaykh Ibrāhīm excerpt not yet curated for {v.key} — see the full Tafsīr panel above.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
