import Link from 'next/link';

const LESSONS = [{"id": 1, "title": "Al-Istiʿādha, Basmala, and Sūrat al-Fātiḥa", "titleAr": "الدرس الأول", "range": "Al-Istiʿādha · Q. 1:1–2:5", "vol": 1, "page": 29, "summary": "Lesson 1 opens with a methodological statement in which Shaykh Ibrāhīm defines the science of tafsīr, distinguishes it from taʾ…", "hasText": true}, {"id": 2, "title": "Sūrat al-Baqara · Q. 2:6–25", "titleAr": "الدرس الثاني", "range": "Q. 2:6–25", "vol": 1, "page": 54, "summary": "Lesson 2 opens al-Baqara with Shaykh Ibrāhīm's structural survey, four verses on the believers, two on the disbelievers, and th…", "hasText": true}, {"id": 3, "title": "Sūrat al-Baqara · Q. 2:26–59", "titleAr": "الدرس الثالث", "range": "Q. 2:26–59", "vol": 1, "page": 59, "summary": "Lesson 3 centres on Q.", "hasText": true}, {"id": 4, "title": "Sūrat al-Baqara · Q. 2:60–105", "titleAr": "الدرس الرابع", "range": "Q. 2:60–105", "vol": 1, "page": 72, "summary": "Lesson 4 covers the Israelites' sojourn in the wilderness, including the miraculous water from the rock, the manna and quails, …", "hasText": true}, {"id": 5, "title": "Sūrat al-Baqara · Q. 2:106–202", "titleAr": "الدرس الخامس", "range": "Q. 2:106–202", "vol": 1, "page": 96, "summary": "Lesson 5 opens with the doctrine of abrogation (naskh), which Shaykh Ibrāhīm defends against objectors with a fourfold typology…", "hasText": true}, {"id": 6, "title": "Sūrat al-Baqara · Q. 2:203–252", "titleAr": "الدرس السادس", "range": "Q. 2:203–252", "vol": 1, "page": 120, "summary": "Lesson 6 completes al-Baqara, beginning with the remaining ḥajj verses, notably the distinction between those who hasten and th…", "hasText": true}, {"id": 7, "title": "Sūrat al-Baqara / Āl ʿImrān · Q. 2:253–3:14", "titleAr": "الدرس السابع", "range": "Q. 2:253–3:14", "vol": 2, "page": 3, "summary": "Lesson 7 opens with the verse of the prophets' ranks (Q.", "hasText": true}, {"id": 8, "title": "Sūrat Āl ʿImrān · Q. 3:15–91", "titleAr": "الدرس الثامن", "range": "Q. 3:15–91", "vol": 2, "page": 34, "summary": "Lesson 8 addresses the question of steadfastness versus attachment to worldly goods, reading Q.", "hasText": true}, {"id": 9, "title": "Sūrat Āl ʿImrān · Q. 3:92–175", "titleAr": "الدرس التاسع", "range": "Q. 3:92–175", "vol": 2, "page": 46, "summary": "Lesson 9 opens with Q.", "hasText": true}, {"id": 10, "title": "Sūrat Āl ʿImrān / al-Nisāʾ · Q. 3:176–4:23", "titleAr": "الدرس العاشر", "range": "Q. 3:176–4:23", "vol": 2, "page": 79, "summary": "Lesson 10 continues the Uḥud narrative, covering the immediate aftermath of the battle and the believers' response to the call …", "hasText": true}, {"id": 11, "title": "Sūrat al-Nisāʾ · Q. 4:24–86", "titleAr": "الدرس الحادي عشر", "range": "Q. 4:24–86", "vol": 2, "page": 124, "summary": "Lesson 11 covers the prohibited categories of marriage in detail, with Shaykh Ibrāhīm working through each of the fourteen or f…", "hasText": true}, {"id": 12, "title": "Sūrat al-Nisāʾ · Q. 4:87–147", "titleAr": "الدرس الثاني عشر", "range": "Q. 4:87–147", "vol": 2, "page": 161, "summary": "Lesson 12 opens with Q.", "hasText": true}, {"id": 13, "title": "Sūrat al-Nisāʾ · Q. 4:148–5:22", "titleAr": "الدرس الثالث عشر", "range": "Q. 4:148–5:22", "vol": 3, "page": 3, "summary": "Lesson 13 opens with Q.", "hasText": true}];

export default function Manzil1Page() {
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
          style={{color:'#6B2424'}}>المنزل الأول</div>
        <h1 className="font-english font-bold text-xl mb-0.5"
          style={{color:'#6B2424'}}>First Manzil</h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          Day One · Al-Fātiḥa — Al-Nisāʾ · Sūras 1–4
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
