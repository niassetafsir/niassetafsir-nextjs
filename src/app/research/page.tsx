import Link from 'next/link';
import type { Metadata } from 'next';
import { getEditionFacts } from '@/lib/coverage';

export const metadata: Metadata = {
  title: 'Research Platform',
  description: 'Scholarly research tools for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm',
};

const TOOLS = [
  {
    href: '/verse',
    titleAr: 'فهرس الآيات القرآنية',
    titleEn: 'Commentary by Verse',
    desc: 'Look up any āya and see every place Shaykh Ibrāhīm treats it — the tafsīr, the fatwās, the letters, the poetry — each entry typed by what he is doing with the verse, dated, and graded for how well attested it is. Readings by his students are held separate.',
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
    // {footnotes} is substituted at render from src/data/footnotesData.json.
    // Hardcoded, this read "1,994" while the apparatus held 1,997 -- the card
    // linking to the footnote index misreported the size of the thing it links
    // to.
    desc: '{footnotes} footnotes by the compiler, genre-classified: Hadith, Tafsīr, Theology, Sufism, Fiqh. Lessons {fnLessons} of {totalLessons} so far.',
    tier: 'scholar',
  },
  {
    href: '/hadith',
    titleAr: 'فهرس الأحاديث',
    titleEn: 'Ḥadīth Index',
    desc: '{hadith} hadith citations across {collections} collections — Bukhārī, Muslim, Tirmidhī, and others.',
    tier: 'scholar',
  },
  {
    href: '/glossary',
    titleAr: 'فهرس المصطلحات',
    titleEn: 'Technical Terms',
    // "Twenty" was the concordance's length, but the merged page lists the
    // graph-only terms too, so it showed twenty-four.
    desc: '{terms} theological and Sufi terms — every occurrence in context, and the relations Niasse draws between them, each cited to the passage.',
    tier: 'scholar',
  },
  {
    href: '/search',
    titleAr: 'البحث في النص',
    titleEn: 'Full-Text Search',
    desc: 'Search across all lessons in Arabic and English.',
    tier: 'research',
  },
  {
    href: '/saved',
    titleAr: 'المحفوظات',
    titleEn: 'Saved',
    desc: 'Passages you have kept while reading — bookmarks and cited clips in one list, with a Chicago citation ready to copy.',
    tier: 'personal',
  },
];

const TIER_LABELS: Record<string, string> = {
  scholar: 'Advanced Research',
  research: 'Research Tools',
  personal: 'Personal',
};

export default async function ResearchPage() {
  const tiers = ['scholar', 'research', 'personal'] as const;
  // Every figure in a tool card is a measurement of this repository, so each
  // one is counted at build time rather than typed. A card that misstates the
  // size of the index it links to is checkable by the reader in one click.
  const f = await getEditionFacts();
  const n = (x: number) => x.toLocaleString('en-US');
  const fill = (s: string) => s
    .replace('{footnotes}', n(f.footnoteCount))
    .replace('{hadith}', n(f.hadithCitations))
    .replace('{collections}', n(f.hadithCollections))
    .replace('{terms}', n(f.termCount))
    .replace('{fnLessons}', n(f.footnoteLessons))
    .replace('{totalLessons}', n(f.totalLessons));

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
          className="tap font-english text-xs hover:text-gold transition-colors"
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
                    {fill(tool.desc)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      <p className="font-english text-[11px] leading-5 mt-2" style={{color:'rgba(255,255,255,0.28)'}}>
        A few advanced analytical tools (scholar network, verse concordance) are being held back while a companion
        article is under preparation for <em>Islamic Africa</em> (Brill).
      </p>

    </main>
  );
}
