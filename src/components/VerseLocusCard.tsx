import Link from 'next/link';
import {
  ACT_LABEL,
  CONFIDENCE_LABEL,
  CONFIDENCE_NOTE,
  type VerseEntry,
} from '@/lib/corpus';

// One locus on a verse page.
//
// Identity is carried by the LABEL, not by colour. Six exegetical acts and
// three confidence tiers do not survive as nine hues -- a categorical palette
// that size fails colour-vision separation, and in any case a reader should
// not have to learn a legend to find out whether they are looking at exegesis
// or a proof-text. So the act is a word, the confidence is a word, and the one
// accent colour on the page does interactive work only.
//
// Four states are renderable, and all four are visible on the site:
//   loaded      -- text is here
//   excerpted   -- text is in the lesson reader; a snippet plus a deep link
//   known       -- the locus is attested but not yet ingested
//   unlocated   -- the material has never been found
// A silent gap would read as "he never said anything here", which is false.

export interface LocusExcerpt {
  ar?: string | null;
  en?: string | null;
  href?: string;
  truncated?: boolean;
  /** Where the containing lesson OPENS in the printed edition. */
  printedRef?: string | null;
}

export default function VerseLocusCard({
  entry,
  excerpt,
}: {
  entry: VerseEntry;
  excerpt?: LocusExcerpt;
}) {
  const { link, locus, witness, work } = entry;
  const isPrimary = link.type === 'tafsir';
  const address = locus.address.raw ?? formatAddress(entry);
  const ar = locus.textAr ?? excerpt?.ar ?? null;
  const en = locus.textEn ?? excerpt?.en ?? null;
  const hasBody = Boolean(ar || en);

  return (
    <article
      className="rounded-xl border mb-3.5 overflow-hidden"
      style={{
        borderColor: isPrimary ? 'rgba(201,168,76,0.28)' : 'rgba(255,255,255,0.10)',
        borderLeftWidth: isPrimary ? 3 : 1,
        borderLeftColor: isPrimary ? 'var(--gold, #C9A84C)' : 'rgba(255,255,255,0.10)',
      }}
      dir="ltr"
    >
      {/* header */}
      <div className="px-4 pt-3.5 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-english text-[15px] font-semibold"
            style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
            {work.titleTranslit ?? work.id}
          </h3>
          {work.titleAr && (
            <span className="font-arabic text-[14px]" dir="rtl"
              style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
              {work.titleAr}
            </span>
          )}

          <span className="ml-auto flex flex-wrap gap-1.5">
            <span className="font-english text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{
                borderColor: isPrimary ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.2)',
                color: isPrimary
                  ? 'var(--gold-light, #E8D4A0)'
                  : 'var(--body-faint, rgba(255,255,255,0.5))',
              }}>
              {ACT_LABEL[link.type]}
            </span>
            <span
              title={CONFIDENCE_NOTE[link.confidence]}
              className="font-english text-[10px] px-2 py-0.5 rounded-full border cursor-help"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'var(--body-faint, rgba(255,255,255,0.5))',
              }}>
              {link.confidence === 'curated' ? '● ' : link.confidence === 'auto' ? '◐ ' : '○ '}
              {CONFIDENCE_LABEL[link.confidence]}
            </span>
          </span>
        </div>

        <p className="font-english text-[11.5px] mt-1.5 leading-relaxed"
          style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
          <strong className="font-semibold"
            style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
            {entry.dateLabel}
          </strong>
          {witness.language && <> · {languageName(witness.language)}</>}
          {address && <> · {address}</>}
          {witness.medium === 'audio' && <> · audio</>}
          {link.rasm !== 'unknown' && <> · numbered by {link.rasm === 'warsh' ? 'Warsh' : 'Ḥafṣ'}</>}
          {excerpt?.printedRef && <> · lesson opens at {excerpt.printedRef}</>}
          {work.compiler && <> · compiled by {shorten(work.compiler)}</>}
        </p>
      </div>

      {/* body — four states, and all four are shown rather than hidden */}
      <div className="px-4 py-4">
        {hasBody ? (
          <>
            {ar && (
              <p className="font-arabic text-[17px] leading-[2.05] mb-3 text-right" dir="rtl"
                style={{ color: 'var(--body-text, rgba(255,255,255,0.88))', textAlign: 'right' }}>
                {ar}
                {excerpt?.truncated && <span style={{ opacity: 0.5 }}> …</span>}
              </p>
            )}
            {en && (
              <p className="font-english text-[15px] leading-relaxed"
                style={{ color: 'var(--body-faint, rgba(255,255,255,0.68))' }}>
                {en}
                {excerpt?.truncated && <span style={{ opacity: 0.5 }}> …</span>}
              </p>
            )}
            {excerpt?.href && (
              <Link href={excerpt.href}
                className="inline-block mt-3 font-english text-[12px] text-gold/70 hover:text-gold underline">
                Read in context →
              </Link>
            )}
            {locus.transcriptionStatus === 'draft' && (
              <p className="font-english text-[11.5px] italic mt-3"
                style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
                Working transcription — not yet proofread against the printing.
              </p>
            )}
            {link.note && (
              <p className="font-english text-[12px] italic mt-3 pt-3 border-t"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--body-faint, rgba(255,255,255,0.38))',
                }}>
                {link.note}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed px-3.5 py-3"
            style={{ borderColor: 'rgba(255,255,255,0.16)' }}>
            <p className="font-english text-[13px] leading-relaxed"
              style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
              <strong style={{ color: 'var(--body-text, rgba(255,255,255,0.8))' }}>
                {witness.medium === 'audio'
                  ? 'Not located.'
                  : link.note
                    ? 'Recorded, not yet transcribed.'
                    : 'Not yet ingested.'}
              </strong>{' '}
              {link.note ??
                'This locus is recorded because the attribution is attested, not because the text is available here.'}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function formatAddress(entry: VerseEntry): string {
  const a = entry.locus.address;
  if (a.lesson !== undefined) {
    return `Lesson ${a.lesson}${a.paragraph !== undefined ? `, ¶${a.paragraph + 1}` : ''}`;
  }
  if (a.volume !== undefined) {
    return `vol. ${a.volume}${a.page !== undefined ? `, p. ${a.page}` : ''}`;
  }
  if (a.page !== undefined) return `p. ${a.page}`;
  if (a.cassette !== undefined) return `cassette ${a.cassette}`;
  return '';
}

function languageName(code: string): string {
  const names: Record<string, string> = {
    ar: 'Arabic', wo: 'Wolof', fr: 'French', en: 'English', ha: 'Hausa', mixed: 'mixed',
  };
  return names[code] ?? code;
}

function shorten(s: string, max = 64): string {
  return s.length <= max ? s : `${s.slice(0, max).replace(/[\s,;.]+$/, '')}…`;
}
