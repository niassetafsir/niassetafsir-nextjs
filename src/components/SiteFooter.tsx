'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteFooter() {
  const pathname = usePathname();
  // Print/PDF-export pages render their own clean, distraction-free
  // document look (see src/app/lesson/[id]/print/page.tsx) -- same opt-out
  // as SiteNav/PersistentNav.
  if (pathname.startsWith('/lesson/') && pathname.endsWith('/print')) return null;

  return (
    <footer translate="yes" style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px', paddingBottom:'12px', paddingLeft:'24px', paddingRight:'24px', background:'transparent'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
        <p className="font-english" style={{fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'0.02em'}}>
          © niassetafsir.org
        </p>
        {/* Plain links, so every page has a crawlable path to About and the
            conventions: the menu opens those only on a click. */}
        <nav dir="ltr" className="font-english flex flex-wrap gap-x-3 gap-y-1" style={{fontSize:'11px'}}>
          <Link href="/about" className="hover:text-gold" style={{color:'rgba(255,255,255,0.45)'}}>About</Link>
          <Link href="/translators-note" className="hover:text-gold" style={{color:'rgba(255,255,255,0.45)'}}>Editorial conventions</Link>
          <Link href="/verse" className="hover:text-gold" style={{color:'rgba(255,255,255,0.45)'}}>Find a verse</Link>
          <Link href="/get-involved" className="hover:text-gold" style={{color:'rgba(255,255,255,0.45)'}}>Get in touch</Link>
        </nav>
        <p className="font-english" style={{fontSize:'10px', color:'rgba(255,255,255,0.15)'}}>
          niassetafsir.com · niassetafsirproject@gmail.com
        </p>
      </div>
    </footer>
  );
}
