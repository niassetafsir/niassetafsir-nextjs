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
};

const MANZILS = [
  {id:1, titleAr:"المنزل الأول — اليوم الأول", titleEn:"First Manzil · Day One", suras:"Al-Fātiḥa → Al-Nisāʾ", lessons:[1,2,3,4,5,6,7,8,9,10,11,12,13]},
  {id:2, titleAr:"المنزل الثاني — اليوم الثاني", titleEn:"Second Manzil · Day Two", suras:"Al-Māʾida → Al-Tawba", lessons:[14,15,16,17,18,19,20,21,22,23]},
  {id:3, titleAr:"المنزل الثالث — اليوم الثالث", titleEn:"Third Manzil · Day Three", suras:"Yūnus → Al-Naḥl", lessons:[24,25,26,27,28,29,30]},
  {id:4, titleAr:"المنزل الرابع — اليوم الرابع", titleEn:"Fourth Manzil · Day Four", suras:"Al-Isrāʾ → Al-Furqān", lessons:[]},
  {id:5, titleAr:"المنزل الخامس — اليوم الخامس", titleEn:"Fifth Manzil · Day Five", suras:"Al-Shuʿarāʾ → Yā Sīn", lessons:[]},
  {id:6, titleAr:"المنزل السادس — اليوم السادس", titleEn:"Sixth Manzil · Day Six", suras:"Al-Ṣāffāt → Al-Ḥujurāt", lessons:[]},
  {id:7, titleAr:"المنزل السابع — اليوم السابع", titleEn:"Seventh Manzil · Day Seven", suras:"Qāf → Al-Nās", lessons:[]},
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
          <div className="font-english text-white/70 text-xs mt-0.5">{manzil.suras}</div>
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
  const [showGuide, setShowGuide] = useState(false);
  const toggle = (id: number) => setOpenManzils(prev => ({...prev, [id]: !prev[id]}));

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20">

      {/* Header */}
      <div className="text-center py-12 border-b border-gold/20 mb-8">
        <div className="font-arabic text-gold text-4xl font-bold mb-3" dir="rtl">
          فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
        </div>
        <div className="font-arabic text-gold-light text-xl mb-1 mt-1 font-bold" dir="rtl">
          الشيخ إبراهيم نياس
        </div>
        <div className="font-english text-gold/45 text-xs mb-2" dir="ltr">
          Shaykh Ibrāhīm Niasse (d. 1975)
        </div>
        <div className="font-english text-white/55 text-sm mb-3" dir="ltr">
          10-Volume Revised Arabic Edition · Bilingual Translation · Scholarly Research Platform
        </div>
        <div className="flex gap-3 justify-center mt-6 flex-wrap items-center">
          <Link href="/lesson/1" className="font-english text-base text-bg bg-gold hover:bg-gold-light px-5 py-2 rounded-lg font-semibold transition-all">
            Start Reading →
          </Link>
          <Link href="/research" className="font-english text-base text-white/75 hover:text-gold border border-gold/30 hover:border-gold/70 px-5 py-2 rounded-lg transition-all">
            Research →
          </Link>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="font-english text-sm text-white/55 border border-white/20 hover:border-gold/40 hover:text-white/80 px-4 py-2 rounded-lg transition-all"
          >
            {showGuide ? "Close" : "How to Use This Platform"}
          </button>
        </div>

        {/* Inline search bar */}
        <div className="mt-5 max-w-2xl mx-auto" dir="ltr">
          <a href="/search" className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-gold/20 hover:border-gold/40 rounded-full px-4 py-2.5 transition-all group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gold/50 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="font-english text-sm text-white/35 group-hover:text-white/55 transition-colors flex-1 text-left">
              Search the tafsīr — Arabic or English...
            </span>
            <span className="font-english text-xs text-gold/35 border border-gold/20 px-2 py-0.5 rounded-full">⌘K</span>
          </a>
        </div>

        {/* How to Use guide */}
        {showGuide && (
          <div className="mt-6 p-6 border border-gold/20 rounded-xl bg-gold/4 text-left max-w-2xl mx-auto" dir="ltr">
            <h3 className="font-english text-gold font-semibold text-base mb-4">How to Use This Platform</h3>
            <div className="font-english text-sm leading-7 space-y-4" style={{color:'rgba(255,255,255,0.75)'}}>

              <p style={{color:'rgba(255,255,255,0.55)'}}>
                <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> by Shaykh Ibrāhīm Niasse is organised here into{' '}
                <strong style={{color:'rgba(255,255,255,0.9)'}}>30 lessons</strong> across{' '}
                <strong style={{color:'rgba(255,255,255,0.9)'}}>7 manzils</strong> — the weekly Quranic recitation
                cycle he practised. Each lesson covers a passage with his Arabic commentary and English translation.
              </p>

              <div className="border-t border-gold/15 pt-3">
                <p className="font-semibold mb-2" style={{color:'rgba(255,255,255,0.9)'}}>Reading the Text</p>
                <ul className="space-y-1.5" style={{color:'rgba(255,255,255,0.65)'}}>
                  <li>Click any manzil → then any lesson</li>
                  <li>Toggle <strong style={{color:'rgba(255,255,255,0.85)'}}>Arabic</strong>, <strong style={{color:'rgba(255,255,255,0.85)'}}>English</strong>, or <strong style={{color:'rgba(255,255,255,0.85)'}}>Bilingual</strong> view inside the lesson</li>
                  <li>Footnote numbers <code style={{color:'rgba(201,168,76,0.9)', fontSize:'11px'}}>[n]</code> link directly to the Footnotes & Citations page</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Audio</strong> — Wolof oral tafsīr (122 sessions) and Arabic delivery by Shaykh Ibrāhīm for all 30 lessons</li>
                </ul>
              </div>

              <div className="border-t border-gold/15 pt-3">
                <p className="font-semibold mb-2" style={{color:'rgba(255,255,255,0.9)'}}>Research Tools</p>
                <ul className="space-y-1.5" style={{color:'rgba(255,255,255,0.65)'}}>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Search</strong> — full-text across 30 Arabic lessons and English translation</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Verse Concordance</strong> — search any verse to access Jalālayn&apos;s commentary and Shaykh Ibrāhīm&apos;s reflection</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Footnotes & Citations</strong> — 798 footnotes by the compiler, classified by scholar and subject; click [n] to go directly to the source</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Hadith Index</strong> — 384 hadith citations indexed by collection</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Scholar & Source Index</strong> — every figure Niasse cites in his own words, distinguished from compiler citations</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Tafsīr Sciences Index</strong> — 12 disciplinary categories drawn from classical ʿulūm al-tafsīr</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Concordance of Terms</strong> — textual index of 20 key terms across all 30 lessons, grounded in Shaykh Aḥmad al-Tijānī and Muḥammad al-Mishri</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Theological Vocabulary Map</strong> — a knowledge graph of how terms connect within Niasse&apos;s system</li>
                  <li><strong style={{color:'rgba(255,255,255,0.85)'}}>Audio Library</strong> — stream or download the Arabic oral tafsīr recordings by sura</li>
                </ul>
              </div>

              <div className="border-t border-gold/15 pt-3">
                <p className="font-semibold mb-1" style={{color:'rgba(255,255,255,0.9)'}}>Citing the Text</p>
                <p style={{color:'rgba(255,255,255,0.55)'}}>
                  Select any passage → <strong style={{color:'rgba(201,168,76,0.8)'}}>Clip &amp; Cite</strong> → Chicago citation with volume and page reference generated automatically.
                  Export all saved clips from <code style={{color:'rgba(255,255,255,0.5)', fontSize:'11px'}}>/clips</code>.
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Manzil verse — English only */}
      <div className="mb-8 p-4 border border-gold/15 rounded-xl bg-gold/3 text-center">
        <div className="font-english text-white dark:text-white text-sm italic [data-theme=light_&]:text-[#2C1810]" dir="ltr">
          &quot;Al-Fātiḥah, al-Māʾida, Yūnus, al-Isrāʾ, al-Shuʿarāʾ, al-Ṣāffāt, Qāf — thus it is clarified.
          He who joins the Criterion with the Joining completes a full recitation of the Criterion.&quot;
        </div>
      </div>

      {/* Manzils — compact grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
        {MANZILS.map((manzil, idx) => (
          <div key={manzil.id} className={idx === MANZILS.length - 1 && MANZILS.length % 3 !== 0 ? "sm:col-span-2 lg:col-start-2 lg:col-span-1" : ""}>
            <ManzilCard
              manzil={manzil}
              isOpen={openManzils[manzil.id] ?? false}
              onToggle={() => toggle(manzil.id)}
            />
          </div>
        ))}
      </div>

      <div className="mt-12 mb-8">
        <SubscribeBar />
      </div>
    </main>
  );
}
