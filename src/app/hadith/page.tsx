'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HadithRef {
  fnId: string;
  lessonId: number;
  lessonTitleEn: string;
  volRef: string;
  number: string | null;
  book: string;
  snippet: string;
  genre: string;
}

type HadithIndex = Record<string, HadithRef[]>;

const COLLECTION_AR: Record<string, { ar: string; full: string }> = {
  'Al-Bukhārī': { ar: 'البخاري', full: 'Ṣaḥīḥ al-Bukhārī' },
  'Muslim': { ar: 'مسلم', full: 'Ṣaḥīḥ Muslim' },
  'Al-Tirmidhī': { ar: 'الترمذي', full: 'Jāmiʿ al-Tirmidhī' },
  'Abū Dāwūd': { ar: 'أبو داود', full: 'Sunan Abī Dāwūd' },
  'Al-Nasāʾī': { ar: 'النسائي', full: 'Sunan al-Nasāʾī' },
  'Ibn Mājah': { ar: 'ابن ماجه', full: 'Sunan Ibn Mājah' },
  'Aḥmad ibn Ḥanbal': { ar: 'أحمد', full: 'Musnad Aḥmad' },
  'Al-Ṭabarānī': { ar: 'الطبراني', full: 'Al-Muʿjam al-Kabīr' },
  'Al-Ḥākim': { ar: 'الحاكم', full: 'Al-Mustadrak' },
  'Al-Bayhaqī': { ar: 'البيهقي', full: 'Shuʿab al-Īmān' },
  'Al-Dārimī': { ar: 'الدارمي', full: 'Sunan al-Dārimī' },
};

export default function HadithPage() {
  const [index, setIndex] = useState<HadithIndex>({});
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/hadith.json').then(r => r.json()).then(d => { setIndex(d); setLoading(false); });
  }, []);

  const total = Object.values(index).reduce((a, b) => a + b.length, 0);
  const collections = Object.entries(index).sort(([,a],[,b]) => b.length - a.length);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">فهرس الأحاديث</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.45)'}}>
          Hadith Index
        </p>
        <p className="font-english text-xs mb-5" style={{color:'rgba(255,255,255,0.25)'}}>
          {loading ? '…' : `${total} hadith citations across ${collections.length} collections`}
        </p>
      </div>

      {loading ? (
        <p className="text-center py-12 animate-pulse font-english" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
      ) : (
        <div className="flex gap-5">
          {/* Collection list */}
          <div className="w-56 flex-shrink-0 space-y-1.5">
            {collections.map(([name, refs]) => {
              const meta = COLLECTION_AR[name];
              return (
                <button key={name} onClick={() => setActive(active === name ? null : name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                    active === name ? 'border-gold/50 bg-gold/10' : 'border-white/10 hover:border-white/20'
                  }`}>
                  <div className="font-english text-sm font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>{name}</div>
                  {meta && (
                    <div className="font-arabic text-xs" dir="rtl" style={{color:'rgba(255,255,255,0.4)'}}>{meta.ar}</div>
                  )}
                  {meta && (
                    <div className="font-english text-[11px] italic" style={{color:'rgba(255,255,255,0.3)'}}>{meta.full}</div>
                  )}
                  <div className="font-english text-[11px] mt-1 text-gold/60">{refs.length} citation{refs.length!==1?'s':''}</div>
                </button>
              );
            })}
          </div>

          {/* Citations */}
          <div className="flex-1 space-y-2">
            {active ? (
              <>
                <p className="font-english text-xs mb-3" style={{color:'rgba(255,255,255,0.3)'}}>
                  {index[active]?.length} citations from {active} · {COLLECTION_AR[active]?.full}
                </p>
                {(index[active] || []).map((ref, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/footnotes#${ref.fnId}`}
                          className="font-english text-[10px] text-gold/60 hover:text-gold border border-gold/20 px-1.5 py-0.5 rounded transition-colors">
                          Lesson {ref.lessonId} [{ref.fnId.split('-').pop()}]
                        </Link>
                        {ref.number && (
                          <span className="font-english text-[11px] font-semibold text-gold/80">
                            No. {ref.number}
                          </span>
                        )}
                        {ref.volRef && (
                          <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                            {ref.volRef}
                          </span>
                        )}
                      </div>
                    </div>
                    {ref.book && (
                      <p className="font-arabic text-xs mb-1.5" dir="rtl" style={{color:'rgba(255,255,255,0.5)'}}>
                        كتاب {ref.book}
                      </p>
                    )}
                    <p className="font-arabic text-sm leading-7" dir="rtl" style={{color:'rgba(255,255,255,0.7)'}}>
                      {ref.snippet}…
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/lesson/${ref.lessonId}?panel=tafsir`}
                        className="font-english text-[11px] text-white/40 hover:text-gold transition-colors">
                        {ref.lessonTitleEn} →
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-16" style={{color:'rgba(255,255,255,0.3)'}}>
                <p className="font-english text-sm">Select a collection to view citations</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
