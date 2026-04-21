import Link from 'next/link';

const LESSONS = [{"id": 51, "sura": "Al-Jumʿa / Al-Munāfiqūn / Al-Taghābun / Al-Ṭalāq / Al-Taḥrīm", "titleAr": "سورة الجمعة / سورة المنافقين / سورة التغابن / سورة الطلاق / سورة التحريم", "range": "Q. 62:1–66:12", "summary": "", "hasText": false}, {"id": 52, "sura": "Al-Mulk / Al-Qalam / Al-Ḥāqqa / Al-Maʿārij / Nūḥ", "titleAr": "سورة الملك / سورة القلم / سورة الحاقة / سورة المعارج / سورة نوح", "range": "Q. 67:1–71:28", "summary": "", "hasText": false}, {"id": 53, "sura": "Al-Jinn / Al-Muzzammil / Al-Muddaththir / Al-Qiyāma / Al-Insān / Al-Mursalāt", "titleAr": "سورة الجن / سورة المزمل / سورة المدثر / سورة القيامة / سورة الإنسان / سورة المرسلات", "range": "Q. 72:1–77:50", "summary": "", "hasText": false}, {"id": 54, "sura": "Al-Nabaʾ / Al-Nāziʿāt / ʿAbasa / Al-Takwīr / Al-Infiṭār / Al-Muṭaffifīn / Al-Inshiqāq / Al-Burūj / Al-Ṭāriq", "titleAr": "سورة النبأ / سورة النازعات / سورة عبس / سورة التكوير / سورة الانفطار / سورة المطففين / سورة الانشقاق / سورة البروج / سورة الطارق", "range": "Q. 78:1–86:17", "summary": "", "hasText": true}, {"id": 55, "sura": "Al-Aʿlā / Al-Ghāshiya / Al-Fajr / Al-Balad / Al-Shams / Al-Layl / Al-Ḍuḥā / Al-Sharḥ / Al-Tīn / Al-ʿAlaq / Al-Qadr / Al-Bayyina / Al-Zalzala", "titleAr": "سورة الأعلى / سورة الغاشية / سورة الفجر / سورة البلد / سورة الشمس / سورة الليل / سورة الضحى / سورة الشرح / سورة التين / سورة العلق / سورة القدر / سورة البينة / سورة الزلزلة", "range": "Q. 87:1–99:8", "summary": "", "hasText": true}, {"id": 56, "sura": "Al-ʿĀdiyāt / Al-Qāriʿa / Al-Takāthur / Al-ʿAṣr / Al-Humaza / Al-Fīl / Quraysh / Al-Māʿūn / Al-Kawthar / Al-Kāfirūn / Al-Naṣr / Al-Masad", "titleAr": "سورة العاديات / سورة القارعة / سورة التكاثر / سورة العصر / سورة الهمزة / سورة الفيل / سورة قريش / سورة الماعون / سورة الكوثر / سورة الكافرون / سورة النصر / سورة المسد", "range": "Q. 100:1–111:5", "summary": "", "hasText": true}, {"id": 57, "sura": "Al-Ikhlāṣ / Al-Falaq / Al-Nās", "titleAr": "سورة الإخلاص / سورة الفلق / سورة الناس", "range": "Q. 112:1–114:6", "summary": "", "hasText": false}];

export default function Manzil7Page() {
  return (
    <main className="max-w-5xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-6">
        <Link href="/read" className="font-english text-xs flex items-center gap-1 mb-4"
          style={{color:'rgba(107,36,36,0.6)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Reading
        </Link>
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl" style={{color:'#1A3A5C'}}>المنزل السابع</div>
        <h1 className="font-english font-bold text-xl mb-0.5" style={{color:'#1A3A5C'}}>Seventh Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Seven · Al-Jumʿa — Al-Nās · Sūras 62–114
        </p>
      </div>

      {/* Grid — 3 col desktop, 1 col mobile compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LESSONS.map((lesson: any) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block px-4 py-3 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? '#1A3A5C35' : 'rgba(255,255,255,0.08)',
              background: lesson.hasText ? '#1A3A5C08' : 'transparent',
            }}>

            {/* Mobile: compact single line */}
            <div className="flex md:hidden items-center justify-between gap-2">
              <span className="font-english text-sm font-bold group-hover:opacity-80"
                style={{color:'#1A3A5C'}}>
                {lesson.sura.split('·')[0].trim()}
              </span>
              <span className="font-english text-[10px] shrink-0"
                style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}> 
                {lesson.range}
              </span>
            </div>

            {/* Desktop: full card with summary */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-english text-sm font-bold group-hover:opacity-80 leading-tight"
                  style={{color:'#1A3A5C'}}>
                  {lesson.sura.split('·')[0].trim()}
                </span>
                <span className="font-english text-[9px] shrink-0 mt-0.5"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}> 
                  (L{lesson.id})
                </span>
              </div>
              <p className="font-english text-[10px] mb-1.5"
                style={{color:'var(--body-faint, rgba(255,255,255,0.4))'}}> 
                {lesson.range}
              </p>
              {lesson.summary && (
                <p className="font-english text-xs italic leading-4"
                  style={{color:'var(--body-sub, rgba(255,255,255,0.55))'}}> 
                  {lesson.summary}
                </p>
              )}
              {!lesson.hasText && (
                <p className="font-english text-[9px] italic mt-1"
                  style={{color:'rgba(255,255,255,0.2)'}}> 
                  Arabic text in preparation
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
