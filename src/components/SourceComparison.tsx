import { SOURCE_NAME, type ComparisonEntry, type ComparedSource } from '@/lib/sourceComparison';

// One verse's comparison with the commentaries he read. Server component: it
// receives only this verse's entries. Rendered only when the comparison is
// switched on (see src/lib/sourceComparison.ts).

const ORDER: ComparedSource[] = ['jalalayn', 'sawi', 'ruh-al-bayan'];

/** Each «…» quotation set as its own right-to-left run, so its guillemets and
 *  word order survive inside an English sentence. */
function withArabic(text: string) {
  return text.split(/(«[^»]*»)/g).map((part, i) =>
    part.startsWith('«') ? (
      // The guillemets stay outside the right-to-left run: inside it they are
      // mirrored and print reversed, as »…«.
      <span key={i}>«<bdi dir="rtl" lang="ar" className="font-arabic text-[15.5px]" translate="no">{part.slice(1, -1)}</bdi>»</span>
    ) : (
      part
    )
  );
}

function Block({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="mt-3">
      <p className="font-english text-[10.5px] uppercase tracking-[0.1em] text-gold/60 mb-1">{label}</p>
      <p className="font-english text-[14px] leading-relaxed" style={{ color: 'var(--body-sub, rgba(255,255,255,0.75))' }}>{withArabic(text)}</p>
    </div>
  );
}

export default function SourceComparison({ entries }: { entries: ComparisonEntry[] }) {
  return (
    <section className="mt-14 pt-8 border-t" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
      <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">
        Read with his sources
      </h2>
      <p className="font-english text-[13px] italic mb-5" style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
        His reading beside the Jalālayn, al-Ṣāwī&rsquo;s gloss and Ismāʿīl Ḥaqqī&rsquo;s <em>Rūḥ al-bayān</em>, with
        how he stands to each. Al-Ṣāwī is given only where Shaykh Ibrāhīm or his editor quotes him.
      </p>
      {entries.map(e => {
        const rulings = ORDER.map(src => ({ src, r: e.rulings.filter(x => x.source === src) })).filter(x => x.r.length);
        return (
          <article key={e.id} className="rounded-lg border px-4 py-3.5 mb-5"
            style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
            <p className="font-english text-[12px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
              {e.heading}{e.section && <> · {e.section}</>}
            </p>
            {rulings.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 mt-2">
                {rulings.map(({ src, r }) => (
                  <li key={src} className="font-english text-[11.5px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: 'rgba(201,168,76,0.4)', color: 'var(--gold-light, #E8D4A0)' }}>
                    {SOURCE_NAME[src]}: {r.map(x => x.label).join('; ')}
                  </li>
                ))}
              </ul>
            )}
            {e.crossRef ? (
              <Block label="Note" text={e.crossRef} />
            ) : (
              <details className="mt-2">
                <summary className="font-english text-[12.5px] text-gold/80 cursor-pointer">The comparison</summary>
                <Block label="Shaykh Ibrāhīm" text={e.niasse} />
                <Block label="Jalālayn" text={e.jalalayn} />
                <Block label="al-Ṣāwī" text={e.sawi} />
                <Block label="Rūḥ al-bayān" text={e.ruhAlBayan} />
                <Block label="How he stands to them" text={e.relation} />
              </details>
            )}
          </article>
        );
      })}
    </section>
  );
}
