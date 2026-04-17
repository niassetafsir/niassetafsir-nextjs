import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">About This Edition</div>
        <div className="font-english text-white/40 text-sm mt-2 italic" dir="ltr">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Bilingual Edition
        </div>
      </div>

      <div className="space-y-8 font-english text-white leading-relaxed">

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Qurʾānic Text and Audio
          </h2>
          <p className="text-white/70 text-sm leading-6">
            The Qurʾānic text in this edition follows the <strong className="text-white/90">Warsh ʿan Nāfiʿ rasm</strong>, 
            the orthographic standard of North and West Africa in which the tafsīr was delivered. 
            Audio recitation is by <strong className="text-white/90">Maḥmūd Khalīl al-Ḥuṣarī</strong> (1917–1980) 
            in the Warsh riwāya.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Copyright
          </h2>
          <p className="text-white/70 text-sm leading-6">
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
          <p className="text-white/70 text-sm leading-6">
            Web development review: Ally Mahmoud. 
            Arabic textual verification and proofreading: Dayyib Bashir Sheikh Dahir and Kabir Aliyu Sheikh Dahir.
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
