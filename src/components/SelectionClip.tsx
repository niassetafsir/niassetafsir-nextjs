'use client';
import { useState, useEffect, useRef } from 'react';
import { saveClip, buildCitation } from '@/lib/clips';
import { addBookmark } from '@/lib/bookmarks';

interface SelectionClipProps {
  lessonId: number;
  lessonTitleAr: string;
  lessonTitleEn: string;
  verseRange: string;
}

export default function SelectionClip({ lessonId, lessonTitleAr, lessonTitleEn, verseRange }: SelectionClipProps) {
  const [visible, setVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [lang, setLang] = useState<'ar'|'en'>('en');
  const [clipDone, setClipDone] = useState(false);
  const [bmDone, setBmDone] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const checkSelection = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() || '';
    if (text.length < 8) {
      setVisible(false);
      return;
    }
    const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
    setLang(ar / text.length > 0.35 ? 'ar' : 'en');
    setSelectedText(text);
    setClipDone(false);
    setBmDone(false);
    setVisible(true);
  };

  useEffect(() => {
    // Use selectionchange event — fires on all platforms including iOS
    document.addEventListener('selectionchange', checkSelection);
    // Also mouseup and touchend as backup
    document.addEventListener('mouseup', () => setTimeout(checkSelection, 50));
    document.addEventListener('touchend', () => setTimeout(checkSelection, 200));
    
    // Hide when clicking elsewhere
    const hide = (e: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        const sel = window.getSelection();
        const text = sel?.toString().trim() || '';
        if (!text) setVisible(false);
      }
    };
    document.addEventListener('mousedown', hide);
    document.addEventListener('touchstart', hide as EventListener);
    
    return () => {
      document.removeEventListener('selectionchange', checkSelection);
      document.removeEventListener('mousedown', hide);
      document.removeEventListener('touchstart', hide as EventListener);
    };
  }, []);

  const clip = () => {
    const citation = buildCitation(lessonId, lessonTitleEn, verseRange, lang);
    saveClip({ text: selectedText, language: lang, lessonId, lessonTitleAr, lessonTitleEn, verseRange, citation });
    setClipDone(true);
  };

  const bookmark = () => {
    addBookmark({
      id: `bm-${lessonId}-${Date.now()}`,
      lessonId,
      lessonTitle: lessonTitleEn,
      lessonTitleAr,
      arabicText: lang === 'ar' ? selectedText : '',
      englishText: lang === 'en' ? selectedText : undefined,
    });
    setBmDone(true);
  };

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        background: '#0D1F0A',
        border: '1px solid rgba(201,168,76,0.6)',
        borderRadius: '999px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
      }}
    >
      <button
        onClick={clip}
        style={{
          color: clipDone ? '#C9A84C' : '#E8E8E0',
          fontSize: '12px',
          fontFamily: 'EB Garamond, serif',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
        }}
      >
        {clipDone ? '✓ Clipped' : '📎 Clip & Cite'}
      </button>
      <span style={{ color: 'rgba(201,168,76,0.3)', fontSize: '12px' }}>|</span>
      <button
        onClick={bookmark}
        style={{
          color: bmDone ? '#C9A84C' : '#E8E8E0',
          fontSize: '12px',
          fontFamily: 'EB Garamond, serif',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
        }}
      >
        {bmDone ? '✓ Saved' : '🔖 Bookmark'}
      </button>
      <button
        onClick={() => setVisible(false)}
        style={{ color: 'rgba(232,232,224,0.3)', fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}
      >
        ✕
      </button>
    </div>
  );
}
