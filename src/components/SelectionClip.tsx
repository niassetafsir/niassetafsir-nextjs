'use client';
import { useState, useEffect, useRef } from 'react';
import { saveClip, isClipped, buildCitation } from '@/lib/clips';

interface SelectionClipProps {
  lessonId: number;
  lessonTitleAr: string;
  lessonTitleEn: string;
  verseRange: string;
  language: 'ar' | 'en';
}

export default function SelectionClip({
  lessonId, lessonTitleAr, lessonTitleEn, verseRange, language
}: SelectionClipProps) {
  const [popup, setPopup] = useState<{text: string; x: number; y: number} | null>(null);
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (!text || text.length < 10) { setPopup(null); return; }
        
        // Check it's from this language's column
        const range = selection?.getRangeAt(0);
        const container = range?.commonAncestorContainer;
        const el = container instanceof Element ? container : container?.parentElement;
        
        // Only show for the relevant column
        const isAr = el?.closest('[dir="rtl"]');
        const isEn = el?.closest('[dir="ltr"]') && !el?.closest('[dir="rtl"]');
        if (language === 'ar' && !isAr) { setPopup(null); return; }
        if (language === 'en' && !isEn) { setPopup(null); return; }
        
        setSaved(isClipped(text));
        setPopup({ text, x: e.clientX, y: e.clientY + window.scrollY });
      }, 10);
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [language]);

  const handleSave = () => {
    if (!popup || saved) return;
    const citation = buildCitation(lessonId, lessonTitleEn, verseRange, language);
    saveClip({
      text: popup.text,
      language,
      lessonId,
      lessonTitleAr,
      lessonTitleEn,
      verseRange,
      citation,
    });
    setSaved(true);
    setFlash(true);
    setTimeout(() => { setFlash(false); setPopup(null); }, 1200);
  };

  if (!popup) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[100] flex items-center gap-2 bg-bg border border-gold/30 rounded-full px-3 py-1.5 shadow-2xl"
      style={{ top: popup.y - 48, left: Math.min(Math.max(popup.x - 80, 8), window.innerWidth - 200) }}
    >
      <button
        onClick={handleSave}
        disabled={saved}
        className={`font-english text-xs font-medium transition-all flex items-center gap-1.5 ${
          saved ? 'text-gold cursor-default' : 'text-white/70 hover:text-gold'
        } ${flash ? 'scale-110' : 'scale-100'}`}
      >
        {saved ? (
          <><span>✓</span><span>Saved to Clips</span></>
        ) : (
          <><span>📎</span><span>Save to Research Clips</span></>
        )}
      </button>
      <button onClick={() => setPopup(null)} className="text-white/25 hover:text-white/50 text-xs ml-1">✕</button>
    </div>
  );
}
