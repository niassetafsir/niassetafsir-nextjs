'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PersistentNav() {
  const pathname = usePathname();
  
  const isRead = pathname.startsWith('/lesson') || pathname.startsWith('/manzil');
  const isListen = pathname.startsWith('/audio');
  const isResearch = pathname.startsWith('/research') || pathname.startsWith('/concordance') ||
    pathname.startsWith('/footnotes') || pathname.startsWith('/hadith') ||
    pathname.startsWith('/scholars') || pathname.startsWith('/themes') ||
    pathname.startsWith('/glossary') || pathname.startsWith('/search') ||
    pathname.startsWith('/clips') || pathname.startsWith('/bookmarks');

  const items = [
    { label: 'Read', href: '/lesson/1', icon: '◎', active: isRead },
    { label: 'Listen', href: '/audio', icon: '♪', active: isListen },
    { label: 'Research', href: '/research', icon: '⊞', active: isResearch },
  ];

  return (
    <>
      {/* Desktop: subtle secondary bar below main nav */}
      <div className="hidden md:flex items-center justify-center gap-1 py-1.5 border-b border-white/6"
        style={{background:'rgba(13,20,10,0.6)', backdropFilter:'blur(8px)'}}>
        {items.map(item => (
          <Link key={item.label} href={item.href}
            className={`font-english text-xs px-5 py-1 rounded-full transition-all ${
              item.active
                ? 'text-gold border border-gold/30 bg-gold/8'
                : 'text-white/35 hover:text-white/60 border border-transparent hover:border-white/10'
            }`}>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile: floating bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10"
        style={{background:'rgba(10,18,8,0.96)', backdropFilter:'blur(12px)'}}>
        {items.map(item => (
          <Link key={item.label} href={item.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all ${
              item.active ? 'text-gold' : 'text-white/30 hover:text-white/55'
            }`}>
            <span className="text-base leading-none">{item.icon}</span>
            <span className="font-english text-[10px] leading-none">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
