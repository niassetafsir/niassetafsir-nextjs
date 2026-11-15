import Link from 'next/link';
import { TOPICS } from '@/lib/topics';

export const metadata = {
  title: 'Topics',
  description: 'What Shaykh Ibrāhīm Niasse says on one subject at a time, in his own words from Fī Riyāḍ al-Tafsīr.',
};

export default function TopicsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">موضوعات</p>
      <h1 className="font-english font-semibold text-base mb-2" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Topics
      </h1>
      <p className="font-english text-[13.5px] leading-relaxed mb-8" style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
        One subject at a time: what Shaykh Ibrāhīm says about it, in his own words, with the volume, page,
        lesson and verse of every passage.
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
    </main>
  );
}
