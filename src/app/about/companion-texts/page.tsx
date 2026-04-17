import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">Companion Texts</h1>
      <p className="font-english text-white/45 text-base mb-8">Tafsīr al-Jalālayn and Rūḥ al-Bayān</p>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-5">
        <p>Each lesson in this edition includes the corresponding passage from two companion tafsīrs that Niasse himself closely consulted.</p>
        <p>Tafsīr al-Jalālayn (Jalāl al-Dīn al-Maḥallī, d. 864/1459, and Jalāl al-Dīn al-Suyūṭī, d. 911/1505) is the most widely read classical tafsīr in the Islamic world. Its concise, accessible explanations of Qurʾānic vocabulary and syntax made it Niasse's primary reference for difficult passages. Where time was short, the compiler notes, Niasse would draw directly from Jalālayn. The English translation by Feras Hamza (Royal Aal al-Bayt Institute, 2007) is used in this edition.</p>
        <p>Rūḥ al-Bayān fī Tafsīr al-Qurʾān of Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715) is a ten-volume Sufi tafsīr drawing on the works of Ibn ʿArabī and later classical commentators. Niasse drew on it extensively for the spiritual and mystical dimensions of the commentary. The full Arabic text is accessible via Usul.ai.</p>
      </div>

      <div className="mt-12 pt-6 border-t border-gold/15 text-center">
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
