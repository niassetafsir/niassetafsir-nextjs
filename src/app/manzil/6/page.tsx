import Link from 'next/link';

const LESSONS = [{"id": 41, "sura": "Sabaʾ / Fāṭir", "titleAr": "سورة سبإ / سورة فاطر", "range": "Q. 34:1–35:45", "summary": "", "hasText": false}, {"id": 42, "sura": "Yā Sīn / Al-Ṣāffāt", "titleAr": "سورة يس / سورة الصافات", "range": "Q. 36:1–37:182", "summary": "", "hasText": false}, {"id": 43, "sura": "Ṣād / Al-Zumar", "titleAr": "سورة ص / سورة الزمر", "range": "Q. 38:1–39:75", "summary": "", "hasText": false}, {"id": 44, "sura": "Ghāfir / Fuṣṣilat", "titleAr": "سورة غافر / سورة فصلت", "range": "Q. 40:1–41:54", "summary": "", "hasText": false}, {"id": 45, "sura": "Al-Shūrā / Al-Zukhruf / Al-Dukhān", "titleAr": "سورة الشورى / سورة الزخرف / سورة الدخان", "range": "Q. 42:1–44:59", "summary": "", "hasText": false}, {"id": 46, "sura": "Al-Jāthiya / Al-Aḥqāf / Muḥammad / Al-Fatḥ", "titleAr": "سورة الجاثية / سورة الأحقاف / سورة محمد / سورة الفتح", "range": "Q. 45:1–48:29", "summary": "", "hasText": false}, {"id": 47, "sura": "Al-Ḥujurāt / Qāf / Al-Dhāriyāt", "titleAr": "سورة الحجرات / سورة المجيد / سورة الذاريات", "range": "Q. 49:1–51:60", "summary": "", "hasText": false}, {"id": 48, "sura": "Al-Ṭūr / Al-Najm / Al-Qamar", "titleAr": "سورة الطور / سورة النجم / سورة القمر", "range": "Q. 52:1–54:55", "summary": "", "hasText": false}, {"id": 49, "sura": "Al-Raḥmān / Al-Wāqiʿa / Al-Ḥadīd", "titleAr": "سورة الرحمن / سورة الواقعة / سورة الحديد", "range": "Q. 55:1–57:29", "summary": "", "hasText": false}, {"id": 50, "sura": "Al-Mujādala / Al-Ḥashr / Al-Mumtaḥana / Al-Ṣaff", "titleAr": "سورة المجادلة / سورة الحشر / سورة الممتحنة / سورة الصف", "range": "Q. 58:1–61:14", "summary": "", "hasText": false}];

export default function Manzil6Page() {
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
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl" style={{color:'#1A3A5C'}}>المنزل السادس</div>
        <h1 className="font-english font-bold text-xl mb-0.5" style={{color:'#1A3A5C'}}>Sixth Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Six · Sabaʾ — Al-Ṣaff · Sūras 34–61
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
