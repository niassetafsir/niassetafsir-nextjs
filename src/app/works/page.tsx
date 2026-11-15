import Link from 'next/link';
import { workSummaries } from '@/lib/corpus';
import { KIND_OF, KIND_ORDER } from '@/lib/homeShowcase';

export const metadata = {
  title: 'Beyond Fī Riyāḍ al-Tafsīr',
  description:
    "The books, letters, sermons and poems from which Shaykh Ibrāhīm Niasse's Qurʾānic commentary on this site is drawn.",
};

// The catalogue side of the corpus. /verse is keyed on the āya; this is keyed
// on the book. A work with no indexed verses is listed too, marked as such:
// an absent work reads as "he never used the Qurʾān there", which is false.
function compiledBy(work: { compiler?: string | null; author?: string | null }): string | null {
  const who = work.compiler ?? (work.author && !/Niasse/.test(work.author) ? work.author : null);
  if (!who) return null;
  return /^[A-Z][a-z]+ by /.test(who) ? who : `compiled by ${who}`;
}

export default function WorksPage() {
  const rows = workSummaries()
    .filter(r => r.work.publish !== false || r.uses > 0)
    .sort((a, b) => b.uses - a.uses || (a.work.titleTranslit ?? '').localeCompare(b.work.titleTranslit ?? ''));
  const indexed = rows.filter(r => r.uses > 0 || r.work.id === 'fi-riyad');
  const pending = rows.filter(r => !(r.uses > 0 || r.work.id === 'fi-riyad'));
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">تفسيره في سائر آثاره</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Beyond Fī Riyāḍ al-Tafsīr
      </h1>
      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        <Link href="/read" className="text-gold/80 hover:text-gold underline">Fī Riyāḍ al-Tafsīr</Link>, the
        1964 Arabic sessions on the whole Qurʾān, is one path into his tafsīr. This is the other: his
        explanation of verses wherever else it survives, in other registers of language and of genre.
        Each work below has been read for the passages where he explains, quotes or applies a verse,
        and each passage stands on its verse page with the book and page it comes from. Other tafsīr
        sessions, including those he gave in Wolof, will join them as they are found and transcribed.
      </p>

      {KIND_ORDER.concat(['Other', 'From his students']).map(kind => {
        const kindOf = (w: { genre?: string; relation?: string }) =>
          w.relation === 'student' ? 'From his students' : (KIND_OF[w.genre ?? ''] ?? 'Other');
        const group = indexed.filter(r => r.work.id !== 'fi-riyad' && kindOf(r.work) === kind);
        if (group.length === 0) return null;
        return (
      <section key={kind} className="mb-8">
      <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-2.5">{kind}</h2>
      <ul className="space-y-3">
        {group.map(({ work, verses, uses }) => (
          <li key={work.id}>
            <Link href={work.id === 'fi-riyad' ? '/read' : `/works/${work.id}`}
              className="block rounded-lg border px-4 py-3 hover:border-gold/50 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
              <span className="font-english text-[15px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                <em>{work.titleTranslit ?? work.id}</em>
              </span>
              {work.titleAr && (
                <span className="font-arabic text-[14px] ml-2" dir="rtl" translate="no"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>{work.titleAr}</span>
              )}
              <span className="block font-english text-[12px] mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                {[
                  [work.composed?.hijri, work.composed?.gregorian].filter(Boolean).join(' / '),
                  // "compiled by" names the compiler, never Niasse himself. A record
                  // whose compiler field is a phrase ("Introduction by …") prints as is.
                  work.relation === 'compiler' && compiledBy(work),
                  work.relation === 'student' && work.author,
                ].filter(Boolean).map(s => `${s} · `).join('')}
                {work.id === 'fi-riyad'
                  ? 'the tafsīr: 56 sessions, read in its own reader'
                  : <>{uses} {uses === 1 ? 'use' : 'uses'} of {verses} {verses === 1 ? 'āya' : 'āyāt'}</>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </section>
        );
      })}

      {pending.length > 0 && (
        <>
          <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">Not yet indexed</h2>
          <p className="font-english text-[13px] italic mb-4" style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
            Known works whose Qurʾānic usage has not yet been read in.
          </p>
          <ul className="font-english text-[13.5px] space-y-1 mb-10" style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
            {pending.map(({ work }) => (
              <li key={work.id}><em>{work.titleTranslit ?? work.id}</em>{work.composed?.gregorian && <> ({work.composed.gregorian})</>}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
