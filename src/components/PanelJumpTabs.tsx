'use client';
import MobileLessonDrawer from './MobileLessonDrawer';
import { Lesson } from '@/lib/types';

export default function PanelJumpTabs({ lessonId, lessons }: { lessonId?: number; lessons?: Lesson[] }) {
  const tabs = [
    { label: 'Tafsīr', id: 'panel-tafsir' },
    { label: 'Overview', id: 'panel-overview' },
    // One tab, because there is now one comparison panel: Jalālayn and Rūḥ
    // al-Bayān were merged into ComparativeCommentary (panelId 'compare') so
    // that Niasse's excerpt is not rendered twice on every lesson page.
    { label: 'Comparison', id: 'panel-compare' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      dir="ltr"
      className="sticky top-0 z-40 flex gap-1.5 overflow-x-auto py-2 px-1 mb-2"
      style={{
        background: 'rgba(245,237,214,0.97)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(13,31,10,0.12)',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      {lessonId !== undefined && lessons && <MobileLessonDrawer lessonId={lessonId} lessons={lessons} />}
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => scrollTo(tab.id)}
          className="font-english text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full border transition-all flex-shrink-0"
          style={{
            borderColor: 'rgba(138,109,31,0.35)',
            color: '#8a6d1f',
            background: 'transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
