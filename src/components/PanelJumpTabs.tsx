'use client';

export default function PanelJumpTabs() {
  const tabs = [
    { label: 'Tafsīr', id: 'panel-tafsir' },
    { label: 'Overview', id: 'panel-overview' },
    { label: 'Audio', id: 'panel-audio' },
    { label: 'Jalālayn', id: 'panel-jalalayn' },
    { label: 'Rūḥ al-Bayān', id: 'panel-ruh' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="sticky top-0 z-40 flex gap-2 overflow-x-auto py-2 px-1 mb-2"
      style={{
        background: 'var(--bg, #1a1008)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => scrollTo(tab.id)}
          className="font-english text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition-all flex-shrink-0"
          style={{
            borderColor: 'rgba(201,168,76,0.3)',
            color: 'rgba(201,168,76,0.85)',
            background: 'transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
