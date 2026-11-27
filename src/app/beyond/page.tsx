import Link from 'next/link';
import { workSummaries, workEntries, wordsDate } from '@/lib/corpus';
import { SURAH_LIST } from '@/lib/verseRanges';
import { shortTitle } from '@/components/VerseLocusCard';
import WorksTabs from '@/components/WorksTabs';
import SuraJump from '@/components/SuraJump';
import Fold from '@/components/Fold';
import { KIND_OF, KIND_ORDER } from '@/lib/homeShowcase';

export const metadata = {
  title: 'Beyond Fī Riyāḍ al-Tafsīr',
  description:
    "The books, letters and sermons from which Shaykh Ibrāhīm Niasse's Qurʾānic commentary on this site is drawn.",
};

// The catalogue side of the corpus. /verse is keyed on the āya; this is keyed
// on the book. A work with no indexed verses is listed too, marked as such:
// an absent work reads as "he never used the Qurʾān there", which is false.
function compiledBy(work: { compiler?: string | null; author?: string | null }): string | null {
  const who = work.compiler ?? (work.author && !/Niasse/.test(work.author) ? work.author : null);
  if (!who) return null;
  return /^[A-Z][a-z]+ by /.test(who) ? who : `compiled by ${who}`;
}

// One-line descriptions, checked against the works themselves.
const WORK_NOTES: Record<string, string> = {
  kashif: 'A defence and explanation of the Fayḍa, written in answer to criticism of Shaykh Ibrāhīm’s spiritual claim.',
  'tadhyil-kashif': 'A continuation of the discussion begun in Kāshif al-ilbās.',
  'tabsirat-al-anam': 'A treatise on knowledge and its authority in religious life.',
};

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
  const ownCount = new Set(Array.from(verseWorks.values()).flatMap(v => Array.from(v.works.keys()))).size;
  // By date: his works in the order he wrote them, the tafsīr sessions among
  // them. Works whose date is not known follow, without a date.
  const ownWorks = rows.filter(r => r.work.relation !== 'student' && (r.uses > 0 || r.work.id === 'fi-riyad'));
  const dated = ownWorks.map(r => ({ ...r, date: wordsDate(r.work) })).filter(r => r.date)
    .sort((a, b) => a.date!.year - b.date!.year);
  const undated = ownWorks.filter(r => !wordsDate(r.work));

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">تفسيره في سائر آثاره</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Beyond Fī Riyāḍ al-Tafsīr
      </h1>
      <p className="font-english text-[14px] leading-relaxed mb-6"
        style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
        Shaykh Ibrāhīm Niasse explained individual Qurʾānic verses throughout his other writings and
        activities. This collection brings together passages from his sessions, letters, sermons,
        treatises and travel accounts.
      </p>
      <p className="font-english text-[14px] leading-relaxed mb-6"
        style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
        Each passage is linked to the verse it discusses, with its original work and page reference.
        Explore his explanations by sūra, by work or by date. The collection currently includes{' '}
        {verseCount} verses across {suras.length} sūras and {ownCount} works.
      </p>

      <WorksTabs
        bySura={
        <div>
          <p className="font-english text-[12.5px] mb-4" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
            Follow his explanations through the Qurʾānic text, sūra by sūra.
          </p>
          <SuraJump suras={suras.map(s => ({ id: s.id, name: s.nameEn, count: s.verses.length }))} />
          <div className="divide-y" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
            {suras.map(s => (
              <Fold key={s.id} id={`sura-${s.id}`} group="sura"
                summary={<>
                  <span className="font-english text-[14px] text-gold/70 tabular-nums w-7 shrink-0">{s.id}</span>
                  <span className="font-english text-[14px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>Sūrat {s.nameEn}</span>
                  <span className="hidden sm:inline font-arabic text-[15px]" dir="rtl" translate="no"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{s.nameAr}</span>
                  <span className="ml-auto font-english text-[12px] tabular-nums whitespace-nowrap" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                    {s.verses.length} {s.verses.length === 1 ? 'verse' : 'verses'}
                  </span>
                </>}>
                <ul className="border-l pl-3 ml-7 space-y-1" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
                  {s.verses.map(v => (
                    <li key={v.ayah} className="font-english text-[13.5px] leading-relaxed">
                      <Link href={`/verse/${v.surah}/${v.ayah}`} className="font-semibold text-gold/90 hover:text-gold hover:underline tabular-nums">
                        Q {v.surah}:{v.ayah}
                      </Link>
                      <span style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
                        {' · '}{Array.from(v.works.values()).map((t, i) => <span key={t}>{i > 0 && ', '}<em>{t}</em></span>)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Fold>
            ))}
          </div>
        </div>
        }
        byDate={<>
      <p className="font-english text-[12.5px] mb-4" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Follow the development of his Qurʾānic engagement chronologically, from 1931 onward, with the tafsīr sessions among his works.
      </p>
      <ol className="relative border-l ml-2 mb-8" style={{ borderColor: 'rgba(201,168,76,0.35)' }}>
        {dated.map(({ work, verses, date }) => (
          <li key={work.id} className="ml-5 mb-4">
            <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--gold, #C9A84C)' }} aria-hidden />
            <span className="block font-english text-[12px] text-gold/80 tabular-nums">{date!.label}</span>
            <Link href={work.id === 'fi-riyad' ? '/read' : `/beyond/${work.id}`} className="font-english text-[15px] font-semibold hover:text-gold"
              style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
              <em>{shortTitle(work)}</em>
            </Link>
            <span className="block font-english text-[12px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
              {work.id === 'fi-riyad' ? 'the tafsīr sessions' : `${verses} ${verses === 1 ? 'verse' : 'verses'}`}
            </span>
          </li>
        ))}
      </ol>
      {undated.length > 0 && (
        <Fold group="date" summary={<>
          <span className="font-english text-[14px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>Date not known</span>
          <span className="ml-auto font-english text-[12px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{undated.length} {undated.length === 1 ? 'work' : 'works'}</span>
        </>}>
          <ul className="space-y-2">
            {undated.map(({ work, verses }) => (
              <li key={work.id} className="font-english text-[14px]">
                <Link href={`/beyond/${work.id}`} className="hover:text-gold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}><em>{shortTitle(work)}</em></Link>
                <span style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}> · {verses} {verses === 1 ? 'verse' : 'verses'}</span>
              </li>
            ))}
          </ul>
        </Fold>
      )}
        </>}
        byWork={<>
      <p className="font-english text-[12.5px] mb-4" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Study the Qurʾānic passages within a particular book or writing.
      </p>
      {KIND_ORDER.concat(['Other']).map(kind => {
        const kindOf = (w: { genre?: string }) => KIND_OF[w.genre ?? ''] ?? 'Other';
        const group = indexed.filter(r => r.work.id !== 'fi-riyad' && r.work.relation !== 'student' && kindOf(r.work) === kind);
        if (group.length === 0) return null;
        return (
      <Fold key={kind} group="kind"
        summary={<>
          <span className="font-english text-[14px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>{kind}</span>
          <span className="ml-auto font-english text-[12px] whitespace-nowrap" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{group.length} {group.length === 1 ? 'work' : 'works'}</span>
        </>}>
      <ul className="space-y-3">
        {group.map(({ work, verses, uses }) => (
          <li key={work.id}>
            <Link href={work.id === 'fi-riyad' ? '/read' : `/beyond/${work.id}`}
              className="block rounded-lg border px-4 py-3 hover:border-gold/50 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
              <span className="font-english text-[15px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                <em>{work.titleTranslit ?? work.id}</em>
              </span>
              {WORK_NOTES[work.id] && (
                <span className="block font-english text-[13px] mt-0.5" style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
                  {WORK_NOTES[work.id]}
                </span>
              )}
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
      </Fold>
        );
      })}

        </>}
      />

      <section className="mt-12">
        <h2 className="font-english text-[15px] font-semibold mb-2" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
          Questions and occasions
        </h2>
        <p className="font-english text-[13px] leading-relaxed mb-3" style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
          Many of these explanations answer a question, a dispute or an event. Some of the occasions, with their sources:
        </p>
        <ul className="font-english text-[13.5px] leading-relaxed space-y-1.5 list-disc pl-5" style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
          <li>The claims of the Fayḍa and its critics: <Link href="/beyond/kashif" className="text-gold/80 hover:text-gold"><em>Kāshif al-ilbās</em></Link>, completed 1350/1931.</li>
          <li>Whether the Qurʾān may be broadcast on the radio (Q 16:8, 6:19, 31:27): <em>al-Ḥujja al-bāligha fī kawn idhāʿat al-Qurʾān fī al-rādiyū sāʾigha</em>, 1375/1956; <em>Mawsūʿat al-āthār al-nathriyya</em>, Muʾallafāt, part 2, pp. 200–216.</li>
          <li>Disputes over sighting the new moon (Q 2:185): <em>Kashf al-ghumma ʿan mirāʾ ʿulamāʾ al-umma</em>; <em>Mawsūʿa</em>, Muʾallafāt, part 2, pp. 270–285.</li>
          <li>The meaning of space flight (Q 55:33, 16:8, 18:84–86): <em>Risālat al-īmān bi-l-qaḍāʾ fī masʾalat ghazw al-faḍāʾ</em>, Jumādā II 1389/1969; <em>Mawsūʿa</em>, Muʾallafāt, part 2, pp. 547–553.</li>
        </ul>
      </section>
    </main>
  );
}
