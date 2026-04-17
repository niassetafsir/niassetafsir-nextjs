import Link from 'next/link';

export default function IntroductionPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold italic">
          Translator&apos;s Introduction
        </div>
        <div className="font-english text-white/50 text-sm mt-2">
          On Translation, Conventions, and This Edition
        </div>
        <p className="font-english text-white font-semibold text-center mt-4">Amadu Kunateh</p>
        <p className="font-english text-white/45 text-sm text-center">PhD Candidate, Philosophy of Religion and African Studies</p>
        
      </div>
      <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">This Edition: Structure, Method, and Translation Approach</h2>
        <p className="font-english text-white leading-relaxed mb-3 text-justify">The present edition presents the Arabic text of Fī Riyāḍ al-Tafsīr in the Warsh ʿan Nāfiʼ rasm, the orthographic standard of North and West Africa in which the tafsīr was delivered, with an English translation on facing pages. The edition is structured in seven volumes, each corresponding to one of the seven manzils, the weekly Qurʾānic recitation cycle that Niasse himself practised and celebrated in verse. He enumerated the opening sūra of each manzil in verse and invoked two of the Qurʾān’s names, al-Furqān (the Criterion) and al-Jamʼ (the Joining):</p>
        <blockquote className="my-4 ml-6 pl-4 border-l-2 border-gold/40 font-english text-sm text-white/75 italic leading-8">Al-Fātiḥah, al-Māʾida, Yūnus, al-Isrāʾ,<br />al-Shuʿarāʾ, al-Ṣāffāt, Qāf, thus it is clarified.<br />He who joins the Criterion with the Joining<br />completes a full recitation of the Criterion.</blockquote>
        <p className="font-english text-white leading-relaxed mb-3 text-justify">This structure reflects fidelity to the Shaykh’s own relationship to the Qurʾān. Qurʾānic audio is presented per verse using the recitation of Maḥmūd Khalīl al-Ḥuṣarī (1917–1980) in the Warsh riwāya. The translation proceeds from a commitment to scholarly precision and readability. The register is formal academic prose that preserves the oral cadences of the original, its directness, its rhythmic repetitions, and its transitions between legal analysis and spiritual address. Technical terms are retained in Arabic on first occurrence, with English equivalents in parentheses, and thereafter used in transliteration. The transliteration follows IJMES conventions throughout.</p>
        <p className="font-english text-white leading-relaxed mb-3 text-justify">Three translation choices warrant explicit statement. First, the Basmala is rendered “By Allāh’s Name, The Entirely Merciful, The Especially Merciful,” preserving the theological distinction between al-Raḥmān and al-Raḥīm that Niasse himself elaborates at length. Second, the term ʿabd is translated as “slave” throughout, as the more precise rendering of the term’s theological weight, the relationship of complete ontological submission that ʿabd carries in Niasse’s usage. Third, the phrase al-ḥamdu lillāh is rendered as two words, “al-ḥamdu lillāh (The Praise is for God),” preserving both the Arabic formula and its syntactic structure.</p>
        <p className="font-english text-white leading-relaxed mb-3 text-justify">The footnote apparatus throughout this edition preserves all of Niasse’s original scholarly citations, to the hadith collections, to al-Suyūṭī’s al-Itqān, to al-Ghazālī, to Ibn ʿArabī, traced to their canonical sources. Translator’s notes are added only where necessary and are distinguished from the Arabic compiler’s footnotes.</p>
        
        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">A Note on Transliteration and Conventions</h2>
        <p className="font-english text-white leading-relaxed mb-3 text-justify">Arabic transliteration follows IJMES conventions throughout. The following honorifics are retained in abbreviated form: r.a. (raḍiya Allāhu ʿanhu/ʿanhā, “may Allāh be pleased with him/her”), used following the names of Companions and recognized saints; ṣ.a.w.s. (ṣallā Allāhu ʿalayhi wa-sallam, “may Allāh’s peace and blessings be upon him”), used following the name of the Prophet. Qurʾānic citations are given in the form Q. followed by chapter and verse numbers. Technical Arabic terms are given in transliteration on first occurrence with an English equivalent in parentheses; thereafter they appear in transliteration only. The Qurʾānic text in this edition follows the Warsh ʿan Nāfiʼ rasm.</p>
        {/* Acknowledgements section withheld pending final publication */}
  <div className="mt-12 pt-6 border-t border-gold/15 text-center">
        <Link href="/lesson/1"
          className="font-english text-sm text-bg bg-gold hover:bg-gold-light px-5 py-2 rounded-lg font-semibold transition-all">
          Begin Reading → Lesson One
        </Link>
      </div>
    </main>
  );
}
