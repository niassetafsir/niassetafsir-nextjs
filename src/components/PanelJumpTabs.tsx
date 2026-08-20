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
 * lessons rather than within one -- and, since this bar was spending fifty
 * pixels of a page's opening screen on a single button, whatever the page
 * wants on the right. The "All Sūrahs" breadcrumb had its own full-width band
 * directly below this one; it sits here now.
 */
export default function PanelJumpTabs({ lessonId, lessons, trailing }: {
  lessonId?: number;
  lessons?: LessonIndexEntry[];
  trailing?: React.ReactNode;
}) {
  return (
    <div
      dir="ltr"
      className="sticky top-0 z-40 flex items-center gap-1.5 overflow-x-auto py-2 px-1 mb-2"
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
      {trailing && <div className="ml-auto flex-shrink-0 pr-2">{trailing}</div>}
    </div>
  );
}
