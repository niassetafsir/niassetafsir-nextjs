'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface DropdownItem {
  label: string;
  sub?: string;
  href: string;
}

// ── Desktop dropdown nav items ────────────────────────────────────

const READ_ITEMS: DropdownItem[] = [
  { label: "Read the Commentary", sub: "Browse by manzil or lesson", href: "/read" },
  { label: "Listen", sub: "Audio recordings of the tafsīr", href: "/audio" },
  { label: "Verse Concordance", sub: "Find any verse in the commentary", href: "/concordance" },
];

const RESEARCH_ITEMS: DropdownItem[] = [
  { label: "Research Platform", sub: "All scholarly tools", href: "/research" },
  { label: "Full-Text Search", sub: "Search Arabic and English", href: "/search" },
  { label: "Footnotes & Citations", sub: "798-footnote apparatus", href: "/footnotes" },
  { label: "Ḥadīth Index", sub: "384 hadith citations", href: "/hadith" },
  { label: "Scholar Index", sub: "Every figure cited", href: "/scholars" },
  { label: "Concordance of Terms", sub: "Key theological terms", href: "/glossary" },
  { label: "Tafsīr Sciences Index", sub: "11-category taxonomy", href: "/themes" },
];

const ABOUT_ITEMS: DropdownItem[] = [
  { label: "The Tafsīr", sub: "Shaykh Ibrāhīm & the commentary", href: "/about/shaykh" },
  { label: "The Project", sub: "Digital edition, translator, editorial note", href: "/about" },
  { label: "Editorial Note", sub: "On the text and apparatus", href: "/editorial-note" },
  { label: "Companion Texts", sub: "Jalālayn & Rūḥ al-Bayān", href: "/about/companion-texts" },
];

const MORE_ITEMS: DropdownItem[] = [
  { label: "Get Involved", sub: "Feedback & contributions", href: "/get-involved" },
  { label: "Publications", sub: "Order Arabic edition", href: "/order" },
  { label: "Pre-Order Bilingual", sub: "Register interest", href: "/preorder" },
  { label: "Bookmarks", sub: "Saved passages", href: "/bookmarks" },
  { label: "Research Clips", sub: "Cited passages", href: "/clips" },
];

// All nav items for mobile overlay
const ALL_SECTIONS = [
  {
    heading: 'Read',
    items: READ_ITEMS,
  },
  {
    heading: 'Research',
    items: RESEARCH_ITEMS,
  },
  {
    heading: 'About',
    items: ABOUT_ITEMS,
  },
  {
    heading: 'More',
    items: MORE_ITEMS,
  },
];

// ── NavDropdown (desktop only) ────────────────────────────────────
function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
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
        className={`flex items-center gap-1 font-english text-sm px-3 py-1.5 rounded-md transition-all ${
          open ? 'bg-gold/15 text-gold' : 'text-white/55 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-bg border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {items.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex flex-col px-4 py-2.5 hover:bg-gold/8 transition-colors border-b border-white/5 last:border-0"
            >
              <span style={{fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.85)'}}>{item.label}</span>
              {item.sub && <span style={{fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'1px'}}>{item.sub}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile full-screen overlay ────────────────────────────────────
function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-white/5 transition-all"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
        <span className="block w-5 h-0.5 bg-gold/70 rounded-full" />
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div
          style={{position:'fixed', inset:0, zIndex:99999, display:'flex', flexDirection:'column', background:'var(--bg, #1a1008)', minHeight:'100vh', minWidth:'100vw'}}
        >
          {/* Overlay header */}
          <div className="flex items-center justify-between px-5 py-3 border-b"
            style={{borderColor: 'rgba(201,168,76,0.2)'}}>
            <div>
              <p className="font-arabic text-gold font-bold text-base" dir="rtl">في رياض التفسير</p>
              <p className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.35)'}}>
                Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white/80 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Scrollable nav content */}
          <div className="flex-1 overflow-y-auto py-4 px-5">
            {ALL_SECTIONS.map((section) => (
              <div key={section.heading} className="mb-6">
                <p className="font-english text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{color: 'rgba(201,168,76,0.6)'}}>
                  {section.heading}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-gold/8 transition-all border border-transparent hover:border-gold/20"
                    >
                      <span className="font-english text-sm font-semibold"
                        style={{color: 'rgba(255,255,255,0.85)'}}>
                        {item.label}
                      </span>
                      {item.sub && (
                        <span className="font-english text-xs mt-0.5"
                          style={{color: 'rgba(255,255,255,0.4)'}}>
                          {item.sub}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Overlay footer */}
          <div className="px-5 py-4 border-t" style={{borderColor:'rgba(201,168,76,0.15)'}}>
            <Link href="/search" onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-english text-sm"
              style={{color:'rgba(255,255,255,0.45)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main SiteNav ──────────────────────────────────────────────────
export default function SiteNav() {
  return (
    <nav className="flex items-center justify-between px-5 py-2.5 sticky top-0 z-50 backdrop-blur border-b-0"
      style={{background:"rgba(13,20,10,0.95)", borderTop:"3px solid #C9A84C", borderBottom:"1px solid rgba(201,168,76,0.2)"}}>

      {/* Logo */}
      <Link href="/" className="flex flex-col flex-shrink-0 hover:opacity-80 transition-opacity group">
        <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl"
          style={{letterSpacing:"-0.01em", textShadow:"0 0 20px rgba(201,168,76,0.3)"}}>
          في رياض التفسير
        </span>
        <span className="font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors" dir="ltr">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
        </span>
      </Link>

      {/* Desktop nav — hidden on mobile */}
      <div className="hidden md:flex items-center gap-1">
        <NavDropdown label="Read" items={READ_ITEMS} />
        <NavDropdown label="Research" items={RESEARCH_ITEMS} />
        <NavDropdown label="About" items={ABOUT_ITEMS} />
        <NavDropdown label="···" items={MORE_ITEMS} />
        <Link href="/search"
          className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all"
          title="Search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </Link>
        <Link href="/clips"
          className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all"
          title="Research Clips">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </Link>
        <Link href="/bookmarks"
          className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all"
          title="Bookmarks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </Link>
      </div>

      {/* Right side — theme toggle + mobile hamburger */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-3">
          <span className="font-english text-white/25 text-[10px]">EN · FR · AR</span>
        </div>
        {/* Theme toggle — always visible */}
        <div className="border-l border-white/10 pl-2 md:pl-3">
          <ThemeToggle />
        </div>
        {/* Mobile hamburger */}
        <MobileNav />
      </div>
    </nav>
  );
}
