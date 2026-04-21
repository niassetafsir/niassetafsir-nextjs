'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PersistentNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isRead = pathname.startsWith('/lesson') || pathname.startsWith('/manzil') || pathname === '/read';
  const isListen = pathname.startsWith('/audio');
  const isResearch = pathname.startsWith('/research') || pathname.startsWith('/concordance') ||
    pathname.startsWith('/footnotes') || pathname.startsWith('/hadith') ||
    pathname.startsWith('/scholars') || pathname.startsWith('/themes') ||
    pathname.startsWith('/glossary') || pathname.startsWith('/search') ||
    pathname.startsWith('/clips') || pathname.startsWith('/bookmarks');

  const items = [
    { label: 'Home', href: '/', icon: '⌂', active: isHome, colorVar: 'var(--nav-home)' },
    { label: 'Read', href: '/read', icon: '◎', active: isRead, colorVar: 'var(--nav-read)' },
    { label: 'Listen', href: '/audio', icon: '♪', active: isListen, colorVar: 'var(--nav-listen)' },
    { label: 'Research', href: '/research', icon: '⊞', active: isResearch, colorVar: 'var(--nav-research)' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{
        background: 'var(--persistent-nav-bg, rgba(10,18,8,0.97))',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--persistent-nav-border, rgba(201,168,76,0.12))'
      }}>
      {items.map(item => (
        <Link key={item.label} href={item.href}
          className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-all"
          style={{
            color: item.active
              ? item.colorVar
              : 'var(--persistent-nav-text, rgba(255,255,255,0.6))',
            fontWeight: item.active ? '700' : '600',
          }}>
          <span className="text-base leading-none">{item.icon}</span>
          <span className="font-english text-[10px] leading-none tracking-wide font-semibold">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
