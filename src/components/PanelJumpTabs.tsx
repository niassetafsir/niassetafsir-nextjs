'use client';
import MobileLessonDrawer from './MobileLessonDrawer';
import type { LessonIndexEntry } from '@/lib/volumes';

/**
 * The lesson-page top bar.
 *
 * Used to carry scroll-to chips for each panel. Those are gone: the panels are
 * no longer a stack to scroll through, they are four modes chosen in
 * LessonExperience, which sits directly below this and shows all four at once.
 * A chip row pointing at sections that no longer exist as sections would have
 * been two navigations for one page.
 *
 * What remains is the mobile lesson drawer, which is about moving between
 * lessons rather than within one.
 */
export default function PanelJumpTabs({ lessonId, lessons }: { lessonId?: number; lessons?: LessonIndexEntry[] }) {
  return (
    <div
      dir="ltr"
      className="sticky top-0 z-40 flex gap-1.5 overflow-x-auto py-2 px-1 mb-2"
      style={{
        background: 'var(--sticky-bg, rgba(13,31,10,0.97))',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--hairline, rgba(232,232,224,0.12))',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      {lessonId !== undefined && lessons && <MobileLessonDrawer lessonId={lessonId} lessons={lessons} />}
    </div>
  );
}
