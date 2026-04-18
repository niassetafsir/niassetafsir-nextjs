'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', icon: '⌂', label: 'Home' },
  { href: '/lesson/1', icon: '◎', label: 'Read' },
  { href: '/research', icon: '⌕', label: 'Research' },
  { href: '/search', icon: '⌕', label: 'Search', hidden: true },
];

export default function MobileNav() {
  const path = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'rgba(13,31,10,0.97)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(201,168,76,0.2)',
      }}>
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        <Link href="/"
          className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all"
          style={{color: isActive('/') && path === '/' ? '#C9A84C' : 'rgba(255,255,255,0.45)'}}>
          <span className="text-lg">⌂</span>
          <span className="font-english text-[10px]">Home</span>
        </Link>
        <Link href="/lesson/1"
          className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all"
          style={{color: isActive('/lesson') || isActive('/manzil') ? '#C9A84C' : 'rgba(255,255,255,0.45)'}}>
          <span className="text-lg">📖</span>
          <span className="font-english text-[10px]">Read</span>
        </Link>
        <Link href="/research"
          className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all"
          style={{color: isActive('/research') || isActive('/concordance') || isActive('/scholars') || isActive('/footnotes') || isActive('/glossary') || isActive('/themes') || isActive('/hadith') ? '#C9A84C' : 'rgba(255,255,255,0.45)'}}>
          <span className="text-lg">◈</span>
          <span className="font-english text-[10px]">Research</span>
        </Link>
        <Link href="/search"
          className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all"
          style={{color: isActive('/search') ? '#C9A84C' : 'rgba(255,255,255,0.45)'}}>
          <span className="text-lg">🔍</span>
          <span className="font-english text-[10px]">Search</span>
        </Link>
      </div>
    </nav>
  );
}
