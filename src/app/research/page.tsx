import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Platform',
  description: 'Scholarly research tools for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm',
};

const TOOLS = [
  // ── Advanced scholarly tools ──────────────────────────────────
  {
    href: '/network',
    titleAr: 'شبكة العلماء',
    titleEn: 'Scholar Network',
    desc: 'Intellectual genealogy — 19 scholars, their traditions, citation counts, body vs. apparatus.',
    tier: 'scholar',
  },
  {
    href: '/notes',
    titleAr: 'ملاحظات البحث',
    titleEn: 'Research Notes',
    desc: 'Editorial observations on the text — methodology, doctrine, and open questions.',
    tier: 'scholar',
  },
  {
    href: '/footnotes',
    titleAr: 'الحواشي والمصادر',
    titleEn: 'Footnotes & Citations',
    desc: '798 footnotes by the compiler, genre-classified: Hadith, Tafsīr, Theology, Sufism, Fiqh.',
    tier: 'scholar',
  },
  {
    href: '/hadith',
    titleAr: 'فهرس الأحاديث',
    titleEn: 'Ḥadīth Index',
    desc: '384 hadith citations indexed by collection — Bukhārī, Muslim, Tirmidhī, and others.',
    tier: 'scholar',
  },
  {
    href: '/glossary',
    titleAr: 'فهرس المصطلحات',
    titleEn: 'Concordance of Terms',
    desc: '20 theological and Sufi terms — every occurrence across the corpus, in context.',
    tier: 'scholar',
  },
  {
    href: '/themes',
    titleAr: 'فهرس علوم التفسير',
    titleEn: 'Tafsīr Sciences Index',
    desc: '11 categories drawn from classical ʿulūm al-tafsīr — passages classified by discipline.',
    tier: 'scholar',
  },
  // ── Research tools ─────────────────────────────────────────────
  {
    href: '/scholars',
    titleAr: 'فهرس العلماء والمصادر',
    titleEn: 'Scholar & Source Index',
    desc: 'Every figure cited — with distinction between body text citations and apparatus citations.',
    tier: 'research',
  },
  {
    href: '/concordance',
    titleAr: 'فهرس الآيات',
    titleEn: 'Verse Concordance',
    desc: 'Find any verse — Shaykh Ibrāhīm\'s commentary alongside Jalālayn on the same passage.',
    tier: 'research',
  },
  {
    href: '/search',
    titleAr: 'البحث في النص',
    titleEn: 'Full-Text Search',
    desc: 'Search across all lessons in Arabic and English.',
    tier: 'research',
  },
  // ── Personal tools ─────────────────────────────────────────────
  {
    href: '/clips',
    titleAr: 'اقتباسات البحث',
    titleEn: 'Research Clips',
    desc: 'Select any passage — Chicago citation generated automatically.',
    tier: 'personal',
  },
  {
    href: '/bookmarks',
    titleAr: 'المحفوظات',
    titleEn: 'Bookmarks',
    desc: 'Save passages for later study.',
    tier: 'personal',
  },
];

const TIER_LABELS: Record<string, string> = {
  scholar: 'Advanced Research',
  research: 'Research Tools',
  personal: 'Personal',
};

export default function ResearchPage() {
  const tiers = ['scholar', 'research', 'personal'] as const;

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-5" dir="ltr">

      {/* Header — compact */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h1 className="font-english font-semibold text-base"
            style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
            Research Platform
          </h1>
          <p className="font-arabic text-sm" dir="rtl" style={{color:'rgba(201,168,76,0.6)'}}>
            أدوات البحث العلمي
          </p>
        </div>
        <Link href="/lesson/1"
          className="font-english text-xs hover:text-gold transition-colors"
          style={{color:'rgba(255,255,255,0.3)'}}>
          ← Reading
        </Link>
      </div>

      {/* Tool sections */}
      {tiers.map(tier => {
        const tools = TOOLS.filter(t => t.tier === tier);
        return (
          <div key={tier} className="mb-6">
            <p className="font-english text-[10px] uppercase tracking-widest mb-2"
              style={{color:'rgba(201,168,76,0.5)', letterSpacing:'0.1em'}}>
              {TIER_LABELS[tier]}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tools.map(tool => (
                <Link key={tool.href} href={tool.href}
                  className="block rounded-xl border p-3 transition-all group hover:border-gold/40"
                  style={{
                    borderColor:'rgba(255,255,255,0.08)',
                    background:'transparent',
                  }}>
                  <p className="font-english text-sm font-semibold mb-0.5 group-hover:text-gold transition-colors"
                    style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
                    {tool.titleEn}
                  </p>
                  <p className="font-arabic text-[10px]" dir="rtl"
                    style={{color:'rgba(201,168,76,0.35)'}}>
                    {tool.titleAr}
                  </p>
                  <p className="font-english text-[11px] leading-4"
                    style={{color:'var(--body-faint, rgba(255,255,255,0.38))'}}>
                    {tool.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

    </main>
  );
}
