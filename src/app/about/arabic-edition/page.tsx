import Link from 'next/link';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Arabic Edition",
  description: "The revised ten-volume compiled edition of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. Compiler, manuscript, and textual history.",
  openGraph: {
    title: "The Arabic Edition | niassetafsir.org",
    description: "The revised ten-volume compiled edition of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. Compiler, manuscript, and textual history.",
  },
};


export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">The Arabic Edition</h1>
      <p className="font-english text-white/45 text-base mb-8">Compiler, manuscript, and sources</p>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-5">
        <p>The Arabic text is drawn from the <strong>revised ten-volume compiled edition</strong> of Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, who transcribed, verified, and annotated the tafsīr from the original cassette recordings of Shaykh Ibrāhīm Niasse's oral delivery in Arabic in 1383 AH (c. 1963–64).</p>
        <p>The revised ten-volume edition represents a substantially expanded recension of the earlier six-volume compilation. It incorporates a more extensive footnotes and citations with a greater number of annotated footnotes, and draws on a broader consultation of the original audio recordings to achieve a more accurate transcription of Niasse&apos;s oral delivery.</p>
        <p>The compiler acknowledges the challenges of transcribing oral speech: the density of pronominal reference, the rapid movement of inflection, and the gap between spoken expression and written text. He undertook the work out of concern that the recordings, scattered among the khalīfas and companions of the Shaykh, might be lost.</p>
        <p>The footnotes and citations is one of the defining achievements of the compiled edition. The hadith apparatus alone records more than six thousand citations traced to their canonical sources across the ṣaḥīḥayn, the Sunan collections, and the wider hadith literature. Beyond hadith, the footnotes engage the major tafsīr works (Ibn Kathīr, al-Qurṭubī, al-Ṭabarī, the Jalālayn, Rūḥ al-Bayān), theological and Sufi sources (al-Ghazālī, Ibn ʿArabī), and linguistic and rhetorical literature. This platform presents 1,994 of these footnotes, spanning all 56 lessons, in a searchable, classified index, browsable by scholar, genre, and lesson, making the full intellectual architecture of the edition accessible for the first time in a research environment.</p>
      </div>

      {/* Volume catalogue */}
      <div className="mt-12 pt-8 border-t border-gold/15">
        <h2 className="font-english text-white text-xl font-semibold mb-1">Volume Catalogue</h2>
        <p className="font-english text-white/45 text-sm mb-6">Ten-volume Arabic edition — lessons and sūra coverage</p>
        <div className="space-y-3">
          {[
            { vol: "I",   ar: "الجزء الأول",   lessons: "1–6",   range: "Al-Istiʿādha · al-Fātiḥa – al-Baqara (Q. 1:1–2:252)" },
            { vol: "II",  ar: "الجزء الثاني",  lessons: "7–12",  range: "Al-Baqara – Al-Nisāʾ (Q. 2:253–4:147)" },
            { vol: "III", ar: "الجزء الثالث",  lessons: "13–19", range: "Al-Nisāʾ – Al-Aʿrāf (Q. 4:148–7:170)" },
            { vol: "IV",  ar: "الجزء الرابع",  lessons: "20–25", range: "Al-Aʿrāf – Hūd (Q. 7:171–11:83)" },
            { vol: "V",   ar: "الجزء الخامس",  lessons: "26–30", range: "Hūd – Al-Naḥl (Q. 11:84–17:111)" },
            { vol: "VI",  ar: "الجزء السادس",  lessons: "31–35", range: "Al-Kahf – Al-Nūr" },
            { vol: "VII", ar: "الجزء السابع",  lessons: "36–40", range: "Al-Nūr – Al-Aḥzāb" },
            { vol: "VIII",ar: "الجزء الثامن",  lessons: "41–45", range: "Al-Aḥzāb – Al-Dukhān" },
            { vol: "IX",  ar: "الجزء التاسع",  lessons: "46–50", range: "Al-Dukhān – Al-Ṣaff" },
            { vol: "X",   ar: "الجزء العاشر",  lessons: "51–56", range: "Al-Jumuʿa – Al-Nās" },
          ].map(({ vol, ar, lessons, range }) => (
            <div key={vol} className="flex items-start gap-4 py-3 border-b border-white/5">
              <div className="w-12 shrink-0 text-right">
                <span className="font-english text-gold/70 text-sm font-semibold">Vol. {vol}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="font-arabic text-white/80 text-base" dir="rtl">{ar}</span>
                  <span className="font-english text-white/30 text-xs">Lessons {lessons}</span>
                </div>
                <p className="font-english text-white/45 text-xs leading-relaxed">{range}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gold/15 text-center">
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
