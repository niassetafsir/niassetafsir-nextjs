'use client';
import Link from 'next/link';
import { useState } from 'react';

// All 114 sūrahs → lesson mapping
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
  [1,'Al-Fātiḥa'],[2,'Al-Baqara'],[3,'Āl ʿImrān'],[4,'Al-Nisāʾ'],[5,'Al-Māʾida'],
  [6,'Al-Anʿām'],[7,'Al-Aʿrāf'],[8,'Al-Anfāl'],[9,'Al-Tawba'],[10,'Yūnus'],
  [11,'Hūd'],[12,'Yūsuf'],[13,'Al-Raʿd'],[14,'Ibrāhīm'],[15,'Al-Ḥijr'],
  [16,'Al-Naḥl'],[17,'Al-Isrāʾ'],[18,'Al-Kahf'],[19,'Maryam'],[20,'Ṭāhā'],
  [21,'Al-Anbiyāʾ'],[22,'Al-Ḥajj'],[23,'Al-Muʾminūn'],[24,'Al-Nūr'],[25,'Al-Furqān'],
  [26,'Al-Shuʿarāʾ'],[27,'Al-Naml'],[28,'Al-Qaṣaṣ'],[29,'Al-ʿAnkabūt'],[30,'Al-Rūm'],
  [31,'Luqmān'],[32,'Al-Sajda'],[33,'Al-Aḥzāb'],[34,'Sabaʾ'],[35,'Fāṭir'],
  [36,'Yā Sīn'],[37,'Al-Ṣāffāt'],[38,'Ṣād'],[39,'Al-Zumar'],[40,'Ghāfir'],
  [41,'Fuṣṣilat'],[42,'Al-Shūrā'],[43,'Al-Zukhruf'],[44,'Al-Dukhān'],[45,'Al-Jāthiya'],
  [46,'Al-Aḥqāf'],[47,'Muḥammad'],[48,'Al-Fatḥ'],[49,'Al-Ḥujurāt'],[50,'Qāf'],
  [51,'Al-Dhāriyāt'],[52,'Al-Ṭūr'],[53,'Al-Najm'],[54,'Al-Qamar'],[55,'Al-Raḥmān'],
  [56,'Al-Wāqiʿa'],[57,'Al-Ḥadīd'],[58,'Al-Mujādala'],[59,'Al-Ḥashr'],[60,'Al-Mumtaḥana'],
  [61,'Al-Ṣaff'],[62,'Al-Jumʿa'],[63,'Al-Munāfiqūn'],[64,'Al-Taghābun'],[65,'Al-Ṭalāq'],
  [66,'Al-Taḥrīm'],[67,'Al-Mulk'],[68,'Al-Qalam'],[69,'Al-Ḥāqqa'],[70,'Al-Maʿārij'],
  [71,'Nūḥ'],[72,'Al-Jinn'],[73,'Al-Muzzammil'],[74,'Al-Muddaththir'],[75,'Al-Qiyāma'],
  [76,'Al-Insān'],[77,'Al-Mursalāt'],[78,'Al-Nabaʾ'],[79,'Al-Nāziʿāt'],[80,'ʿAbasa'],
  [81,'Al-Takwīr'],[82,'Al-Infiṭār'],[83,'Al-Muṭaffifīn'],[84,'Al-Inshiqāq'],[85,'Al-Burūj'],
  [86,'Al-Ṭāriq'],[87,'Al-Aʿlā'],[88,'Al-Ghāshiya'],[89,'Al-Fajr'],[90,'Al-Balad'],
  [91,'Al-Shams'],[92,'Al-Layl'],[93,'Al-Ḍuḥā'],[94,'Al-Sharḥ'],[95,'Al-Tīn'],
  [96,'Al-ʿAlaq'],[97,'Al-Qadr'],[98,'Al-Bayyina'],[99,'Al-Zalzala'],[100,'Al-ʿĀdiyāt'],
  [101,'Al-Qāriʿa'],[102,'Al-Takāthur'],[103,'Al-ʿAṣr'],[104,'Al-Humaza'],[105,'Al-Fīl'],
  [106,'Quraysh'],[107,'Al-Māʿūn'],[108,'Al-Kawthar'],[109,'Al-Kāfirūn'],[110,'Al-Naṣr'],
  [111,'Al-Masad'],[112,'Al-Ikhlāṣ'],[113,'Al-Falaq'],[114,'Al-Nās'],
];

const LESSONS = [
  {id:1, suras:'Al-Istiʿādha, Basmala & Al-Fātiḥa', range:'Q. 1:1–2:5', hasText:true},
  {id:2, suras:'Al-Baqara', range:'Q. 2:6–25', hasText:true},
  {id:3, suras:'Al-Baqara', range:'Q. 2:26–59', hasText:true},
  {id:4, suras:'Al-Baqara', range:'Q. 2:60–105', hasText:true},
  {id:5, suras:'Al-Baqara', range:'Q. 2:106–202', hasText:true},
  {id:6, suras:'Al-Baqara', range:'Q. 2:203–252', hasText:true},
  {id:7, suras:'Al-Baqara / Āl ʿImrān', range:'Q. 2:253–3:14', hasText:true},
  {id:8, suras:'Āl ʿImrān', range:'Q. 3:15–91', hasText:true},
  {id:9, suras:'Āl ʿImrān', range:'Q. 3:92–175', hasText:true},
  {id:10, suras:'Āl ʿImrān / Al-Nisāʾ', range:'Q. 3:176–4:23', hasText:true},
  {id:11, suras:'Al-Nisāʾ', range:'Q. 4:24–86', hasText:true},
  {id:12, suras:'Al-Nisāʾ', range:'Q. 4:87–147', hasText:true},
  {id:13, suras:'Al-Nisāʾ / Al-Māʾida', range:'Q. 4:148–5:22', hasText:true},
  {id:14, suras:'Al-Māʾida', range:'Q. 5:23–81', hasText:true},
  {id:15, suras:'Al-Māʾida / Al-Anʿām', range:'Q. 5:82–6:35', hasText:true},
  {id:16, suras:'Al-Anʿām', range:'Q. 6:36–110', hasText:true},
  {id:17, suras:'Al-Anʿām', range:'Q. 6:111–165', hasText:true},
  {id:18, suras:'Al-Aʿrāf', range:'Q. 7:1–87', hasText:true},
  {id:19, suras:'Al-Aʿrāf', range:'Q. 7:88–170', hasText:true},
  {id:20, suras:'Al-Aʿrāf / Al-Anfāl', range:'Q. 7:171–8:40', hasText:true},
  {id:21, suras:'Al-Anfāl / Al-Tawba', range:'Q. 8:41–9:33', hasText:true},
  {id:22, suras:'Al-Tawba', range:'Q. 9:34–92', hasText:true},
  {id:23, suras:'Al-Tawba / Yūnus', range:'Q. 9:93–10:25', hasText:true},
  {id:24, suras:'Yūnus / Hūd', range:'Q. 10:26–11:5', hasText:true},
  {id:25, suras:'Hūd', range:'Q. 11:6–83', hasText:true},
  {id:26, suras:'Hūd / Yūsuf', range:'Q. 11:84–12:52', hasText:true},
  {id:27, suras:'Yūsuf / Al-Raʿd', range:'Q. 12:53–13:18', hasText:true},
  {id:28, suras:'Al-Raʿd / Ibrāhīm', range:'Q. 13:19–14:52', hasText:true},
  {id:29, suras:'Al-Ḥijr / Al-Naḥl', range:'Q. 15:1–16:89', hasText:true},
  {id:30, suras:'Al-Naḥl / Al-Isrāʾ', range:'Q. 16:90–17:111', hasText:true},
  {id:31, suras:'Al-Kahf', range:'Q. 18:1–110', hasText:false},
  {id:32, suras:'Maryam / Ṭāhā', range:'Q. 19:1–20:54', hasText:false},
  {id:33, suras:'Ṭāhā / Al-Anbiyāʾ', range:'Q. 20:55–21:63', hasText:false},
  {id:34, suras:'Al-Anbiyāʾ / Al-Ḥajj', range:'Q. 21:64–22:78', hasText:false},
  {id:35, suras:'Al-Muʾminūn / Al-Nūr', range:'Q. 23:1–24:52', hasText:false},
  {id:36, suras:'Al-Furqān', range:'Q. 25:1–77', hasText:false},
  {id:37, suras:'Al-Shuʿarāʾ / Al-Naml', range:'Q. 26:1–27:93', hasText:false},
  {id:38, suras:'Al-Qaṣaṣ', range:'Q. 28:1–88', hasText:false},
  {id:39, suras:'Al-ʿAnkabūt / Al-Rūm / Luqmān', range:'Q. 29:1–31:34', hasText:false},
  {id:40, suras:'Al-Sajda / Al-Aḥzāb', range:'Q. 32:1–33:73', hasText:false},
  {id:41, suras:'Sabaʾ / Fāṭir', range:'Q. 34:1–35:45', hasText:false},
  {id:42, suras:'Yā Sīn / Al-Ṣāffāt', range:'Q. 36:1–37:182', hasText:false},
  {id:43, suras:'Ṣād / Al-Zumar', range:'Q. 38:1–39:75', hasText:false},
  {id:44, suras:'Ghāfir / Fuṣṣilat', range:'Q. 40:1–41:54', hasText:false},
  {id:45, suras:'Al-Shūrā / Al-Zukhruf / Al-Dukhān', range:'Q. 42:1–44:59', hasText:false},
  {id:46, suras:'Al-Jāthiya / Al-Aḥqāf / Muḥammad / Al-Fatḥ', range:'Q. 45:1–48:29', hasText:false},
  {id:47, suras:'Al-Ḥujurāt / Qāf / Al-Dhāriyāt', range:'Q. 49:1–51:60', hasText:false},
  {id:48, suras:'Al-Ṭūr / Al-Najm / Al-Qamar', range:'Q. 52:1–54:55', hasText:false},
  {id:49, suras:'Al-Raḥmān / Al-Wāqiʿa / Al-Ḥadīd', range:'Q. 55:1–57:29', hasText:false},
  {id:50, suras:'Al-Mujādala / Al-Ḥashr / Al-Mumtaḥana / Al-Ṣaff', range:'Q. 58:1–61:14', hasText:false},
  {id:51, suras:'Al-Jumʿa / Al-Munāfiqūn / Al-Taghābun / Al-Ṭalāq / Al-Taḥrīm', range:'Q. 62:1–66:12', hasText:false},
  {id:52, suras:'Al-Mulk / Al-Qalam / Al-Ḥāqqa / Al-Maʿārij / Nūḥ', range:'Q. 67:1–71:28', hasText:false},
  {id:53, suras:'Al-Jinn through Al-Mursalāt', range:'Q. 72:1–77:50', hasText:false},
  {id:54, suras:'Al-Nabaʾ through Al-Ṭāriq', range:'Q. 78:1–86:17', hasText:false},
  {id:55, suras:'Al-Aʿlā through Al-Zalzala', range:'Q. 87:1–99:8', hasText:false},
  {id:56, suras:'Al-ʿĀdiyāt through Al-Masad', range:'Q. 100:1–111:5', hasText:false},
  {id:57, suras:'Al-Ikhlāṣ / Al-Falaq / Al-Nās', range:'Q. 112:1–114:6', hasText:false},
];

export default function ReadPage() {
  const [query, setQuery] = useState('');
  const [showSuras, setShowSuras] = useState(false);
  const [showLessons, setShowLessons] = useState(false);

  const suraResults = query.trim()
    ? SURAS.filter(([_, name]) => (name as string).toLowerCase().includes(query.toLowerCase()))
    : [];
  const lessonResults = query.trim()
    ? LESSONS.filter(l => l.suras.toLowerCase().includes(query.toLowerCase()) || l.range.includes(query))
    : [];
  const hasResults = suraResults.length > 0 || lessonResults.length > 0;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-english font-semibold text-base mb-0.5"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          Read the Commentary
        </h1>
        <p className="font-english text-xs italic"
          style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm · 57 lessons · Shaykh Ibrāhīm Niasse
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by sūrah name, verse, or keyword…"
          className="w-full rounded-xl px-4 py-3 text-sm font-english"
          style={{
            background:'var(--panel-body-bg, rgba(13,20,10,0.97))',
            border:'1px solid rgba(201,168,76,0.25)',
            color:'var(--body-text, rgba(255,255,255,0.85))',
            outline:'none',
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
        <div className="mb-6 space-y-1">
          {!hasResults && (
            <p className="font-english text-sm text-center italic"
              style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
              No results found
            </p>
          )}
          {suraResults.map(([num, name]) => (
            <Link key={num} href={`/lesson/${SURA_TO_LESSON[num as number]}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg border transition-all group"
              style={{borderColor:'rgba(201,168,76,0.2)', background:'rgba(201,168,76,0.04)'}}>
              <span className="font-english text-sm group-hover:text-gold transition-colors"
                style={{color:'var(--body-text, rgba(255,255,255,0.85))'}}>
                {name as string}
              </span>
              <span className="font-english text-[10px]"
                style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                → Lesson {SURA_TO_LESSON[num as number]}
              </span>
            </Link>
          ))}
          {lessonResults.map(l => (
            <Link key={l.id} href={`/lesson/${l.id}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg border transition-all group"
              style={{borderColor:'rgba(201,168,76,0.15)', background:'transparent'}}>
              <span className="font-english text-sm group-hover:text-gold transition-colors"
                style={{color:'var(--body-text, rgba(255,255,255,0.85))'}}>
                Lesson {l.id} · {l.suras.split(' / ')[0]}
              </span>
              <span className="font-english text-[10px]"
                style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                {l.range}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Browse toggles — only when not searching */}
      {!query && (
        <div className="space-y-2">

          {/* Browse by Sūrah */}
          <div className="border rounded-xl overflow-hidden"
            style={{borderColor:'rgba(201,168,76,0.2)'}}>
            <button onClick={() => setShowSuras(!showSuras)}
              className="w-full flex items-center justify-between px-4 py-3 font-english text-sm font-semibold transition-all"
              style={{
                background:'var(--panel-header-bg, rgba(13,20,10,0.95))',
                color:'rgba(201,168,76,0.85)',
              }}>
              <span>Browse by Sūrah</span>
              <span className="text-xs">{showSuras ? '▲' : '▸'}</span>
            </button>
            {showSuras && (
              <div className="p-3" style={{background:'var(--panel-body-bg, rgba(13,20,10,0.5))'}}>
                <p className="font-english text-[10px] mb-2 italic"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
                  Each sūrah links to the lesson that covers it
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {SURAS.map(([num, name]) => {
                    const lessonId = SURA_TO_LESSON[num as number];
                    const hasText = lessonId <= 30;
                    return (
                      <Link key={num} href={`/lesson/${lessonId}`}
                        className="flex flex-col px-2 py-1.5 rounded-lg border transition-all text-left"
                        style={{
                          borderColor: hasText ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)',
                          background: 'transparent',
                        }}>
                        <span className="font-english text-[9px]"
                          style={{color:'rgba(201,168,76,0.5)'}}>{num}</span>
                        <span className="font-english text-[10px] leading-tight"
                          style={{color: hasText ? 'var(--body-text, rgba(255,255,255,0.85))' : 'var(--body-faint, rgba(255,255,255,0.3))'}}>
                          {(name as string).length > 12 ? (name as string).slice(0,11)+'…' : name}
                        </span>
                        <span className="font-english text-[9px]"
                          style={{color:'rgba(201,168,76,0.4)'}}>L{lessonId}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Browse by Lesson */}
          <div className="border rounded-xl overflow-hidden"
            style={{borderColor:'rgba(201,168,76,0.2)'}}>
            <button onClick={() => setShowLessons(!showLessons)}
              className="w-full flex items-center justify-between px-4 py-3 font-english text-sm font-semibold transition-all"
              style={{
                background:'var(--panel-header-bg, rgba(13,20,10,0.95))',
                color:'rgba(201,168,76,0.85)',
              }}>
              <span>Browse by Lesson</span>
              <span className="text-xs">{showLessons ? '▲' : '▸'}</span>
            </button>
            {showLessons && (
              <div className="p-3 space-y-1" style={{background:'var(--panel-body-bg, rgba(13,20,10,0.5))'}}>
                {LESSONS.map(l => (
                  <Link key={l.id} href={`/lesson/${l.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border transition-all group"
                    style={{
                      borderColor: l.hasText ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
                      background:'transparent',
                    }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-english text-[10px] shrink-0"
                        style={{color:'rgba(201,168,76,0.5)'}}>
                        {l.id}
                      </span>
                      <span className="font-english text-xs truncate group-hover:text-gold transition-colors"
                        style={{color: l.hasText ? 'var(--body-text, rgba(255,255,255,0.85))' : 'var(--body-faint, rgba(255,255,255,0.3))'}}>
                        {l.suras.split(' / ')[0]}{l.suras.includes(' / ') ? ' ···' : ''}
                      </span>
                    </div>
                    <span className="font-english text-[9px] shrink-0 ml-2"
                      style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
                      {l.hasText ? l.range.split('–')[0] : 'forthcoming'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
