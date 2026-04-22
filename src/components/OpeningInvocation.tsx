'use client';
import { useState } from 'react';

interface OpeningInvocationProps {
  html: string; // the invocation HTML block
}

export default function OpeningInvocation({ html }: OpeningInvocationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 border-b" style={{borderColor:'rgba(201,168,76,0.1)'}}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 font-english text-xs transition-all"
        style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}
      >
        <span className="flex items-center gap-1.5">
          <span style={{fontSize:'10px'}}>↵</span>
          Opening invocation
        </span>
        <span style={{fontSize:'10px'}}>{open ? '▲ Close' : '▸ View'}</span>
      </button>

      {open && (
        <div
          className="pb-4 font-arabic text-sm leading-8"
          dir="rtl"
          style={{color:'rgba(201,168,76,0.65)'}}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
