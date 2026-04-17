'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VerseRef {
  lessonId: number;
  lessonTitleEn: string;
  verseRange: string;
  source: string;
  excerpt: string;
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
      <div className="mb-8">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1 text-center" dir="rtl">
          فهرس الآيات
        </h1>
        <p className="font-english text-sm text-center mb-6" style={{color:'var(--text-muted, rgba(255,255,255,0.5))'}}>
          Verse Concordance — every Quranic reference in the tafsīr and commentary
        </p>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by verse reference, e.g. 2:255 or 1:"
          className="w-full border border-gold/25 rounded-xl px-4 py-3 font-english text-sm outline-none focus:border-gold/60 placeholder-white/25 bg-white/5"
          style={{ color: 'inherit' }}
          dir="ltr"
        />
        {!loading && (
          <p className="font-english text-xs mt-2 text-center" style={{color:'var(--text-muted, rgba(255,255,255,0.25))'}}>
            {entries.length} verse references · {Object.keys(concordance).length} unique verses
          </p>
        )}
      </div>

      {loading ? (
        <p className="font-english text-center py-12 animate-pulse" style={{color:'rgba(255,255,255,0.3)'}}>Loading concordance…</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, refs]) => {
            const [sura, verse] = key.split(':').map(Number);
            const suraName = SURA_NAMES[sura] || `Sūra ${sura}`;
            const vt = verseText[key];
            return (
              <div key={key} className="border border-gold/15 rounded-xl overflow-hidden">
                {/* Verse header */}
                <div className="bg-gold/8 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-english text-gold font-semibold text-sm">Q.{key}</span>
                      <span className="font-english text-xs ml-2" style={{color:'rgba(255,255,255,0.45)'}}>
                        {suraName} · verse {verse}
                      </span>
                    </div>
                    <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.25)'}}>
                      {refs.length} ref{refs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Verse text: Arabic + English */}
                  {vt && (
                    <div className="mt-1.5 space-y-1">
                      <p className="font-arabic text-sm leading-7 text-right" dir="rtl"
                        style={{color:'rgba(255,255,255,0.75)'}}>
                        ﴿{vt.ar}﴾
                      </p>
                      <p className="font-english text-xs italic leading-5"
                        style={{color:'rgba(255,255,255,0.45)'}}>
                        {vt.en}
                      </p>
                    </div>
                  )}
                </div>

                {/* Lesson references */}
                <div className="divide-y divide-white/5">
                  {refs.map((ref, i) => (
                    <Link key={i} href={`/lesson/${ref.lessonId}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gold/5 transition-colors group">
                      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0 mt-0.5">
                        {ref.lessonId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-english text-xs font-medium group-hover:text-gold transition-colors"
                          style={{color:'rgba(255,255,255,0.65)'}}>
                          {ref.lessonTitleEn}
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] border border-white/10"
                            style={{color:'rgba(255,255,255,0.3)'}}>
                            {ref.source === 'jalalayn' ? 'Jalālayn' : ref.source === 'niasse-primary' ? 'Lesson' : 'Niasse'}
                          </span>
                        </div>
                        {ref.excerpt && (
                          <p className="font-english text-xs mt-0.5 truncate"
                            style={{color:'rgba(255,255,255,0.3)'}}>
                            {ref.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
