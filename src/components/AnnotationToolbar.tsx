'use client';
import { useState, useEffect, useCallback } from 'react';
import { saveAnnotation, buildAnnotationCitation, type HighlightColor } from '@/lib/annotations';

interface AnnotationToolbarProps {
  lessonId: number;
  lessonTitle: string;
  verseRange: string;
  onAnnotationSaved: () => void;
}

const COLORS: { id: HighlightColor; label: string; bg: string; text: string }[] = [
  { id: 'gold',  label: 'Key passage',  bg: 'rgba(201,168,76,0.3)',  text: '#C9A84C' },
  { id: 'blue',  label: 'Question',     bg: 'rgba(60,120,200,0.25)', text: '#7EB5FF' },
  { id: 'green', label: 'Confirmed',    bg: 'rgba(50,140,80,0.25)',  text: '#7EC87E' },
];

export default function AnnotationToolbar({ lessonId, lessonTitle, verseRange, onAnnotationSaved }: AnnotationToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [color, setColor] = useState<HighlightColor>('gold');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() || '';
    if (text.length < 5) { setVisible(false); return; }
    const arChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    setLang(arChars / text.length > 0.3 ? 'ar' : 'en');
    setSelectedText(text);
    setNote('');
    setSaved(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    const onMouseUp = () => setTimeout(checkSelection, 100);
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [checkSelection]);

  const save = () => {
    if (!selectedText) return;
    const citation = buildAnnotationCitation(lessonId, lessonTitle, verseRange);
    saveAnnotation({
      id: `ann-${lessonId}-${Date.now()}`,
      lessonId, lessonTitle, verseRange,
      selectedText, language: lang, color, note,
      flagged: false, timestamp: Date.now(), citation,
    });
    setSaved(true);
    onAnnotationSaved();
    setTimeout(() => { setVisible(false); setSelectedText(''); }, 1200);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '130px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99990,
        background: '#fff',
        border: '1.5px solid #C9A84C',
        borderRadius: '14px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        minWidth: '300px',
        maxWidth: '420px',
        // Desktop only
        display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'block',
      }}
    >
      {/* Selected text preview */}
      <p style={{fontSize:'11px', color:'#888', marginBottom:'8px',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        direction: lang === 'ar' ? 'rtl' : 'ltr'}}>
        {selectedText.slice(0, 60)}{selectedText.length > 60 ? '…' : ''}
      </p>

      {/* Colour picker */}
      <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
        {COLORS.map(c => (
          <button key={c.id}
            onClick={() => setColor(c.id)}
            style={{
              flex:1, padding:'4px 0', borderRadius:'6px', border: color === c.id ? '2px solid ' + c.text : '1.5px solid #ddd',
              background: color === c.id ? c.bg : 'transparent',
              fontSize:'10px', color: c.text, cursor:'pointer', fontFamily:'inherit',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Note input */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add a note (optional)…"
        rows={2}
        style={{
          width:'100%', padding:'6px 8px', borderRadius:'6px',
          border:'1px solid #ddd', fontSize:'12px', fontFamily:'inherit',
          resize:'none', marginBottom:'8px', boxSizing:'border-box',
          color:'#333',
        }}
      />

      {/* Actions */}
      <div style={{display:'flex', gap:'8px'}}>
        <button onClick={save}
          style={{
            flex:1, padding:'7px', borderRadius:'8px', border:'none',
            background: saved ? '#2D7A4F' : '#C9A84C',
            color: saved ? '#fff' : '#1a100a',
            fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit',
          }}>
          {saved ? 'Saved ✓' : 'Save annotation'}
        </button>
        <button onClick={() => setVisible(false)}
          style={{
            padding:'7px 12px', borderRadius:'8px', border:'1px solid #ddd',
            background:'transparent', color:'#999', fontSize:'12px',
            cursor:'pointer', fontFamily:'inherit',
          }}>
          ✕
        </button>
      </div>
    </div>
  );
}
