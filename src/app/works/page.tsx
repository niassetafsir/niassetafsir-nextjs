import Link from 'next/link';
import { workSummaries } from '@/lib/corpus';

export const metadata = {
  title: 'The Works',
  description:
    "The works in which Shaykh Ibrāhīm Niasse uses the Qurʾān — tafsīr, treatises, letters, fatwās, sermons, poems — and how far each has been indexed verse by verse.",
};

// The catalogue side of the corpus. /verse is keyed on the āya; this is keyed
// on the book. A work with no indexed verses is listed too, marked as such:
// an absent work reads as "he never used the Qurʾān there", which is false.
export default function WorksPage() {
  const rows = workSummaries()
    .filter(r => r.work.publish !== false || r.uses > 0)
    .sort((a, b) => b.uses - a.uses || (a.work.titleTranslit ?? '').localeCompare(b.work.titleTranslit ?? ''));
  const indexed = rows.filter(r => r.uses > 0 || r.work.id === 'fi-riyad');
  const pending = rows.filter(r => !(r.uses > 0 || r.work.id === 'fi-riyad'));
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">المؤلفات</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        The Works
      </h1>
      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Shaykh Ibrāhīm used the Qurʾān in everything he wrote and said, not only in his tafsīr. Each
        work below is read for every verse he quotes, comments on, applies or alludes to; each use
        is recorded with its page, its Arabic, and whether the words are his own, written on his
        behalf, or reported of him. Commentaries he copied into his own works are listed under the
        author speaking.
      </p>

      <ul className="space-y-3 mb-12">
        {indexed.map(({ work, verses, uses, copied }) => (
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
                {work.composed?.hijri && `${work.composed.hijri}`}{work.composed?.gregorian && ` / ${work.composed.gregorian}`}
                {work.relation === 'compiler' && work.author && <> · compiled by {work.author}</>}
                {work.relation === 'student' && work.author && <> · {work.author}</>}
                {' · '}
                {work.id === 'fi-riyad'
                  ? 'the tafsīr: 56 sessions, read in its own reader'
                  : <>{uses} {uses === 1 ? 'use' : 'uses'} of {verses} {verses === 1 ? 'āya' : 'āyāt'}{copied > 0 && <>, and {copied} in commentaries he copied</>}</>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

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
