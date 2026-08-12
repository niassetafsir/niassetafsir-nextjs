import Link from 'next/link';

const LESSONS = [{"id": 31, "sura": "Al-Kahf", "titleAr": "الدرس الحادي والثلاثون", "range": "Sūrat Al-Kahf", "summary": "Lesson 31 opens Sūrat Al-Kahf with an extended meditation on the meaning of ḥamd (praise) — verbal, active, and existential…", "hasText": true}, {"id": 32, "sura": "Maryam / Ṭāhā", "titleAr": "الدرس الثاني والثلاثون", "range": "Sūrat Maryam – Sūrat Ṭāhā", "summary": "Lesson 32 opens Sūrat Maryam with a doctrinal reflection on why Mary is named explicitly some thirty times in the Qurʾān while…", "hasText": true}, {"id": 33, "sura": "Ṭāhā / Al-Anbiyāʾ", "titleAr": "الدرس الثالث والثلاثون", "range": "Sūrat Ṭāhā – Sūrat Al-Anbiyāʾ", "summary": "Lesson 33 resumes abruptly within Sūrat Ṭāhā at Q. 20:55 ('From it We created you, and into it We return you, and from it We…", "hasText": true}, {"id": 34, "sura": "Al-Anbiyāʾ / Al-Ḥajj", "titleAr": "الدرس الرابع والثلاثون", "range": "Sūrat Al-Anbiyāʾ – Sūrat Al-Ḥajj", "summary": "Lesson 34 opens within Sūrat Al-Anbiyāʾ with Ibrāhīm's confrontation with his people after he has broken their idols: turning…", "hasText": true}, {"id": 35, "sura": "Al-Muʾminūn / Al-Nūr", "titleAr": "الدرس الخامس والثلاثون", "range": "Sūrat Al-Muʾminūn – Sūrat Al-Nūr", "summary": "Lesson 35 opens Sūrat Al-Muʾminūn with the declaration that the believers have attained success, and offers a detailed anatomy…", "hasText": true}];

export default function Manzil4Page() {
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
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl" style={{color:'#1E5A4A'}}>المنزل الرابع</div>
        <h1 className="font-english font-bold text-xl mb-0.5" style={{color:'#1E5A4A'}}>Fourth Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day Four · Al-Isrāʾ — Al-Furqān · Sūras 17–25
        </p>
      </div>

      {/* Grid — 3 col desktop, 1 col mobile compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LESSONS.map((lesson: any) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block px-4 py-3 rounded-xl border transition-all group"
            style={{
              borderColor: lesson.hasText ? '#1E5A4A35' : 'rgba(255,255,255,0.08)',
              background: lesson.hasText ? '#1E5A4A08' : 'transparent',
            }}>

            {/* Mobile: compact single line */}
            <div className="flex md:hidden items-center justify-between gap-2">
              <span className="font-english text-sm font-bold group-hover:opacity-80"
                style={{color:'#1E5A4A'}}>
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
                  style={{color:'#1E5A4A'}}>
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
