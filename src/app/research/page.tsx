import Link from 'next/link';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research Platform",
  description: "Research tools for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm: full-text search, verse concordance, critical apparatus, scholar index, tafsīr sciences index, glossary, and citation tools.",
  openGraph: {
    title: "Research Platform | niassetafsir.org",
    description: "Research tools for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm: full-text search, verse concordance, critical apparatus, scholar index, tafsīr sciences index, glossary, and citation tools.",
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
    desc: "Search any verse · Jalālayn commentary · Shaykh Ibrāhīm's reflection",
  },
  {
    href: '/footnotes',
    titleAr: 'فهرس الحواشي والمصادر',
    titleEn: 'Footnotes & Citations',
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
    desc: "Every figure cited across the tafsīr, with a key distinction: scholars Shaykh Ibrāhīm invokes in his own words versus sources documented by the compiler.",
  },
  {
    href: '/themes',
    titleAr: 'فهرس علوم التفسير',
    titleEn: 'Tafsīr Sciences Index',
    desc: 'Classified by tafsīr discipline — 11 categories drawn from classical ʿulūm al-tafsīr: Quranic Sciences, Prophethood, Fiqh & Law, Sufism, Spiritual Ethics, History & Narrative.',
  },
  {
    href: '/glossary',
    titleAr: 'مصطلحات التفسير',
    titleEn: 'Concordance of Terms',
    desc: 'Twenty theological and Sufi terms as Shaykh Ibrāhīm employs them, with his exact Arabic usage, apparatus citations, and conceptual connections.',
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

const TOOLS = [...PRIMARY_TOOLS, ...PERSONAL_TOOLS,
  {
    href: '/network',
    titleAr: 'شبكة العلماء',
    titleEn: 'Scholar Network',
    desc: '19 scholars cited across the tafsīr — their traditions, citation counts, and roles in the body text vs. apparatus. Filter by discipline.',
  },
  {
    href: '/notes',
    titleAr: 'ملاحظات البحث',
    titleEn: 'Research Notes',
    desc: 'Editorial observations on specific passages — methodology, doctrine, and textual questions noted during the preparation of this edition.',
  }
];

export default function ResearchPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 pb-6 pt-4" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-english text-white font-semibold text-base">Research Platform</h1>
          <div className="font-arabic text-gold text-sm mt-0.5" dir="rtl">أدوات البحث العلمي</div>
        </div>
        <Link href="/lesson/1"
          className="font-english text-xs text-white/40 hover:text-gold transition-colors">
          ← Reading
        </Link>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {TOOLS.map(tool => (
          <Link key={tool.href} href={tool.href}
            className="group border border-white/10 hover:border-gold/40 rounded-xl p-3 transition-all hover:bg-gold/5">
            <div className="mb-1">
              <div>
                <div className="font-arabic text-sm" dir="rtl"
                  style={{color:'rgba(255,255,255,0.5)'}}>{tool.titleAr}</div>
                <div className="font-english font-semibold text-sm group-hover:text-gold transition-colors"
                  style={{color:'rgba(255,255,255,0.9)'}}>{tool.titleEn}</div>
              </div>
            </div>
            <p className="font-english text-xs leading-5"
              style={{color:'rgba(255,255,255,0.45)'}}>{tool.desc}</p>
          </Link>
        ))}
      </div>


    </main>
  );
}
