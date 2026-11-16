'use client';
import { useRef, type ReactNode } from 'react';

/**
 * One foldable section. Easy to open, easy to close:
 * - while it is open its heading stays pinned under the site bar, with a
 *   "Close" at the right, so it can be shut from anywhere inside it;
 * - folds sharing a `group` behave as an accordion: opening one shuts the
 *   others, so the page never grows into a long scroll;
 * - on closing, the page returns to the heading rather than leaving the
 *   reader stranded further down.
 */
export default function Fold({
  id, group, summary, children, defaultOpen = false, className = '',
}: {
  id?: string;
  group?: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={ref}
      id={id}
      open={defaultOpen}
      data-fold-group={group}
      className={`fold group scroll-mt-24 ${className}`}
      onToggle={e => {
        const el = e.currentTarget;
        if (el.open && group) {
          document.querySelectorAll<HTMLDetailsElement>(`details[data-fold-group="${group}"][open]`)
            .forEach(d => { if (d !== el) d.open = false; });
        }
        if (!el.open) {
          const top = el.getBoundingClientRect().top;
          if (top < 0) el.scrollIntoView({ block: 'start' });
        }
      }}
    >
      <summary className="fold-summary flex items-baseline gap-2 py-2.5 cursor-pointer list-none">
        <span className="flex-1 min-w-0 flex items-baseline gap-2">{summary}</span>
        <span className="shrink-0 font-english text-[12px] text-gold/80 select-none">
          <span className="group-open:hidden text-[15px]" aria-label="Open">›</span>
          <span className="hidden group-open:inline">Close ✕</span>
        </span>
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}
