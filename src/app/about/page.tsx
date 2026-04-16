import Link from 'next/link';
import SubscribeBar from '@/components/SubscribeBar';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">About This Edition</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Bilingual Edition
        </div>
      </div>

      <div className="space-y-5 font-english text-white leading-relaxed">

        <h2 className="font-english text-gold text-lg font-semibold mt-2 mb-3 pb-2 border-b border-gold/20">
          The Translator and Editor
        </h2>
        <p>
          This edition was conceived, translated, digitized, and built by{' '}
          <strong className="text-gold-light">Amadu Kunateh</strong>, PhD Candidate in Philosophy of
          Religion and African Studies at Harvard University. Kunateh is the sole translator of the
          English text and has been the primary researcher, proofreader, and digital architect of
          this edition from its inception.
        </p>
        <p>
          His engagement with this tafsīr began with the earlier six-volume Arabic edition and
          deepened substantially with the transition to the current ten-volume edition from 2022
          onward. The preparation of this bilingual digital edition has proceeded in parallel with
          his doctoral research.
        </p>
        <p>
          His dissertation — the first sustained, book-length scholarly treatment of this tafsīr —
          investigates the theology (Who is God?), anthropology (Who is the human being?), and
          cosmology (What is the cosmos?) as found in Fī Riyāḍ al-Tafsīr, reading it as a case
          study in twentieth-century West African Islamic erudition and its theological,
          philosophical, and Sufi dimensions. Expected completion: May 2027.
        </p>

        <h2 id="arabic" className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20 scroll-mt-20">
          The Arabic Edition
        </h2>
        <p>
          The Arabic text is drawn from the ten-volume edition compiled by{' '}
          <strong className="text-gold-light">Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī</strong>,
          who transcribed, verified, and annotated the tafsīr from the original cassette recordings
          of Shaykh Ibrāhīm Niasse&apos;s oral delivery in Arabic in 1383 AH (c. 1963–64). The
          compiler&apos;s hadith apparatus alone records more than six thousand citations traced to
          their canonical sources. This edition was prepared with the authorisation and blessing of
          the Niasse family.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20">
          The Qurʾānic Text and Audio
        </h2>
        <p>
          The Qurʾānic text follows the Warsh ʿan Nāfiʿ rasm, the orthographic standard of North
          and West Africa in which the tafsīr was delivered. Audio recitation is by Maḥmūd Khalīl
          al-Ḥuṣarī (1917–1980) in the Warsh riwāya.
        </p>

        <h2 id="companion" className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20 scroll-mt-20">
          Companion Texts
        </h2>
        <p>
          Each lesson includes the corresponding passage from{' '}
          <em>Tafsīr al-Jalālayn</em> (Jalāl al-Dīn al-Maḥallī, d. 864/1459, and Jalāl al-Dīn
          al-Suyūṭī, d. 911/1505), in the English translation of Feras Hamza (Royal Aal al-Bayt
          Institute for Islamic Thought, 2007), and a link to the corresponding passage in{' '}
          <em>Rūḥ al-Bayān fī Tafsīr al-Qurʾān</em> of Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715)
          via{' '}
          <a href="https://usul.ai" target="_blank" rel="noopener"
            className="text-gold/70 hover:text-gold underline">
            Usul.ai
          </a>.
          These companion texts appear as inline comparative notes after each section of Niasse&apos;s
          commentary, enabling direct scholarly comparison.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20">
          Copyright
        </h2>
        <p className="text-white/70">
          Arabic edition © Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. English
          translation © Amadu Kunateh. All rights reserved. Scholarly quotation with full citation
          is permitted. Reproduction, redistribution, or commercial use without written permission
          is prohibited.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-8 mb-3 pb-2 border-b border-gold/20">
          Team
        </h2>
        <p className="text-white/70">
          Web development review: Ally Mahmoud. Arabic textual verification and proofreading:
          Dayyib Bashir Sheikh Dahir and Kabir Aliyu Sheikh Dahir.
        </p>

      </div>

      <div className="mt-10 mb-6">
        <SubscribeBar />
      </div>
      <div className="mt-6 pt-6 border-t border-gold/15 text-center">
        <Link href="/"
          className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Back to Contents
        </Link>
      </div>
    </main>
  );
}
