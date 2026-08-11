'use client';
import { useState } from 'react';

interface OpeningInvocationProps {
  html: string; // the invocation HTML block
}

export default function OpeningInvocation({ html }: OpeningInvocationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 border-b" style={{borderColor:'rgba(13,31,10,0.1)'}}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 font-english text-xs transition-all"
        style={{color:'rgba(13,31,10,0.45)'}}
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
