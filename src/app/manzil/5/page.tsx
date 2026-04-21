import Link from 'next/link';

const LESSONS = [
  { id: 36, en: "Al-Furqān", ar: "سورة الفرقان", range: "Q. 25:1–77" },
  { id: 37, en: "Al-Shuʿarāʾ · Al-Naml", ar: "سورة الشعراء · النمل", range: "Q. 26:1–27:93" },
  { id: 38, en: "Al-Qaṣaṣ", ar: "سورة القصص", range: "Q. 28:1–88" },
  { id: 39, en: "Al-ʿAnkabūt · Al-Rūm · Luqmān", ar: "سورة العنكبوت · الروم · لقمان", range: "Q. 29:1–31:34" },
  { id: 40, en: "Al-Sajda · Al-Aḥzāb", ar: "سورة السجدة · الأحزاب", range: "Q. 32:1–33:73" },
];

export default function Manzil5Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-24 pt-8" dir="ltr">
      <div className="mb-8 text-center">
        <div className="font-arabic text-gold text-2xl mb-1" dir="rtl">المنزل الخامس</div>
        <h1 className="font-english text-white text-xl font-semibold mb-1">Manzil Five</h1>
        <p className="font-english text-sm" style={{color:'rgba(255,255,255,0.4)'}}>
          Sūrat al-Furqān — Sūrat al-Aḥzāb · Volume 7 · Lessons 36–40
        </p>
      </div>
      <div className="space-y-3">
        {LESSONS.map((lesson) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block border border-white/10 hover:border-gold/40 rounded-xl px-5 py-4 transition-all hover:bg-gold/5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-arabic text-base leading-7 mb-1" dir="rtl"
                  style={{color:'rgba(255,255,255,0.85)'}}>{lesson.ar}</div>
                <div className="font-english text-sm" style={{color:'rgba(255,255,255,0.5)'}}>{lesson.en}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-english text-xs text-gold/60">{lesson.range}</div>
                <div className="font-english text-xs mt-1 group-hover:text-gold transition-colors"
                  style={{color:'rgba(255,255,255,0.3)'}}>Lesson {lesson.id}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/read" className="font-english text-sm hover:text-gold transition-colors"
          style={{color:'rgba(255,255,255,0.3)'}}>← All Manzils</Link>
      </div>
    </main>
  );
}
