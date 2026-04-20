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
              className="flex flex-col items-center px-3 py-1.5 hover:bg-gold/8 transition-colors border-b border-white/5 last:border-0 text-center"
            >
              <span style={{fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.80)', textTransform:'capitalize', whiteSpace:'nowrap'}}>{item.label}</span>
              {item.sub && <span style={{fontSize:'11px', color:'rgba(255,255,255,0.40)', marginTop:'1px', whiteSpace:'nowrap'}}>{item.sub}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


function LangDropdown({ current, onChange }: { current: Lang; onChange: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const LANG_LABELS: Record<Lang, string> = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 font-english text-xs px-2.5 py-1.5 rounded-md transition-all ${
          open ? 'bg-gold/15 text-gold' : 'text-white/55 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        <span>{LANG_LABELS[current]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-36 bg-bg border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {(['en', 'fr', 'ar'] as Lang[]).map(code => (
            <button
              key={code}
              onClick={() => { onChange(code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 transition-colors border-b border-white/5 last:border-0 ${
                current === code
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/70 hover:bg-gold/8 hover:text-white/90'
              }`}
              style={{fontSize: '13px', fontWeight: current === code ? '600' : '400'}}
            >
              {LANG_LABELS[code]}
            </button>
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

  const PUBLICATIONS_ITEMS: DropdownItem[] = [
  { label: "Order Arabic Edition", sub: "10-volume compiled Arabic edition", href: "/order" },
  { label: "Pre-Order Bilingual Edition", sub: "Register interest · forthcoming", href: "/preorder" },
];

const RESEARCH_ITEMS: DropdownItem[] = [
  { label: "Search", sub: "Full-text across all lessons", href: "/search" },
  { label: "Browse Tools", sub: "Concordance, footnotes, hadith, scholars", href: "/research" },
  { label: "Cite a Passage", sub: "Select text to clip and cite", href: "/clips" },
];

const ABOUT_ITEMS: DropdownItem[] = [
  { label: "The Tafsīr", sub: "Shaykh Ibrāhīm Niasse & the commentary", href: "/about/shaykh" },
  { label: "The Project", sub: "Digital edition, translator, editorial note", href: "/about" },
];

  const CONTRIBUTE_ITEMS: DropdownItem[] = [
    { label: "Feedback", sub: "Share your experience", href: "/get-involved/feedback" },
    { label: "Suggestions", sub: "Ideas for the project", href: "/get-involved/suggestions" },
    { label: "Report an Error", sub: "Flag a textual issue", href: "/get-involved/report-error" },
    { label: "Join the Team", sub: "Transcription & translation", href: "/get-involved/join" },
  ];

  return (
    <nav className="flex items-center justify-between px-5 py-2.5 sticky top-0 z-50 backdrop-blur border-b-0" style={{background:"rgba(13,20,10,0.95)", borderTop:"3px solid #C9A84C", borderBottom:"1px solid rgba(201,168,76,0.2)"}}>
      {/* Logo */}
      <Link href="/" className="flex flex-col flex-shrink-0 hover:opacity-80 transition-opacity group">
        <span className="font-arabic text-gold font-bold text-base leading-tight" dir="rtl" style={{letterSpacing:"-0.01em", textShadow:"0 0 20px rgba(201,168,76,0.3)"}}>في رياض التفسير</span>
        <span className="font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors" dir="ltr">Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</span>
      </Link>

      {/* Nav items */}
      <div className="flex items-center gap-1">
<NavDropdown label="About" items={ABOUT_ITEMS} />
<NavDropdown label="Get Involved" items={CONTRIBUTE_ITEMS} />
        <NavDropdown label="Publications" items={PUBLICATIONS_ITEMS} />
        <NavDropdown label="Research" items={RESEARCH_ITEMS} />
        <Link href="/search" className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all" title="Search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </Link>
        <Link href="/clips" className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all" title="Research Clips">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </Link>
        <Link href="/bookmarks" className="font-english text-xs text-white/45 hover:text-white/75 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-all" title="Bookmarks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </Link>
      </div>

      {/* Right: language dropdown + theme */}
      <div className="flex items-center gap-2 border-l border-white/10 pl-3">
        <span className="font-english text-white/25 text-[10px] hidden sm:block">
          EN · FR · AR
        </span>
        <ThemeToggle />
      </div>
    </nav>
  );
}
