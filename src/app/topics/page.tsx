import Link from 'next/link';
import { TOPICS } from '@/lib/topics';

export const metadata = {
  title: 'Topics and terms',
  description: 'What Shaykh Ibrāhīm Niasse says on one subject at a time, the terms he defines, and the technical terms of Fī Riyāḍ al-Tafsīr.',
};

export default function TopicsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">موضوعات</p>
      <h1 className="font-english font-semibold text-base mb-2" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Topics and terms
      </h1>
      <p className="font-english text-[13.5px] leading-relaxed mb-8" style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
        Explore Shaykh Ibrāhīm&rsquo;s explanations of particular subjects across the tafsīr. Each topic
        gathers related passages from different lessons, with their Arabic text, volume, page, lesson and
        Qurʾānic reference. Each opens with a short summary by the editor; the passages that follow are
        his words, and every point in the summary rests on them.
      </p>
      <ul className="space-y-3">
        {TOPICS.map(t => (
          <li key={t.slug}>
            <Link href={`/topics/${t.slug}`} className="block rounded-lg border px-4 py-3 hover:border-gold/50 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
              <span className="font-arabic text-gold text-[17px] mr-2" dir="rtl" translate="no">{t.termAr}</span>
              <span className="font-english text-[15px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                {t.title} <span className="font-normal italic">({t.term})</span>
              </span>
              <span className="block font-english text-[12.5px] mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                {t.passages.length} passages from Lessons {Array.from(new Set(t.passages.map(p => p.lesson))).sort((a, b) => a - b).join(', ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* One door for the three indexes of concepts (site review, 27 Nov
          2026). The topics gather his words on a subject; the two term
          indexes below answer narrower questions and live on their own pages. */}
      <h2 className="font-english font-semibold text-[14px] mt-10 mb-3" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Terms
      </h2>
      <ul className="space-y-3">
        {[
          { href: '/term', ar: 'تعريفاته', en: 'Terms he defines', hint: 'The passages, across his works, where he defines a term rather than uses it.' },
          { href: '/glossary', ar: 'المصطلحات', en: 'Technical terms in Fī Riyāḍ al-Tafsīr', hint: 'Where each term occurs in the tafsīr, counted and linked to its passages.' },
        ].map(x => (
          <li key={x.href}>
            <Link href={x.href} className="block rounded-lg border px-4 py-3 hover:border-gold/50 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
              <span className="font-arabic text-gold text-[17px] mr-2" dir="rtl" translate="no">{x.ar}</span>
              <span className="font-english text-[15px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>{x.en}</span>
              <span className="block font-english text-[12.5px] mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{x.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
