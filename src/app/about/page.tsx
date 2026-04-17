import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">About This Edition</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
        </div>
      </div>

      <div className="space-y-8 font-english text-white/70 leading-relaxed text-sm">

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Edition
          </h2>
          <p className="leading-6">
            This is a digital bilingual scholarly edition of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> 
            by Shaykh Ibrāhīm Niasse (d. 1975). The edition presents the complete Arabic text of the 
            ten-volume compiled edition alongside a partial English translation (currently Lessons 1–2), 
            with the full translation in preparation for print publication.
          </p>
          <p className="leading-6 mt-3">
            The digital edition is based on the Arabic text compiled by 
            <strong className="text-white/85"> Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī</strong> 
            from recordings of Shaykh Ibrāhīm&apos;s oral delivery, with editorial corrections and 
            scholarly annotations. Each lesson is accompanied by comparative notes drawing on 
            Tafsīr al-Jalālayn and Rūḥ al-Bayān of Ismāʿīl Ḥaqqī al-Burūsawī — the two works 
            Niasse himself most closely consulted.
          </p>
          <p className="leading-6 mt-3">
            The print bilingual edition (Arabic facing English) is currently under review for 
            publication with Brill Academic Publishers.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Qurʾānic Text and Audio
          </h2>
          <p className="leading-6">
            The Qurʾānic text follows the <strong className="text-white/85">Warsh ʿan Nāfiʿ rasm</strong>, 
            the orthographic standard of North and West Africa in which the tafsīr was delivered. 
            Audio recitation is by <strong className="text-white/85">Maḥmūd Khalīl al-Ḥuṣarī</strong> (1917–1980) 
            in the Warsh riwāya.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Copyright
          </h2>
          <p className="leading-6">
            Arabic edition © Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. 
            English translation © Amadu Kunateh. All rights reserved. 
            Scholarly quotation with full citation is permitted. 
            Reproduction, redistribution, or commercial use without written permission is prohibited.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Team
          </h2>
          <p className="leading-6">
            <strong className="text-white/85">Amadu Kunateh</strong> — Translator, Editor, Digitiser, 
            and builder of this scholarly database. Kunateh conceived and developed this resource 
            to make Shaykh Ibrāhīm Niasse&apos;s tafsīr accessible and searchable for scholarly 
            research, building the first digital comparative database of the text.
          </p>
          <p className="leading-6 mt-3">
            <strong className="text-white/70">Ally Mahmoud</strong> — Web development review.<br />
            <strong className="text-white/70">Dayyib Bashir Sheikh Dahir</strong> — Arabic textual verification and proofreading.<br />
            <strong className="text-white/70">Kabir Aliyu Sheikh Dahir</strong> — Arabic textual verification and proofreading.
          </p>
        </div>

      </div>

      <div className="mt-10 pt-6 border-t border-gold/15 text-center">
        <Link href="/"
          className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Back to Contents
        </Link>
      </div>
    </main>
  );
}
