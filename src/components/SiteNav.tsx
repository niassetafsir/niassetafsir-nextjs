'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { NAV, activeSection, type NavSection } from '@/lib/nav';

/**
 * The top bar.
 *
 * Its four dropdowns -- About, Contribute, Publications, Research -- and its
 * five-section mobile sheet were two more hand-kept inventories of the site,
 * disagreeing with PersistentNav and with /research about what the top level
 * even was. Both now render src/lib/nav.ts, so there is one answer.
 *
 * The order is the table's order, and it opens on "By verse". A reader arriving
 * at a Qurʾānic archive should meet the āya lookup before the colophon.
 */

function Dropdown({ section, active }: { section: NavSection; active: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link href={section.href}
        aria-current={active ? 'page' : undefined}
        className="font-english text-[13px] px-3 py-2 rounded-lg transition-all inline-flex items-center gap-1"
        style={{ color: active ? 'var(--gold, #C9A84C)' : 'rgba(255,255,255,0.75)', fontWeight: active ? 700 : 500 }}>
        {section.label}
        <span aria-hidden className="text-[9px] opacity-60">▾</span>
      </Link>
      {open && (
        <div className="absolute left-0 top-full pt-1 z-50 min-w-[248px]">
          <div className="rounded-xl border p-1.5 shadow-xl"
            style={{ background: 'rgba(18,26,14,0.99)', borderColor: 'rgba(201,168,76,0.25)' }}>
            {section.children.map(c => (
              <Link key={c.href} href={c.href} onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <span className="font-english block text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                  {c.label}
                </span>
                <span className="font-english block text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {c.hint}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileSheet() {
  const [open, setOpen] = useState(false);
  // The sheet is rendered into document.body rather than in place. It has to
  // be: <nav> carries backdrop-blur, and a backdrop-filter establishes a
  // containing block for position:fixed descendants, so a full-screen overlay
  // declared here resolved against the nav bar instead of the viewport -- it
  // collapsed to 44x44, the size of the close button, and the overflow made
  // the page zoom out on a phone. Sizing it explicitly fixed the height and
  // left it 12px off, because the origin shifts too. A portal removes the
  // problem rather than compensating for it.
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const active = activeSection(pathname);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  // The page behind must not scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}
        className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-lg hover:bg-white/5 transition-all flex-shrink-0">
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
      </button>

      {open && mounted && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Menu"
          /* dir is set here because the portal renders into document.body and
             so inherits the document's direction rather than the dir="ltr" that
             wraps the page content. Without it the whole sheet reads
             right-aligned. The Arabic labels carry their own dir="rtl". */
          dir="ltr"
          className="flex flex-col"
          style={{
            position: 'fixed', inset: 0,
            height: '100dvh',
            zIndex: 99999,
            background: 'var(--overlay-bg, #1a1008)',
          }}>
          <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
            style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
            <p className="font-arabic text-gold font-bold text-base" dir="rtl">في رياض التفسير</p>
            <button onClick={() => setOpen(false)} aria-label="Close menu"
              className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 text-white/60">
              ✕
            </button>
          </div>

          {/* Everything open at once. The previous sheet made each of five
              sections a collapsed accordion, so reaching any page took two taps
              and the site's contents were hidden behind headings on the screen
              where hiding them costs most. */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {NAV.map(s => (
              <div key={s.id} className="mb-5">
                <Link href={s.href} onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 mb-1.5 border"
                  style={{
                    borderColor: active?.id === s.id ? 'var(--gold, #C9A84C)' : 'rgba(201,168,76,0.22)',
                    background: active?.id === s.id ? 'rgba(201,168,76,0.10)' : 'transparent',
                  }}>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-english text-base font-semibold" style={{ color: 'var(--gold, #C9A84C)' }}>
                      {s.label}
                    </span>
                    <span className="font-arabic text-sm" dir="rtl" style={{ color: 'rgba(201,168,76,0.65)' }}>
                      {s.labelAr}
                    </span>
                  </span>
                  <span className="font-english block text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {s.hint}
                  </span>
                </Link>
                {s.children.map(c => (
                  <Link key={c.href} href={c.href} onClick={() => setOpen(false)}
                    className="flex items-center min-h-[48px] px-4 rounded-lg"
                    style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <span className="font-english text-[15px]">{c.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function SiteNav() {
  const pathname = usePathname();
  const active = activeSection(pathname);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur"
      style={{ background: 'rgba(13,20,10,0.95)', borderTop: '3px solid #C9A84C', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-3 items-center px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-english text-white/25 text-[10px]">EN · FR · AR</span>
          <div className="border-l border-white/10 pl-2"><ThemeToggle /></div>
        </div>
        <div className="flex items-center justify-center gap-0.5">
          {NAV.map(s => <Dropdown key={s.id} section={s} active={active?.id === s.id} />)}
        </div>
        <div className="flex justify-end">
          <Link href="/" className="flex flex-col items-end hover:opacity-80 transition-opacity group">
            <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl"
              style={{ letterSpacing: '-0.01em' }}>في رياض التفسير</span>
            <span className="font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors" dir="ltr">
              Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center px-3 py-2 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2"><MobileSheet /></div>
        <Link href="/" className="flex flex-col items-center mx-auto hover:opacity-80 transition-opacity">
          <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl"
            style={{ letterSpacing: '-0.01em' }}>في رياض التفسير</span>
        </Link>
        <div className="absolute right-3 top-1/2 -translate-y-1/2"><ThemeToggle /></div>
      </div>
    </nav>
  );
}
