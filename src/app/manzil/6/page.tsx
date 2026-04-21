import Link from 'next/link';

const MANZIL6_LESSONS = [
  { id: 46, en: "Al-Jāthiya · Al-Aḥqāf · Muḥammad · Al-Fatḥ", ar: "الجاثية · الأحقاف · محمد · الفتح", range: "Q. 45–48" },
  { id: 47, en: "Al-Ḥujurāt · Qāf · Al-Dhāriyāt", ar: "الحجرات · ق · الذاريات", range: "Q. 49–51" },
  { id: 48, en: "Al-Ṭūr · Al-Najm · Al-Qamar", ar: "الطور · النجم · القمر", range: "Q. 52–54" },
  { id: 49, en: "Al-Raḥmān · Al-Wāqiʿa · Al-Ḥadīd", ar: "الرحمن · الواقعة · الحديد", range: "Q. 55–57" },
  { id: 50, en: "Al-Mujādala · Al-Ḥashr · Al-Mumtaḥana · Al-Ṣaff", ar: "المجادلة · الحشر · الممتحنة · الصف", range: "Q. 58–61" },
  { id: 51, en: "Al-Jumʿa · Al-Munāfiqūn · Al-Taghābun · Al-Ṭalāq · Al-Taḥrīm", ar: "الجمعة · المنافقون · التغابن · الطلاق · التحريم", range: "Q. 62–66" },
  { id: 52, en: "Al-Mulk · Al-Qalam · Al-Ḥāqqa · Al-Maʿārij · Nūḥ", ar: "الملك · القلم · الحاقة · المعارج · نوح", range: "Q. 67–71" },
  { id: 53, en: "Al-Jinn · Al-Muzzammil · Al-Muddaththir · Al-Qiyāma · Al-Insān · Al-Mursalāt", ar: "الجن · المزمل · المدثر · القيامة · الإنسان · المرسلات", range: "Q. 72–77" },
  { id: 54, en: "Al-Nabaʾ · Al-Nāziʿāt · ʿAbasa · Al-Takwīr · Al-Infiṭār · Al-Muṭaffifīn · Al-Inshiqāq · Al-Burūj · Al-Ṭāriq", ar: "النبأ · النازعات · عبس · التكوير · الانفطار · المطففين · الانشقاق · البروج · الطارق", range: "Q. 78–86" },
  { id: 55, en: "Al-Aʿlā through Al-Zalzala", ar: "الأعلى · الغاشية · الفجر · البلد · الشمس · الليل · الضحى · الشرح · التين · العلق · القدر · البينة · الزلزلة", range: "Q. 87–99" },
  { id: 56, en: "Al-ʿĀdiyāt through Al-Masad", ar: "العاديات · القارعة · التكاثر · العصر · الهمزة · الفيل · قريش · الماعون · الكوثر · الكافرون · النصر · المسد", range: "Q. 100–111" },
  { id: 57, en: "Al-Ikhlāṣ · Al-Falaq · Al-Nās", ar: "الإخلاص · الفلق · الناس", range: "Q. 112–114" },
];

export default function Manzil6Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-24 pt-8" dir="ltr">
      <div className="mb-8 text-center">
        <div className="font-arabic text-gold text-2xl mb-1" dir="rtl">المنزل السادس</div>
        <h1 className="font-english text-white text-xl font-semibold mb-1">Manzil Six</h1>
        <p className="font-english text-sm" style={{color:'var(--body-text, rgba(255,255,255,0.4))'}}>
          Sūrat al-Jāthiya — Sūrat al-Nās · Volumes 9–10 · Lessons 46–57
        </p>
      </div>

      <div className="space-y-3">
        {MANZIL6_LESSONS.map((lesson) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`}
            className="block border border-white/10 hover:border-gold/40 rounded-xl px-5 py-4 transition-all hover:bg-gold/5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-arabic text-base leading-7 mb-1" dir="rtl"
                  style={{color:'var(--body-text, rgba(255,255,255,0.85))'}}>
                  {lesson.ar}
                </div>
                <div className="font-english text-sm" style={{color:'var(--body-text, rgba(255,255,255,0.5))'}}>
                  {lesson.en}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-english text-xs text-gold/60">{lesson.range}</div>
                <div className="font-english text-xs mt-1 group-hover:text-gold transition-colors"
                  style={{color:'var(--body-text, rgba(255,255,255,0.3))'}}>
                  Lesson {lesson.id}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/read" className="font-english text-sm hover:text-gold transition-colors"
          style={{color:'var(--body-text, rgba(255,255,255,0.3))'}}>
          ← All Manzils
        </Link>
      </div>
    </main>
  );
}
