'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { NAV, activeSection, type NavSection } from '@/lib/nav';

/**
 * The top bar.
 *
 * It used to carry six hand-written lists of its own -- Publications,
 * Research, About, Contribute, Read, More -- which is the third picture of the
 * site src/lib/nav.ts was written to end. They had drifted: "Research"
 * appeared in two of them, "Commentary by Verse" in two more under different
 * hints, and /about/shaykh had not been a route for some time. Everything here
 * now comes from NAV, so a link cannot appear without resolving and a section
 * cannot exist without appearing.
 *
 * Four dropdowns became five sections, and the site reads better for it: By
 * verse and Read were buried inside dropdowns while Publications and
 * Contribute sat at the top level, which put ordering a book above reading the
 * text.
 */

// ── One dropdown ──────────────────────────────────────────────────
function NavDropdown({ section, active }: { section: NavSection; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-1 font-english text-sm px-3 py-1.5 rounded-md transition-all ${
          open || active
            ? 'bg-gold/15 text-gold'
            : 'text-white/55 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        {section.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-60 bg-bg border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {section.children.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="flex flex-col px-4 py-2.5 hover:bg-gold/8 transition-colors border-b border-white/5 last:border-0">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
                {item.hint}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile full-screen sheet ──────────────────────────────────────
function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-white/5 transition-all flex-shrink-0"
        aria-label="Open menu">
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', background: 'var(--overlay-bg, #1a1008)' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
            <div>
              <p className="font-arabic text-gold font-bold text-base" dir="rtl" translate="no">في رياض التفسير</p>
              <p className="font-english text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white/80 transition-all"
              aria-label="Close menu">
              ✕
            </button>
          </div>

          {/* A flat map, not an accordion.
            *
            * Every section used to be a collapsed row you tapped to open,
            * then tapped again to choose: two taps and a guess about what
            * was inside, for a site with five sections and sixteen pages in
            * all. Everything is on screen now, grouped under its section,
            * and one tap goes where the reader is going. The section name is
            * a heading rather than a control, so nothing on this screen
            * does anything except navigate. */}
          <div className="flex-1 overflow-y-auto py-3 px-5" style={{ textAlign: 'left' }}>
            {NAV.map(section => (
              <div key={section.id} className="mb-4 min-w-0">
                <Link href={section.href} onClick={() => setOpen(false)}
                  className="block py-1.5 min-w-0"
                  style={{ borderLeft: '3px solid var(--gold, #C9A84C)', paddingLeft: '10px' }}>
                  <span className="font-english text-sm font-bold block" style={{ color: 'rgba(255,255,255,0.92)' }}>
                    {section.label}
                  </span>
                  <span className="font-english text-[11px] block" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {section.hint}
                  </span>
                </Link>
                <div className="mt-1 min-w-0">
                  {section.children.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className="tap flex items-center min-h-[44px] py-1 pl-[13px] min-w-0 rounded-lg hover:bg-gold/8 transition-colors">
                      <span className="font-english text-[13px] min-w-0" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
            <Link href="/search" onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-english text-sm"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </Link>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}

// ── Main SiteNav ──────────────────────────────────────────────────
export default function SiteNav() {
  const pathname = usePathname();
  // Print/PDF-export pages render their own clean document look (see
  // src/app/lesson/[id]/print/page.tsx); the site nav has no place there,
  // same as PersistentNav already opts out of /lesson/* entirely.
  if (pathname.startsWith('/lesson/') && pathname.endsWith('/print')) return null;

  const active = pathname === '/' ? undefined : activeSection(pathname);

  return (
    // The chrome is not the edition: let it be translated.
    <nav translate="yes" className="sticky top-0 z-50 backdrop-blur border-b-0"
      style={{
        background: 'rgba(13,20,10,0.95)',
        borderTop: '3px solid #C9A84C',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
      }}>

      {/* ── Desktop: one flex row ──────────────────────────────
          This was `grid grid-cols-3`, three rigid thirds. The centre column
          holds five dropdown buttons and needs 493px; a third of an iPad's
          820px portrait viewport is 258px, so it overflowed by 235px, and
          because the document is RTL it overflowed leftward, printing the
          navigation on top of the title in the corner. Landscape hid it
          (a third of 1180px is 393px, still short, but the gap closed
          enough to look intentional), which is why it read as a rotation
          bug. Thirds were never the right constraint: the bar has one item
          that must not shrink (the links), one that is fixed (the toggle)
          and one that can (the title). Flex says exactly that. */}
      <div className="hidden md:flex items-center justify-between gap-3 px-5 py-2.5">
        {/* "EN · FR · AR" sat here as plain text for months. It was never a
            control -- LangSwitcher is rendered nowhere -- so it advertised two
            languages the site does not have and implied the English on the page
            was the edition's. A reader who pressed it, found nothing, and let
            Chrome translate the page instead got al-Takāthur's ʿayn al-yaqīn
            back as "the eyes of the innocent". */}
        <div className="flex items-center gap-2 flex-none">
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-center gap-1 flex-none">
          {NAV.map(section => (
            <NavDropdown key={section.id} section={section} active={active?.id === section.id} />
          ))}
        </div>

        {/* The one element allowed to give way. min-w-0 lets it, and the
            English line truncates rather than pushing the links aside. */}
        <div className="flex justify-end flex-1 min-w-0">
          <Link href="/" className="flex flex-col items-end min-w-0 hover:opacity-80 transition-opacity group">
            <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl" translate="no"
              style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
              في رياض التفسير
            </span>
            <span className="font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors truncate max-w-full" dir="ltr">
              Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
            </span>
          </Link>
        </div>
      </div>

      {/* ── Mobile: hamburger left, logo centre ─────────────── */}
      <div className="flex md:hidden items-center px-4 py-2.5 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <MobileNav />
        </div>
        <Link href="/" className="flex flex-col items-center mx-auto hover:opacity-80 transition-opacity group">
          <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl" translate="no"
            style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
            في رياض التفسير
          </span>
        </Link>
      </div>
    </nav>
  );
}
