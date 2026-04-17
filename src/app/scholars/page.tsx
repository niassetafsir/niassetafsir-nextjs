'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ScholarRef {
  lessonId: number;
  lessonTitleEn: string;
  verseRange: string;
  excerpt: string;
  lang: string;
  source: string;
}

type ScholarIndex = Record<string, ScholarRef[]>;

const SCHOLAR_BIO: Record<string, { ar: string; d: string; tradition: string }> = {
  'Al-Bukhārī': { ar: 'البخاري', d: 'd. 256/870', tradition: 'Hadith' },
  'Muslim': { ar: 'مسلم', d: 'd. 261/875', tradition: 'Hadith' },
  'Al-Tirmidhī': { ar: 'الترمذي', d: 'd. 279/892', tradition: 'Hadith' },
  'Abū Dāwūd': { ar: 'أبو داود', d: 'd. 275/889', tradition: 'Hadith' },
  'Al-Nasāʾī': { ar: 'النسائي', d: 'd. 303/915', tradition: 'Hadith' },
  'Ibn Mājah': { ar: 'ابن ماجه', d: 'd. 273/887', tradition: 'Hadith' },
  'Al-Ṭabarī': { ar: 'الطبري', d: 'd. 310/923', tradition: 'Tafsīr' },
  'Al-Qurṭubī': { ar: 'القرطبي', d: 'd. 671/1273', tradition: 'Tafsīr' },
  'Ibn Kathīr': { ar: 'ابن كثير', d: 'd. 774/1373', tradition: 'Tafsīr' },
  'Al-Rāzī': { ar: 'الرازي', d: 'd. 606/1210', tradition: 'Kalām / Tafsīr' },
  'Al-Suyūṭī': { ar: 'السيوطي', d: 'd. 911/1505', tradition: 'Tafsīr / Hadith' },
  'Al-Maḥallī': { ar: 'المحلي', d: 'd. 864/1459', tradition: 'Tafsīr' },
  'Al-Ghazālī': { ar: 'الغزالي', d: 'd. 505/1111', tradition: 'Theology / Sufism' },
  'Ibn ʿArabī': { ar: 'ابن عربي', d: 'd. 638/1240', tradition: 'Sufism / Metaphysics' },
  'Al-Junayd': { ar: 'الجنيد', d: 'd. 298/910', tradition: 'Sufism' },
  'Ibn al-Fāriḍ': { ar: 'ابن الفارض', d: 'd. 632/1235', tradition: 'Sufi Poetry' },
  'Al-Bursawī': { ar: 'البروسوي', d: 'd. 1127/1715', tradition: 'Tafsīr / Sufism' },
  'Aḥmad al-Tijānī': { ar: 'أحمد التجاني', d: 'd. 1230/1815', tradition: 'Tijānī Order' },
  'Sīdī ʿAlī Ḥarāzim': { ar: 'حرازم', d: 'd. 1213/1798', tradition: 'Tijānī Order' },
};

const TRADITION_COLOR: Record<string, string> = {
  'Hadith': 'border-blue-500/30 text-blue-300/70',
  'Tafsīr': 'border-green-500/30 text-green-300/70',
  'Kalām / Tafsīr': 'border-green-500/30 text-green-300/70',
  'Tafsīr / Hadith': 'border-green-500/30 text-green-300/70',
  'Tafsīr / Sufism': 'border-purple-500/30 text-purple-300/70',
  'Theology / Sufism': 'border-purple-500/30 text-purple-300/70',
  'Sufism': 'border-purple-500/30 text-purple-300/70',
  'Sufism / Metaphysics': 'border-purple-500/30 text-purple-300/70',
  'Sufi Poetry': 'border-purple-500/30 text-purple-300/70',
  'Tijānī Order': 'border-gold/30 text-gold/70',
  'Kalām': 'border-amber-500/30 text-amber-300/70',
};

export default function ScholarsPage() {
  const [index, setIndex] = useState<ScholarIndex>({});
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/scholars.json').then(r => r.json()).then(d => { setIndex(d); setLoading(false); });
  }, []);

  const scholars = Object.entries(index)
    .filter(([name]) => !filter || name.toLowerCase().includes(filter.toLowerCase()))
    .sort(([, a], [, b]) => b.length - a.length);

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">فهرس العلماء</h1>
        <p className="font-english text-sm mb-5" style={{color:'rgba(255,255,255,0.4)'}}>
          Scholar & Source Index — every figure cited by Niasse across the tafsīr
        </p>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by name…"
          className="w-full max-w-sm border border-gold/25 rounded-xl px-4 py-2.5 font-english text-sm outline-none focus:border-gold/50 bg-white/5 placeholder-white/20 mx-auto block"
          style={{ color: 'inherit' }}
        />
        {!loading && (
          <p className="font-english text-[11px] mt-1.5" style={{color:'rgba(255,255,255,0.2)'}}>
            {scholars.length} scholars · tap to see lessons
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-center py-12 animate-pulse font-english" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
      ) : (
        <div className="space-y-2">
          {scholars.map(([name, refs]) => {
            const bio = SCHOLAR_BIO[name];
            const tradColor = bio ? (TRADITION_COLOR[bio.tradition] || 'border-white/15 text-white/40') : 'border-white/15 text-white/40';
            const isOpen = expanded === name;
            return (
              <div key={name} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : name)}
                  className="w-full text-left px-4 py-3 hover:bg-gold/5 transition-colors flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-english font-semibold text-sm" style={{color:'rgba(255,255,255,0.85)'}}>{name}</span>
                      {bio && <span className="font-arabic text-xs" dir="rtl" style={{color:'rgba(255,255,255,0.4)'}}>{bio.ar}</span>}
                      {bio && <span className={`font-english text-[10px] px-1.5 py-0.5 rounded border ${tradColor}`}>{bio.tradition}</span>}
                      {bio && <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>{bio.d}</span>}
                    </div>
                  </div>
                  <span className="font-english text-xs text-gold/50 flex-shrink-0">{refs.length} lesson{refs.length !== 1 ? 's' : ''}</span>
                  <span className="text-gold/30 text-xs">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-white/5 border-t border-white/8">
                    {refs.sort((a,b) => a.lessonId - b.lessonId).map((ref, i) => (
                      <Link key={i} href={`/lesson/${ref.lessonId}?panel=tafsir`}
                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-gold/5 transition-colors group">
                        <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {ref.lessonId}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-english text-xs group-hover:text-gold transition-colors" style={{color:'rgba(255,255,255,0.6)'}}>
                            {ref.lessonTitleEn}
                            <span className="ml-2 font-english text-[10px] px-1 py-0.5 rounded border border-white/10" style={{color:'rgba(255,255,255,0.25)'}}>
                              {ref.source}
                            </span>
                          </div>
                          {ref.excerpt && (
                            <p className="font-english text-xs mt-0.5 truncate" style={{color:'rgba(255,255,255,0.3)'}}>{ref.excerpt}</p>
                          )}
                        </div>
                        <span className="text-gold/25 text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
