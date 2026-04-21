import Link from 'next/link';

const LESSONS = [{"id": 14, "sura": "Q. 5:23–81", "titleAr": "الدرس الرابع عشر", "range": "Q. 5:23–81", "summary": "Lesson 14 covers the Israelites' refusal to enter the Holy Land, with Shaykh Ibrāhīm focusing on the courage of Yūshaʿ b.", "hasText": true}, {"id": 15, "sura": "Q. 5:82–6:35", "titleAr": "الدرس الخامس عشر", "range": "Q. 5:82–6:35", "summary": "Lesson 15 opens with the distinction between the Jews and the Christians in their relations with the Muslim community (Q.", "hasText": true}, {"id": 16, "sura": "Q. 6:36–110", "titleAr": "الدرس السادس عشر", "range": "Q. 6:36–110", "summary": "Lesson 16 covers a substantial portion of al-Anʿām, one of the Qurʾānic suras most heavily freighted with theological argument.", "hasText": true}, {"id": 17, "sura": "Q. 6:111–165", "titleAr": "الدرس السابع عشر", "range": "Q. 6:111–165", "summary": "Lesson 17 addresses the divine argument about free will and hidāya (guidance).", "hasText": true}, {"id": 18, "sura": "Q. 7:1–87", "titleAr": "الدرس الثامن عشر", "range": "Q. 7:1–87", "summary": "Lesson 18 opens with the disconnected letters Alif Lām Mīm Ṣād, which Shaykh Ibrāhīm treats as divine secrets whose full meanin…", "hasText": true}, {"id": 19, "sura": "Q. 7:88–170", "titleAr": "الدرس التاسع عشر", "range": "Q. 7:88–170", "summary": "Lesson 19 centres on the narrative of Shuʿayb and the people of Madyan (Q.", "hasText": true}, {"id": 20, "sura": "Q. 7:171–8:40", "titleAr": "الدرس العشرون", "range": "Q. 7:171–8:40", "summary": "Lesson 20 opens with the covenant of Alast (Q.", "hasText": true}, {"id": 21, "sura": "Q. 8:41–9:33", "titleAr": "الدرس الحادي والعشرون", "range": "Q. 8:41–9:33", "summary": "Lesson 21 covers the rules of war spoils (Q.", "hasText": true}, {"id": 22, "sura": "Q. 9:34–92", "titleAr": "الدرس الثاني والعشرون", "range": "Q. 9:34–92", "summary": "Lesson 22 covers the extended censure of the hypocrites in al-Tawba and Shaykh Ibrāhīm's commentary on Q.", "hasText": true}, {"id": 23, "sura": "Q. 9:93–10:25", "titleAr": "الدرس الثالث والعشرون", "range": "Q. 9:93–10:25", "summary": "Lesson 23 closes al-Tawba with the severe censure of those who sought permission to stay behind from the Tabūk expedition, then…", "hasText": true}];

export default function Manzil2Page() {
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
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl" style={{color:'#6B2424'}}>المنزل الثاني</div>
        <h1 className="font-english font-bold text-xl mb-0.5" style={{color:'#6B2424'}}>Second Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Two · Al-Māʾida — Al-Tawba · Sūras 5–9
        </p>
      </div>

      {/* Grid — 3 col desktop, 1 col mobile compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LESSONS.map((lesson: any) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block px-4 py-3 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? '#6B242435' : 'rgba(255,255,255,0.08)',
              background: lesson.hasText ? '#6B242408' : 'transparent',
            }}>

            {/* Mobile: compact single line */}
            <div className="flex md:hidden items-center justify-between gap-2">
              <span className="font-english text-sm font-bold group-hover:opacity-80"
                style={{color:'#6B2424'}}>
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
                  style={{color:'#6B2424'}}>
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
