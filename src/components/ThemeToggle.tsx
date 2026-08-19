'use client';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // The blocking script in the root layout has already read localStorage and
  // set data-theme before first paint, so read the attribute rather than
  // localStorage: one source of truth, and no second write that could differ
  // from what the page is already painted as. Keep the useState default above
  // in agreement with that script's fallback.
  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'light';
    setTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('site-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="font-english text-xs px-2.5 py-1 rounded-full border border-white/15 text-white/50 hover:text-white/75 hover:border-white/30 transition-all"
    >
      {theme === 'dark' ? '☀' : '◐'}
    </button>
  );
}
