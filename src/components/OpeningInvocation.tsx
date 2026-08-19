'use client';
import { useState } from 'react';

interface OpeningInvocationProps {
  html: string; // the invocation HTML block
}

export default function OpeningInvocation({ html }: OpeningInvocationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 border-b" style={{borderColor:'var(--hairline, rgba(13,31,10,0.12))'}}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 font-english text-xs transition-all"
        // 0.75, matching the Layout / Language / Verse labels. At 0.45 this
        // disclosure was legible in principle and invisible in practice, and a
        // control nobody sees is a control that does not exist.
        style={{color:'rgba(26,26,26,0.75)'}}
      >
        <span className="flex items-center gap-1.5">
          <span style={{fontSize:'10px'}}>↵</span>
          Opening invocation
        </span>
        <span style={{fontSize:'10px'}}>{open ? '▲ Close' : '▸ View'}</span>
      </button>

      {open && (
        <div
          className="pb-4 font-arabic-sans text-sm leading-8"
          dir="rtl"
          style={{color:'#8a6d1f'}}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
