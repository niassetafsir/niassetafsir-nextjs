import Link from 'next/link';
import { workSummaries } from '@/lib/corpus';

export const metadata = {
  title: 'Commentaries of His Students',
  description:
    'Qurʾānic explanations by scholars of the Fayḍa who learned from Shaykh Ibrāhīm Niasse, read alongside his own commentary on the same verses.',
};

// The third path. Works whose relation is 'student' are written by scholars
// who learned from him; their passages are their words, not his. Where they
// report his words, those passages stand with his own on the verse page.
export default function StudentsPage() {
  const rows = workSummaries()
    .filter(r => r.work.relation === 'student' && (r.work.publish !== false || r.uses > 0))
    .sort((a, b) => b.uses - a.uses || (a.work.titleTranslit ?? '').localeCompare(b.work.titleTranslit ?? ''));
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">تفاسير تلامذته</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Commentaries of His Students
      </h1>
      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Scholars of the Fayḍa who learned from Shaykh Ibrāhīm also explained the Qurʾān in their own
        writings. This collection brings together their commentaries and places them alongside his own
        wherever they address the same verses. Each passage is attributed to its author. Where a student
        transmits Shaykh Ibrāhīm&rsquo;s teaching, the passage is identified separately from the
        student&rsquo;s own commentary.
      </p>
      {rows.length === 0 ? (
        <p className="font-english text-[13px] italic" style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
          No works are listed yet.
        </p>
      ) : (
      <ul className="space-y-3">
        {rows.map(({ work, verses }) => (
          <li key={work.id}>
            <Link href={`/students/${work.id}`}
              className="block rounded-lg border px-4 py-3 hover:border-gold/50 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
              <span className="font-english text-[15px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                <em>{work.titleTranslit ?? work.id}</em>
              </span>
              {work.titleAr && (
                <span className="block font-arabic text-[14px] mt-0.5" dir="rtl" translate="no"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>{work.titleAr}</span>
              )}
              <span className="block font-english text-[12px] mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                {[work.author, [work.composed?.hijri, work.composed?.gregorian].filter(Boolean).join(' / ')]
                  .filter(Boolean).map(s => `${s} · `).join('')}
                {verses} {verses === 1 ? 'verse' : 'verses'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </main>
  );
}
