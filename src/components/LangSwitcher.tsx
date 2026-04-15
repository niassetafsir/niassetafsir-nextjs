'use client';
import { useRouter, usePathname } from 'next/navigation';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'ع' },
];

interface LangSwitcherProps {
  current: string;
}

export default function LangSwitcher({ current }: LangSwitcherProps) {
  // For now use localStorage to persist — full i18n routing can be added later
  const setLang = (code: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('site-lang', code);
      window.location.reload();
    }
  };

  return (
    <div className="flex gap-1 items-center" dir="ltr">
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLang(lang.code)}
          className={`font-english text-xs px-2 py-0.5 rounded border transition-all ${
            current === lang.code
              ? 'bg-gold/20 text-gold border-gold/40'
              : 'text-white/35 border-white/15 hover:text-white/55 hover:border-white/30'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
