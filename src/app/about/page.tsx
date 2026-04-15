import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">About This Edition</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Bilingual Edition
        </div>
      </div>

      <div className="space-y-6 font-english text-white leading-relaxed">
        <p>
          This digital edition presents the Arabic text of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> by
          Shaykh Ibrāhīm Niasse (d. 1975), with a facing-page English translation by Amadu Kunateh,
          PhD Candidate in Philosophy of Religion and African Studies at Harvard University.
        </p>
        <p>
          The Arabic edition was compiled by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī
          from the original cassette recordings of the Shaykh&apos;s oral delivery of the tafsīr in
          Arabic in 1383 AH (c. 1963–64). The compiler subjected the transcription to a rigorous
          process of hadith verification and scholarly annotation across ten volumes.
        </p>
        <p>
          The Qurʾānic text follows the Warsh ʿan Nāfiʿ rasm. Audio recitation is by Maḥmūd Khalīl
          al-Ḥuṣarī (1917–1980) in the Warsh riwāya.
        </p>
        <h2 className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20">
          Companion Texts
        </h2>
        <p>
          Each lesson includes the corresponding passage from{' '}
          <em>Tafsīr al-Jalālayn</em> (Jalāl al-Dīn al-Maḥallī and Jalāl al-Dīn al-Suyūṭī,
          d. 864/1459 and 911/1505), in the English translation of Feras Hamza (Royal Aal al-Bayt
          Institute, 2007), and a link to the corresponding passage in{' '}
          <em>Rūḥ al-Bayān</em> of Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715) via{' '}
          <a href="https://usul.ai" target="_blank" rel="noopener" className="text-gold/70 hover:text-gold underline">
            Usul.ai
          </a>.
        </p>
        <h2 className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20">
          Copyright
        </h2>
        <p className="text-white/70">
          Arabic edition © Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. English translation
          © Amadu Kunateh. All rights reserved. Scholarly quotation with full citation is permitted.
          Reproduction or redistribution without written permission is prohibited.
        </p>
        <h2 className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20">
          Team
        </h2>
        <p className="text-white/70">
          Web development verification and review: Ally Mahmoud. Arabic textual verification:
          Dayyid Bashir Sheikh Ṭāhir Bouchī and Kabir Sayyid ʿAlī Usmān Ṭāhir Bouchī.
        </p>
      </div>

      <div className="mt-10 pt-6 border-t border-gold/15 text-center">
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Back to Contents
        </Link>
      </div>
    </main>
  );
}
