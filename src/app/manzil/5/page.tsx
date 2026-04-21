import Link from 'next/link';

const LESSONS = [{"id": 36, "title": "Lesson Thirty-Six · Al-Furqān", "titleAr": "سورة الفرقان", "range": "Q. 25:1–77", "vol": 7, "page": 3, "summary": "", "hasText": false}, {"id": 37, "title": "Lesson Thirty-Seven · Al-Shuʿarāʾ / Al-Naml", "titleAr": "سورة الشعراء / سورة النمل", "range": "Q. 26:1–27:93", "vol": 7, "page": 52, "summary": "", "hasText": false}, {"id": 38, "title": "Lesson Thirty-Eight · Al-Qaṣaṣ", "titleAr": "سورة القصص", "range": "Q. 28:1–88", "vol": 7, "page": 114, "summary": "", "hasText": false}, {"id": 39, "title": "Lesson Thirty-Nine · Al-ʿAnkabūt / Al-Rūm / Luqmān", "titleAr": "سورة العنكبوت / سورة الروم / سورة لقمان", "range": "Q. 29:1–31:34", "vol": 7, "page": 145, "summary": "", "hasText": false}, {"id": 40, "title": "Lesson Forty · Al-Sajda / Al-Aḥzāb", "titleAr": "سورة السجدة / سورة الأحزاب", "range": "Q. 32:1–33:73", "vol": 7, "page": 195, "summary": "", "hasText": false}];

export default function Manzil5Page() {
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
          style={{color:'#1E5A4A'}}>المنزل الخامس</div>
        <h1 className="font-english font-bold text-xl mb-0.5"
          style={{color:'#1E5A4A'}}>Fifth Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Five · Al-Furqān — Al-Aḥzāb · Sūras 25–33
        </p>
      </div>

      {/* Lesson cards */}
      <div className="space-y-3">
        {LESSONS.map((lesson: any) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block px-4 py-4 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? '#1E5A4A30' : 'rgba(255,255,255,0.08)',
              background: lesson.hasText ? '#1E5A4A08' : 'transparent',
            }}>

            {/* Sūrah name + verse range */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <span className="font-english text-sm font-bold group-hover:opacity-80 transition-opacity"
                  style={{color:'#1E5A4A'}}>
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
