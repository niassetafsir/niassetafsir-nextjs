import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">Shaykh Ibrāhīm Niasse</h1>
      <p className="font-english text-white/45 text-base mb-8">The West African Scholarly Tradition</p>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-5">
        <p>Shaykh Ibrāhīm Niasse (d. 1975) was a Senegalese scholar and spiritual leader whose formation was shaped entirely by the West African scholarly tradition. He emerged from a lineage of West African scholars who had, from the fifteenth century onward, contributed substantially to Islamic theology, logic, jurisprudence, and spirituality.</p>
        <p>He is regarded by his followers as the Ṣāḥib al-Fayḍa, the Possessor of the Tijānī Flood of Gnosis. His scholarly mission extended across the inhabited world, from West Africa to Paris, Cairo, Beirut, Tehran, India, Hong Kong, and China. He is reported to have memorised Fakhr al-Dīn al-Rāzī's Mafātīḥ al-Ghayb in its entirety — one of the most philosophically sophisticated Qurʾānic commentaries in the classical tradition.</p>
        <p>Tafsīr was the medium in which Niasse most fully expressed his scholarly mission. He completed the entire tafsīr of the Qurʾān between ten and twelve times throughout his life, in public sessions, primarily in Wolof, with several complete cycles delivered in Arabic for his non-Wolof-speaking students.</p>
      </div>

      <div className="mt-12 pt-6 border-t border-gold/15 text-center">
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
