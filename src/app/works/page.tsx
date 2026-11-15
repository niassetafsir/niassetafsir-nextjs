import Link from 'next/link';
import { workSummaries, workEntries } from '@/lib/corpus';
import { SURAH_LIST } from '@/lib/verseRanges';
import { shortTitle } from '@/components/VerseLocusCard';
import WorksTabs from '@/components/WorksTabs';
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
  const pending = rows.filter(r => !(r.uses > 0 || r.work.id === 'fi-riyad') && r.work.relation !== 'student');
  // By sūra: every verse he quotes, explains or applies outside the tafsīr,
  // with the works it appears in. His words only (a student's report of him
  // counts; a student's own reading does not).
  const verseWorks = new Map<string, { surah: number; ayah: number; works: Map<string, string> }>();
  for (const { work } of indexed) {
    if (work.id === 'fi-riyad') continue;
    for (const e of workEntries(work.id)) {
      if (!e.isNiasse || !e.hasText) continue;
      for (let ayah = e.ayahStart; ayah <= (e.ayahEnd ?? e.ayahStart); ayah++) {
        const k = `${e.surah}:${ayah}`;
        const v = verseWorks.get(k) ?? { surah: e.surah, ayah, works: new Map() };
        v.works.set(work.id, shortTitle(work));
        verseWorks.set(k, v);
      }
    }
  }
  const suras = SURAH_LIST.map(s => ({
    ...s,
    verses: Array.from(verseWorks.values()).filter(v => v.surah === s.id).sort((a, b) => a.ayah - b.ayah),
  })).filter(s => s.verses.length > 0);
  const verseCount = verseWorks.size;

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
        Each of his works here has been read for the passages where he explains, quotes or applies a verse,
        and each passage stands on its verse page with the book and page it comes from. Other tafsīr
        sessions, including those he gave in Wolof, will join them as they are found and transcribed.
      </p>

      <WorksTabs
        bySura={
        <div>
          <p className="font-english text-[12.5px] mb-4" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
            {verseCount} verses in {suras.length} sūras. Each opens its verse page.
          </p>
          <div className="space-y-5">
            {suras.map(s => (
              <section key={s.id}>
                <h2 className="font-english text-[13px] font-semibold mb-1.5 flex items-baseline gap-2"
                  style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                  <span className="text-gold/70 tabular-nums">{s.id}</span> Sūrat {s.nameEn}
                  <span className="font-arabic text-[14px] font-normal" dir="rtl" translate="no"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{s.nameAr}</span>
                </h2>
                <ul className="border-l pl-3 space-y-1" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
                  {s.verses.map(v => (
                    <li key={v.ayah} className="font-english text-[13px] leading-relaxed">
                      <Link href={`/verse/${v.surah}/${v.ayah}`} className="font-semibold text-gold/90 hover:text-gold hover:underline tabular-nums">
                        Q {v.surah}:{v.ayah}
                      </Link>
                      <span style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
                        {' · '}{Array.from(v.works.values()).map((t, i) => <span key={t}>{i > 0 && ', '}<em>{t}</em></span>)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
        }
        byWork={<>
      {KIND_ORDER.concat(['Other']).map(kind => {
        const kindOf = (w: { genre?: string }) => KIND_OF[w.genre ?? ''] ?? 'Other';
        const group = indexed.filter(r => r.work.id !== 'fi-riyad' && r.work.relation !== 'student' && kindOf(r.work) === kind);
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
                <span className="block font-arabic text-[14px] mt-0.5" dir="rtl" translate="no"
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
                  : <>{verses} {verses === 1 ? 'verse' : 'verses'}</>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </section>
        );
      })}

        </>}
      />
    </main>
  );
}
