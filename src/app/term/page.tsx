import Link from 'next/link';
import { definedTerms, getTermEntries } from '@/lib/corpus';

export const metadata = {
  title: 'Terms he defines',
  description:
    "Passages where Shaykh Ibrāhīm Niasse defines a technical term rather than construing a verse — each cited to its page and its date.",
};

// The index's second axis.
//
// /verse asks what he said about an āya. This asks what he meant by a word.
// The two are answered by different passages: much of the fatāwā is not verse
// commentary at all but lexicography, and until now the site had nowhere to
// put it, because every act type it carried pointed at a verse.

export default function TermIndexPage() {
  const rows = definedTerms().map(({ term, count }) => {
    const entries = getTermEntries(term.slug);
    const borrowed = entries.filter(e => e.termLink.mode === 'quotes').length;
    return { term, count, borrowed, entries };
  });

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">فهرس المصطلحات المعرَّفة</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Terms he defines
      </h1>
      <p className="font-english text-xs italic mb-4"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
        {rows.length} terms, from {new Set(rows.flatMap(r => r.entries.map(e => e.locus.id))).size} passages
      </p>

      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Elsewhere the site indexes what he says about a verse. These pages index what he means by a
        word — passages where he stops to define a term rather than use it. Much of this comes from
        the fatāwā, where whole answers are given over to fixing the sense of <em>ikhlāṣ</em>,{' '}
        <em>hayba</em>, <em>sayr</em>, the <em>quṭb</em>. Where he adopts a formulation from someone
        else rather than coining it, the page says so and names them.
      </p>

      <ul className="space-y-2">
        {rows.map(({ term, count, borrowed }) => (
          <li key={term.slug}>
            <Link href={`/term/${term.slug}`}
              className="block rounded-xl border px-4 py-3 hover:border-gold/40 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-arabic text-[18px] text-gold/85" dir="rtl">{term.ar}</span>
                <span className="font-english text-[14px] font-semibold"
                  style={{ color: 'var(--body-text, rgba(255,255,255,0.88))' }}>
                  {term.translit}
                </span>
                {term.en && (
                  <span className="font-english text-[12.5px] italic"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
                    {term.en}
                  </span>
                )}
                <span className="ml-auto font-english text-[11px]"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
                  {count} {count === 1 ? 'passage' : 'passages'}
                  {borrowed > 0 && ` · ${borrowed} quoted from another`}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
