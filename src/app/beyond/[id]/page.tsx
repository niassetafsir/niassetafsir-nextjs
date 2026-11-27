import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAH_LIST } from '@/lib/verseRanges';
import SuraJump from '@/components/SuraJump';
import Fold from '@/components/Fold';
import { getWork, workEntries, workSummaries, VOICE_LABEL } from '@/lib/corpus';

// His own works live here; a student's commentary has the same page at
// /students/[id] (src/app/students/[id]/page.tsx renders this component).
export function generateStaticParams() {
  return workSummaries()
    .filter(r => r.uses > 0 && r.work.id !== 'fi-riyad' && r.work.relation !== 'student')
    .map(r => ({ id: r.work.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const w = getWork(params.id);
  if (!w) return {};
  return {
    title: `${w.titleTranslit ?? w.id} — the verses`,
    description: `Every Qurʾānic verse Shaykh Ibrāhīm Niasse uses in ${w.titleTranslit ?? w.id}, with page and Arabic.`,
  };
}

const ref = (s: number, a: number, b?: number) => `${s}:${a}${b && b !== a ? `–${b}` : ''}`;

// One work's verse index, in Qurʾānic order: the dossier of the work, on the
// site. Each row links to the verse page, where it stands beside every other
// work's use of the same āya.
export default function WorkPage({ params, student = false }: { params: { id: string }; student?: boolean }) {
  const work = getWork(params.id);
  if (!work || work.id === 'fi-riyad') notFound();
  if ((work.relation === 'student') !== student) notFound();
  const all = workEntries(work.id);
  if (all.length === 0) notFound();
  const own = all.filter(e => !e.isCopied);

  // One row per passage. A passage that runs over several verses (the
  // Fātiḥa's opening verses in a ḥamdala) is one row, not one per verse; a
  // locus with no text yet is left off until it has some.
  type Entry = (typeof all)[number];
  const rows: { e: Entry; refs: string[] }[] = [];
  for (const e of own) {
    if (!e.locus.textAr && !e.locus.textEn) continue;
    const last = rows[rows.length - 1];
    if (last && last.e.locus.id === e.locus.id) last.refs.push(ref(e.surah, e.ayahStart, e.ayahEnd));
    else rows.push({ e, refs: [ref(e.surah, e.ayahStart, e.ayahEnd)] });
  }

  const Row = ({ e, refs }: { e: Entry; refs: string[] }) => (
    <li className="py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="flex items-baseline gap-3 flex-wrap">
        <Link href={`/verse/${e.surah}/${e.ayahStart}`} className="font-english text-[14px] font-semibold text-gold/90 hover:text-gold underline-offset-2 hover:underline">
          Q {refs.length > 1 && refs.every(r => r.startsWith(`${e.surah}:`))
            ? `${refs[0]}–${refs[refs.length - 1].split(':')[1]}`
            : refs.join(', ')}
        </Link>
        <span className="font-english text-[12px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
          {(e.locus.address.raw ?? '').replace(/\s*\(PDF[^)]*\)/g, '').replace(/\s*[—-]\s*page not yet resolved/i, '')}
          {e.locus.voice && e.locus.voice !== 'own' && <> · {VOICE_LABEL[e.locus.voice]}</>}
        </span>
      </div>
      {e.locus.textAr && (
        <p className="font-arabic text-[16px] leading-[1.95] mt-1.5 text-right" dir="rtl" translate="no"
          style={{ color: 'var(--body-text, rgba(255,255,255,0.85))', whiteSpace: 'pre-line' }}>
          {e.locus.textAr}
        </p>
      )}
      {e.locus.textEn && (
        <p className="font-english text-[13.5px] leading-relaxed mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.65))' }}>
          {e.locus.textEn}
        </p>
      )}
    </li>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-english text-[12px] mb-3"><Link href={work.relation === 'student' ? '/students' : '/beyond'} className="text-gold/70 hover:text-gold">{work.relation === 'student' ? '← Commentaries of his students' : '← Beyond Fī Riyāḍ al-Tafsīr'}</Link></p>
      {work.titleAr && <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl" translate="no">{work.titleAr}</p>}
      <h1 className="font-english font-semibold text-base mb-1" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        <em>{work.titleTranslit}</em>
      </h1>
      <p className="font-english text-[12px] mb-4" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        {/* "compiled by" names the compiler, never Shaykh Ibrāhīm (it read
            "compiled by Ibrāhīm Niasse" on the Mawsūʿa pages). */}
        {[
          work.titleEn,
          work.composed?.gregorian ? `${work.composed.hijri ? `${work.composed.hijri} / ` : ''}${work.composed.gregorian}` : null,
          (work as { series?: string; seriesIndex?: number }).series
            ? `${(work as { series?: string }).series}${(work as { seriesIndex?: number }).seriesIndex ? `, maḥwar ${(work as { seriesIndex?: number }).seriesIndex}` : ''}`
            : null,
          work.relation === 'compiler' && work.compiler ? `compiled by ${work.compiler}` : null,
        ].filter(Boolean).join(' · ')}
      </p>
      {work.note && (
        <p className="font-english text-[13.5px] leading-relaxed mb-8" style={{ color: 'var(--body-sub, rgba(255,255,255,0.75))' }}>{work.note}</p>
      )}

      <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">
        The verses · {rows.length}
      </h2>
      <p className="font-english text-[12.5px] italic mb-3" style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
        In Qurʾānic order.
      </p>
      {(() => {
        // Grouped by sūra and folded, so a long book is a short page on a
        // phone: open the sūra you want. A short book is shown open.
        const groups = new Map<number, typeof rows>();
        for (const r of rows) {
          const g = groups.get(r.e.surah) ?? [];
          g.push(r); groups.set(r.e.surah, g);
        }
        const openAll = rows.length <= 12;
        const list = Array.from(groups.entries()).map(([id, g]) => ({ meta: SURAH_LIST.find(x => x.id === id)!, g }));
        return (
          <>
            {!openAll && <SuraJump suras={list.map(({ meta, g }) => ({ id: meta.id, name: meta.nameEn, count: g.length }))} />}
            <div className="mb-12 divide-y" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
              {list.map(({ meta, g }, i) => (
                <Fold key={meta.id} id={`sura-${meta.id}`} defaultOpen={openAll || i === 0} group={openAll ? undefined : 'sura'}
                  summary={<>
                    <span className="font-english text-[14px] text-gold/70 tabular-nums w-7 shrink-0">{meta.id}</span>
                    <span className="font-english text-[14px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>Sūrat {meta.nameEn}</span>
                    <span className="ml-auto font-english text-[12px] tabular-nums whitespace-nowrap" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{g.length} {g.length === 1 ? 'verse' : 'verses'}</span>
                  </>}>
                  <ul>{g.map(r => <Row key={`${r.e.locus.id}-${r.refs[0]}`} e={r.e} refs={r.refs} />)}</ul>
                </Fold>
              ))}
            </div>
          </>
        );
      })()}
    </main>
  );
}
