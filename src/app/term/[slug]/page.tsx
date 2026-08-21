import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CONFIDENCE_LABEL,
  CONFIDENCE_NOTE,
  DEFINITION_MODE_LABEL,
  definedTerms,
  getTerm,
  getTermEntries,
} from '@/lib/corpus';

// /term/[slug] -- where Shaykh Ibrāhīm defines a word.
//
// The companion to /verse/[surah]/[ayah]. That page asks what he said about an
// āya; this asks what he meant by a term. They are different questions and the
// fatāwā answer both: §10 of the tafsīr chapter is lexicography, and its verse
// citations hang off the definitions rather than the other way round.
//
// The distinction the page must never lose is whose formulation it is. He
// defines ikhlāṣ himself; he adopts al-Amīr's wording on God's oneness by way
// of ʿIllīsh. Both belong in a glossary. Only one of them is his.

export function generateStaticParams() {
  return definedTerms().map(({ term }) => ({ slug: term.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const term = getTerm(params.slug);
  if (!term) return {};
  return {
    title: `${term.translit} — in Shaykh Ibrāhīm's own definition`,
    description: `Where Shaykh Ibrāhīm Niasse defines ${term.translit} (${term.ar}), with the page and date of each definition.`,
  };
}

export default function TermPage({ params }: { params: { slug: string } }) {
  const term = getTerm(params.slug);
  if (!term) notFound();
  const entries = getTermEntries(params.slug);
  if (entries.length === 0) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <Link href="/term"
        className="font-english text-[12px] hover:text-gold"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
        ← Terms he defines
      </Link>

      <p className="font-arabic text-gold text-3xl mt-4 mb-1" dir="rtl">{term.ar}</p>
      <h1 className="font-english font-semibold text-xl mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.92))' }}>
        {term.translit}
      </h1>
      {term.en && (
        <p className="font-english text-[13px] italic mb-6"
          style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
          {term.en}
        </p>
      )}

      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        {entries.length === 1 ? 'One passage' : `${entries.length} passages`} where the term is
        defined rather than merely used. Each names the work, the page and the date, and says
        whether the wording is his own.
      </p>

      {entries.map(entry => {
        const { termLink: t, locus, work, occasion } = entry;
        const borrowed = t.mode === 'quotes';
        return (
          <article key={`${t.term}-${t.locusId}`}
            className="rounded-xl border mb-4 overflow-hidden"
            style={{
              borderColor: borrowed ? 'rgba(255,255,255,0.14)' : 'rgba(201,168,76,0.28)',
              borderLeftWidth: 3,
              borderLeftColor: borrowed ? 'rgba(255,255,255,0.2)' : 'var(--gold, #C9A84C)',
            }}>
            <div className="px-4 pt-3.5 pb-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="font-english text-[15px] font-semibold"
                  style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                  {work.titleTranslit ?? work.id}
                </h2>
                {!entry.isNiasse && locus.attributedTo && (
                  <span className="font-english text-[11px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: 'rgba(255,255,255,0.22)',
                             color: 'var(--body-sub, rgba(255,255,255,0.78))' }}>
                    {locus.attributedTo}
                  </span>
                )}
                <span className="ml-auto flex flex-wrap gap-1.5">
                  <span className="font-english text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: borrowed ? 'rgba(255,255,255,0.2)' : 'rgba(201,168,76,0.5)',
                      color: borrowed
                        ? 'var(--body-faint, rgba(255,255,255,0.5))'
                        : 'var(--gold-light, #E8D4A0)',
                    }}>
                    {DEFINITION_MODE_LABEL[t.mode]}
                  </span>
                  <span title={CONFIDENCE_NOTE[t.confidence]}
                    className="font-english text-[10px] px-2 py-0.5 rounded-full border cursor-help"
                    style={{ borderColor: 'rgba(255,255,255,0.2)',
                             color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                    {CONFIDENCE_LABEL[t.confidence]}
                  </span>
                </span>
              </div>
              <p className="font-english text-[11.5px] mt-1.5 leading-relaxed"
                style={{ color: 'var(--body-faint, rgba(255,255,255,0.42))' }}>
                {/* The work is undated; the passage is not. §10 is signed and
                    dated in the printing -- Kaolack, Rabīʿ I 1349 -- and that
                    belongs on the card, since when he said a thing is half of
                    what a definition is worth. Fall back to the work's date
                    only when the passage carries none. */}
                <strong className="font-semibold"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
                  {occasion?.hijri || occasion?.gregorian
                    ? [occasion.hijri, occasion.gregorian].filter(Boolean).join(' / ')
                    : entry.dateLabel}
                </strong>
                {locus.address.raw && <> · {locus.address.raw}</>}
                {occasion?.place && <> · {occasion.place}</>}
              </p>
            </div>

            <div className="px-4 py-4">
              <p className="font-english text-[15px] leading-relaxed"
                style={{ color: 'var(--body-text, rgba(255,255,255,0.85))' }}>
                {t.glossEn}
              </p>

              {/* A formulation he endorses is not a formulation he coined, and
                  a glossary that let the two look alike would be doing exactly
                  what the rest of this apparatus exists to prevent. */}
              {borrowed && t.quotedFrom && (
                <p className="font-english text-[12px] italic mt-3"
                  style={{ color: 'var(--gold-light, #E8D4A0)' }}>
                  His wording is not his own here — he quotes {t.quotedFrom}, and adopts it.
                </p>
              )}

              {t.against?.length ? (
                <p className="font-english text-[12px] mt-3"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
                  Set against: {t.against.join(', ')}
                </p>
              ) : null}

              {locus.editorialNote && (
                <p className="font-english text-[11.5px] italic mt-3 pt-3 border-t leading-relaxed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)',
                           color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
                  {locus.editorialNote}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </main>
  );
}
