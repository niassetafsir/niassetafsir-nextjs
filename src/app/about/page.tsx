import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">About This Edition &amp; Database</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
        </div>
      </div>

      <div className="space-y-8 font-english text-white/70 leading-relaxed text-sm">

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            This Scholarly Database
          </h2>
          <p className="leading-6">
            This is a digital scholarly research database for <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> 
            by Shaykh Ibrāhīm Niasse (d. 1975) — the first resource of its kind designed to make this 
            tafsīr accessible, searchable, and analytically usable for academic research. It provides 
            the complete Arabic text, a partial English translation (Lessons 1–2), comparative passages 
            from Tafsīr al-Jalālayn and <em>Rūḥ al-Bayān</em>, full-text search, and research tools 
            including text clipping with auto-citation.
          </p>
          <p className="leading-6 mt-3">
            The Arabic text is based on the compiled edition of 
            <strong className="text-white/85"> Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī</strong>, 
            with editorial corrections. The database has been digitised, verified, and built by 
            <strong className="text-white/85"> Amadu Kunateh</strong> (Harvard University) as part 
            of his doctoral research on Niasse&apos;s tafsīr.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Print Bilingual Edition
          </h2>
          <p className="leading-6">
            The complete bilingual print edition (Arabic facing English) is currently under review 
            for publication with Brill Academic Publishers. It differs from the Arabic compiled 
            edition in its organisation: rather than following the ten-volume structure of the 
            Arabic edition, the print bilingual edition is organised around the 
            <strong className="text-white/85"> seven manzils</strong> — the daily recitation portions 
            that Shaykh Ibrāhīm himself enumerated in verse and practised as a weekly cycle of 
            Qurʾānic recitation.
          </p>
          <p className="leading-6 mt-3">
            This seven-volume structure — each volume corresponding to one manzil — reflects the 
            Sheikh&apos;s own relationship to the Qurʾān and provides a framework for the translation 
            that is rooted in his practice rather than in the conventions of the printed Arabic edition.
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
