import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">Translator &amp; Digital Editor</h1>
      <p className="font-english text-white/45 text-base mb-8">Amadu Kunateh</p>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-5">
        <p>
          <strong className="text-white/90">Amadu Kunateh</strong> is a PhD candidate in Philosophy of Religion and African Studies at Harvard University. This digital scholarly edition is part of his sustained 
          doctoral research on the tafsīr of Shaykh Ibrāhīm Niasse — work he has conducted since 2022 across 
          both the six-volume and current ten-volume Arabic editions of the text.
        </p>
        <p>
          Kunateh conceived, built, and maintains this edition. He is the sole translator of the English text 
          and has been responsible for the digitisation, proofreading, structural design, and scholarly 
          annotation of every component of this resource. The genre classification of the critical apparatus — 
          organising the compiler's 798 footnotes by subject (Hadith Sciences, Tafsīr, Theology, Sufism, 
          Fiqh, Linguistics, History) — is an original editorial contribution of this digital edition, not 
          present in the printed Arabic text.
        </p>
        <p>
          The Scholar Index represents a further and distinct contribution. Where the compiler&apos;s 
          apparatus documents Niasse&apos;s sources, the Scholar Index maps Niasse&apos;s intellectual 
          interlocutors — the figures he names, invokes, and positions himself in relation to within his 
          own oral commentary. This is an act of intellectual history, not source documentation. It answers 
          the question: <em>with whom does Niasse think?</em> No printed edition of this tafsīr — including 
          the Arabic ten-volume compiled edition — undertakes this mapping. This edition does so as part of the sustained aim to document Niasse&apos;s intellectual genealogy.
        </p>
        <p>
          His dissertation — <em>Leaders of Knowledge: Tafsīr, Philosophical-Theology, and the Remapping of 
          Islamic Thought in West Africa</em> (expected 2027) — is the first sustained, 
          book-length scholarly treatment of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>. It investigates 
          the theology (Who is God?), anthropology (Who is the human being?), and cosmology (What is the cosmos?) 
          as found in Niasse&apos;s tafsīr, reading it as a case study in twentieth-century West African Islamic 
          erudition and its theological, philosophical, and Sufi dimensions.
        </p>

      </div>

      <div className="mt-10 pt-6 border-t border-gold/15">
        <a href="mailto:niassetafsirproject@gmail.com" className="font-english text-sm text-white/35 hover:text-gold/60 transition-all">
          niassetafsirproject@gmail.com
        </a>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="font-english text-xs text-white/35 hover:text-gold/60 border border-white/10 hover:border-gold/30 px-4 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
