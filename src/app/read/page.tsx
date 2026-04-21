'use client';
import Link from 'next/link';
import { useState } from 'react';

const LESSONS = [
  { id: 1, sura: 'Al-Istiʿādha, Basmala & Al-Fātiḥa', suraAr: 'الاستعاذة · البسملة · الفاتحة', range: 'Q. 1:1–2:5', vol: 1, page: 29, manzil: 1, hasText: true, hasEn: true },
  { id: 2, sura: 'Al-Baqara', suraAr: 'سورة البقرة', range: 'Q. 2:6–25', vol: 1, page: 54, manzil: 1, hasText: true, hasEn: true },
  { id: 3, sura: 'Al-Baqara', suraAr: 'سورة البقرة', range: 'Q. 2:26–59', vol: 1, page: 59, manzil: 1, hasText: true, hasEn: false },
  { id: 4, sura: 'Al-Baqara', suraAr: 'سورة البقرة', range: 'Q. 2:60–105', vol: 1, page: 72, manzil: 1, hasText: true, hasEn: false },
  { id: 5, sura: 'Al-Baqara', suraAr: 'سورة البقرة', range: 'Q. 2:106–202', vol: 1, page: 96, manzil: 1, hasText: true, hasEn: false },
  { id: 6, sura: 'Al-Baqara', suraAr: 'سورة البقرة', range: 'Q. 2:203–252', vol: 1, page: 120, manzil: 1, hasText: true, hasEn: false },
  { id: 7, sura: 'Al-Baqara · Āl ʿImrān', suraAr: 'البقرة · آل عمران', range: 'Q. 2:253–3:14', vol: 2, page: 3, manzil: 1, hasText: true, hasEn: false },
  { id: 8, sura: 'Āl ʿImrān', suraAr: 'سورة آل عمران', range: 'Q. 3:15–91', vol: 2, page: 34, manzil: 1, hasText: true, hasEn: false },
  { id: 9, sura: 'Āl ʿImrān', suraAr: 'سورة آل عمران', range: 'Q. 3:92–175', vol: 2, page: 46, manzil: 1, hasText: true, hasEn: false },
  { id: 10, sura: 'Āl ʿImrān · Al-Nisāʾ', suraAr: 'آل عمران · النساء', range: 'Q. 3:176–4:23', vol: 2, page: 79, manzil: 1, hasText: true, hasEn: false },
  { id: 11, sura: 'Al-Nisāʾ', suraAr: 'سورة النساء', range: 'Q. 4:24–86', vol: 2, page: 124, manzil: 1, hasText: true, hasEn: false },
  { id: 12, sura: 'Al-Nisāʾ', suraAr: 'سورة النساء', range: 'Q. 4:87–147', vol: 2, page: 161, manzil: 1, hasText: true, hasEn: false },
  { id: 13, sura: 'Al-Nisāʾ · Al-Māʾida', suraAr: 'النساء · المائدة', range: 'Q. 4:148–5:22', vol: 3, page: 3, manzil: 1, hasText: true, hasEn: false },
  { id: 14, sura: 'Al-Māʾida', suraAr: 'سورة المائدة', range: 'Q. 5:23–81', vol: 3, page: 33, manzil: 2, hasText: true, hasEn: false },
  { id: 15, sura: 'Al-Māʾida · Al-Anʿām', suraAr: 'المائدة · الأنعام', range: 'Q. 5:82–6:35', vol: 3, page: 49, manzil: 2, hasText: true, hasEn: false },
  { id: 16, sura: 'Al-Anʿām', suraAr: 'سورة الأنعام', range: 'Q. 6:36–110', vol: 3, page: 112, manzil: 2, hasText: true, hasEn: false },
  { id: 17, sura: 'Al-Anʿām', suraAr: 'سورة الأنعام', range: 'Q. 6:111–165', vol: 3, page: 122, manzil: 2, hasText: true, hasEn: false },
  { id: 18, sura: 'Al-Aʿrāf', suraAr: 'سورة الأعراف', range: 'Q. 7:1–87', vol: 3, page: 159, manzil: 2, hasText: true, hasEn: false },
  { id: 19, sura: 'Al-Aʿrāf', suraAr: 'سورة الأعراف', range: 'Q. 7:88–170', vol: 3, page: 191, manzil: 2, hasText: true, hasEn: false },
  { id: 20, sura: 'Al-Aʿrāf · Al-Anfāl', suraAr: 'الأعراف · الأنفال', range: 'Q. 7:171–8:40', vol: 4, page: 3, manzil: 2, hasText: true, hasEn: false },
  { id: 21, sura: 'Al-Anfāl · Al-Tawba', suraAr: 'الأنفال · التوبة', range: 'Q. 8:41–9:33', vol: 4, page: 44, manzil: 2, hasText: true, hasEn: false },
  { id: 22, sura: 'Al-Tawba', suraAr: 'سورة التوبة', range: 'Q. 9:34–92', vol: 4, page: 86, manzil: 2, hasText: true, hasEn: false },
  { id: 23, sura: 'Al-Tawba · Yūnus', suraAr: 'التوبة · يونس', range: 'Q. 9:93–10:25', vol: 4, page: 129, manzil: 2, hasText: true, hasEn: false },
  { id: 24, sura: 'Yūnus · Hūd', suraAr: 'يونس · هود', range: 'Q. 10:26–11:5', vol: 4, page: 165, manzil: 3, hasText: true, hasEn: false },
  { id: 25, sura: 'Hūd', suraAr: 'سورة هود', range: 'Q. 11:6–83', vol: 4, page: 196, manzil: 3, hasText: true, hasEn: false },
  { id: 26, sura: 'Hūd · Yūsuf', suraAr: 'هود · يوسف', range: 'Q. 11:84–12:52', vol: 5, page: 3, manzil: 3, hasText: true, hasEn: false },
  { id: 27, sura: 'Yūsuf · Al-Raʿd', suraAr: 'يوسف · الرعد', range: 'Q. 12:53–13:18', vol: 5, page: 39, manzil: 3, hasText: true, hasEn: false },
  { id: 28, sura: 'Al-Raʿd · Ibrāhīm', suraAr: 'الرعد · إبراهيم', range: 'Q. 13:19–14:52', vol: 5, page: 70, manzil: 3, hasText: true, hasEn: false },
  { id: 29, sura: 'Al-Ḥijr · Al-Naḥl', suraAr: 'الحجر · النحل', range: 'Q. 15:1–16:89', vol: 5, page: 100, manzil: 3, hasText: true, hasEn: false },
  { id: 30, sura: 'Al-Naḥl · Al-Isrāʾ', suraAr: 'النحل · الإسراء', range: 'Q. 16:90–17:111', vol: 5, page: 144, manzil: 3, hasText: true, hasEn: false },
  { id: 31, sura: 'Al-Kahf', suraAr: 'سورة الكهف', range: 'Q. 18:1–110', vol: 6, page: 3, manzil: 4, hasText: false, hasEn: false },
  { id: 32, sura: 'Maryam · Ṭāhā', suraAr: 'مريم · طه', range: 'Q. 19:1–20:54', vol: 6, page: 3, manzil: 4, hasText: false, hasEn: false },
  { id: 33, sura: 'Ṭāhā · Al-Anbiyāʾ', suraAr: 'طه · الأنبياء', range: 'Q. 20:55–21:63', vol: 6, page: 3, manzil: 4, hasText: false, hasEn: false },
  { id: 34, sura: 'Al-Anbiyāʾ · Al-Ḥajj', suraAr: 'الأنبياء · الحج', range: 'Q. 21:64–22:78', vol: 6, page: 3, manzil: 4, hasText: false, hasEn: false },
  { id: 35, sura: 'Al-Muʾminūn · Al-Nūr', suraAr: 'المؤمنون · النور', range: 'Q. 23:1–24:52', vol: 6, page: 3, manzil: 4, hasText: false, hasEn: false },
  { id: 36, sura: 'Al-Furqān', suraAr: 'سورة الفرقان', range: 'Q. 25:1–77', vol: 7, page: 3, manzil: 5, hasText: false, hasEn: false },
  { id: 37, sura: 'Al-Shuʿarāʾ · Al-Naml', suraAr: 'الشعراء · النمل', range: 'Q. 26:1–27:93', vol: 7, page: 52, manzil: 5, hasText: false, hasEn: false },
  { id: 38, sura: 'Al-Qaṣaṣ', suraAr: 'سورة القصص', range: 'Q. 28:1–88', vol: 7, page: 114, manzil: 5, hasText: false, hasEn: false },
  { id: 39, sura: 'Al-ʿAnkabūt · Al-Rūm · Luqmān', suraAr: 'العنكبوت · الروم · لقمان', range: 'Q. 29:1–31:34', vol: 7, page: 145, manzil: 5, hasText: false, hasEn: false },
  { id: 40, sura: 'Al-Sajda · Al-Aḥzāb', suraAr: 'السجدة · الأحزاب', range: 'Q. 32:1–33:73', vol: 7, page: 195, manzil: 5, hasText: false, hasEn: false },
  { id: 41, sura: 'Sabaʾ · Fāṭir', suraAr: 'سبأ · فاطر', range: 'Q. 34:1–35:45', vol: 8, page: 3, manzil: 5, hasText: false, hasEn: false },
  { id: 42, sura: 'Yā Sīn · Al-Ṣāffāt', suraAr: 'يس · الصافات', range: 'Q. 36:1–37:182', vol: 8, page: 55, manzil: 5, hasText: false, hasEn: false },
  { id: 43, sura: 'Ṣād · Al-Zumar', suraAr: 'ص · الزمر', range: 'Q. 38:1–39:75', vol: 8, page: 105, manzil: 5, hasText: false, hasEn: false },
  { id: 44, sura: 'Ghāfir · Fuṣṣilat', suraAr: 'غافر · فصلت', range: 'Q. 40:1–41:54', vol: 8, page: 159, manzil: 5, hasText: false, hasEn: false },
  { id: 45, sura: 'Al-Shūrā · Al-Zukhruf · Al-Dukhān', suraAr: 'الشورى · الزخرف · الدخان', range: 'Q. 42:1–44:59', vol: 8, page: 203, manzil: 5, hasText: false, hasEn: false },
  { id: 46, sura: 'Al-Jāthiya · Al-Aḥqāf · Muḥammad · Al-Fatḥ', suraAr: 'الجاثية · الأحقاف · محمد · الفتح', range: 'Q. 45:1–48:29', vol: 9, page: 3, manzil: 6, hasText: false, hasEn: false },
  { id: 47, sura: 'Al-Ḥujurāt · Qāf · Al-Dhāriyāt', suraAr: 'الحجرات · ق · الذاريات', range: 'Q. 49:1–51:60', vol: 9, page: 56, manzil: 6, hasText: false, hasEn: false },
  { id: 48, sura: 'Al-Ṭūr · Al-Najm · Al-Qamar', suraAr: 'الطور · النجم · القمر', range: 'Q. 52:1–54:55', vol: 9, page: 108, manzil: 6, hasText: false, hasEn: false },
  { id: 49, sura: 'Al-Raḥmān · Al-Wāqiʿa · Al-Ḥadīd', suraAr: 'الرحمن · الواقعة · الحديد', range: 'Q. 55:1–57:29', vol: 9, page: 152, manzil: 6, hasText: false, hasEn: false },
  { id: 50, sura: 'Al-Mujādala · Al-Ḥashr · Al-Mumtaḥana · Al-Ṣaff', suraAr: 'المجادلة · الحشر · الممتحنة · الصف', range: 'Q. 58:1–61:14', vol: 9, page: 189, manzil: 6, hasText: false, hasEn: false },
  { id: 51, sura: 'Al-Jumʿa · Al-Munāfiqūn · Al-Taghābun · Al-Ṭalāq · Al-Taḥrīm', suraAr: 'الجمعة · المنافقون · التغابن · الطلاق · التحريم', range: 'Q. 62:1–66:12', vol: 10, page: 3, manzil: 6, hasText: false, hasEn: false },
  { id: 52, sura: 'Al-Mulk · Al-Qalam · Al-Ḥāqqa · Al-Maʿārij · Nūḥ', suraAr: 'الملك · القلم · الحاقة · المعارج · نوح', range: 'Q. 67:1–71:28', vol: 10, page: 52, manzil: 6, hasText: false, hasEn: false },
  { id: 53, sura: 'Al-Jinn · Al-Muzzammil · Al-Muddaththir · Al-Qiyāma · Al-Insān · Al-Mursalāt', suraAr: 'الجن · المزمل · المدثر · القيامة · الإنسان · المرسلات', range: 'Q. 72:1–77:50', vol: 10, page: 94, manzil: 6, hasText: false, hasEn: false },
  { id: 54, sura: 'Al-Nabaʾ · Al-Nāziʿāt · ʿAbasa · Al-Takwīr · Al-Infiṭār · Al-Muṭaffifīn · Al-Inshiqāq · Al-Burūj · Al-Ṭāriq', suraAr: 'النبأ · النازعات · عبس · التكوير · الانفطار · المطففين · الانشقاق · البروج · الطارق', range: 'Q. 78:1–86:17', vol: 10, page: 129, manzil: 6, hasText: false, hasEn: false },
  { id: 55, sura: 'Al-Aʿlā through Al-Zalzala', suraAr: 'الأعلى · الغاشية · الفجر · البلد · الشمس · الليل · الضحى · الشرح · التين · العلق · القدر · البينة · الزلزلة', range: 'Q. 87:1–99:8', vol: 10, page: 167, manzil: 6, hasText: false, hasEn: false },
  { id: 56, sura: 'Al-ʿĀdiyāt through Al-Masad', suraAr: 'العاديات · القارعة · التكاثر · العصر · الهمزة · الفيل · قريش · الماعون · الكوثر · الكافرون · النصر · المسد', range: 'Q. 100:1–111:5', vol: 10, page: 207, manzil: 6, hasText: false, hasEn: false },
  { id: 57, sura: 'Al-Ikhlāṣ · Al-Falaq · Al-Nās', suraAr: 'الإخلاص · الفلق · الناس', range: 'Q. 112:1–114:6', vol: 10, page: 223, manzil: 6, hasText: false, hasEn: false },
];

const MANZIL_NAMES = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'];
const MANZIL_COLOURS = ['', '#6B2424', '#6B2424', '#6B2424', '#6B2424', '#1E5A4A', '#1A3A5C', '#1A3A5C'];

export default function ReadPage() {
  const [query, setQuery] = useState('');
  const [manzilOpen, setManzilOpen] = useState(false);

  const filtered = query.trim()
    ? LESSONS.filter(l =>
        l.sura.toLowerCase().includes(query.toLowerCase()) ||
        l.suraAr.includes(query) ||
        l.range.toLowerCase().includes(query.toLowerCase())
      )
    : LESSONS;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="font-arabic text-gold text-xl font-bold mb-1" dir="rtl">في رياض التفسير</div>
        <h1 className="font-english font-semibold text-lg mb-1"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          Read the Commentary
        </h1>
        <p className="font-english text-xs italic"
          style={{color:'var(--body-sub, rgba(255,255,255,0.45))'}}>
          The complete Quranic commentary of Shaykh Ibrāhīm Niasse — lesson by lesson
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by sūra name, verse, or keyword..."
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

      {/* Lesson count */}
      {query && (
        <p className="font-english text-xs mb-3"
          style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          {filtered.length} lesson{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Lesson list */}
      <div className="space-y-2">
        {filtered.map(lesson => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.08)',
              background: 'var(--panel-body-bg, rgba(13,20,10,0.5))',
            }}>

            {/* Left: sura info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-english text-sm font-semibold group-hover:text-gold transition-colors"
                  style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
                  {lesson.sura}
                </span>
                <span className="font-english text-[10px]"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                  (Lesson {lesson.id})
                </span>
                {lesson.hasEn && (
                  <span className="font-english text-[9px] px-1.5 py-0.5 rounded"
                    style={{background:'rgba(201,168,76,0.15)', color:'#C9A84C'}}>
                    EN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-english text-xs"
                  style={{color:'var(--body-sub, rgba(255,255,255,0.45))'}}>
                  {lesson.range}
                </span>
                <span className="font-english text-[10px]"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
                  · Vol. {lesson.vol}, p. {lesson.page}
                </span>
              </div>
              {!lesson.hasText && (
                <span className="font-english text-[9px] italic"
                  style={{color:'rgba(255,255,255,0.2)'}}>
                  Arabic text in preparation
                </span>
              )}
            </div>

            {/* Right: Arabic name */}
            <div className="flex flex-col items-end ml-3 shrink-0">
              <span className="font-arabic text-sm text-right"
                style={{color:'var(--body-sub, rgba(255,255,255,0.6))', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}
                dir="rtl">
                {lesson.suraAr.split(' · ')[0]}
              </span>
              <span className="font-english text-[9px] mt-0.5"
                style={{color:`rgba(${lesson.manzil <= 3 ? '107,36,36' : lesson.manzil <= 5 ? '30,90,74' : '26,58,92'},0.7)`}}>
                Manzil {lesson.manzil}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Browse by Manzil — collapsible */}
      {!query && (
        <div className="mt-8 border rounded-xl overflow-hidden"
          style={{borderColor:'rgba(201,168,76,0.2)'}}>
          <button
            onClick={() => setManzilOpen(!manzilOpen)}
            className="w-full flex items-center justify-between px-4 py-3 font-english text-sm font-semibold transition-all"
            style={{
              background: 'var(--panel-header-bg, rgba(13,20,10,0.95))',
              color: 'rgba(201,168,76,0.8)',
            }}>
            <span>Browse by Manzil</span>
            <span>{manzilOpen ? '▾' : '▸'}</span>
          </button>

          {manzilOpen && (
            <div className="p-3 grid grid-cols-1 gap-2"
              style={{background:'var(--panel-body-bg, rgba(13,20,10,0.5))'}}>
              {[1,2,3,4,5,6,7].map(m => (
                <Link key={m} href={`/manzil/${m}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all"
                  style={{
                    borderColor: MANZIL_COLOURS[m] + '40',
                    background: MANZIL_COLOURS[m] + '10',
                  }}>
                  <span className="font-english text-sm font-semibold"
                    style={{color: MANZIL_COLOURS[m]}}>
                    {MANZIL_NAMES[m]} Manzil
                  </span>
                  <span className="font-arabic text-xs" dir="rtl"
                    style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
                    {['','المنزل الأول','المنزل الثاني','المنزل الثالث','المنزل الرابع','المنزل الخامس','المنزل السادس','المنزل السابع'][m]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
