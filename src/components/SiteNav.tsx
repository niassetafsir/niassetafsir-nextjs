'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type Lang } from '@/lib/i18n';
import ThemeToggle from '@/components/ThemeToggle';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'ع' },
];

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

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-black/30 border-b border-gold/15 sticky top-0 z-50 backdrop-blur">
      {/* Logo / Home — always visible */}
      <Link href="/" className="font-arabic text-gold font-bold text-lg hover:text-gold-light transition-colors flex-shrink-0" dir="rtl">
        في رياض التفسير
      </Link>

      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {/* Home button — visible on mobile too */}
        <Link href="/" className="font-english text-xs text-white/60 hover:text-gold border border-gold/25 hover:border-gold/55 px-2.5 py-1 rounded-full transition-all">
          ⌂
        </Link>
        <Link href="/introduction" className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-2.5 py-1 rounded-full transition-all hidden sm:block">
          {lang === 'ar' ? 'مقدمة' : lang === 'fr' ? 'Intro' : 'Intro'}
        </Link>
        <Link href="/about" className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-2.5 py-1 rounded-full transition-all hidden sm:block">
          {lang === 'ar' ? 'عن' : 'About'}
        </Link>
        <Link href="/get-involved" className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-2.5 py-1 rounded-full transition-all hidden sm:block">
          {lang === 'ar' ? 'شارك' : lang === 'fr' ? 'Participer' : 'Get Involved'}
        </Link>
        <a href="mailto:niassetafsirproject@gmail.com" className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-2.5 py-1 rounded-full transition-all hidden sm:block">
          Contact
        </a>
        {/* Language switcher */}
        <div className="flex gap-1 border-l border-white/10 pl-1.5">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`text-xs px-1.5 py-0.5 rounded border transition-all ${
                lang === l.code
                  ? 'bg-gold/20 text-gold border-gold/40 font-semibold'
                  : 'text-white/35 border-white/15 hover:text-white/55 hover:border-white/25'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
