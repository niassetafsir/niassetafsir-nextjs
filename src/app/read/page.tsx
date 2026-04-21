'use client';
import Link from 'next/link';
import { useState } from 'react';

// ── Sūra → Lesson mapping (all 114 sūras) ────────────────────────
const SURA_TO_LESSON: Record<number, number> = {
  1:1, 2:2, 3:8, 4:11, 5:14, 6:16, 7:18, 8:21, 9:22, 10:24,
  11:25, 12:26, 13:28, 14:28, 15:29, 16:30, 17:30, 18:31, 19:32, 20:32,
  21:33, 22:34, 23:35, 24:35, 25:36, 26:37, 27:37, 28:38, 29:39, 30:39,
  31:39, 32:40, 33:40, 34:41, 35:41, 36:42, 37:42, 38:43, 39:43, 40:44,
  41:44, 42:45, 43:45, 44:45, 45:46, 46:46, 47:46, 48:46, 49:47, 50:47,
  51:47, 52:48, 53:48, 54:48, 55:49, 56:49, 57:49, 58:50, 59:50, 60:50,
  61:50, 62:51, 63:51, 64:51, 65:51, 66:51, 67:52, 68:52, 69:52, 70:52,
  71:52, 72:53, 73:53, 74:53, 75:53, 76:53, 77:53, 78:54, 79:54, 80:54,
  81:54, 82:54, 83:54, 84:54, 85:54, 86:54, 87:55, 88:55, 89:55, 90:55,
  91:55, 92:55, 93:55, 94:55, 95:55, 96:55, 97:55, 98:55, 99:55, 100:56,
  101:56, 102:56, 103:56, 104:56, 105:56, 106:56, 107:56, 108:56, 109:56, 110:56,
  111:56, 112:57, 113:57, 114:57,
};

const SURAS = [
  [1,'Al-Fātiḥa','الفاتحة'],[2,'Al-Baqara','البقرة'],[3,'Āl ʿImrān','آل عمران'],
  [4,'Al-Nisāʾ','النساء'],[5,'Al-Māʾida','المائدة'],[6,'Al-Anʿām','الأنعام'],
  [7,'Al-Aʿrāf','الأعراف'],[8,'Al-Anfāl','الأنفال'],[9,'Al-Tawba','التوبة'],
  [10,'Yūnus','يونس'],[11,'Hūd','هود'],[12,'Yūsuf','يوسف'],
  [13,'Al-Raʿd','الرعد'],[14,'Ibrāhīm','إبراهيم'],[15,'Al-Ḥijr','الحجر'],
  [16,'Al-Naḥl','النحل'],[17,'Al-Isrāʾ','الإسراء'],[18,'Al-Kahf','الكهف'],
  [19,'Maryam','مريم'],[20,'Ṭāhā','طه'],[21,'Al-Anbiyāʾ','الأنبياء'],
  [22,'Al-Ḥajj','الحج'],[23,'Al-Muʾminūn','المؤمنون'],[24,'Al-Nūr','النور'],
  [25,'Al-Furqān','الفرقان'],[26,'Al-Shuʿarāʾ','الشعراء'],[27,'Al-Naml','النمل'],
  [28,'Al-Qaṣaṣ','القصص'],[29,'Al-ʿAnkabūt','العنكبوت'],[30,'Al-Rūm','الروم'],
  [31,'Luqmān','لقمان'],[32,'Al-Sajda','السجدة'],[33,'Al-Aḥzāb','الأحزاب'],
  [34,'Sabaʾ','سبأ'],[35,'Fāṭir','فاطر'],[36,'Yā Sīn','يس'],
  [37,'Al-Ṣāffāt','الصافات'],[38,'Ṣād','ص'],[39,'Al-Zumar','الزمر'],
  [40,'Ghāfir','غافر'],[41,'Fuṣṣilat','فصلت'],[42,'Al-Shūrā','الشورى'],
  [43,'Al-Zukhruf','الزخرف'],[44,'Al-Dukhān','الدخان'],[45,'Al-Jāthiya','الجاثية'],
  [46,'Al-Aḥqāf','الأحقاف'],[47,'Muḥammad','محمد'],[48,'Al-Fatḥ','الفتح'],
  [49,'Al-Ḥujurāt','الحجرات'],[50,'Qāf','ق'],[51,'Al-Dhāriyāt','الذاريات'],
  [52,'Al-Ṭūr','الطور'],[53,'Al-Najm','النجم'],[54,'Al-Qamar','القمر'],
  [55,'Al-Raḥmān','الرحمن'],[56,'Al-Wāqiʿa','الواقعة'],[57,'Al-Ḥadīd','الحديد'],
  [58,'Al-Mujādala','المجادلة'],[59,'Al-Ḥashr','الحشر'],[60,'Al-Mumtaḥana','الممتحنة'],
  [61,'Al-Ṣaff','الصف'],[62,'Al-Jumʿa','الجمعة'],[63,'Al-Munāfiqūn','المنافقون'],
  [64,'Al-Taghābun','التغابن'],[65,'Al-Ṭalāq','الطلاق'],[66,'Al-Taḥrīm','التحريم'],
  [67,'Al-Mulk','الملك'],[68,'Al-Qalam','القلم'],[69,'Al-Ḥāqqa','الحاقة'],
  [70,'Al-Maʿārij','المعارج'],[71,'Nūḥ','نوح'],[72,'Al-Jinn','الجن'],
  [73,'Al-Muzzammil','المزمل'],[74,'Al-Muddaththir','المدثر'],[75,'Al-Qiyāma','القيامة'],
  [76,'Al-Insān','الإنسان'],[77,'Al-Mursalāt','المرسلات'],[78,'Al-Nabaʾ','النبأ'],
  [79,'Al-Nāziʿāt','النازعات'],[80,'ʿAbasa','عبس'],[81,'Al-Takwīr','التكوير'],
  [82,'Al-Infiṭār','الانفطار'],[83,'Al-Muṭaffifīn','المطففين'],[84,'Al-Inshiqāq','الانشقاق'],
  [85,'Al-Burūj','البروج'],[86,'Al-Ṭāriq','الطارق'],[87,'Al-Aʿlā','الأعلى'],
  [88,'Al-Ghāshiya','الغاشية'],[89,'Al-Fajr','الفجر'],[90,'Al-Balad','البلد'],
  [91,'Al-Shams','الشمس'],[92,'Al-Layl','الليل'],[93,'Al-Ḍuḥā','الضحى'],
  [94,'Al-Sharḥ','الشرح'],[95,'Al-Tīn','التين'],[96,'Al-ʿAlaq','العلق'],
  [97,'Al-Qadr','القدر'],[98,'Al-Bayyina','البينة'],[99,'Al-Zalzala','الزلزلة'],
  [100,'Al-ʿĀdiyāt','العاديات'],[101,'Al-Qāriʿa','القارعة'],[102,'Al-Takāthur','التكاثر'],
  [103,'Al-ʿAṣr','العصر'],[104,'Al-Humaza','الهمزة'],[105,'Al-Fīl','الفيل'],
  [106,'Quraysh','قريش'],[107,'Al-Māʿūn','الماعون'],[108,'Al-Kawthar','الكوثر'],
  [109,'Al-Kāfirūn','الكافرون'],[110,'Al-Naṣr','النصر'],[111,'Al-Masad','المسد'],
  [112,'Al-Ikhlāṣ','الإخلاص'],[113,'Al-Falaq','الفلق'],[114,'Al-Nās','الناس'],
];

const MANZILS = [
  { id:1, en:'First Manzil', ar:'المنزل الأول', sub:'Al-Fātiḥa — Al-Nisāʾ', color:'#6B2424' },
  { id:2, en:'Second Manzil', ar:'المنزل الثاني', sub:'Al-Māʾida — Al-Tawba', color:'#6B2424' },
  { id:3, en:'Third Manzil', ar:'المنزل الثالث', sub:'Yūnus — Al-Naḥl', color:'#6B2424' },
  { id:4, en:'Fourth Manzil', ar:'المنزل الرابع', sub:'Al-Isrāʾ — Al-Furqān', color:'#1E5A4A' },
  { id:5, en:'Fifth Manzil', ar:'المنزل الخامس', sub:'Al-Furqān — Al-Aḥzāb', color:'#1E5A4A' },
  { id:6, en:'Sixth Manzil', ar:'المنزل السادس', sub:'Sabaʾ — Al-Ṣaff', color:'#1A3A5C' },
  { id:7, en:'Seventh Manzil', ar:'المنزل السابع', sub:'Al-Jumʿa — Al-Nās', color:'#1A3A5C' },
];

type Mode = null | 'surah' | 'manzil';

export default function ReadPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>(null);

  const searchResults = query.trim()
    ? SURAS.filter(([_, en, ar]) =>
        (en as string).toLowerCase().includes(query.toLowerCase()) ||
        (ar as string).includes(query)
      )
    : [];

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-5 text-center">
        <div className="font-arabic text-gold text-xl font-bold mb-1" dir="rtl">في رياض التفسير</div>
        <h1 className="font-english font-semibold text-base"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          Read the Commentary
        </h1>
      </div>

      {/* Search bar — always first */}
      <div className="relative mb-5">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (e.target.value) setMode(null); }}
          placeholder="Search by sūra name..."
          className="w-full rounded-xl px-4 py-3 text-sm font-english"
          style={{
            background: 'var(--panel-body-bg, rgba(13,20,10,0.97))',
            border: '1px solid rgba(201,168,76,0.25)',
            color: 'var(--body-text, rgba(255,255,255,0.85))',
            outline: 'none',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{color:'rgba(201,168,76,0.6)'}}>
            ✕
          </button>
        )}
      </div>

      {/* Search results */}
      {query && (
        <div className="mb-6">
          {searchResults.length === 0 ? (
            <p className="font-english text-sm text-center italic"
              style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
              No sūras found
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {searchResults.map(([num, en, ar]) => (
                <Link key={num} href={`/lesson/${SURA_TO_LESSON[num as number]}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all group"
                  style={{borderColor:'rgba(201,168,76,0.2)', background:'var(--panel-body-bg, rgba(13,20,10,0.5))'}}>
                  <div>
                    <p className="font-english text-xs font-semibold group-hover:text-gold transition-colors"
                      style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
                      {en as string}
                    </p>
                    <p className="font-english text-[9px]" style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                      Sūra {num as number}
                    </p>
                  </div>
                  <span className="font-arabic text-sm" dir="rtl"
                    style={{color:'var(--body-sub, rgba(255,255,255,0.55))'}}>
                    {ar as string}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Two mode cards — shown when not searching */}
      {!query && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Read by Sūra */}
            <button
              onClick={() => setMode(mode === 'surah' ? null : 'surah')}
              className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 transition-all"
              style={{
                borderColor: mode === 'surah' ? '#6B2424' : 'rgba(107,36,36,0.35)',
                background: mode === 'surah' ? 'rgba(107,36,36,0.12)' : 'transparent',
              }}>
              <span className="font-arabic text-2xl mb-2" style={{color:'#6B2424'}}>ﵚ</span>
              <span className="font-english text-sm font-bold" style={{color:'#6B2424'}}>
                Read by Sūra
              </span>
              <span className="font-english text-[10px] mt-1 text-center"
                style={{color:'rgba(107,36,36,0.6)'}}>
                All 114 sūras
              </span>
            </button>

            {/* Read by Manzil */}
            <button
              onClick={() => setMode(mode === 'manzil' ? null : 'manzil')}
              className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 transition-all"
              style={{
                borderColor: mode === 'manzil' ? '#1A3A5C' : 'rgba(26,58,92,0.35)',
                background: mode === 'manzil' ? 'rgba(26,58,92,0.12)' : 'transparent',
              }}>
              <span className="font-arabic text-2xl mb-2" style={{color:'#1A3A5C'}}>٧</span>
              <span className="font-english text-sm font-bold" style={{color:'#1A3A5C'}}>
                Read by Manzil
              </span>
              <span className="font-english text-[10px] mt-1 text-center"
                style={{color:'rgba(26,58,92,0.6)'}}>
                7 weekly sections
              </span>
            </button>
          </div>

          {/* ── Sūra grid (expanded inline) ────────────────────── */}
          {mode === 'surah' && (
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {SURAS.map(([num, en, ar]) => (
                <Link key={num} href={`/lesson/${SURA_TO_LESSON[num as number]}`}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all group text-center"
                  style={{borderColor:'rgba(107,36,36,0.2)', background:'rgba(107,36,36,0.05)'}}>
                  <span className="font-english text-[9px] font-bold group-hover:text-gold transition-colors"
                    style={{color:'rgba(107,36,36,0.7)'}}>
                    {num}
                  </span>
                  <span className="font-arabic text-xs leading-5"
                    style={{color:'var(--body-text, rgba(255,255,255,0.85))'}}>
                    {ar as string}
                  </span>
                  <span className="font-english text-[8px] leading-tight"
                    style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                    {(en as string).length > 12 ? (en as string).slice(0,11)+'…' : en as string}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* ── Manzil list (expanded inline) ──────────────────── */}
          {mode === 'manzil' && (
            <div className="space-y-2 mb-4">
              {MANZILS.map(m => (
                <Link key={m.id} href={`/manzil/${m.id}`}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all group"
                  style={{borderColor: m.color + '40', background: m.color + '0d'}}>
                  <div>
                    <p className="font-english text-sm font-bold group-hover:opacity-80 transition-opacity"
                      style={{color: m.color}}>
                      {m.en}
                    </p>
                    <p className="font-english text-xs mt-0.5"
                      style={{color:'var(--body-faint, rgba(255,255,255,0.4))'}}>
                      {m.sub}
                    </p>
                  </div>
                  <span className="font-arabic text-base" dir="rtl"
                    style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
                    {m.ar}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Descriptive note — shown when neither mode is open */}
          {!mode && (
            <p className="font-english text-xs text-center italic mt-2"
              style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
              Search above, or choose how you'd like to navigate the tafsīr
            </p>
          )}
        </>
      )}
    </main>
  );
}
