import Link from 'next/link';

const LESSONS = [{"id": 41, "title": "Lesson Forty-One · Sabaʾ / Fāṭir", "titleAr": "سورة سبإ / سورة فاطر", "range": "Q. 34:1–35:45", "vol": 8, "page": 3, "summary": "", "hasText": false}, {"id": 42, "title": "Lesson Forty-Two · Yā Sīn / Al-Ṣāffāt", "titleAr": "سورة يس / سورة الصافات", "range": "Q. 36:1–37:182", "vol": 8, "page": 55, "summary": "", "hasText": false}, {"id": 43, "title": "Lesson Forty-Three · Ṣād / Al-Zumar", "titleAr": "سورة ص / سورة الزمر", "range": "Q. 38:1–39:75", "vol": 8, "page": 105, "summary": "", "hasText": false}, {"id": 44, "title": "Lesson Forty-Four · Ghāfir / Fuṣṣilat", "titleAr": "سورة غافر / سورة فصلت", "range": "Q. 40:1–41:54", "vol": 8, "page": 159, "summary": "", "hasText": false}, {"id": 45, "title": "Lesson Forty-Five · Al-Shūrā / Al-Zukhruf / Al-Dukhān", "titleAr": "سورة الشورى / سورة الزخرف / سورة الدخان", "range": "Q. 42:1–44:59", "vol": 8, "page": 203, "summary": "", "hasText": false}, {"id": 46, "title": "Lesson Forty-Six · Al-Jāthiya / Al-Aḥqāf / Muḥammad / Al-Fatḥ", "titleAr": "سورة الجاثية / سورة الأحقاف / سورة محمد / سورة الفتح", "range": "Q. 45:1–48:29", "vol": 9, "page": 3, "summary": "", "hasText": false}, {"id": 47, "title": "Lesson Forty-Seven · Al-Ḥujurāt / Qāf / Al-Dhāriyāt", "titleAr": "سورة الحجرات / سورة المجيد / سورة الذاريات", "range": "Q. 49:1–51:60", "vol": 9, "page": 56, "summary": "", "hasText": false}, {"id": 48, "title": "Lesson Forty-Eight · Al-Ṭūr / Al-Najm / Al-Qamar", "titleAr": "سورة الطور / سورة النجم / سورة القمر", "range": "Q. 52:1–54:55", "vol": 9, "page": 108, "summary": "", "hasText": false}, {"id": 49, "title": "Lesson Forty-Nine · Al-Raḥmān / Al-Wāqiʿa / Al-Ḥadīd", "titleAr": "سورة الرحمن / سورة الواقعة / سورة الحديد", "range": "Q. 55:1–57:29", "vol": 9, "page": 152, "summary": "", "hasText": false}, {"id": 50, "title": "Lesson Fifty · Al-Mujādala / Al-Ḥashr / Al-Mumtaḥana / Al-Ṣaff", "titleAr": "سورة المجادلة / سورة الحشر / سورة الممتحنة / سورة الصف", "range": "Q. 58:1–61:14", "vol": 9, "page": 189, "summary": "", "hasText": false}];

export default function Manzil6Page() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-6">
        <Link href="/read" className="font-english text-xs flex items-center gap-1 mb-4"
          style={{color:'rgba(107,36,36,0.6)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Reading
        </Link>
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl"
          style={{color:'#1A3A5C'}}>المنزل السادس</div>
        <h1 className="font-english font-bold text-xl mb-0.5"
          style={{color:'#1A3A5C'}}>Sixth Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Six · Sabaʾ — Al-Ṣaff · Sūras 34–61
        </p>
      </div>

      {/* Lesson cards */}
      <div className="space-y-3">
        {LESSONS.map((lesson: any) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block px-4 py-4 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? '#1A3A5C30' : 'rgba(255,255,255,0.08)',
              background: lesson.hasText ? '#1A3A5C08' : 'transparent',
            }}>

            {/* Sūrah name + verse range */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <span className="font-english text-sm font-bold group-hover:opacity-80 transition-opacity"
                  style={{color:'#1A3A5C'}}>
                  {lesson.title.replace(/Lesson \w+( \w+)? · /, '').split('·')[0].trim()}
                </span>
                <span className="font-english text-[10px] ml-2"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}> 
                  (Lesson {lesson.id})
                </span>
              </div>
              <span className="font-english text-[10px] shrink-0"
                style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}> 
                {lesson.range}
              </span>
            </div>

            {/* First sentence summary */}
            {lesson.summary && (
              <p className="font-english text-xs italic leading-5"
                style={{color:'var(--body-sub, rgba(255,255,255,0.55))'}}> 
                {lesson.summary}
              </p>
            )}
            {!lesson.summary && (
              <p className="font-english text-[10px] italic"
                style={{color:'rgba(255,255,255,0.2)'}}> 
                {lesson.hasText ? 'Overview forthcoming' : 'Arabic text in preparation'}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
