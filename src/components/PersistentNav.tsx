'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, activeSection } from '@/lib/nav';

/**
 * The bottom bar, and on a phone the primary navigation.
 *
 * It used to carry its own list of five tabs and its own hand-written
 * active-tab matching, which is why it went on highlighting /concordance,
 * /scholars, /themes and /network after all four routes were deleted. Both come
 * from src/lib/nav.ts now, so a route cannot be in the bar without existing and
 * cannot exist in the table without appearing here.
 */
export default function PersistentNav() {
  const pathname = usePathname();

  // The lesson page has its own navigation -- the drawer and the prev/next card
  // -- and the bar would eat screen height during reading, which on a phone is
  // most of what there is.
  if (pathname.startsWith('/lesson/')) return null;

  const active = activeSection(pathname);
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
      {NAV.map(s => {
        const on = !isHome && active?.id === s.id;
        return (
          <Link key={s.id} href={s.href}
            aria-current={on ? 'page' : undefined}
            /* min-h-[56px] rather than padding alone: this is the primary
               navigation on a phone and every target clears the 44px
               guideline with room for a thumb. */
            className="flex-1 min-h-[56px] flex flex-col items-center justify-center gap-1 py-2 transition-all"
            style={{
              color: on ? 'var(--gold, #C9A84C)' : 'var(--persistent-nav-text, rgba(255,255,255,0.6))',
              fontWeight: on ? 700 : 600,
            }}>
            <span className="text-base leading-none" aria-hidden>{s.icon}</span>
            <span className="font-english text-[10px] leading-none tracking-wide text-center px-0.5">
              {s.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
