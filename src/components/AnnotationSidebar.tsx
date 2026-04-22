'use client';
import { useState, useEffect } from 'react';
import { getAnnotationsForLesson, deleteAnnotation, toggleFlag, exportAnnotationsText, type Annotation } from '@/lib/annotations';

interface AnnotationSidebarProps {
  lessonId: number;
  lessonTitle: string;
  verseRange: string;
  refreshTrigger: number;
}

const COLOR_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  gold:  { bg:'rgba(201,168,76,0.12)',  border:'rgba(201,168,76,0.4)',  text:'#C9A84C' },
  blue:  { bg:'rgba(60,120,200,0.1)',   border:'rgba(60,120,200,0.35)', text:'#7EB5FF' },
  green: { bg:'rgba(50,140,80,0.1)',    border:'rgba(50,140,80,0.35)',  text:'#7EC87E' },
};

const COLOR_LABEL: Record<string, string> = {
  gold:'Key passage', blue:'Question', green:'Confirmed'
};

export default function AnnotationSidebar({ lessonId, lessonTitle, verseRange, refreshTrigger }: AnnotationSidebarProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [exportMsg, setExportMsg] = useState('');

  useEffect(() => {
    setAnnotations(getAnnotationsForLesson(lessonId));
  }, [lessonId, refreshTrigger]);

  const handleDelete = (id: string) => {
    deleteAnnotation(id);
    setAnnotations(getAnnotationsForLesson(lessonId));
  };

  const handleFlag = (id: string) => {
    toggleFlag(id);
    setAnnotations(getAnnotationsForLesson(lessonId));
  };

  const handleExport = () => {
    const text = exportAnnotationsText(lessonId);
    navigator.clipboard?.writeText(text).then(() => {
      setExportMsg('Copied to clipboard');
      setTimeout(() => setExportMsg(''), 2000);
    });
  };

  const handleExportAll = () => {
    const text = exportAnnotationsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'niassetafsir-annotations.txt';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div
      className="hidden md:flex flex-col"
      style={{
        width:'260px', flexShrink:0, borderLeft:'1px solid rgba(201,168,76,0.15)',
        height:'calc(100vh - 56px)', position:'sticky', top:'56px',
        background:'var(--bg, #1a1008)', overflowY:'auto',
      }}
    >
      {/* Header */}
      <div style={{padding:'14px 14px 10px', borderBottom:'1px solid rgba(201,168,76,0.12)'}}>
        <p className="font-english" style={{fontSize:'10px', textTransform:'uppercase',
          letterSpacing:'0.1em', color:'rgba(201,168,76,0.6)', marginBottom:'2px'}}>
          Annotations
        </p>
        <p className="font-english" style={{fontSize:'11px', color:'rgba(255,255,255,0.35)'}}>
          {annotations.length} note{annotations.length !== 1 ? 's' : ''} on this lesson
        </p>
      </div>

      {/* Annotation list */}
      <div style={{flex:1, padding:'10px', overflowY:'auto'}}>
        {annotations.length === 0 ? (
          <div style={{textAlign:'center', paddingTop:'2rem'}}>
            <p className="font-english" style={{fontSize:'11px', color:'rgba(255,255,255,0.2)', fontStyle:'italic'}}>
              Select any text to annotate
            </p>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {annotations.map(ann => {
              const cs = COLOR_STYLE[ann.color] || COLOR_STYLE.gold;
              return (
                <div key={ann.id}
                  style={{
                    background: cs.bg, border:'1px solid ' + cs.border,
                    borderRadius:'10px', padding:'10px',
                  }}>
                  {/* Colour label */}
                  <p className="font-english"
                    style={{fontSize:'9px', color: cs.text, textTransform:'uppercase',
                      letterSpacing:'0.08em', marginBottom:'4px'}}>
                    {COLOR_LABEL[ann.color]}
                    {ann.flagged && <span style={{marginLeft:'6px'}}>⚑ Flagged</span>}
                  </p>
                  {/* Selected text */}
                  <p className="font-english"
                    style={{fontSize:'11px', color:'rgba(255,255,255,0.8)',
                      lineHeight:1.5, marginBottom: ann.note ? '6px' : '8px',
                      direction: ann.language === 'ar' ? 'rtl' : 'ltr',
                      fontFamily: ann.language === 'ar' ? 'Amiri, serif' : 'inherit'}}>
                    {ann.selectedText.slice(0, 120)}{ann.selectedText.length > 120 ? '…' : ''}
                  </p>
                  {/* Note */}
                  {ann.note && (
                    <p className="font-english"
                      style={{fontSize:'11px', color:'rgba(255,255,255,0.55)',
                        fontStyle:'italic', marginBottom:'8px', lineHeight:1.5}}>
                      {ann.note}
                    </p>
                  )}
                  {/* Actions */}
                  <div style={{display:'flex', gap:'6px'}}>
                    <button onClick={() => handleFlag(ann.id)}
                      className="font-english"
                      style={{fontSize:'9px', color:'rgba(255,255,255,0.35)',
                        background:'none', border:'none', cursor:'pointer', padding:0}}>
                      {ann.flagged ? 'Unflag' : '⚑ Flag'}
                    </button>
                    <span style={{color:'rgba(255,255,255,0.15)', fontSize:'9px'}}>·</span>
                    <button onClick={() => handleDelete(ann.id)}
                      className="font-english"
                      style={{fontSize:'9px', color:'rgba(255,100,100,0.5)',
                        background:'none', border:'none', cursor:'pointer', padding:0}}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export footer */}
      {annotations.length > 0 && (
        <div style={{padding:'10px', borderTop:'1px solid rgba(201,168,76,0.12)'}}>
          <button onClick={handleExport}
            className="font-english"
            style={{
              width:'100%', padding:'7px', borderRadius:'8px',
              border:'1px solid rgba(201,168,76,0.3)',
              background:'transparent', color:'rgba(201,168,76,0.7)',
              fontSize:'11px', cursor:'pointer', marginBottom:'6px',
            }}>
            {exportMsg || 'Copy this lesson'}
          </button>
          <button onClick={handleExportAll}
            className="font-english"
            style={{
              width:'100%', padding:'7px', borderRadius:'8px',
              border:'1px solid rgba(255,255,255,0.1)',
              background:'transparent', color:'rgba(255,255,255,0.3)',
              fontSize:'10px', cursor:'pointer',
            }}>
            Export all annotations (.txt)
          </button>
        </div>
      )}
    </div>
  );
}
