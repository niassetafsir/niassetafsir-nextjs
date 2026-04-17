import Link from 'next/link';

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
        <p>The Arabic text is drawn from the ten-volume compiled edition of Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, who transcribed, verified, and annotated the tafsīr from the original cassette recordings of Shaykh Ibrāhīm Niasse's oral delivery in Arabic in 1383 AH (c. 1963–64).</p>
        <p>The compiler acknowledges the challenges of transcribing oral speech: the density of pronominal reference, the rapid movement of inflection, and the gap between spoken expression and written text. He undertook the work out of concern that the recordings, scattered among the khalīfas and companions of the Shaykh, might be lost. The hadith apparatus alone records more than six thousand citations traced to their canonical sources across the ṣaḥīḥayn, the Sunan collections, and the wider hadith literature.</p>
        <p>This edition was prepared with the authorisation and blessing of the Niasse family, with unrestricted permission granted for its writing, verification, printing, and dissemination.</p>
      </div>

      <div className="mt-12 pt-6 border-t border-gold/15 text-center">
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
