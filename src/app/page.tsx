"use client";
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
  16: {ar: "الدرس السادس عشر", en: "Lesson Sixteen", sura: "Al-Māʾida/Al-Anʿām", hasEn: false},
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
  27: {ar: "الدرس السابع والعشرون", en: "Lesson Twenty-Seven", sura: "Yūsuf/Al-Raʿd", hasEn: false},
  28: {ar: "الدرس الثامن والعشرون", en: "Lesson Twenty-Eight", sura: "Al-Raʿd/Ibrāhīm", hasEn: false},
  29: {ar: "الدرس التاسع والعشرون", en: "Lesson Twenty-Nine", sura: "Al-Ḥijr", hasEn: false},
  30: {ar: "الدرس الثلاثون", en: "Lesson Thirty", sura: "Al-Naḥl", hasEn: false},
};

const MANZILS = [
  {id:1, titleAr:"المنزل الأول — اليوم الأول", titleEn:"First Manzil · Day One", suras:"Al-Fātiḥa → Al-Nisāʾ (Suras 1–4)", lessons:[1,2,3,4,5,6,7,8,9,10,11,12,13]},
  {id:2, titleAr:"المنزل الثاني — اليوم الثاني", titleEn:"Second Manzil · Day Two", suras:"Al-Māʾida → Al-Tawba (Suras 5–9)", lessons:[14,15,16,17,18,19,20,21,22,23]},
  {id:3, titleAr:"المنزل الثالث — اليوم الثالث", titleEn:"Third Manzil · Day Three", suras:"Yūnus → Al-Naḥl (Suras 10–16)", lessons:[24,25,26,27,28,29,30]},
  {id:4, titleAr:"المنزل الرابع — اليوم الرابع", titleEn:"Fourth Manzil · Day Four", suras:"Al-Isrāʾ → Al-Furqān (Suras 17–25)", lessons:[]},
  {id:5, titleAr:"المنزل الخامس — اليوم الخامس", titleEn:"Fifth Manzil · Day Five", suras:"Al-Shuʿarāʾ → Yā Sīn (Suras 26–36)", lessons:[]},
  {id:6, titleAr:"المنزل السادس — اليوم السادس", titleEn:"Sixth Manzil · Day Six", suras:"Al-Ṣāffāt → Al-Ḥujurāt (Suras 37–49)", lessons:[]},
  {id:7, titleAr:"المنزل السابع — اليوم السابع", titleEn:"Seventh Manzil · Day Seven", suras:"Qāf → Al-Nās (Suras 50–114)", lessons:[]},
];

export default function HomePage() {
  const [openManzils, setOpenManzils] = useState<Record<number, boolean>>({1: true});
  const toggle = (id: number) => setOpenManzils(prev => ({...prev, [id]: !prev[id]}));

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20">

      {/* Header */}
      <div className="text-center py-12 border-b border-gold/20 mb-8">
        <div className="font-arabic text-gold text-4xl font-bold mb-3" dir="rtl">
          فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
        </div>
        <div className="font-arabic text-gold-light text-xl italic mb-2 mt-1" dir="rtl">
          الشيخ إبراهيم نياس رضي اللّٰه عنه
        </div>
        <div className="font-english text-white/55 text-base mt-2" dir="ltr">
          In the Gardens of Exegesis — The Digital Bilingual Edition
        </div>
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <Link href="/lesson/1" className="font-english text-base text-bg bg-gold hover:bg-gold-light px-5 py-2 rounded-lg font-semibold transition-all">
            Start Reading →
          </Link>
          <Link href="/introduction" className="font-english text-base text-white/65 border border-gold/30 hover:border-gold/60 hover:text-gold px-5 py-2 rounded-lg transition-all">
            Translator&apos;s Introduction
          </Link>
          <Link href="/about" className="font-english text-base text-white/45 border border-white/15 hover:border-gold/30 hover:text-white/65 px-5 py-2 rounded-lg transition-all">
            About This Edition
          </Link>
        </div>
      </div>

      {/* Manzil verse */}
      <div className="mb-8 p-5 border border-gold/15 rounded-xl bg-gold/3 text-center">
        <div className="font-arabic text-gold/80 text-base leading-9 mb-3" dir="rtl">
          الفاتحة والمائدة يونس الإسرا · والشعراء والصافات قاف قد أُبانا
          <br />
          فمن جمع الفرقان بالجمع ختم · قراءة الفرقان مع ما هانا
        </div>
        <div className="font-english text-white text-sm italic" dir="ltr">
          &quot;Al-Fātiḥah, al-Māʾida, Yūnus, al-Isrāʾ, al-Shuʿarāʾ, al-Ṣāffāt, Qāf — thus it is clarified.
          He who joins the Criterion with the Joining completes a full recitation of the Criterion.&quot;
          — Shaykh Ibrāhīm Niasse
        </div>
      </div>

      {/* Collapsible Manzils */}
      {MANZILS.map(manzil => {
        const isOpen = openManzils[manzil.id] ?? false;
        const hasLessons = manzil.lessons.length > 0;
        return (
          <div key={manzil.id} className="mb-4 border border-gold/15 rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(manzil.id)}
              className="w-full bg-gold/8 hover:bg-gold/13 px-5 py-4 flex items-center justify-between transition-colors"
            >
              <div dir="rtl" className="text-right flex-1">
                <div className="font-arabic text-gold font-bold text-base">{manzil.titleAr}</div>
                <div className="font-english text-gold/70 text-xs mt-0.5 font-semibold" dir="ltr">{manzil.titleEn}</div>
                <div className="font-english text-white/50 text-xs" dir="ltr">{manzil.suras}</div>
              </div>
              <div className="flex items-center gap-2" dir="ltr">
                <div className="text-right hidden sm:block">
                  <div className="font-english text-white/50 text-xs">
                    {hasLessons ? `${manzil.lessons.length} lessons` : "Coming soon"}
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gold/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {isOpen && (
              <div>
                {!hasLessons ? (
                  <div className="px-5 py-4 font-english text-white/25 italic text-sm" dir="ltr">
                    Coming soon — further volumes in preparation.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {manzil.lessons.map(n => {
                      const m = LESSON_META[n];
                      if (!m) return null;
                      return (
                        <Link key={n} href={`/lesson/${n}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gold/5 transition-colors group">
                          <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-bg text-xs font-bold flex-shrink-0">
                            {n}
                          </div>
                          <div dir="rtl" className="flex-1 min-w-0">
                            <div className="font-arabic text-gold-light text-lg font-bold group-hover:text-gold transition-colors truncate">{m.ar}</div>
                            <div className="font-arabic text-white/30 text-sm">{m.sura}</div>
                          </div>
                          <div dir="ltr" className="flex-1 min-w-0 hidden sm:block">
                            <div className="font-english text-white/70 text-sm italic truncate">{m.en}</div>
                          </div>
                          {m.hasEn && (
                            <span className="font-english text-xs text-gold/60 border border-gold/25 px-2 py-0.5 rounded-full flex-shrink-0">EN ✓</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <footer className="text-center mt-12 pt-8 border-t border-gold/15">
        <div className="font-arabic text-gold text-sm">فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ</div>
        <div className="font-english text-white/25 text-xs mt-2">
          niassetafsir.com · niassetafsir.org · © Amadu Kunateh. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
