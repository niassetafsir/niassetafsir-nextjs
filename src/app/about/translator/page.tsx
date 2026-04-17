import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">The Translator</h1>
      <p className="font-english text-white/45 text-base mb-8">Amadu Kunateh, Harvard University</p>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-5">
        <p>
          <strong className="text-white/90">Amadu Kunateh</strong> is a PhD candidate in Philosophy of Religion 
          and African Studies at Harvard University. His dissertation — the first sustained, book-length scholarly 
          treatment of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> — investigates the theology, anthropology, 
          and cosmology as found in Niasse&apos;s tafsīr, reading it as a case study in twentieth-century West 
          African Islamic erudition and its theological, philosophical, and Sufi dimensions.
        </p>
        <p>
          His engagement with this tafsīr began with the earlier six-volume Arabic edition and deepened with the 
          transition to the current ten-volume edition from 2022. This digital bilingual edition has been developed 
          in parallel with his doctoral research. Kunateh is the sole translator of the English text and the primary 
          researcher, proofreader, and architect of this edition.
        </p>
        <p>
          The print translation is in preparation for publication with Brill Academic Publishers. Expected 
          completion of the dissertation: May 2027.
        </p>
      </div>

      <div className="mt-10 pt-6 border-t border-gold/15">
        <Link href="/introduction" className="font-english text-sm text-gold/60 hover:text-gold transition-all">
          Read the Translator&apos;s Introduction →
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="font-english text-xs text-white/35 hover:text-gold/60 border border-white/10 hover:border-gold/30 px-4 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
