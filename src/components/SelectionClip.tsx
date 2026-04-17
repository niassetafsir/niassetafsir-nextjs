'use client';
import { useState, useEffect, useRef } from 'react';
import { saveClip, isClipped, buildCitation } from '@/lib/clips';
import { addBookmark, isBookmarked } from '@/lib/bookmarks';

interface SelectionClipProps {
  lessonId: number;
  lessonTitleAr: string;
  lessonTitleEn: string;
  verseRange: string;
}

export default function SelectionClip({
  lessonId, lessonTitleAr, lessonTitleEn, verseRange
}: SelectionClipProps) {
  const [popup, setPopup] = useState<{
    text: string; x: number; y: number; lang: 'ar'|'en'
  } | null>(null);
  const [clipSaved, setClipSaved] = useState(false);
  const [bmSaved, setBmSaved] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = (x: number, y: number) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text.length < 8) { setPopup(null); return; }
      const arChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
      const lang: 'ar'|'en' = arChars / text.length > 0.35 ? 'ar' : 'en';
      setClipSaved(isClipped(text));
      setBmSaved(isBookmarked(`${lessonId}-${text.slice(0,20)}`));
      setPopup({ text, lang, x, y });
    };

    const onMouseUp = (e: MouseEvent) => {
      setTimeout(() => show(e.clientX, e.clientY + window.scrollY), 30);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      setTimeout(() => show(t.clientX, t.clientY + window.scrollY), 100);
    };
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown as EventListener);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown as EventListener);
    };
  }, [lessonId]);

  const handleClip = () => {
    if (!popup || clipSaved) return;
    const citation = buildCitation(lessonId, lessonTitleEn, verseRange, popup.lang);
    saveClip({ text: popup.text, language: popup.lang, lessonId, lessonTitleAr, lessonTitleEn, verseRange, citation });
    setClipSaved(true);
  };

  const handleBookmark = () => {
    if (!popup || bmSaved) return;
    addBookmark({
      id: `${lessonId}-${popup.text.slice(0,20)}-${Date.now()}`,
      lessonId,
      lessonTitle: lessonTitleEn,
      lessonTitleAr,
      arabicText: popup.lang === 'ar' ? popup.text : '',
      englishText: popup.lang === 'en' ? popup.text : undefined,
    });
    setBmSaved(true);
  };

  if (!popup) return null;

  const left = Math.max(8, Math.min(popup.x - 110, (typeof window !== 'undefined' ? window.innerWidth : 400) - 240));
  const top = popup.y - 56;

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] flex items-center gap-1 rounded-full px-3 py-2 shadow-2xl border"
      style={{
        top,
        left,
        background: '#0D1F0A',
        borderColor: 'rgba(201,168,76,0.5)',
      }}
    >
      <button
        onClick={handleClip}
        className="font-english text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all"
        style={{ color: clipSaved ? '#C9A84C' : '#E8E8E0' }}
        title="Save to Research Clips with citation"
      >
        📎 {clipSaved ? 'Clipped' : 'Clip & Cite'}
      </button>
      <span style={{color:'rgba(201,168,76,0.3)'}}>|</span>
      <button
        onClick={handleBookmark}
        className="font-english text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all"
        style={{ color: bmSaved ? '#C9A84C' : '#E8E8E0' }}
        title="Bookmark this passage"
      >
        🔖 {bmSaved ? 'Saved' : 'Bookmark'}
      </button>
      <button
        onClick={() => setPopup(null)}
        style={{ color: 'rgba(232,232,224,0.3)', marginLeft: '4px', fontSize: '10px' }}
      >
        ✕
      </button>
    </div>
  );
}
