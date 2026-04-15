import Link from 'next/link';

export default function SiteNav() {
  return (
    <nav className="flex items-center justify-between px-5 py-3 bg-black/30 border-b border-gold/15 sticky top-0 z-50 backdrop-blur">
      <Link href="/" className="font-arabic text-gold font-bold text-lg hover:text-gold-light transition-colors">
        في رياض التفسير
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/" className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1 rounded-full transition-all">
          ⌂ Home
        </Link>
        <Link href="/introduction" className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1 rounded-full transition-all">
          Introduction
        </Link>
      </div>
    </nav>
  );
}
