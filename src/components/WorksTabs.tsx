'use client';
import { useState, type ReactNode } from 'react';

// Views of the same works: by sūra (the default, verse first, as a student
// looks things up), by work, and by date.
export default function WorksTabs({ bySura, byWork, byDate }: { bySura: ReactNode; byWork: ReactNode; byDate?: ReactNode }) {
  const [tab, setTab] = useState<'sura' | 'work' | 'date'>('sura');
  const btn = (id: 'sura' | 'work' | 'date', label: string) => (
    <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
      className="font-english text-[13px] font-semibold rounded-full px-3.5 py-1.5 transition-colors"
      style={{
        border: '1px solid ' + (tab === id ? 'var(--gold, #C9A84C)' : 'rgba(138,109,31,0.28)'),
        background: tab === id ? 'var(--gold, #C9A84C)' : 'transparent',
        color: tab === id ? '#0D1F0A' : 'var(--body-text, rgba(232,232,224,0.85))',
      }}>
      {label}
    </button>
  );
  return (
    <>
      <div role="tablist" aria-label="Arrange by" className="flex gap-1.5 mb-6">
        {btn('sura', 'By sūra')}
        {btn('work', 'By work')}
        {byDate && btn('date', 'By date')}
      </div>
      <div role="tabpanel" hidden={tab !== 'sura'}>{bySura}</div>
      <div role="tabpanel" hidden={tab !== 'work'}>{byWork}</div>
      {byDate && <div role="tabpanel" hidden={tab !== 'date'}>{byDate}</div>}
    </>
  );
}
