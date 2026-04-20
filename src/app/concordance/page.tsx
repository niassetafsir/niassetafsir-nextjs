'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface VerseRef {
  lessonId: number;
  lessonTitleEn: string;
  verseRange: string;
  source: string;
  excerpt: string;
  volRef?: string;
  anchor?: string | null;
  panel?: string | null;
}

const ALL_SURAS: [number, string, string][] = [
  [1,'Al-Fātiḥa','الفاتحة'],[2,'Al-Baqara','البقرة'],[3,'Āl ʿImrān','آل عمران'],
  [4,'Al-Nisāʾ','النساء'],[5,'Al-Māʾida','المائدة'],[6,'Al-Anʿām','الأنعام'],
  [7,'Al-Aʿrāf','الأعراف'],[8,'Al-Anfāl','الأنفال'],[9,'Al-Tawba','التوبة'],
  [10,'Yūnus','يونس'],[11,'Hūd','هود'],[12,'Yūsuf','يوسف'],[13,'Al-Raʿd','الرعد'],
  [14,'Ibrāhīm','إبراهيم'],[15,'Al-Ḥijr','الحجر'],[16,'Al-Naḥl','النحل'],
  [17,'Al-Isrāʾ','الإسراء'],[18,'Al-Kahf','الكهف'],[19,'Maryam','مريم'],
  [20,'Ṭāhā','طه'],[21,'Al-Anbiyāʾ','الأنبياء'],[22,'Al-Ḥajj','الحج'],
  [23,'Al-Muʾminūn','المؤمنون'],[24,'Al-Nūr','النور'],[25,'Al-Furqān','الفرقان'],
  [26,'Al-Shuʿarāʾ','الشعراء'],[27,'Al-Naml','النمل'],[28,'Al-Qaṣaṣ','القصص'],
  [29,'Al-ʿAnkabūt','العنكبوت'],[30,'Al-Rūm','الروم'],[31,'Luqmān','لقمان'],
  [32,'Al-Sajda','السجدة'],[33,'Al-Aḥzāb','الأحزاب'],[34,'Sabaʾ','سبأ'],
  [35,'Fāṭir','فاطر'],[36,'Yā Sīn','يس'],[37,'Al-Ṣāffāt','الصافات'],
  [38,'Ṣād','ص'],[39,'Al-Zumar','الزمر'],[40,'Ghāfir','غافر'],
  [41,'Fuṣṣilat','فصلت'],[42,'Al-Shūrā','الشورى'],[43,'Al-Zukhruf','الزخرف'],
  [44,'Al-Dukhān','الدخان'],[45,'Al-Jāthiya','الجاثية'],[46,'Al-Aḥqāf','الأحقاف'],
  [47,'Muḥammad','محمد'],[48,'Al-Fatḥ','الفتح'],[49,'Al-Ḥujurāt','الحجرات'],
  [50,'Qāf','ق'],[51,'Al-Dhāriyāt','الذاريات'],[52,'Al-Ṭūr','الطور'],
  [53,'Al-Najm','النجم'],[54,'Al-Qamar','القمر'],[55,'Al-Raḥmān','الرحمن'],
  [56,'Al-Wāqiʿa','الواقعة'],[57,'Al-Ḥadīd','الحديد'],[58,'Al-Mujādala','المجادلة'],
  [59,'Al-Ḥashr','الحشر'],[60,'Al-Mumtaḥana','الممتحنة'],[61,'Al-Ṣaff','الصف'],
  [62,'Al-Jumuʿa','الجمعة'],[63,'Al-Munāfiqūn','المنافقون'],[64,'Al-Taghābun','التغابن'],
  [65,'Al-Ṭalāq','الطلاق'],[66,'Al-Taḥrīm','التحريم'],[67,'Al-Mulk','الملك'],
  [68,'Al-Qalam','القلم'],[69,'Al-Ḥāqqa','الحاقة'],[70,'Al-Maʿārij','المعارج'],
  [71,'Nūḥ','نوح'],[72,'Al-Jinn','الجن'],[73,'Al-Muzzammil','المزمل'],
  [74,'Al-Muddaththir','المدثر'],[75,'Al-Qiyāma','القيامة'],[76,'Al-Insān','الإنسان'],
  [77,'Al-Mursalāt','المرسلات'],[78,'Al-Nabaʾ','النبأ'],[79,'Al-Nāziʿāt','النازعات'],
  [80,'ʿAbasa','عبس'],[81,'Al-Takwīr','التكوير'],[82,'Al-Infiṭār','الانفطار'],
  [83,'Al-Muṭaffifīn','المطففين'],[84,'Al-Inshiqāq','الانشقاق'],[85,'Al-Burūj','البروج'],
  [86,'Al-Ṭāriq','الطارق'],[87,'Al-Aʿlā','الأعلى'],[88,'Al-Ghāshiya','الغاشية'],
  [89,'Al-Fajr','الفجر'],[90,'Al-Balad','البلد'],[91,'Al-Shams','الشمس'],
  [92,'Al-Layl','الليل'],[93,'Al-Ḍuḥā','الضحى'],[94,'Al-Sharḥ','الشرح'],
  [95,'Al-Tīn','التين'],[96,'Al-ʿAlaq','العلق'],[97,'Al-Qadr','القدر'],
  [98,'Al-Bayyina','البينة'],[99,'Al-Zalzala','الزلزلة'],[100,'Al-ʿĀdiyāt','العاديات'],
  [101,'Al-Qāriʿa','القارعة'],[102,'Al-Takāthur','التكاثر'],[103,'Al-ʿAṣr','العصر'],
  [104,'Al-Humaza','الهمزة'],[105,'Al-Fīl','الفيل'],[106,'Quraysh','قريش'],
  [107,'Al-Māʿūn','الماعون'],[108,'Al-Kawthar','الكوثر'],[109,'Al-Kāfirūn','الكافرون'],
  [110,'Al-Naṣr','النصر'],[111,'Al-Masad','المسد'],[112,'Al-Ikhlāṣ','الإخلاص'],
  [113,'Al-Falaq','الفلق'],[114,'Al-Nās','الناس'],
];

export default function ConcordancePage() {
  const [concordance, setConcordance] = useState<Record<string, VerseRef[]>>({});
  const [search, setSearch] = useState('');
  const [activeSura, setActiveSura] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/data/concordance.json').then(r => r.json()).then(d => {
      setConcordance(d);
      setLoading(false);
    });
  }, []);

  // Build surah → verses map
  const suraVerses: Record<number, string[]> = {};
  Object.keys(concordance).forEach(key => {
    const [s] = key.split(':').map(Number);
    if (!suraVerses[s]) suraVerses[s] = [];
    suraVerses[s].push(key);
  });

  // Sort verses within each sura
  Object.keys(suraVerses).forEach(s => {
    suraVerses[Number(s)].sort((a, b) => {
      const [, av] = a.split(':').map(Number);
      const [, bv] = b.split(':').map(Number);
      return av - bv;
    });
  });

  // Search: filter verses matching input
  const searchResults: Array<{key: string; refs: VerseRef[]; sura: number; verse: number}> = [];
  if (search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    Object.entries(concordance).forEach(([key, refs]) => {
      const [s, v] = key.split(':').map(Number);
      const suraName = ALL_SURAS[s-1]?.[1] || '';
      const matchKey = `Q. ${key}`.toLowerCase().includes(q) ||
                       `${s}:${v}`.includes(q) ||
                       suraName.toLowerCase().includes(q) ||
                       refs.some(r => r.excerpt?.toLowerCase().includes(q));
      if (matchKey) searchResults.push({ key, refs, sura: s, verse: v });
    });
    searchResults.sort((a, b) => a.sura !== b.sura ? a.sura - b.sura : a.verse - b.verse);
  }

  const showSearch = search.trim().length >= 2;
  const activeSuraVerses = activeSura ? (suraVerses[activeSura] || []) : [];

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-6">
        <div className="font-arabic text-gold text-xl mb-1" dir="rtl">فهرس الآيات</div>
        <h1 className="font-english text-white text-2xl font-semibold">Verse Concordance</h1>
        <p className="font-english text-sm mt-1" style={{color:'rgba(255,255,255,0.4)'}}>
          1,079 Quranic verses across the commentary · Select a sura or search by verse
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveSura(null); }}
          placeholder="Search by sura name, verse ref (e.g. 2:255), or keyword…"
          className="w-full border border-gold/30 rounded-xl px-4 py-3 font-english text-sm bg-white/5 outline-none focus:border-gold/60"
          style={{color:'inherit'}}
        />
      </div>

      {/* Search results */}
      {showSearch && (
        <div>
          <p className="font-english text-xs mb-3" style={{color:'rgba(255,255,255,0.3)'}}>
            {searchResults.length} verse{searchResults.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-2">
            {searchResults.map(({key, refs, sura, verse}) => {
              const suraData = ALL_SURAS[sura-1];
              const suraName = suraData?.[1] || `Sura ${sura}`;
              const ref = refs[0];
              const link = `/lesson/${ref.lessonId}?panel=${ref.panel || 'tafsir'}${ref.anchor ? '&q=' + encodeURIComponent(ref.anchor) : ''}`;
              return (
                <div key={key} className="border border-white/10 rounded-xl p-4 hover:border-gold/30 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-english text-gold font-semibold text-sm">Q. {key}</span>
                      <span className="font-english text-xs ml-2" style={{color:'rgba(255,255,255,0.4)'}}>{suraName}</span>
                    </div>
                    <span className="font-english text-[10px] border border-white/10 px-2 py-0.5 rounded" style={{color:'rgba(255,255,255,0.3)'}}>
                      {refs.length} lesson{refs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {refs.map((r, i) => (
                      <Link key={i}
                        href={`/lesson/${r.lessonId}?panel=${r.panel || 'tafsir'}${r.anchor ? '&q=' + encodeURIComponent(r.anchor) : ''}`}
                        className="flex items-center gap-2 group">
                        <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0">{r.lessonId}</div>
                        <span className="font-english text-xs group-hover:text-gold transition-colors" style={{color:'rgba(255,255,255,0.55)'}}>
                          {r.lessonTitleEn} · {r.volRef}
                        </span>
                        <span className="font-english text-[10px] text-gold/60 ml-auto flex-shrink-0">→ Open</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sura grid + verse list */}
      {!showSearch && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Sura list */}
          <div className="md:col-span-1">
            <p className="font-english text-[10px] uppercase tracking-wide mb-2" style={{color:'rgba(255,255,255,0.25)'}}>
              Select a sura
            </p>
            <div className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
              {ALL_SURAS.map(([num, nameEn, nameAr]) => {
                const covered = !!suraVerses[num];
                const count = suraVerses[num]?.length || 0;
                const isActive = activeSura === num;
                return (
                  <button
                    key={num}
                    onClick={() => covered ? setActiveSura(isActive ? null : num) : null}
                    disabled={!covered}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      isActive ? 'bg-gold/12 border border-gold/30' :
                      covered ? 'hover:bg-white/5 border border-transparent' :
                      'opacity-30 cursor-default border border-transparent'
                    }`}
                  >
                    <span className="font-english text-[10px] w-5 text-right flex-shrink-0" style={{color:'rgba(255,255,255,0.3)'}}>{num}</span>
                    <span className="font-english text-xs flex-1 min-w-0 truncate" style={{color: isActive ? '#C9A84C' : covered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'}}>{nameEn}</span>
                    <span className="font-arabic text-xs flex-shrink-0" dir="rtl" style={{color:'rgba(255,255,255,0.3)', fontSize:'10px'}}>{nameAr}</span>
                    {covered && (
                      <span className="font-english text-[9px] flex-shrink-0" style={{color:'rgba(201,168,76,0.5)'}}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Verse list */}
          <div className="md:col-span-2">
            {!activeSura ? (
              <div className="border border-white/8 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="font-arabic text-gold/30 text-3xl mb-3" dir="rtl">فهرس الآيات</div>
                <p className="font-english text-white/25 text-sm">Select a sura from the list to view its verses</p>
                <p className="font-english text-white/15 text-xs mt-1">or search above by verse reference or keyword</p>
              </div>
            ) : (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="font-english text-gold font-semibold">{ALL_SURAS[activeSura-1]?.[1]}</span>
                    <span className="font-arabic text-gold/60 ml-2 text-sm" dir="rtl">{ALL_SURAS[activeSura-1]?.[2]}</span>
                  </div>
                  <span className="font-english text-xs" style={{color:'rgba(255,255,255,0.3)'}}>
                    {activeSuraVerses.length} verse{activeSuraVerses.length !== 1 ? 's' : ''} cited
                  </span>
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {activeSuraVerses.map(key => {
                    const refs = concordance[key];
                    const [, v] = key.split(':').map(Number);
                    return (
                      <div key={key} className="border border-white/10 rounded-xl p-3 hover:border-gold/25 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-english text-gold text-sm font-semibold">Q. {key}</span>
                          <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>
                            {refs.length} reference{refs.length !== 1 ? 's' : ''} in commentary
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {refs.map((ref, i) => (
                            <Link key={i}
                              href={`/lesson/${ref.lessonId}?panel=${ref.panel || 'tafsir'}${ref.anchor ? '&q=' + encodeURIComponent(ref.anchor) : ''}`}
                              className="flex items-center gap-2.5 group py-1">
                              <div className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0">{ref.lessonId}</div>
                              <div className="flex-1 min-w-0">
                                <span className="font-english text-xs group-hover:text-gold transition-colors truncate block" style={{color:'rgba(255,255,255,0.6)'}}>
                                  {ref.lessonTitleEn}
                                </span>
                                <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>{ref.volRef}</span>
                              </div>
                              <span className="font-english text-[10px] text-gold/50 flex-shrink-0 group-hover:text-gold transition-colors">→ View commentary</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <p className="font-english text-white/30 animate-pulse text-sm">Loading concordance…</p>
        </div>
      )}
    </main>
  );
}
