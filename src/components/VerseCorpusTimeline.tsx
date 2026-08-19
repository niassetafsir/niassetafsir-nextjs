import type { TimelineMark } from '@/lib/corpus';

// One mark per work that engages this verse, placed by date of composition.
//
// This is the one thing the printed corpus cannot show. Shaykh Ibrāhīm returns
// to the same verse across a fifty-year career, doing different work with it
// each time, and the evidence for that is scattered across texts compiled by
// different people in different countries. Laying the marks on a single axis
// is the argument for keying the data on the verse rather than on the lesson.
//
// Deliberately a server component with no JavaScript: the detail lives in the
// native `title` tooltip. A hover layer here would mean shipping the corpus
// into a client bundle for an ornament, and this site has been burned by
// exactly that (see src/lib/volumes.ts).
//
// Marks are a single series, so there is no categorical palette and no legend
// to get wrong — filled means the text is loaded, hollow means the locus is
// known but not yet available, and both states are named in the caption
// rather than left to colour.

const PAD_YEARS = 4;

export default function VerseCorpusTimeline({ marks }: { marks: TimelineMark[] }) {
  if (marks.length < 2) return null;

  const years = marks.map(m => m.year);
  const lo = Math.min(...years) - PAD_YEARS;
  const hi = Math.max(...years) + PAD_YEARS;
  const span = Math.max(hi - lo, 1);
  const pct = (y: number) => ((y - lo) / span) * 100;

  // Axis ticks at decade boundaries inside the range, so the reader has a
  // scale rather than four floating dots.
  const ticks: number[] = [];
  for (let y = Math.ceil(lo / 10) * 10; y <= hi; y += 10) ticks.push(y);

  return (
    <section className="mb-10" dir="ltr">
      <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">
        This verse across his life
      </h2>
      <p className="font-english text-xs italic mb-6"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
        Each mark is one work in which Shaykh Ibrāhīm engages this verse, placed by date of
        composition. Hollow marks are loci we know of but cannot yet show.
      </p>

      <div className="relative mx-6" style={{ height: 108, marginTop: 18 }}>
        {/* axis */}
        <div className="absolute left-0 right-0" style={{ top: 54, height: 1, background: 'rgba(201,168,76,0.3)' }} />

        {ticks.map(t => (
          <div key={`t-${t}`} className="absolute font-english text-[10px]"
            style={{
              left: `${pct(t)}%`, top: 60, transform: 'translateX(-50%)',
              color: 'var(--body-faint, rgba(255,255,255,0.32))',
            }}>
            <span className="absolute" style={{
              left: '50%', top: -8, width: 1, height: 5,
              background: 'rgba(201,168,76,0.3)',
            }} />
            {t}
          </div>
        ))}

        {marks.map((m, i) => {
          // Marks close together on the axis would collide, so alternate the
          // label height instead of letting two work titles overlap.
          const crowded = i > 0 && pct(m.year) - pct(marks[i - 1].year) < 16;
          const labelTop = crowded && i % 2 === 1 ? -14 : 12;
          return (
            <div key={m.workId}>
              <div
                title={m.detail}
                className="absolute rounded-full cursor-help"
                style={{
                  left: `${pct(m.year)}%`, top: 48, width: 13, height: 13,
                  transform: 'translateX(-50%)',
                  background: m.hasText ? 'var(--gold, #C9A84C)' : 'transparent',
                  border: m.hasText
                    ? '2px solid var(--bg, #0D1F0A)'
                    : '2px solid rgba(201,168,76,0.55)',
                }}
              />
              <div className="absolute font-english text-[11px] text-center leading-tight whitespace-nowrap"
                style={{
                  left: `${pct(m.year)}%`, top: labelTop, transform: 'translateX(-50%)',
                  color: 'var(--body-faint, rgba(255,255,255,0.5))',
                }}>
                <span className="block font-semibold"
                  style={{ color: 'var(--body-text, rgba(255,255,255,0.85))' }}>
                  {m.dateLabel.replace(/^.*\//, '').trim()}
                </span>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
