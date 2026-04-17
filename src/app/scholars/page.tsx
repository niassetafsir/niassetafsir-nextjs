'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FootnoteRef {
  fnId: string;
  lessonId: number;
  num: number;
  work: string;
  genre: string;
  arabicSnippet: string;
  enHeader: string;
}

interface BodyRef {
  lessonId: number;
  lessonTitleEn: string;
  snippet: string;
  type: string;
}

type ScholarFootnotes = Record<string, FootnoteRef[]>;
type ScholarBody = Record<string, BodyRef[]>;

const SCHOLAR_BIO: Record<string, { ar: string; d: string; tradition: string }> = {
  'Al-Bukhārī': { ar: 'البخاري', d: 'd. 256/870', tradition: 'Hadith' },
  'Muslim ibn al-Ḥajjāj': { ar: 'مسلم', d: 'd. 261/875', tradition: 'Hadith' },
  'Al-Tirmidhī': { ar: 'الترمذي', d: 'd. 279/892', tradition: 'Hadith' },
  'Abū Dāwūd': { ar: 'أبو داود', d: 'd. 275/889', tradition: 'Hadith' },
  'Al-Nasāʾī': { ar: 'النسائي', d: 'd. 303/915', tradition: 'Hadith' },
  'Ibn Mājah': { ar: 'ابن ماجه', d: 'd. 273/887', tradition: 'Hadith' },
  'Aḥmad ibn Ḥanbal': { ar: 'أحمد', d: 'd. 241/855', tradition: 'Hadith' },
  'Al-Ṭabarānī': { ar: 'الطبراني', d: 'd. 360/971', tradition: 'Hadith' },
  'Al-Bukhārī & Muslim': { ar: 'البخاري ومسلم', d: '', tradition: 'Hadith' },
  'Al-Ṭabarī': { ar: 'الطبري', d: 'd. 310/923', tradition: 'Tafsīr' },
  'Al-Qurṭubī': { ar: 'القرطبي', d: 'd. 671/1273', tradition: 'Tafsīr' },
  'Ibn Kathīr': { ar: 'ابن كثير', d: 'd. 774/1373', tradition: 'Tafsīr' },
  'Al-Suyūṭī & Al-Maḥallī': { ar: 'الجلالين', d: 'd. 911/1505', tradition: 'Tafsīr' },
  'Ismāʿīl Ḥaqqī al-Bursawī': { ar: 'البروسوي', d: 'd. 1127/1715', tradition: 'Tafsīr / Sufism' },
  'Al-Bursawī': { ar: 'البروسوي', d: 'd. 1127/1715', tradition: 'Tafsīr / Sufism' },
  'Al-Ghazālī': { ar: 'الغزالي', d: 'd. 505/1111', tradition: 'Theology / Sufism' },
  'Ibn ʿArabī': { ar: 'ابن عربي', d: 'd. 638/1240', tradition: 'Sufism / Metaphysics' },
  'Al-Junayd': { ar: 'الجنيد', d: 'd. 298/910', tradition: 'Sufism' },
  'Ibn al-Fāriḍ': { ar: 'ابن الفارض', d: 'd. 632/1235', tradition: 'Sufi Poetry' },
  'Aḥmad al-Tijānī': { ar: 'أحمد التجاني', d: 'd. 1230/1815', tradition: 'Tijānī Order' },
  'Sīdī ʿAlī Ḥarāzim': { ar: 'حرازم', d: 'd. 1213/1798', tradition: 'Tijānī Order' },
  'Ibn ʿAṭāʾ Allāh': { ar: 'ابن عطاء الله', d: 'd. 709/1309', tradition: 'Sufism' },
  'Ibn Hishām': { ar: 'ابن هشام', d: 'd. 761/1360', tradition: 'Linguistics' },
  'Ibn Saʿd': { ar: 'ابن سعد', d: 'd. 230/845', tradition: 'History' },
  'Al-Nīsābūrī': { ar: 'النيسابوري', d: 'd. 406/1016', tradition: 'History' },
};

const TRADITION_COLOR: Record<string, string> = {
  'Hadith': 'border-blue-500/30 text-blue-300/70',
  'Tafsīr': 'border-green-500/30 text-green-300/70',
  'Tafsīr / Sufism': 'border-teal-500/30 text-teal-300/70',
  'Theology / Sufism': 'border-amber-500/30 text-amber-300/70',
  'Sufism': 'border-purple-500/30 text-purple-300/70',
  'Sufism / Metaphysics': 'border-purple-500/30 text-purple-300/70',
  'Sufi Poetry': 'border-purple-500/30 text-purple-300/70',
  'Tijānī Order': 'border-gold/30 text-gold/70',
  'Linguistics': 'border-cyan-500/30 text-cyan-300/70',
  'History': 'border-rose-500/30 text-rose-300/70',
};

export default function ScholarsPage() {
  const [fnIndex, setFnIndex] = useState<ScholarFootnotes>({});
  const [bodyIndex, setBodyIndex] = useState<ScholarBody>({});
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/scholar_footnotes.json').then(r => r.json()),
      fetch('/data/scholar_body.json').then(r => r.json()),
    ]).then(([fn, body]) => {
      setFnIndex(fn);
      setBodyIndex(body);
      setLoading(false);
    });
  }, []);

  // Merge all scholars
  const allScholars = Array.from(new Set([...Object.keys(fnIndex), ...Object.keys(bodyIndex)]));
  const filtered = allScholars
    .filter(s => !filter || s.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const aTotal = (fnIndex[a]?.length || 0) + (bodyIndex[a]?.length || 0) * 3;
      const bTotal = (fnIndex[b]?.length || 0) + (bodyIndex[b]?.length || 0) * 3;
      return bTotal - aTotal;
    });

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">فهرس العلماء والمصادر</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.45)'}}>
          Scholar & Source Index
        </p>
        <p className="font-english text-xs mb-5" style={{color:'rgba(255,255,255,0.25)'}}>
          Distinguished by source: Niasse's own citations in the text vs. the compiler's documentary footnotes
        </p>
        <input
          type="text" value={filter} onChange={e => setFilter(e.target.value)}
          placeholder="Filter by name…"
          className="w-full max-w-sm border border-gold/25 rounded-xl px-4 py-2.5 font-english text-sm outline-none focus:border-gold/50 bg-white/5 placeholder-white/20 mx-auto block"
          style={{ color: 'inherit' }}
        />
        {!loading && (
          <p className="font-english text-xs mt-1.5" style={{color:'rgba(255,255,255,0.2)'}}>
            {filtered.length} scholars · tap to expand
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-center py-12 animate-pulse font-english" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(name => {
            const bio = SCHOLAR_BIO[name];
            const tradColor = bio ? (TRADITION_COLOR[bio.tradition] || 'border-white/15 text-white/40') : 'border-white/15 text-white/40';
            const fnRefs = fnIndex[name] || [];
            const bodyRefs = bodyIndex[name] || [];
            const isOpen = expanded === name;

            // Group footnotes by lesson
            const fnByLesson: Record<number, FootnoteRef[]> = {};
            fnRefs.forEach(fn => {
              if (!fnByLesson[fn.lessonId]) fnByLesson[fn.lessonId] = [];
              fnByLesson[fn.lessonId].push(fn);
            });

            return (
              <div key={name} className="border border-white/10 rounded-xl overflow-hidden">
                {/* Header */}
                <button onClick={() => setExpanded(isOpen ? null : name)}
                  className="w-full text-left px-4 py-3 hover:bg-gold/5 transition-colors flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-english font-semibold text-sm" style={{color:'rgba(255,255,255,0.88)'}}>
                        {name}
                      </span>
                      {bio && <span className="font-arabic text-sm" dir="rtl" style={{color:'rgba(255,255,255,0.4)'}}>{bio.ar}</span>}
                      {bio && bio.tradition && (
                        <span className={`font-english text-[11px] px-1.5 py-0.5 rounded border ${tradColor}`}>
                          {bio.tradition}
                        </span>
                      )}
                      {bio && bio.d && <span className="font-english text-[11px]" style={{color:'rgba(255,255,255,0.3)'}}>{bio.d}</span>}
                    </div>
                    <div className="flex gap-3 mt-0.5">
                      {bodyRefs.length > 0 && (
                        <span className="font-english text-[11px]" style={{color:'rgba(201,168,76,0.7)'}}>
                          {bodyRefs.length} in Niasse's text
                        </span>
                      )}
                      {fnRefs.length > 0 && (
                        <span className="font-english text-[11px]" style={{color:'rgba(255,255,255,0.35)'}}>
                          {fnRefs.length} in apparatus
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-gold/30 text-xs">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-white/8 divide-y divide-white/5">

                    {/* Section 1: Niasse's own citations */}
                    {bodyRefs.length > 0 && (
                      <div className="px-4 py-3">
                        <p className="font-english text-[11px] font-semibold mb-2" style={{color:'rgba(201,168,76,0.8)'}}>
                          IN NIASSE'S TEXT — cited by the Shaykh himself
                        </p>
                        <div className="space-y-2">
                          {bodyRefs.sort((a,b) => a.lessonId - b.lessonId).map((ref, i) => (
                            <Link key={i} href={`/lesson/${ref.lessonId}?panel=tafsir`}
                              className="flex items-start gap-3 group hover:bg-gold/5 rounded-lg px-2 py-1.5 transition-colors -mx-2">
                              <div className="w-5 h-5 rounded-full bg-gold/25 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {ref.lessonId}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-english text-xs group-hover:text-gold transition-colors" style={{color:'rgba(255,255,255,0.65)'}}>
                                  {ref.lessonTitleEn}
                                </span>
                                {ref.snippet && (
                                  <p className="font-arabic text-xs mt-0.5 truncate" dir="rtl" style={{color:'rgba(255,255,255,0.3)', fontSize:'13px'}}>
                                    …{ref.snippet}…
                                  </p>
                                )}
                              </div>
                              <span className="text-gold/25 text-xs">→</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 2: Compiler's footnote citations */}
                    {fnRefs.length > 0 && (
                      <div className="px-4 py-3">
                        <p className="font-english text-[11px] font-semibold mb-2" style={{color:'rgba(255,255,255,0.4)'}}>
                          IN THE CRITICAL APPARATUS — documented by the compiler
                        </p>
                        <div className="space-y-1">
                          {Object.entries(fnByLesson)
                            .sort(([a],[b]) => parseInt(a)-parseInt(b))
                            .map(([lessonId, fns]) => (
                            <div key={lessonId} className="flex items-start gap-2">
                              <span className="font-english text-[11px] w-16 flex-shrink-0" style={{color:'rgba(255,255,255,0.3)'}}>
                                Lesson {lessonId}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {fns.map(fn => (
                                  <Link key={fn.fnId} href={`/footnotes#${fn.fnId}`}
                                    className="font-english text-[11px] text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/50 px-1.5 py-0.5 rounded transition-colors"
                                    title={fn.enHeader}>
                                    [{fn.num}]
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="font-english text-[10px] mt-2 italic" style={{color:'rgba(255,255,255,0.2)'}}>
                          Click any [n] to go directly to that footnote in the Critical Apparatus
                        </p>
                      </div>
                    )}
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
