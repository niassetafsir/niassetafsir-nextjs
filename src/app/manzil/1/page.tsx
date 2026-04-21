import Link from 'next/link';

const LESSONS = [{"id": 1, "sura": "Al-Istiʿādha, Basmala, and Sūrat al-Fātiḥa", "titleAr": "الدرس الأول", "range": "Al-Istiʿādha · Q. 1:1–2:5", "summary": "Lesson 1 opens with a methodological statement in which Shaykh Ibrāhīm defines the science of tafsīr, distinguishes it from taʾ…", "hasText": true}, {"id": 2, "sura": "Q. 2:6–25", "titleAr": "الدرس الثاني", "range": "Q. 2:6–25", "summary": "Lesson 2 opens al-Baqara with Shaykh Ibrāhīm's structural survey, four verses on the believers, two on the disbelievers, and th…", "hasText": true}, {"id": 3, "sura": "Q. 2:26–59", "titleAr": "الدرس الثالث", "range": "Q. 2:26–59", "summary": "Lesson 3 centres on Q.", "hasText": true}, {"id": 4, "sura": "Q. 2:60–105", "titleAr": "الدرس الرابع", "range": "Q. 2:60–105", "summary": "Lesson 4 covers the Israelites' sojourn in the wilderness, including the miraculous water from the rock, the manna and quails, …", "hasText": true}, {"id": 5, "sura": "Q. 2:106–202", "titleAr": "الدرس الخامس", "range": "Q. 2:106–202", "summary": "Lesson 5 opens with the doctrine of abrogation (naskh), which Shaykh Ibrāhīm defends against objectors with a fourfold typology…", "hasText": true}, {"id": 6, "sura": "Q. 2:203–252", "titleAr": "الدرس السادس", "range": "Q. 2:203–252", "summary": "Lesson 6 completes al-Baqara, beginning with the remaining ḥajj verses, notably the distinction between those who hasten and th…", "hasText": true}, {"id": 7, "sura": "Q. 2:253–3:14", "titleAr": "الدرس السابع", "range": "Q. 2:253–3:14", "summary": "Lesson 7 opens with the verse of the prophets' ranks (Q.", "hasText": true}, {"id": 8, "sura": "Q. 3:15–91", "titleAr": "الدرس الثامن", "range": "Q. 3:15–91", "summary": "Lesson 8 addresses the question of steadfastness versus attachment to worldly goods, reading Q.", "hasText": true}, {"id": 9, "sura": "Q. 3:92–175", "titleAr": "الدرس التاسع", "range": "Q. 3:92–175", "summary": "Lesson 9 opens with Q.", "hasText": true}, {"id": 10, "sura": "Q. 3:176–4:23", "titleAr": "الدرس العاشر", "range": "Q. 3:176–4:23", "summary": "Lesson 10 continues the Uḥud narrative, covering the immediate aftermath of the battle and the believers' response to the call …", "hasText": true}, {"id": 11, "sura": "Q. 4:24–86", "titleAr": "الدرس الحادي عشر", "range": "Q. 4:24–86", "summary": "Lesson 11 covers the prohibited categories of marriage in detail, with Shaykh Ibrāhīm working through each of the fourteen or f…", "hasText": true}, {"id": 12, "sura": "Q. 4:87–147", "titleAr": "الدرس الثاني عشر", "range": "Q. 4:87–147", "summary": "Lesson 12 opens with Q.", "hasText": true}, {"id": 13, "sura": "Q. 4:148–5:22", "titleAr": "الدرس الثالث عشر", "range": "Q. 4:148–5:22", "summary": "Lesson 13 opens with Q.", "hasText": true}];

export default function Manzil1Page() {
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
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl" style={{color:'#6B2424'}}>المنزل الأول</div>
        <h1 className="font-english font-bold text-xl mb-0.5" style={{color:'#6B2424'}}>First Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day One · Al-Fātiḥa — Al-Nisāʾ · Sūras 1–4
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
