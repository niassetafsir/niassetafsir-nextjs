'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_BAR, OPEN_MENU_EVENT, activeTab, type MobileTab } from '@/lib/nav';

/**
 * The phone's bottom bar.
 *
 * It used to mirror NAV's five sections. A bar is not a table of
 * contents, though: it holds what a reader does, and Search -- the
 * thing you reach for when you do not know where something lives --
 * was not on it at all, sitting two taps down inside two different
 * sections. It is a tab now, and About, visited once, is not. See
 * MOBILE_BAR in src/lib/nav.ts.
 *
 * Both this and SiteNav read their lists from that file, so a tab
 * cannot point at a route that does not exist -- which is how this
 * bar went on highlighting /concordance, /scholars, /themes and
 * /network months after all four were deleted.
 */

export default function PersistentNav() {
  const pathname = usePathname();

  // The lesson page has its own navigation -- the drawer and the prev/next card
  // -- and the bar would eat screen height during reading, which on a phone is
  // most of what there is.
  if (pathname.startsWith('/lesson/')) return null;

  const active: MobileTab | undefined = activeTab(pathname);
  const isHome = pathname === '/';

  return (
    <nav dir="ltr" aria-label="Sections"
      /* Phones only. On a desktop this repeated SiteNav's own centre row --
         "Research" appeared twice on the same screen -- and ate 56px of a
         viewport that had no shortage of width to put the same links in.
         A phone is the one place it earns its keep, being a thumb's reach
         from the bottom edge where the hamburger is not. */
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{
        background: 'var(--persistent-nav-bg, rgba(10,18,8,0.97))',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--persistent-nav-border, rgba(201,168,76,0.12))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      {MOBILE_BAR.map(t => {
        const on = !isHome && active?.id === t.id;
        /* min-w-0 is load-bearing. A flex item will not shrink below its
           content by default, so five tabs together demanded more than a
           phone's width, the row grew past the viewport, and -- the page
           being RTL -- it dragged the whole document sideways. That was
           the "nav spills over" a reader sees: not the menu misdrawn but
           the page itself pushed off-screen. */
        const cls = 'flex-1 min-w-0 min-h-[56px] flex flex-col items-center justify-center gap-1 py-2 transition-all';
        const style = {
          color: on ? 'var(--gold, #C9A84C)' : 'var(--persistent-nav-text, rgba(255,255,255,0.6))',
          fontWeight: on ? 700 : 600,
        } as React.CSSProperties;
        const inner = (
          <>
            <span className="text-base leading-none" aria-hidden>{t.icon}</span>
            <span className="font-english text-[10px] leading-none tracking-wide text-center px-0.5 truncate max-w-full">
              {t.label}
            </span>
          </>
        );

        // `more` opens the menu rather than navigating, so it is a button.
        // A link to nowhere would read as a destination to a screen reader
        // and would be followed by a crawler.
        if (!t.href) {
          return (
            <button key={t.id} type="button" className={cls} style={style}
              aria-haspopup="dialog"
              onClick={() => window.dispatchEvent(new CustomEvent(OPEN_MENU_EVENT))}>
              {inner}
            </button>
          );
        }

        return (
          <Link key={t.id} href={t.href} aria-current={on ? 'page' : undefined}
            className={cls} style={style}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
