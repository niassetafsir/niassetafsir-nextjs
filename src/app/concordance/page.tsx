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

const SURA_NAMES: Record<number, string> = {
  1:'Al-Fātiḥa',2:'Al-Baqara',3:'Āl ʿImrān',4:'Al-Nisāʾ',5:'Al-Māʾida',
  6:'Al-Anʿām',7:'Al-Aʿrāf',8:'Al-Anfāl',9:'Al-Tawba',10:'Yūnus',
  11:'Hūd',12:'Yūsuf',13:'Al-Raʿd',14:'Ibrāhīm',15:'Al-Ḥijr',16:'Al-Naḥl',
  17:'Al-Isrāʾ',18:'Al-Kahf',19:'Maryam',20:'Ṭāhā',24:'Al-Nūr',
  33:'Al-Aḥzāb',36:'Yā Sīn',40:'Ghāfir',42:'Al-Shūrā',48:'Al-Fatḥ',
  57:'Al-Ḥadīd',74:'Al-Muddaththir',75:'Al-Qiyāma',96:'Al-ʿAlaq',
};

export default function ConcordancePage() {
  const [concordance, setConcordance] = useState<Record<string, VerseRef[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/concordance.json')
      .then(r => r.json())
      .then(d => { setConcordance(d); setLoading(false); });
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
        <p className="font-english text-white/50 text-sm text-center mb-6">
          Verse Concordance — every Quranic reference in the tafsīr and commentary
        </p>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by verse reference (e.g. 2:255, 1:)"
          className="w-full bg-white/5 border border-gold/25 rounded-xl px-4 py-3 font-english text-white text-sm outline-none focus:border-gold/60 placeholder-white/25"
          dir="ltr"
        />
        {!loading && (
          <p className="font-english text-white/25 text-xs mt-2 text-center">
            {entries.length} verse references across {Object.keys(concordance).length} unique verses
          </p>
        )}
      </div>

      {loading ? (
        <p className="font-english text-white/30 text-center py-12 animate-pulse">Loading concordance...</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, refs]) => {
            const [sura, verse] = key.split(':').map(Number);
            const suraName = SURA_NAMES[sura] || `Sūra ${sura}`;
            return (
              <div key={key} className="border border-gold/15 rounded-xl overflow-hidden">
                <div className="bg-gold/8 px-4 py-2.5 flex items-center justify-between">
                  <div dir="ltr">
                    <span className="font-english text-gold font-semibold text-sm">Q.{key}</span>
                    <span className="font-english text-white/50 text-xs ml-2">{suraName}</span>
                  </div>
                  <span className="font-english text-white/30 text-xs">{refs.length} reference{refs.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {refs.map((ref, i) => (
                    <Link key={i} href={`/lesson/${ref.lessonId}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gold/5 transition-colors group">
                      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0 mt-0.5">
                        {ref.lessonId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-english text-white/70 text-xs font-medium group-hover:text-gold transition-colors">
                          {ref.lessonTitleEn}
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] border border-white/10 text-white/30">
                            {ref.source === 'jalalayn' ? 'Jalālayn' : 'Niasse'}
                          </span>
                        </div>
                        {ref.excerpt && (
                          <p className="font-english text-white/35 text-xs mt-0.5 truncate">{ref.excerpt}</p>
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
