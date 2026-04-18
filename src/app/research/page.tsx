import Link from 'next/link';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research Platform",
  description: "Research tools for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm: full-text search, verse concordance, critical apparatus, scholar index, thematic index, glossary, and citation tools.",
  openGraph: {
    title: "Research Platform | niassetafsir.org",
    description: "Research tools for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm: full-text search, verse concordance, critical apparatus, scholar index, thematic index, glossary, and citation tools.",
  },
};


// Research tools — primary scholarly infrastructure
const PRIMARY_TOOLS = [
  {
    href: '/search',
    titleAr: 'البحث الشامل',
    titleEn: 'Full-Text Search',
    desc: 'Search across all 30 lessons in Arabic and English. Covers the commentary text, English translation, and Jalālayn companion text.',
  },
  {
    href: '/concordance',
    titleAr: 'فهرس الآيات',
    titleEn: 'Verse Concordance',
    desc: '1,079 Quranic references mapped to the lessons where Niasse comments on them. Click any verse to reach his commentary directly.',
  },
  {
    href: '/footnotes',
    titleAr: 'فهرس الحواشي والمصادر',
    titleEn: 'Critical Apparatus',
    desc: '798 footnotes compiled by Muḥammad ibn al-Shaykh, classified by genre (Hadith, Tafsīr, Theology, Sufism, Fiqh, Linguistics). Inline [n] links in the text.',
  },
  {
    href: '/hadith',
    titleAr: 'فهرس الأحاديث',
    titleEn: 'Hadith Index',
    desc: '384 hadith citations indexed by collection — Bukhārī, Muslim, Tirmidhī, Abū Dāwūd, and eight others. Each entry links to its lesson and footnote.',
  },
  {
    href: '/scholars',
    titleAr: 'فهرس العلماء والمصادر',
    titleEn: 'Scholar & Source Index',
    desc: "Every figure cited across the tafsīr, with a key distinction: scholars Niasse invokes in his own words versus sources documented by the compiler.",
  },
  {
    href: '/themes',
    titleAr: 'الفهرس الموضوعي',
    titleEn: 'Thematic Index',
    desc: 'Browse all 30 lessons by subject: Quranic Sciences, Prophethood, Fiqh & Law, Sufism, Spiritual Ethics, History & Narrative.',
  },
  {
    href: '/glossary',
    titleAr: 'مصطلحات التفسير',
    titleEn: 'Glossary of Key Terms',
    desc: 'Nineteen theological and Sufi terms as Niasse employs them, with his exact Arabic usage, apparatus citations, and conceptual connections.',
  },
  {
    href: '/glossary-map',
    titleAr: 'خريطة المصطلحات',
    titleEn: 'Theological Vocabulary Map',
    desc: "A structured map of how key terms connect within Niasse's theological system — hierarchies, conditions, and conceptual relationships confirmed from his text.",
  },
  {
    href: '/audio',
    titleAr: 'تسجيلات التفسير',
    titleEn: 'Audio Archive',
    desc: "Stream or download Shaykh Ibrāhīm's Arabic oral tafsīr — one recording per sura, from the 1383 AH / 1964 sessions. Wolof tafsīr (122 sessions) also available.",
  },
];

// Personal research tools
const PERSONAL_TOOLS = [
  {
    href: '/clips',
    titleAr: 'المقتطفات البحثية',
    titleEn: 'Research Clips',
    desc: 'Select any passage → Clip & Cite → Chicago citation generated automatically with volume and page reference. Export for academic writing.',
  },
  {
    href: '/bookmarks',
    titleAr: 'الإشارات المرجعية',
    titleEn: 'Bookmarks',
    desc: 'Save passages for return visits. Export your reading list at any time.',
  },
];

const TOOLS = [...PRIMARY_TOOLS, ...PERSONAL_TOOLS];

export default function ResearchPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-8" dir="ltr">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">
          أدوات البحث العلمي
        </div>
        <h1 className="font-english text-white text-2xl font-semibold mt-1 mb-2">
          Research Platform
        </h1>
        <p className="font-english text-sm max-w-xl mx-auto" style={{color:'rgba(255,255,255,0.45)'}}>
          Tools for scholarly work on <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>, 
          from text to meaning, passage to citation.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/lesson/1"
            className="font-english text-sm text-white/50 hover:text-gold border border-white/15 hover:border-gold/40 px-4 py-1.5 rounded-lg transition-all">
            ← Return to Reading
          </Link>
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(tool => (
          <Link key={tool.href} href={tool.href}
            className="group border border-white/10 hover:border-gold/40 rounded-xl p-5 transition-all hover:bg-gold/5">
            <div className="mb-3">
              <div>
                <div className="font-arabic text-sm" dir="rtl"
                  style={{color:'rgba(255,255,255,0.5)'}}>{tool.titleAr}</div>
                <div className="font-english font-semibold text-sm group-hover:text-gold transition-colors"
                  style={{color:'rgba(255,255,255,0.9)'}}>{tool.titleEn}</div>
              </div>
            </div>
            <p className="font-english text-xs leading-6"
              style={{color:'rgba(255,255,255,0.45)'}}>{tool.desc}</p>
          </Link>
        ))}
      </div>

      {/* Citation note */}
      <div className="mt-10 p-5 border border-gold/15 rounded-xl text-center">
        <p className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
          <strong style={{color:'rgba(255,255,255,0.65)'}}>Citing this platform:</strong>{' '}
          Ibrāhīm Niasse, <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>, comp. Muḥammad ibn Shaykh ʿAbd Allāh 
          al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed. (n.p., n.d.). Digital ed., ed. Amadu Kunateh. 
          niassetafsir.org, 2025.
        </p>
      </div>
    </main>
  );
}
