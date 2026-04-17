'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { type Lang } from '@/lib/i18n';
import ThemeToggle from '@/components/ThemeToggle';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'ع' },
];

interface DropdownItem {
  label: string;
  sub?: string;
  href: string;
}

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
        className={`flex items-center gap-1 font-english text-xs px-3 py-1.5 rounded-md transition-all ${
          open ? 'bg-gold/15 text-gold' : 'text-white/55 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-bg border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {items.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex flex-col items-center px-3 py-1.5 hover:bg-gold/8 transition-colors border-b border-white/5 last:border-0 text-center"
            >
              <span className="font-english text-[11px] text-white/75 font-medium tracking-wide uppercase">{item.label}</span>
              {item.sub && <span className="font-english text-[10px] text-white/30 mt-0.5 normal-case">{item.sub}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteNav() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('site-lang') as Lang;
    if (stored && ['en', 'fr', 'ar'].includes(stored)) setLang(stored);
  }, []);

  const changeLang = (code: Lang) => {
    setLang(code);
    localStorage.setItem('site-lang', code);
  };

  const ABOUT_ITEMS: DropdownItem[] = [
    { label: "Translator\'s Introduction", sub: "(Amadu Kunateh)", href: "/introduction" },
    { label: "Shaykh Ibrāhīm Niasse", sub: "West African Scholarly Tradition", href: "/introduction" },
    { label: "About This Edition", sub: "", href: "/about" },
    { label: "The Arabic Edition", sub: "Compiler & manuscript", href: "/about#arabic" },
    { label: "Companion Texts", sub: "Jalālayn & Rūḥ al-Bayān", href: "/about#companion" },
  ];

  const CONTRIBUTE_ITEMS: DropdownItem[] = [
    { label: "Feedback", sub: "Share your experience", href: "/get-involved/feedback" },
    { label: "Suggestions", sub: "Ideas for the project", href: "/get-involved/suggestions" },
    { label: "Report an Error", sub: "Flag a textual issue", href: "/get-involved/report-error" },
    { label: "Join the Team", sub: "Transcription & translation", href: "/get-involved/join" },
  ];

  return (
    <nav className="flex items-center justify-between px-5 py-2.5 bg-black/30 border-b border-gold/15 sticky top-0 z-50 backdrop-blur">
      {/* Logo */}
      <Link href="/" className="font-arabic text-gold font-bold text-base hover:text-gold-light transition-colors flex-shrink-0" dir="rtl">
        في رياض التفسير
      </Link>

      {/* Nav items */}
      <div className="flex items-center gap-1">
        <Link href="/" className="font-english text-xs text-white/45 hover:text-white/75 px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
          ⌂
        </Link>
        <NavDropdown label="About" items={ABOUT_ITEMS} />
        <NavDropdown label="Get Involved" items={CONTRIBUTE_ITEMS} />
        <Link href="/search" className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all" title="Search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </Link>
        <Link href="/bookmarks" className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all" title="Bookmarks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </Link>
      </div>

      {/* Right: language + theme */}
      <div className="flex items-center gap-1 border-l border-white/10 pl-3">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => changeLang(l.code)}
            className={`text-xs px-2 py-0.5 rounded border transition-all ${
              lang === l.code
                ? 'bg-gold/20 text-gold border-gold/40 font-semibold'
                : 'text-white/30 border-white/10 hover:text-white/50 hover:border-white/20'
            }`}
          >
            {l.label}
          </button>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  );
}
