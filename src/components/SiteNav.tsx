'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { NAV, OPEN_MENU_EVENT, activeSection, type NavSection } from '@/lib/nav';

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
function NavDropdown({ section, active, alignRight = false }: { section: NavSection; active: boolean; alignRight?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (section.children.length === 0) {
    return (
      <Link href={section.href} aria-current={active ? 'page' : undefined}
        className={`flex items-center font-english text-sm px-3 py-1.5 rounded-md transition-all ${
          active ? 'bg-gold/15 text-gold' : 'text-white/55 hover:text-white/80 hover:bg-white/5'
        }`}>
        {section.label}
      </Link>
    );
  }

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
        // The last two sections open leftward so their panel stays on screen.
        <div dir="ltr" className={`absolute top-full ${alignRight ? 'right-0' : 'left-0'} mt-1 w-64 bg-bg border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden text-left font-english`}>
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

  // The bottom bar's "More" tab opens this sheet. The two components are
  // siblings in the layout with no state between them, and a context
  // provider for one boolean would be more machinery than the job.
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_MENU_EVENT, show);
    return () => window.removeEventListener(OPEN_MENU_EVENT, show);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-white/5 transition-all flex-shrink-0"
        aria-label="Open menu">
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
      </button>

      {/* The sheet is portalled to <body>. Drawn in place it sat inside the
          sticky <nav>, whose backdrop-filter -- and the wrapper's translate --
          make a containing block for fixed descendants, so `inset: 0`
          measured against the 36px hamburger wrapper rather than the
          viewport: a menu 44px wide, links 13px wide, one word per line. */}
      {open && typeof document !== 'undefined' && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Menu" dir="ltr" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', background: 'var(--overlay-bg, #1a1008)' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
            <div>
              <p className="font-wordmark text-gold text-lg" dir="rtl" translate="no">منطق الفيضة</p>
              <p className="font-english text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Shaykh Ibrāhīm Niasse and His School on the Qurʾān
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
                      className="flex w-full items-center min-h-[44px] py-1 pl-[13px] min-w-0 rounded-lg hover:bg-gold/8 transition-colors">
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
        </div>,
        document.body
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
      {/* Left to right, as an English reader scans: the title, then the
          sections in NAV order (By verse first), then the theme toggle. The
          page is dir="rtl" for the Arabic, so this row says dir="ltr" or the
          sections print backwards, About first. The title is the one item
          allowed to give way: min-w-0 lets its English line truncate rather
          than push the sections off the bar on a tablet. */}
      <div dir="ltr" className="hidden md:flex items-center justify-between gap-3 px-5 py-2.5">
        <div className="flex flex-1 min-w-0">
          <Link href="/" className="flex flex-col items-start min-w-0 hover:opacity-80 transition-opacity group">
            <span className="font-wordmark text-gold text-2xl" dir="rtl" translate="no">
              منطق الفيضة
            </span>
            <span className="hidden 2xl:block font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors truncate max-w-full">
              Shaykh Ibrāhīm Niasse and His School on the Qurʾān
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 flex-none">
          {NAV.map((section, i) => (
            <NavDropdown key={section.id} section={section} active={active?.id === section.id}
              alignRight={i >= NAV.length - 2} />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-none">
          <Link href="/search" aria-label="Search"
            className="flex items-center justify-center w-8 h-8 rounded-md text-white/55 hover:text-white/80 hover:bg-white/5 transition-all">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Mobile: hamburger left, logo centre ─────────────── */}
      <div className="flex md:hidden items-center px-4 py-2.5 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <MobileNav />
        </div>
        <Link href="/" className="flex flex-col items-center mx-auto hover:opacity-80 transition-opacity group">
          <span className="font-wordmark text-gold text-2xl" dir="rtl" translate="no">
            منطق الفيضة
          </span>
        </Link>
      </div>
    </nav>
  );
}
