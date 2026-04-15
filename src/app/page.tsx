import Link from 'next/link';

const LESSON_META: Record<number, {ar: string, en: string, sura: string, hasEn: boolean}> = {
  1: {ar: "الدرس الأول", en: "Lesson One", sura: "Al-Fātiḥa", hasEn: true},
  2: {ar: "الدرس الثاني", en: "Lesson Two", sura: "Al-Baqara", hasEn: true},
  3: {ar: "الدرس الثالث", en: "Lesson Three", sura: "Al-Baqara", hasEn: false},
  4: {ar: "الدرس الرابع", en: "Lesson Four", sura: "Al-Baqara", hasEn: false},
  5: {ar: "الدرس الخامس", en: "Lesson Five", sura: "Al-Baqara", hasEn: false},
  6: {ar: "الدرس السادس", en: "Lesson Six", sura: "Al-Baqara", hasEn: false},
  7: {ar: "الدرس السابع", en: "Lesson Seven", sura: "Al-Baqara", hasEn: false},
  8: {ar: "الدرس الثامن", en: "Lesson Eight", sura: "Āl ʿImrān", hasEn: false},
  9: {ar: "الدرس التاسع", en: "Lesson Nine", sura: "Āl ʿImrān", hasEn: false},
  10: {ar: "الدرس العاشر", en: "Lesson Ten", sura: "Āl ʿImrān", hasEn: false},
  11: {ar: "الدرس الحادي عشر", en: "Lesson Eleven", sura: "Al-Nisāʾ", hasEn: false},
  12: {ar: "الدرس الثاني عشر", en: "Lesson Twelve", sura: "Al-Nisāʾ", hasEn: false},
  13: {ar: "الدرس الثالث عشر", en: "Lesson Thirteen", sura: "Al-Nisāʾ", hasEn: false},
  14: {ar: "الدرس الرابع عشر", en: "Lesson Fourteen", sura: "Al-Māʾida", hasEn: false},
  15: {ar: "الدرس الخامس عشر", en: "Lesson Fifteen", sura: "Al-Māʾida", hasEn: false},
  16: {ar: "الدرس السادس عشر", en: "Lesson Sixteen", sura: "Al-Māʾida", hasEn: false},
  17: {ar: "الدرس السابع عشر", en: "Lesson Seventeen", sura: "Al-Anʿām", hasEn: false},
  18: {ar: "الدرس الثامن عشر", en: "Lesson Eighteen", sura: "Al-Aʿrāf", hasEn: false},
  19: {ar: "الدرس التاسع عشر", en: "Lesson Nineteen", sura: "Al-Aʿrāf", hasEn: false},
  20: {ar: "الدرس العشرون", en: "Lesson Twenty", sura: "Al-Aʿrāf", hasEn: false},
  21: {ar: "الدرس الحادي والعشرون", en: "Lesson Twenty-One", sura: "Al-Anfāl", hasEn: false},
  22: {ar: "الدرس الثاني والعشرون", en: "Lesson Twenty-Two", sura: "Al-Tawba", hasEn: false},
  23: {ar: "الدرس الثالث والعشرون", en: "Lesson Twenty-Three", sura: "Al-Tawba", hasEn: false},
  24: {ar: "الدرس الرابع والعشرون", en: "Lesson Twenty-Four", sura: "Yūnus", hasEn: false},
  25: {ar: "الدرس الخامس والعشرون", en: "Lesson Twenty-Five", sura: "Hūd", hasEn: false},
  26: {ar: "الدرس السادس والعشرون", en: "Lesson Twenty-Six", sura: "Hūd/Yūsuf", hasEn: false},
  27: {ar: "الدرس السابع والعشرون", en: "Lesson Twenty-Seven", sura: "Yūsuf", hasEn: false},
  28: {ar: "الدرس الثامن والعشرون", en: "Lesson Twenty-Eight", sura: "Al-Raʿd", hasEn: false},
  29: {ar: "الدرس التاسع والعشرون", en: "Lesson Twenty-Nine", sura: "Al-Ḥijr", hasEn: false},
  30: {ar: "الدرس الثلاثون", en: "Lesson Thirty", sura: "Al-Naḥl", hasEn: false},
};

const MANZILS = [
  {id:1, titleAr:"المنزل الأول", titleEn:"First Manzil", suras:"Al-Fātiḥa – Al-Baqara", lessons:[1,2,3,4,5,6,7]},
  {id:2, titleAr:"المنزل الثاني", titleEn:"Second Manzil", suras:"Āl ʿImrān – Al-Nisāʾ", lessons:[8,9,10,11,12,13]},
  {id:3, titleAr:"المنزل الثالث", titleEn:"Third Manzil", suras:"Al-Māʾida – Al-Tawba", lessons:[14,15,16,17,18,19,20,21,22,23]},
  {id:4, titleAr:"المنزل الرابع", titleEn:"Fourth Manzil", suras:"Yūnus – Hūd", lessons:[24,25,26]},
  {id:5, titleAr:"المنزل الخامس", titleEn:"Fifth Manzil", suras:"Yūsuf – Al-Ḥijr", lessons:[27,28,29]},
  {id:6, titleAr:"المنزل السادس", titleEn:"Sixth Manzil", suras:"Al-Naḥl", lessons:[30]},
];

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="text-center py-12 border-b border-gold/20 mb-8">
        <div className="font-arabic text-gold text-4xl font-bold mb-3" dir="rtl">
          في رياض التفسير
        </div>
        <div className="font-arabic text-gold-light text-xl italic mb-2" dir="rtl">
          الشيخ إبراهيم نياس رضي اللّٰه عنه
        </div>
        <div className="font-english text-white/50 text-sm" dir="ltr">
          In the Gardens of Exegesis — The Digital Bilingual Edition
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/lesson/1" className="font-english text-sm text-bg bg-gold hover:bg-gold-light px-5 py-2 rounded-lg font-semibold transition-all">
            Start Reading →
          </Link>
          <Link href="/introduction" className="font-english text-sm text-white/60 border border-gold/30 hover:border-gold/60 hover:text-gold px-5 py-2 rounded-lg transition-all">
            Translator's Introduction
          </Link>
        </div>
      </div>

      {/* Manzils */}
      {MANZILS.map(manzil => (
        <div key={manzil.id} className="mb-8 border border-gold/15 rounded-xl overflow-hidden">
          <div className="bg-gold/8 px-5 py-3 border-b border-gold/15 flex items-center justify-between">
            <div dir="rtl">
              <div className="font-arabic text-gold font-bold">{manzil.titleAr}</div>
              <div className="font-arabic text-gold/50 text-sm">{manzil.suras}</div>
            </div>
            <div dir="ltr">
              <div className="font-english text-gold/80 font-semibold text-sm">{manzil.titleEn}</div>
              <div className="font-english text-gold/40 text-xs">{manzil.suras}</div>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {manzil.lessons.map(n => {
              const m = LESSON_META[n];
              if (!m) return null;
              return (
                <Link key={n} href={"/lesson/" + n} className="flex items-center gap-4 px-5 py-3 hover:bg-gold/5 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-xs font-bold flex-shrink-0">
                    {n}
                  </div>
                  <div dir="rtl" className="flex-1">
                    <div className="font-arabic text-gold-light text-sm font-bold group-hover:text-gold transition-colors">{m.ar}</div>
                    <div className="font-arabic text-white/30 text-xs">{m.sura}</div>
                  </div>
                  <div dir="ltr" className="flex-1">
                    <div className="font-english text-white/60 text-sm italic">{m.en}</div>
                  </div>
                  {m.hasEn && (
                    <span className="font-english text-xs text-gold/60 border border-gold/25 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <footer className="text-center mt-12 pt-8 border-t border-gold/15">
        <div className="font-arabic text-gold">في رياض التفسير</div>
        <div className="font-english text-white/25 text-xs mt-1">niassetafsir.com</div>
      </footer>
    </main>
  );
}
