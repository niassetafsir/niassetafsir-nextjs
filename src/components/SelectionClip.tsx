'use client';
import { useState, useEffect, useRef } from 'react';
import { saveClip, isClipped, buildCitation } from '@/lib/clips';

interface SelectionClipProps {
  lessonId: number;
  lessonTitleAr: string;
  lessonTitleEn: string;
  verseRange: string;
}

export default function SelectionClip({
  lessonId, lessonTitleAr, lessonTitleEn, verseRange
}: SelectionClipProps) {
  const [popup, setPopup] = useState<{text: string; x: number; y: number; lang: 'ar'|'en'} | null>(null);
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || '';
        if (text.length < 8) { setPopup(null); return; }

        // Detect language from selected text
        const arChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
        const lang = arChars / text.length > 0.4 ? 'ar' : 'en';

        setSaved(isClipped(text));
        setPopup({
          text,
          lang,
          x: Math.min(e.clientX, window.innerWidth - 220),
          y: e.clientY + window.scrollY
        });
      }, 20);
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
  }, []);

  const handleSave = () => {
    if (!popup || saved) return;
    const citation = buildCitation(lessonId, lessonTitleEn, verseRange, popup.lang);
    saveClip({ text: popup.text, language: popup.lang, lessonId, lessonTitleAr, lessonTitleEn, verseRange, citation });
    setSaved(true);
    setFlash(true);
    setTimeout(() => { setFlash(false); setPopup(null); }, 1200);
  };

  if (!popup) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[200] flex items-center gap-2 bg-bg border border-gold/40 rounded-full px-3 py-2 shadow-2xl backdrop-blur"
      style={{ top: popup.y - 52, left: Math.max(8, popup.x - 100) }}
    >
      <button
        onClick={handleSave}
        disabled={saved}
        className={`font-english text-xs font-medium flex items-center gap-1.5 transition-all ${
          saved ? 'text-gold' : 'text-white/80 hover:text-gold'
        } ${flash ? 'scale-110' : ''}`}
      >
        {saved ? '✓ Saved to Clips' : '📎 Save to Research Clips'}
      </button>
      <button onClick={() => setPopup(null)} className="text-white/25 hover:text-white/60 text-xs">✕</button>
    </div>
  );
}
