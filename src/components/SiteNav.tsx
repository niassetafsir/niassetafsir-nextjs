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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => { setOpen(false); setExpanded({}); }, [pathname]);

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
              <p className="font-arabic text-gold font-bold text-base" dir="rtl">في رياض التفسير</p>
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

          <div className="flex-1 overflow-y-auto py-4 px-5" style={{ textAlign: 'left' }}>
            {NAV.map(section => (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                  className="w-full flex items-center justify-between py-2.5 text-left"
                  style={{ borderLeft: '3px solid var(--gold, #C9A84C)', paddingLeft: '10px' }}>
                  <span className="flex flex-col">
                    <span className="font-english text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {section.label}
                    </span>
                    <span className="font-english text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {section.hint}
                    </span>
                  </span>
                  <span style={{ color: 'var(--gold, #C9A84C)', fontSize: '12px', marginRight: '4px' }}>
                    {expanded[section.id] ? '▾' : '▸'}
                  </span>
                </button>
                {expanded[section.id] && (
                  <div className="space-y-0.5 mt-1 mb-3">
                    {section.children.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                        className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-gold/8 transition-all border border-transparent hover:border-gold/20 text-left">
                        <span className="font-english text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                          {item.label}
                        </span>
                        <span className="font-english text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {item.hint}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
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
    <nav className="sticky top-0 z-50 backdrop-blur border-b-0"
      style={{
        background: 'rgba(13,20,10,0.95)',
        borderTop: '3px solid #C9A84C',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
      }}>

      {/* ── Desktop: 3-column grid ─────────────────────────── */}
      <div className="hidden md:grid grid-cols-3 items-center px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-english text-white/25 text-[10px]">EN · FR · AR</span>
          <div className="border-l border-white/10 pl-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1">
          {NAV.map(section => (
            <NavDropdown key={section.id} section={section} active={active?.id === section.id} />
          ))}
        </div>

        <div className="flex justify-end">
          <Link href="/" className="flex flex-col items-end hover:opacity-80 transition-opacity group">
            <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl"
              style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
              في رياض التفسير
            </span>
            <span className="font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors" dir="ltr">
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
          <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl"
            style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
            في رياض التفسير
          </span>
        </Link>
      </div>
    </nav>
  );
}
