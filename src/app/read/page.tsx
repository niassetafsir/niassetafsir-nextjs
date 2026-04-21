import Link from 'next/link';
import SubscribeBar from '@/components/SubscribeBar';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Read — Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm",
  description: "Read and listen to the complete Quranic commentary of Shaykh Ibrāhīm Niasse, organised by the seven manzils of the weekly recitation cycle.",
};

const MANZILS = [
  { id: 1, ar: "المنزل الأول", en: "First Manzil", day: "Day One", suras: "Al-Fātiḥa — Al-Nisāʾ", range: "Suras 1–4", lessons: "Lessons 1–13", href: "/manzil/1" },
  { id: 2, ar: "المنزل الثاني", en: "Second Manzil", day: "Day Two", suras: "Al-Māʾida — Al-Tawba", range: "Suras 5–9", lessons: "Lessons 14–23", href: "/manzil/2" },
  { id: 3, ar: "المنزل الثالث", en: "Third Manzil", day: "Day Three", suras: "Yūnus — Al-Naḥl", range: "Suras 10–16", lessons: "Lessons 24–30", href: "/manzil/3" },
  { id: 4, ar: "المنزل الرابع", en: "Fourth Manzil", day: "Day Four", suras: "Al-Isrāʾ — Al-Furqān", range: "Suras 17–25", lessons: "Lessons 31–35", href: "/manzil/4" },
  { id: 5, ar: "المنزل الخامس", en: "Fifth Manzil", day: "Day Five", suras: "Al-Shuʿarāʾ — Yā Sīn", range: "Suras 26–36", lessons: "Coming soon", href: "#" },
  { id: 6, ar: "المنزل السادس", en: "Sixth Manzil", day: "Day Six", suras: "Al-Ṣāffāt — Al-Ḥujurāt", range: "Suras 37–49", lessons: "Coming soon", href: "#" },
  { id: 7, ar: "المنزل السابع", en: "Seventh Manzil", day: "Day Seven", suras: "Qāf — Al-Nās", range: "Suras 50–114", lessons: "Coming soon", href: "#" },
];

export default function ReadPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 pb-24 pt-8" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="font-english text-xs text-white/30 hover:text-gold/60 transition-all">
          ← Home
        </Link>
        <div className="mt-4">
          <div className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">في رياض التفسير</div>
          <h1 className="font-english text-white text-xl font-semibold">Read the Commentary</h1>
          <p className="font-english text-white/40 text-sm mt-1">
            Select a manzil to begin — or search for a verse at{' '}
            <Link href="/concordance" className="text-gold/60 hover:text-gold underline">the Verse Concordance</Link>
          </p>
        </div>
      </div>

      {/* Search shortcut */}
      <Link href="/search"
        className="flex items-center gap-3 bg-white/4 hover:bg-white/6 border border-white/10 hover:border-gold/25 rounded-xl px-4 py-3 transition-all group mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/25 flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span className="font-english text-sm text-white/30 group-hover:text-white/50 transition-colors">
          Search by verse, keyword, or Arabic text...
        </span>
      </Link>

      {/* Manzil cards */}
      <div className="space-y-3">
        {MANZILS.map(m => {
          const available = m.href !== "#";
          return (
            <div key={m.id}
              className={`border rounded-2xl transition-all ${
                available
                  ? "border-gold/20 hover:border-gold/40 hover:bg-gold/4"
                  : "border-white/8 opacity-45"
              }`}>
              {available ? (
                <Link href={m.href} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">
                    {m.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-english text-white font-semibold text-sm">{m.en}</span>
                      <span className="font-arabic text-gold/60 text-sm" dir="rtl">{m.ar}</span>
                      <span className="font-english text-white/30 text-xs">{m.day}</span>
                    </div>
                    <div className="font-english text-white/45 text-xs mt-0.5">{m.suras} · {m.range}</div>
                    <div className="font-english text-gold/50 text-xs mt-0.5">{m.lessons}</div>
                  </div>
                  <span className="text-gold/40 text-sm flex-shrink-0">→</span>
                </Link>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/25 text-sm font-bold flex-shrink-0">
                    {m.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-english text-white/30 font-semibold text-sm">{m.en}</span>
                      <span className="font-arabic text-white/20 text-sm" dir="rtl">{m.ar}</span>
                    </div>
                    <div className="font-english text-white/20 text-xs mt-0.5">{m.suras} · {m.range}</div>
                    <div className="font-english text-white/20 text-xs mt-0.5">In preparation</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <p className="font-english text-white/20 text-xs text-center mt-8 leading-5">
        The seven manzils divide the Qurʾān for weekly recitation — a practice central to the Fayḍah Tijāniyya community.
        Shaykh Ibrāhīm Niasse organised his commentary by this structure.
      </p>
      <div className="mt-10 opacity-60">
        <SubscribeBar />
      </div>
    </main>
  );
}
