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

  const checkSelection = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() || '';
    if (text.length < 8) return;
    const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
    setLang(ar / text.length > 0.35 ? 'ar' : 'en');
    setSelectedText(text);
    setClipDone(false);
    setBmDone(false);
    setVisible(true);
  };

  useEffect(() => {
    document.addEventListener('selectionchange', checkSelection);
    document.addEventListener('mouseup', () => setTimeout(checkSelection, 50));
    document.addEventListener('touchend', () => setTimeout(checkSelection, 300));
    return () => {
      document.removeEventListener('selectionchange', checkSelection);
    };
  }, []);

  const clip = () => {
    if (!selectedText) return;
    const citation = buildCitation(lessonId, lessonTitleEn, verseRange, lang);
    saveClip({ text: selectedText, language: lang, lessonId, lessonTitleAr, lessonTitleEn, verseRange, citation });
    setClipDone(true);
    setTimeout(() => setVisible(false), 1500);
  };

  const bookmark = () => {
    if (!selectedText) return;
    addBookmark({
      id: `bm-${lessonId}-${Date.now()}`,
      lessonId,
      lessonTitle: lessonTitleEn,
      lessonTitleAr,
      arabicText: lang === 'ar' ? selectedText : '',
      englishText: lang === 'en' ? selectedText : undefined,
    });
    setBmDone(true);
    setTimeout(() => setVisible(false), 1500);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        background: '#ffffff',
        border: '2px solid #C9A84C',
        borderRadius: '12px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        minWidth: '260px',
        justifyContent: 'center',
      }}
    >
      <button
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); clip(); }}
        style={{
          color: clipDone ? '#7B1C1C' : '#111111',
          fontSize: '14px',
          fontFamily: 'EB Garamond, Georgia, serif',
          fontWeight: '600',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: '16px' }}>📎</span>
        <span>{clipDone ? 'Clipped ✓' : 'Clip & Cite'}</span>
      </button>
      
      <div style={{ width: '1px', height: '24px', background: '#C9A84C', opacity: 0.4 }} />
      
      <button
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); bookmark(); }}
        style={{
          color: bmDone ? '#7B1C1C' : '#111111',
          fontSize: '14px',
          fontFamily: 'EB Garamond, Georgia, serif',
          fontWeight: '600',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: '16px' }}>🔖</span>
        <span>{bmDone ? 'Saved ✓' : 'Bookmark'}</span>
      </button>

      <button
        onPointerDown={() => setVisible(false)}
        style={{
          color: '#999999',
          fontSize: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          marginLeft: '4px',
        }}
      >
        ✕
      </button>
    </div>
  );
}
