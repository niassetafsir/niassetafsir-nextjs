'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VerseRef {
  lessonId: number;
  lessonTitleEn: string;
  verseRange: string;
  source: string;
  excerpt: string;
  volRef?: string;
  anchor?: string | null;
}

interface VerseText {
  ar: string;
  en: string;
}

const SURA_NAMES: Record<number, string> = {
  1:'Al-Fātiḥa',2:'Al-Baqara',3:'Āl ʿImrān',4:'Al-Nisāʾ',5:'Al-Māʾida',
  6:'Al-Anʿām',7:'Al-Aʿrāf',8:'Al-Anfāl',9:'Al-Tawba',10:'Yūnus',
  11:'Hūd',12:'Yūsuf',13:'Al-Raʿd',14:'Ibrāhīm',15:'Al-Ḥijr',16:'Al-Naḥl',
  17:'Al-Isrāʾ',18:'Al-Kahf',19:'Maryam',20:'Ṭāhā',21:'Al-Anbiyāʾ',
  23:'Al-Muʾminūn',24:'Al-Nūr',26:'Al-Shuʿarāʾ',29:'Al-ʿAnkabūt',
  33:'Al-Aḥzāb',36:'Yā Sīn',40:'Ghāfir',43:'Al-Zukhruf',44:'Al-Dukhān',
  52:'Al-Ṭūr',56:'Al-Wāqiʿa',57:'Al-Ḥadīd',74:'Al-Muddaththir',75:'Al-Qiyāma',
  96:'Al-ʿAlaq',
};

function VerseEntry({ entryKey, refs, vt }: { entryKey: string; refs: VerseRef[]; vt?: VerseText }) {
  const [open, setOpen] = useState(false);
  const [sura, verse] = entryKey.split(':').map(Number);
  const suraName = SURA_NAMES[sura] || `Sūra ${sura}`;

  return (
    <div className="border border-gold/15 rounded-lg overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-2.5 hover:bg-gold/5 transition-colors"
        style={{ background: open ? 'rgba(201,168,76,0.07)' : 'transparent' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Reference line */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-english text-gold font-semibold text-sm">Q.{entryKey}</span>
              <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
                {suraName}
              </span>
              <span className="font-english text-[10px] px-1.5 py-0.5 rounded border border-white/10"
                style={{color:'rgba(255,255,255,0.25)'}}>
                {refs.length} ref{refs.length !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Verse text — small, single line when collapsed */}
            {vt && (
              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                <span className="font-arabic leading-5" dir="rtl"
                  style={{fontSize:'11px', color:'rgba(255,255,255,0.5)'}}>
                  ﴿{vt.ar.slice(0, 60)}{vt.ar.length > 60 ? '…' : ''}﴾
                </span>
                {!open && (
                  <span className="font-english italic"
                    style={{fontSize:'10px', color:'rgba(255,255,255,0.3)'}}>
                    {vt.en.slice(0, 55)}{vt.en.length > 55 ? '…' : ''}
                  </span>
                )}
              </div>
            )}
            {/* Full English when open */}
            {vt && open && (
              <p className="font-english italic mt-0.5"
                style={{fontSize:'11px', color:'rgba(255,255,255,0.4)', lineHeight:'1.5'}}>
                {vt.en}
              </p>
            )}
          </div>
          <span className="text-gold/40 text-xs mt-0.5 flex-shrink-0">
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded: lesson references */}
      {open && (
        <div className="divide-y divide-white/5 border-t border-white/8">
          {refs.map((ref, i) => (
            <Link key={i} 
              href={`/lesson/${ref.lessonId}?panel=tafsir${ref.anchor ? '&q=' + encodeURIComponent(ref.anchor) : ''}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold/5 transition-colors group">
              <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0">
                {ref.lessonId}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-english text-xs group-hover:text-gold transition-colors"
                  style={{color:'rgba(255,255,255,0.6)'}}>
                  {ref.lessonTitleEn}
                </span>
                <span className="ml-2 font-english text-[10px] px-1 py-0.5 rounded border border-white/10"
                  style={{color:'rgba(255,255,255,0.25)'}}>
                  {ref.source === 'primary' ? 'Commentary' : 'Cross-reference'}
                </span>
              </div>
              <span className="text-gold/30 text-xs">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConcordancePage() {
  const [concordance, setConcordance] = useState<Record<string, VerseRef[]>>({});
  const [verseText, setVerseText] = useState<Record<string, VerseText>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/concordance.json').then(r => r.json()),
      fetch('/data/verse_text.json').then(r => r.json()),
    ]).then(([conc, vt]) => {
      setConcordance(conc);
      setVerseText(vt);
      setLoading(false);
    });
  }, []);

  const entries = Object.entries(concordance)
    .filter(([key]) => !search || key.includes(search))
    .sort(([a], [b]) => {
      const [as, av] = a.split(':').map(Number);
      const [bs, bv] = b.split(':').map(Number);
      return as !== bs ? as - bs : av - bv;
    });

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1 text-center" dir="rtl">
          فهرس الآيات
        </h1>
        <p className="font-english text-sm text-center mb-5"
          style={{color:'rgba(255,255,255,0.4)'}}>
          Verse Concordance — verses Niasse directly comments on, with cross-references
        </p>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search verse, e.g. 2:255 or 1:"
          className="w-full border border-gold/25 rounded-xl px-4 py-2.5 font-english text-sm outline-none focus:border-gold/50 bg-white/5 placeholder-white/20"
          style={{ color: 'inherit' }}
        />
        {!loading && (
          <p className="font-english text-[11px] mt-1.5 text-center"
            style={{color:'rgba(255,255,255,0.2)'}}>
            {entries.length} verses · tap any row to expand lesson references
          </p>
        )}
      </div>

      {loading ? (
        <p className="font-english text-center py-12 animate-pulse"
          style={{color:'rgba(255,255,255,0.3)'}}>Loading concordance…</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(([key, refs]) => (
            <VerseEntry
              key={key}
              entryKey={key}
              refs={refs}
              vt={verseText[key]}
            />
          ))}
        </div>
      )}
    </main>
  );
}
