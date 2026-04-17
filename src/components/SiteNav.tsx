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

  const RESEARCH_ITEMS: DropdownItem[] = [
  { label: "Verse Concordance", sub: "314 verses, Niasse's commentary", href: "/concordance" },
  { label: "Scholar Index", sub: "Every figure Niasse cites", href: "/scholars" },
  { label: "Glossary", sub: "Key terms in Niasse's vocabulary", href: "/glossary" },
  { label: "Critical Apparatus", sub: "798 footnotes & citations", href: "/footnotes" },
  { label: "Research Clips", sub: "Saved citations & excerpts", href: "/clips" },
  { label: "Bookmarks", sub: "Saved passages", href: "/bookmarks" },
];

const ABOUT_ITEMS: DropdownItem[] = [
    { label: "This Platform", sub: "Digital scholarly edition & research tools", href: "/about" },
    { label: "Shaykh Ibrāhīm Niasse", sub: "Tafsīr tradition in West Africa", href: "/about/shaykh" },
    { label: "The Arabic Text", sub: "Compiler & ten-volume edition", href: "/about/arabic-edition" },
    { label: "Companion Texts", sub: "Jalālayn & Rūḥ al-Bayān", href: "/about/companion-texts" },
    { label: "The Translator", sub: "Amadu Kunateh", href: "/about/translator" },
    { label: "Translator's Note", sub: "Methodology & conventions", href: "/translators-note" },
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
      <Link href="/" className="flex flex-col flex-shrink-0 hover:opacity-80 transition-opacity group">
        <span className="font-arabic text-gold font-bold text-sm leading-tight" dir="rtl">في رياض التفسير</span>
        <span className="font-english text-gold/40 text-[8px] leading-tight tracking-wide group-hover:text-gold/60 transition-colors" dir="ltr">Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</span>
      </Link>

      {/* Nav items */}
      <div className="flex items-center gap-1">
<NavDropdown label="About" items={ABOUT_ITEMS} />
<NavDropdown label="Get Involved" items={CONTRIBUTE_ITEMS} />
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
