'use client';
import { usePathname } from 'next/navigation';

export default function SiteFooter() {
  const pathname = usePathname();
  // Print/PDF-export pages render their own clean, distraction-free
  // document look (see src/app/lesson/[id]/print/page.tsx) -- same opt-out
  // as SiteNav/PersistentNav.
  if (pathname.startsWith('/lesson/') && pathname.endsWith('/print')) return null;

  return (
    <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px', paddingBottom:'12px', paddingLeft:'24px', paddingRight:'24px', background:'transparent'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
        <p className="font-english" style={{fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'0.02em'}}>
          © niassetafsir.org
        </p>
        <p className="font-english" style={{fontSize:'10px', color:'rgba(255,255,255,0.15)'}}>
          niassetafsir.com · niassetafsirproject@gmail.com
        </p>
      </div>
    </footer>
  );
}
