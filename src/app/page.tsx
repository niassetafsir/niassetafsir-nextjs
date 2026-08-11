"use client";
import Link from 'next/link';
import SubscribeBar from '@/components/SubscribeBar';
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
  31: {ar: "الدرس الحادي والثلاثون", en: "Lesson Thirty-One", sura: "Al-Kahf", hasEn: false},
  32: {ar: "الدرس الثاني والثلاثون", en: "Lesson Thirty-Two", sura: "Maryam / Ṭāhā", hasEn: false},
  33: {ar: "الدرس الثالث والثلاثون", en: "Lesson Thirty-Three", sura: "Ṭāhā / Al-Anbiyāʾ", hasEn: false},
  34: {ar: "الدرس الرابع والثلاثون", en: "Lesson Thirty-Four", sura: "Al-Anbiyāʾ / Al-Ḥajj", hasEn: false},
  35: {ar: "الدرس الخامس والثلاثون", en: "Lesson Thirty-Five", sura: "Al-Muʾminūn / Al-Nūr", hasEn: false},
  36: {ar: "الدرس السادس والثلاثون", en: "Lesson Thirty-Six", sura: "Al-Nūr / Al-Furqān", hasEn: false},
  37: {ar: "الدرس السابع والثلاثون", en: "Lesson Thirty-Seven", sura: "Al-Shuʿarāʾ / Al-Naml", hasEn: false},
  38: {ar: "الدرس الثامن والثلاثون", en: "Lesson Thirty-Eight", sura: "Al-Naml / Al-Qaṣaṣ", hasEn: false},
  39: {ar: "الدرس التاسع والثلاثون", en: "Lesson Thirty-Nine", sura: "Al-ʿAnkabūt / Al-Rūm / Luqmān", hasEn: false},
  40: {ar: "الدرس الأربعون", en: "Lesson Forty", sura: "Luqmān / Al-Sajda / Al-Aḥzāb", hasEn: false},
  41: {ar: "الدرس الحادي والأربعون", en: "Lesson Forty-One", sura: "Al-Aḥzāb / Sabaʾ / Fāṭir", hasEn: false},
  42: {ar: "الدرس الثاني والأربعون", en: "Lesson Forty-Two", sura: "Fāṭir / Yā-Sīn / Al-Ṣāffāt", hasEn: false},
  43: {ar: "الدرس الثالث والأربعون", en: "Lesson Forty-Three", sura: "Al-Ṣāffāt / Ṣād / Al-Zumar", hasEn: false},
  44: {ar: "الدرس الرابع والأربعون", en: "Lesson Forty-Four", sura: "Ghāfir / Fuṣṣilat", hasEn: false},
  45: {ar: "الدرس الخامس والأربعون", en: "Lesson Forty-Five", sura: "Fuṣṣilat / Al-Shūrā / Al-Zukhruf / Al-Dukhān", hasEn: false},
  46: {ar: "الدرس السادس والأربعون", en: "Lesson Forty-Six", sura: "Al-Dukhān / Al-Jāthiya / Al-Aḥqāf / Muḥammad / Al-Fatḥ", hasEn: false},
  47: {ar: "الدرس السابع والأربعون", en: "Lesson Forty-Seven", sura: "Al-Fatḥ / Al-Ḥujurāt / Qāf / Al-Dhāriyāt", hasEn: false},
  48: {ar: "الدرس الثامن والأربعون", en: "Lesson Forty-Eight", sura: "Al-Dhāriyāt / Al-Ṭūr / Al-Najm / Al-Qamar", hasEn: false},
  49: {ar: "الدرس التاسع والأربعون", en: "Lesson Forty-Nine", sura: "Al-Raḥmān / Al-Wāqiʿa / Al-Ḥadīd", hasEn: false},
  50: {ar: "الدرس الخمسون", en: "Lesson Fifty", sura: "Al-Mujādala / Al-Ḥashr / Al-Mumtaḥana / Al-Ṣaff", hasEn: false},
  51: {ar: "الدرس الحادي والخمسون", en: "Lesson Fifty-One", sura: "Al-Jumuʿa / Al-Munāfiqūn / Al-Taghābun / Al-Ṭalāq / Al-Taḥrīm", hasEn: false},
  52: {ar: "الدرس الثاني والخمسون", en: "Lesson Fifty-Two", sura: "Al-Mulk / Al-Qalam / Al-Ḥāqqa / Al-Maʿārij / Nūḥ", hasEn: false},
  53: {ar: "الدرس الثالث والخمسون", en: "Lesson Fifty-Three", sura: "Al-Jinn / Al-Muzzammil / Al-Muddaththir / Al-Qiyāma / Al-Insān / Al-Mursalāt", hasEn: false},
  54: {ar: "الدرس الرابع والخمسون", en: "Lesson Fifty-Four", sura: "Al-Nabaʾ / Al-Nāziʿāt / ʿAbasa / Al-Takwīr / Al-Infiṭār / Al-Muṭaffifīn / Al-Inshiqāq / Al-Burūj / Al-Ṭāriq", hasEn: false},
  55: {ar: "الدرس الخامس والخمسون", en: "Lesson Fifty-Five", sura: "Al-Aʿlā / Al-Ghāshiya / Al-Fajr / Al-Balad / Al-Shams / Al-Layl / Al-Ḍuḥā / Al-Sharḥ / Al-Tīn / Al-ʿAlaq / Al-Qadr / Al-Bayyina / Al-Zalzala / Al-ʿĀdiyāt / Al-Qāriʿa / Al-Takāthur / Al-ʿAṣr / Al-Humaza / Al-Fīl / Quraysh / Al-Māʿūn / Al-Kawthar / Al-Kāfirūn / Al-Naṣr / Al-Masad", hasEn: false},
  56: {ar: "الدرس السادس والخمسون", en: "Lesson Fifty-Six", sura: "Al-Ikhlāṣ / Al-Falaq / Al-Nās", hasEn: false},
};

const MANZILS = [
  {id:1, titleAr:"المنزل الأول — اليوم الأول", titleEn:"First Manzil · Day One", sūrahs:"Al-Fātiḥa → Al-Nisāʾ", lessons:[1,2,3,4,5,6,7,8,9,10,11,12,13]},
  {id:2, titleAr:"المنزل الثاني — اليوم الثاني", titleEn:"Second Manzil · Day Two", sūrahs:"Al-Māʾida → Al-Tawba", lessons:[14,15,16,17,18,19,20,21,22,23]},
  {id:3, titleAr:"المنزل الثالث — اليوم الثالث", titleEn:"Third Manzil · Day Three", sūrahs:"Yūnus → Al-Naḥl", lessons:[24,25,26,27,28,29,30]},
  {id:4, titleAr:"المنزل الرابع — اليوم الرابع", titleEn:"Fourth Manzil · Day Four", sūrahs:"Al-Isrāʾ → Al-Furqān", lessons:[31,32,33,34,35]},
  {id:5, titleAr:"المنزل الخامس — اليوم الخامس", titleEn:"Fifth Manzil · Day Five", sūrahs:"Al-Furqān → Al-Aḥzāb", lessons:[36,37,38,39,40]},
  {id:6, titleAr:"المنزل السادس — اليوم السادس", titleEn:"Sixth Manzil · Day Six", sūrahs:"Sabaʾ → Al-Ṣaff", lessons:[41,42,43,44,45,46,47,48,49,50]},
  {id:7, titleAr:"المنزل السابع — اليوم السابع", titleEn:"Seventh Manzil · Day Seven", sūrahs:"Al-Jumʿa → Al-Nās", lessons:[51,52,53,54,55,56]},
];

function ManzilCard({ manzil, isOpen, onToggle }: {
  manzil: typeof MANZILS[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasLessons = manzil.lessons.length > 0;
  return (
    <div className="border border-gold/15 rounded-xl overflow-hidden flex flex-col">
      <Link
        href={`/manzil/${manzil.id}`}
        className="w-full bg-gold/8 hover:bg-gold/13 px-4 py-3 flex items-center justify-between transition-colors block"
      >
        
        <div className="flex-1 text-center">
          <div className="font-arabic text-gold font-bold text-base leading-snug" dir="rtl">{manzil.titleAr}</div>
          <div className="font-english text-white font-bold text-sm mt-1">{manzil.titleEn}</div>
          <div className="font-english text-white/70 text-xs mt-0.5">{manzil.sūrahs}</div>
          <div className="font-english text-white/50 text-xs mt-1">
            {hasLessons ? `${manzil.lessons.length} lessons available` : "Coming soon"}
          </div>
        </div>
        <ChevronDown size={16} className={`text-gold/50 flex-shrink-0 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      
      </Link>

      {isOpen && (
        <div className="flex-1">
          {!hasLessons ? (
            <div className="px-4 py-3 font-english text-white/25 italic text-sm" dir="ltr">
              Further volumes in preparation.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {manzil.lessons.map(n => {
                const m = LESSON_META[n];
                if (!m) return null;
                return (
                  <Link key={n} href={`/lesson/${n}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold/5 transition-colors group">
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-bg text-xs font-bold flex-shrink-0">
                      {n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-english text-white/60 text-[10px] uppercase tracking-wide mb-0.5">{m.en}</div>
                      <div dir="rtl" className="font-arabic text-gold-light text-sm font-bold group-hover:text-gold transition-colors truncate">{m.ar}</div>
                      <div className="font-english text-white/45 text-xs truncate">{m.sura}</div>
                    </div>
                    {m.hasEn && (
                      <span className="font-english text-xs text-gold/50 border border-gold/20 px-1.5 py-0.5 rounded-full flex-shrink-0">EN</span>
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
}

export default function HomePage() {
  const [openManzils, setOpenManzils] = useState<Record<number, boolean>>({});
  const toggle = (id: number) => setOpenManzils(prev => ({...prev, [id]: !prev[id]}));

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20">

      {/* Header */}
      <div className="text-center py-8 mb-6">
        {/* English title — primary */}
        <div className="mb-2">
          <div className="font-english text-white/90 text-3xl font-semibold italic mb-1">
            Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
          </div>
          <div className="font-english text-white/45 text-sm">
            Shaykh Ibrāhīm Niasse (d. 1975)
          </div>
        </div>
        {/* Arabic subtitle — smaller, contextual */}
        <div className="mb-5">
          <div className="font-arabic text-gold/60 text-lg leading-snug" dir="rtl">
            فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
          </div>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          <Link href="/read"
            className="font-english font-bold text-sm px-8 py-3 rounded-full transition-all"
            style={{border:'2.5px solid #6B2424', color:'#6B2424', background:'transparent', letterSpacing:'0.04em'}}>
            Read
          </Link>
          <Link href="/audio"
            className="font-english font-bold text-sm px-8 py-3 rounded-full transition-all"
            style={{border:'2.5px solid #1E5A4A', color:'#1E5A4A', background:'transparent', letterSpacing:'0.04em'}}>
            Listen
          </Link>
          <Link href="/research"
            className="font-english font-bold text-sm px-8 py-3 rounded-full transition-all"
            style={{border:'2.5px solid #1A3A5C', color:'#1A3A5C', background:'transparent', letterSpacing:'0.04em'}}>
            Research
          </Link>
        </div>
        <div className="mt-5 max-w-xl mx-auto" dir="ltr">
          <a href="/search" className="flex items-center gap-3 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-gold/25 rounded-full px-4 py-2 transition-all group">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/25 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="font-english text-sm text-white/25 group-hover:text-white/45 transition-colors flex-1 text-left">
              Search Arabic or English...
            </span>
          </a>
        </div>
      </div>

      

    </main>
  );
}
