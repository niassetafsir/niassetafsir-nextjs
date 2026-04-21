import Link from 'next/link';

const LESSONS = [{"id": 24, "title": "Sūrat Yūnus / Hūd · Q. 10:26–11:5", "titleAr": "الدرس الرابع والعشرون", "range": "Q. 10:26–11:5", "vol": 4, "page": 165, "summary": "Lesson 24 continues Shaykh Ibrāhīm's commentary on the vision of God (Q.", "hasText": true}, {"id": 25, "title": "Sūrat Hūd · Q. 11:6–83", "titleAr": "الدرس الخامس والعشرون", "range": "Q. 11:6–83", "vol": 4, "page": 196, "summary": "Lesson 25 covers the prophetic narratives at the heart of Hūd.", "hasText": true}, {"id": 26, "title": "Sūrat Hūd / Yūsuf · Q. 11:84–12:52", "titleAr": "الدرس السادس والعشرون", "range": "Q. 11:84–12:52", "vol": 5, "page": 3, "summary": "Lesson 26 continues the Hūd narrative with Shuʿayb's mission to Madyan (Q.", "hasText": true}, {"id": 27, "title": "Sūrat Yūsuf / Al-Raʿd · Q. 12:53–13:18", "titleAr": "الدرس السابع والعشرون", "range": "Q. 12:53–13:18", "vol": 5, "page": 39, "summary": "Lesson 27 covers Yūsuf's self-exculpation and his theological humility (Q.", "hasText": true}, {"id": 28, "title": "Sūrat Ibrāhīm / Al-Ḥijr · Q. 13:19–14:52", "titleAr": "الدرس الثامن والعشرون", "range": "Q. 13:19–14:52", "vol": 5, "page": 70, "summary": "Lesson 28 opens with Q.", "hasText": true}, {"id": 29, "title": "Sūrat al-Ḥijr / Al-Naḥl · Q. 15:1–16:89", "titleAr": "الدرس التاسع والعشرون", "range": "Q. 15:1–16:89", "vol": 5, "page": 100, "summary": "Lesson 29 covers the opening of al-Ḥijr, whose disconnected letters (Alif Lām Rāʾ) Shaykh Ibrāhīm treats as divine mysteries, a…", "hasText": true}, {"id": 30, "title": "Sūrat al-Naḥl / Al-Isrāʾ · Q. 16:90–17:111", "titleAr": "الدرس الثلاثون", "range": "Q. 16:90–17:111", "vol": 5, "page": 144, "summary": "Lesson 30 opens with Q.", "hasText": true}];

export default function Manzil3Page() {
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
          style={{color:'#6B2424'}}>المنزل الثالث</div>
        <h1 className="font-english font-bold text-xl mb-0.5"
          style={{color:'#6B2424'}}>Third Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Three · Yūnus — Al-Naḥl · Sūras 10–16
        </p>
      </div>

      {/* Lesson cards */}
      <div className="space-y-3">
        {LESSONS.map((lesson: any) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block px-4 py-4 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? '#6B242430' : 'rgba(255,255,255,0.08)',
              background: lesson.hasText ? '#6B242408' : 'transparent',
            }}>

            {/* Sūrah name + verse range */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <span className="font-english text-sm font-bold group-hover:opacity-80 transition-opacity"
                  style={{color:'#6B2424'}}>
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
