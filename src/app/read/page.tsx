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
  { id: 5, ar: "المنزل الخامس", en: "Fifth Manzil", day: "Day Five", suras: "Al-Shuʿarāʾ — Yā Sīn", range: "Suras 26–36", lessons: "In preparation", href: "#" },
  { id: 6, ar: "المنزل السادس", en: "Sixth Manzil", day: "Day Six", suras: "Al-Ṣāffāt — Al-Ḥujurāt", range: "Suras 37–49", lessons: "In preparation", href: "#" },
  { id: 7, ar: "المنزل السابع", en: "Seventh Manzil", day: "Day Seven", suras: "Qāf — Al-Nās", range: "Suras 50–114", lessons: "In preparation", href: "#" },
];

export default function ReadPage() {
  return (
    <main className="max-w-6xl mx-auto px-5 pb-24 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="font-english text-xs text-white/30 hover:text-gold/60 transition-all">
          ← Home
        </Link>
        <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="font-arabic text-gold text-xl font-bold mb-0.5" dir="rtl">في رياض التفسير</div>
            <h1 className="font-english text-white text-xl font-semibold">Read the Commentary</h1>
          </div>
          <Link href="/search"
            className="flex items-center gap-2 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-gold/25 rounded-full px-4 py-2 transition-all group">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/25 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="font-english text-xs text-white/30 group-hover:text-white/50 transition-colors">
              Search by verse or keyword...
            </span>
          </Link>
        </div>
      </div>

      {/* Two-column layout: Manzil grid left, Verse Concordance right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Manzil grid */}
        <div className="lg:col-span-3">
          <p className="font-english text-white/35 text-xs mb-4">
            Select a manzil to begin — or find a verse in the concordance →
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MANZILS.map(m => {
              const available = m.href !== "#";
              return (
                <div key={m.id}
                  className={`border rounded-2xl transition-all ${
                    available
                      ? "border-gold/20 hover:border-gold/40 hover:bg-gold/4"
                      : "border-white/8 opacity-40"
                  }`}>
                  {available ? (
                    <Link href={m.href} className="flex items-start gap-3 px-4 py-4">
                      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-bg text-sm font-bold flex-shrink-0 mt-0.5">
                        {m.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-english text-white font-semibold text-sm">{m.en}</div>
                        <div className="font-arabic text-gold/55 text-sm leading-5" dir="rtl">{m.ar}</div>
                        <div className="font-english text-white/35 text-xs mt-1">{m.suras}</div>
                        <div className="font-english text-white/25 text-xs">{m.range}</div>
                        <div className="font-english text-gold/50 text-xs mt-1 font-medium">{m.lessons}</div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-4">
                      <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/20 text-sm font-bold flex-shrink-0 mt-0.5">
                        {m.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-english text-white/25 font-semibold text-sm">{m.en}</div>
                        <div className="font-arabic text-white/15 text-sm leading-5" dir="rtl">{m.ar}</div>
                        <div className="font-english text-white/15 text-xs mt-1">{m.suras} · {m.range}</div>
                        <div className="font-english text-white/15 text-xs mt-1">{m.lessons}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="font-english text-white/15 text-xs mt-5 leading-5">
            The seven manzils divide the Qurʾān for weekly recitation — a practice central to the Fayḍah Tijāniyya community.
            Shaykh Ibrāhīm Niasse organised his commentary by this structure.
          </p>
        </div>

        {/* Right: Verse Concordance quick-access */}
        <div className="lg:col-span-2">
          <div className="border border-gold/15 rounded-2xl p-4 sticky top-20">
            <div className="mb-3">
              <h2 className="font-english text-white/70 font-semibold text-sm mb-0.5">Verse Concordance</h2>
              <p className="font-english text-white/30 text-xs">
                Find any Quranic verse and go directly to Shaykh Ibrāhīm's commentary on it
              </p>
            </div>
            <Link href="/concordance"
              className="flex items-center gap-2 bg-gold/8 hover:bg-gold/12 border border-gold/20 hover:border-gold/40 rounded-xl px-4 py-3 transition-all group mb-3">
              <span className="font-english text-sm text-gold/80 group-hover:text-gold transition-colors">Browse all 114 suras →</span>
            </Link>
            <p className="font-english text-white/20 text-xs mb-3">or search directly</p>
            <Link href="/search"
              className="flex items-center gap-2 bg-white/4 hover:bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 transition-all group">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/25 flex-shrink-0">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="font-english text-xs text-white/25 group-hover:text-white/45 transition-colors">
                Search Arabic or English...
              </span>
            </Link>


          </div>
        </div>

      </div>

      <div className="mt-12 opacity-50">
        <SubscribeBar />
      </div>
    </main>
  );
}
