import Link from 'next/link';

const LESSONS = [{"id": 41, "sura": "Al-Aḥzāb / Sabaʾ / Fāṭir", "titleAr": "الدرس الحادي والأربعون", "range": "Sūrat Al-Aḥzāb – Sūrat Fāṭir", "summary": "Lesson 41 continues within Sūrat Al-Aḥzāb, focusing on the special legal and spiritual status of the Prophet's wives: their…", "hasText": true}, {"id": 42, "sura": "Fāṭir / Yā-Sīn / Al-Ṣāffāt", "titleAr": "الدرس الثاني والأربعون", "range": "Sūrat Fāṭir – Sūrat Al-Ṣāffāt", "summary": "Lesson 42 opens Sūrat Fāṭir with the verse addressing all of humanity as beings utterly poor before God (Q. 35:15), which…", "hasText": true}, {"id": 43, "sura": "Al-Ṣāffāt / Ṣād / Al-Zumar", "titleAr": "الدرس الثالث والأربعون", "range": "Sūrat Al-Ṣāffāt – Sūrat Al-Zumar", "summary": "Lesson 43 continues through Sūrat Al-Ṣāffāt and into Sūrat Ṣād, closing with the story of Sulaymān: his prayer for a kingdom…", "hasText": true}, {"id": 44, "sura": "Ghāfir / Fuṣṣilat", "titleAr": "الدرس الرابع والأربعون", "range": "Sūrat Ghāfir – Sūrat Fuṣṣilat", "summary": "Lesson 44 opens directly on the disconnected letters Ḥā-Mīm at the start of Sūrat Ghāfir, introduced by a rich collection of…", "hasText": true}, {"id": 45, "sura": "Fuṣṣilat / Al-Shūrā / Al-Zukhruf / Al-Dukhān", "titleAr": "الدرس الخامس والأربعون", "range": "Sūrat Fuṣṣilat – Sūrat Al-Dukhān", "summary": "Lesson 45 works through Sūrat Fuṣṣilat and into Sūrat Al-Shūrā, closing with a treatment of divine trial through calamity at…", "hasText": true}, {"id": 46, "sura": "Al-Dukhān / Al-Jāthiya / Al-Aḥqāf / Muḥammad / Al-Fatḥ", "titleAr": "الدرس السادس والأربعون", "range": "Sūrat Al-Dukhān – Sūrat Al-Fatḥ", "summary": "Lesson 46 opens abruptly at Q. 44:24, in the middle of Sūrat Al-Dukhān's account of the crossing of the sea and Pharaoh's…", "hasText": true}, {"id": 47, "sura": "Al-Fatḥ / Al-Ḥujurāt / Qāf / Al-Dhāriyāt", "titleAr": "الدرس السابع والأربعون", "range": "Sūrat Al-Fatḥ – Sūrat Al-Dhāriyāt", "summary": "Lesson 47 opens Sūrat Al-Fatḥ with a detailed narrative account of the Pledge of the Tree at Ḥudaybiya: the Prophet's peaceful…", "hasText": true}, {"id": 48, "sura": "Al-Dhāriyāt / Al-Ṭūr / Al-Najm / Al-Qamar", "titleAr": "الدرس الثامن والأربعون", "range": "Sūrat Al-Dhāriyāt – Sūrat Al-Qamar", "summary": "Lesson 48 opens within Sūrat Al-Dhāriyāt with the continuation of the angelic guests' visit to Ibrāhīm, who asks their errand…", "hasText": true}, {"id": 49, "sura": "Al-Raḥmān / Al-Wāqiʿa / Al-Ḥadīd", "titleAr": "الدرس التاسع والأربعون", "range": "Sūrat Al-Raḥmān – Sūrat Al-Ḥadīd", "summary": "Lesson 49 opens Sūrat Al-Raḥmān, noting the Qurʾān's pattern of following severity with mercy — Sūrat Al-Qamar, its…", "hasText": true}, {"id": 50, "sura": "Al-Mujādala / Al-Ḥashr / Al-Mumtaḥana / Al-Ṣaff", "titleAr": "الدرس الخمسون", "range": "Sūrat Al-Mujādala – Sūrat Al-Ṣaff", "summary": "Lesson 50 opens Sūrat Al-Mujādala with the detailed narrative behind its first verses: Khawla bint Thaʿlaba's husband, Aws ibn…", "hasText": true}];

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
