'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PersistentNav() {
  const pathname = usePathname();

  const isRead = pathname.startsWith('/lesson') || pathname.startsWith('/manzil') || pathname === '/read';
  const isListen = pathname.startsWith('/audio');
  const isResearch = pathname.startsWith('/research') || pathname.startsWith('/concordance') ||
    pathname.startsWith('/footnotes') || pathname.startsWith('/hadith') ||
    pathname.startsWith('/scholars') || pathname.startsWith('/themes') ||
    pathname.startsWith('/glossary') || pathname.startsWith('/search') ||
    pathname.startsWith('/clips') || pathname.startsWith('/bookmarks');

  const isHome = pathname === '/';
  const items = [
    { label: 'Home', href: '/', icon: '⌂', active: isHome },
    { label: 'Read', href: '/read', icon: '◎', active: isRead },
    { label: 'Listen', href: '/audio', icon: '♪', active: isListen },
    { label: 'Research', href: '/research', icon: '⊞', active: isResearch },
  ];

  return (
    /* Fixed bottom bar — all screen sizes */
    <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{
        background:'var(--persistent-nav-bg, rgba(10,18,8,0.97))',
        backdropFilter:'blur(12px)',
        borderColor:'rgba(201,168,76,0.15)'
      }}>
      {items.map(item => (
        <Link key={item.label} href={item.href}
          className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-all`}
          style={{
            color: item.active ? '#C9A84C' : 'var(--persistent-nav-text, rgba(255,255,255,0.35))'
          }}>
          <span className="text-base leading-none">{item.icon}</span>
          <span className="font-english text-[10px] leading-none tracking-wide">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
