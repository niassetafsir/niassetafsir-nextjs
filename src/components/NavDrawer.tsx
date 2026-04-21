'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MANZILS = [
  { id: 1, ar: 'المنزل الأول', en: 'First Manzil', href: '/manzil/1', sub: 'Al-Fātiḥa — Al-Nisāʾ' },
  { id: 2, ar: 'المنزل الثاني', en: 'Second Manzil', href: '/manzil/2', sub: 'Al-Māʾida — Al-Tawba' },
  { id: 3, ar: 'المنزل الثالث', en: 'Third Manzil', href: '/manzil/3', sub: 'Yūnus — Al-Naḥl' },
  { id: 4, ar: 'المنزل الرابع', en: 'Fourth Manzil', href: '/manzil/4', sub: 'Al-Isrāʾ — Al-Furqān' },
  { id: 5, ar: 'المنزل الخامس', en: 'Fifth Manzil', href: '/manzil/5', sub: 'Al-Furqān — Al-Aḥzāb' },
  { id: 6, ar: 'المنزل السادس', en: 'Sixth Manzil', href: '/manzil/6', sub: 'Sabaʾ — Al-Ṣaff' },
  { id: 7, ar: 'المنزل السابع', en: 'Seventh Manzil', href: '/manzil/7', sub: 'Al-Jumʿa — Al-Nās' },
];

const PAGES = [
  { label: 'Research', href: '/research' },
  { label: 'Footnotes & Citations', href: '/footnotes' },
  { label: 'Ḥadīth Index', href: '/hadith' },
  { label: 'Scholar Index', href: '/scholars' },
  { label: 'Concordance of Terms', href: '/glossary' },
  { label: 'Order Arabic Edition', href: '/order' },
  { label: 'About', href: '/about' },
];

export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Floating open button — always visible */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        style={{
          position: 'fixed',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9998,
          background: 'rgba(201,168,76,0.15)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: '999px',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
      >
        <span style={{fontSize:'14px', color:'#C9A84C'}}>☰</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        left: open ? 0 : '-320px',
        top: 0, bottom: 0,
        width: '260px',
        zIndex: 9999,
        transition: 'left 0.25s ease',
        background: 'var(--bg, #1a1008)',
        borderRight: '1px solid rgba(201,168,76,0.2)',
        overflowY: 'auto',
        padding: '20px 0',
      }}>
        {/* Header */}
        <div style={{padding:'0 20px 16px', borderBottom:'1px solid rgba(201,168,76,0.15)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <p className="font-arabic" style={{color:'#C9A84C', fontSize:'14px'}}>في رياض التفسير</p>
              <p className="font-english" style={{color:'rgba(255,255,255,0.5)', fontSize:'11px'}}>Navigation</p>
            </div>
            <button onClick={() => setOpen(false)}
              style={{color:'rgba(255,255,255,0.4)', background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}>
              ✕
            </button>
          </div>
        </div>

        {/* Manzil list */}
        <div style={{padding:'12px 0'}}>
          <p className="font-english" style={{padding:'6px 20px', fontSize:'10px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>
            Seven Manzils
          </p>
          {MANZILS.map(m => (
            <Link key={m.id} href={m.href} onClick={() => setOpen(false)}
              style={{
                display:'block', padding:'10px 20px',
                borderLeft: pathname.startsWith(m.href) ? '3px solid #C9A84C' : '3px solid transparent',
                textDecoration:'none',
              }}>
              <p className="font-arabic" style={{color:'rgba(255,255,255,0.85)', fontSize:'14px', textAlign:'right'}}>{m.ar}</p>
              <p className="font-english" style={{color:'rgba(255,255,255,0.4)', fontSize:'11px'}}>{m.en} · {m.sub}</p>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{height:'1px', background:'rgba(201,168,76,0.15)', margin:'8px 0'}} />

        {/* Other pages */}
        <div style={{padding:'8px 0'}}>
          <p className="font-english" style={{padding:'6px 20px', fontSize:'10px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>
            Tools & Pages
          </p>
          {PAGES.map(pg => (
            <Link key={pg.href} href={pg.href} onClick={() => setOpen(false)}
              style={{
                display:'block', padding:'10px 20px',
                borderLeft: pathname === pg.href ? '3px solid #C9A84C' : '3px solid transparent',
                textDecoration:'none',
              }}>
              <p className="font-english" style={{color:'rgba(255,255,255,0.75)', fontSize:'13px'}}>{pg.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
