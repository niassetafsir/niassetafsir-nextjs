import Link from 'next/link';
import { type VerseEntry } from '@/lib/corpus';

// One passage on a verse page, kept plain for a student or researcher: his
// Arabic, an English rendering or summary, and a short citation. The working
// apparatus (reader flags, derivation, stance, witness editors, confidence)
// stays in the data and the Word dossiers, not on the page.

export interface LocusExcerpt {
  ar?: string | null;
  en?: string | null;
  href?: string;
  truncated?: boolean;
  /** Where the containing lesson OPENS in the printed edition. */
  printedRef?: string | null;
}

/** A reader-sized title: "Fī Riyāḍ al-Tafsīr", "Kāshif al-ilbās". */
export function shortTitle(work: { id: string; titleTranslit?: string | null }): string {
  if (work.id === 'fi-riyad') return 'Fī Riyāḍ al-Tafsīr';
  const t = work.titleTranslit ?? work.id;
  const words = t.split(' ');
  const cut = words.findIndex((w, i) => i >= 2 && /^(ʿan|fī|li-l-|bi-l-|ilā|wa-l-|min)$/.test(w));
  return (cut > 0 ? words.slice(0, cut).join(' ') : t).replace(/[:,]$/, '');
}

export default function VerseLocusCard({
  entry,
  excerpt,
  hideCitation = false,
}: {
  entry: VerseEntry;
  excerpt?: LocusExcerpt;
  /** Set on every passage of a run from the same lesson or page but the
   *  last, so the citation and the link are printed once for the run. */
  hideCitation?: boolean;
}) {
  const { link, locus, witness, work } = entry;
  const inSession = link.derivation === 'session-range';
  const lessonId = locus.address.lesson;
  const lessonHref = lessonId !== undefined ? `/lesson/${lessonId}` : null;
  const ar = excerpt?.ar ?? locus.textAr ?? null;
  const en = excerpt?.en ?? locus.textEn ?? null;
  const hasBody = Boolean(ar || en);
  const isSummary = Boolean(locus.editorialNote && /summary/i.test(locus.editorialNote));

  // Who is speaking, only when it is not plainly him.
  const speaker =
    entry.isNiasse
      ? locus.voice === 'reported'
        ? `Reported by ${work.relation === 'student' ? (work.author ?? 'a disciple') : 'a disciple'}`
        : locus.voice === 'uncertain'
          ? 'Attribution uncertain'
          : locus.voice === 'on-behalf'
            ? 'Written on his behalf'
            : null
      : locus.attributedTo ?? work.author ?? null;

  // Citation: title, date, place in the book.
  const where = lessonId !== undefined
    ? `Lesson ${lessonId}${excerpt?.printedRef ? `, ${excerpt.printedRef}` : ''}`
    : (locus.address.raw ?? '').replace(/\s*\(PDF[^)]*\)/g, '');
  const date = work.composed?.hijri
    ? [work.composed.hijri, work.composed.gregorian].filter(Boolean).join('/')
    : null;
  const titleHref = work.id === 'fi-riyad' ? (lessonHref ?? '/read') : `/works/${work.id}`;

  return (
    <article className="rounded-xl border mb-3.5 overflow-hidden" dir="ltr"
      style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
      {(locus.question || speaker) && (
        <div className="px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {locus.question && (
            <h3 className="font-english text-[15px] font-semibold"
              style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
              {locus.question.en}
            </h3>
          )}
          {locus.question?.ar && (
            <p className="font-arabic text-[15.5px] leading-[1.95] mt-1.5 text-right" dir="rtl" translate="no"
              style={{ color: 'var(--gold-light, #E8D4A0)', textAlign: 'right' }}>
              {locus.question.ar}
            </p>
          )}
          {speaker && (
            <p className="font-english text-[12px] mt-1" style={{ color: 'var(--body-sub, rgba(255,255,255,0.75))' }}>
              {speaker}
            </p>
          )}
        </div>
      )}

      <div className="px-4 py-4">
        {hasBody ? (
          <>
            {ar && (
              <p className="font-arabic text-[17px] leading-[2.05] mb-3 text-right" dir="rtl" translate="no"
                style={{ color: 'var(--body-text, rgba(255,255,255,0.88))', textAlign: 'right', whiteSpace: 'pre-line' }}>
                {ar}
                {excerpt?.truncated && <span style={{ opacity: 0.5 }}> …</span>}
              </p>
            )}
            {en && (
              <p className="font-english text-[15px] leading-relaxed"
                style={{ color: 'var(--body-faint, rgba(255,255,255,0.68))' }}>
                {isSummary && <span className="text-[12px] uppercase tracking-[0.08em] mr-2" style={{ opacity: 0.6 }}>In brief</span>}
                {en}
                {excerpt?.truncated && <span style={{ opacity: 0.5 }}> …</span>}
              </p>
            )}
            {excerpt?.href && !hideCitation && (
              <Link href={excerpt.href}
                className="inline-block mt-3 font-english text-[12px] text-gold/70 hover:text-gold underline">
                Read in context →
              </Link>
            )}
          </>
        ) : (
          <p className="font-english text-[13.5px] leading-relaxed"
            style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}>
            {lessonHref && (
              <Link href={lessonHref} className="text-gold/70 hover:text-gold underline">
                Read Lesson {lessonId} →
              </Link>
            )}
          </p>
        )}
      </div>

      {!hideCitation && <p className="px-4 pb-3.5 -mt-1 font-english text-[12px]"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
        <Link href={titleHref} className="italic hover:text-gold" style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}>
          {shortTitle(work)}
        </Link>
        {date && <>, {date}</>}
        {where && <>, {where}</>}
        {witness.medium === 'audio' && <> (audio)</>}
      </p>}
    </article>
  );
}
