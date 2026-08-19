import Link from 'next/link';
import VersePicker from '@/components/VersePicker';
import { SURAH_LIST } from '@/lib/verseRanges';
import {
  ACT_LABEL,
  crossCorpusVerses,
  getVerseEntries,
  getWitness,
  splitBySpeaker,
} from '@/lib/corpus';

export const metadata = {
  title: 'Commentary by Verse',
  description:
    "Verses that Shaykh Ibrāhīm Niasse engages in more than one work: the index behind niassetafsir.org's cross-corpus verse pages.",
};

// The entry point to /verse/[surah]/[ayah].
//
// It lists only the āyāt with a locus OUTSIDE Fī Riyāḍ al-Tafsīr, because
// those are the ones where the cross-corpus view shows something the lesson
// reader cannot. Every other āya in the tafsīr still has a verse page; it is
// reached from the reader, or by typing the URL, and renders on demand.
export default function VerseIndexPage() {
  const verses = crossCorpusVerses().map(v => {
    const all = getVerseEntries(v.surah, v.ayah);
    const { niasse: entries, school } = splitBySpeaker(all);

    // The headline count has to be true of Shaykh Ibrāhīm, not of the page.
    // A verse he treats once in Fī Riyāḍ and that a student then treats
    // elsewhere is NOT a verse he engaged twice, and saying so would put a
    // disciple's words behind the master's authority -- the one error this
    // whole apparatus exists to prevent.
    const secondNiasseWork = new Set(
      entries
        .filter(e => e.locus.witnessId !== 'fi-riyad-site-transcription')
        .map(e => e.work.id)
    ).size > 0;

    const works = Array.from(
      new Set(entries.map(e => e.work.titleTranslit ?? e.work.id).filter(Boolean) as string[])
    );
    const schoolWorks = Array.from(
      new Set(
        school.map(e =>
          `${e.work.titleTranslit ?? e.work.id}${e.work.author ? ` (${e.work.author})` : ''}`
        )
      )
    );
    const acts = Array.from(new Set(entries.map(e => ACT_LABEL[e.link.type])));
    const anyAudio = entries.some(e => getWitness(e.locus.witnessId)?.medium === 'audio');
    return { ...v, entries, school, works, schoolWorks, acts, anyAudio, secondNiasseWork };
  });

  const byNiasse = verses.filter(v => v.secondNiasseWork).length;
  const schoolOnly = verses.length - byNiasse;

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">فهرس الآيات القرآنية</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Commentary by Verse
      </h1>
      <p className="font-english text-xs italic mb-4"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
        Every āya has a page. Listed below are the {byNiasse} engaged in more than one of Shaykh
        Ibrāhīm&rsquo;s own works
        {schoolOnly > 0 && (
          <>, and {schoolOnly} more where the second reading is a student&rsquo;s</>
        )}.
      </p>

      <VersePicker
        surahs={SURAH_LIST.map(s => ({ id: s.id, name: s.nameEn, ayahCount: s.ayahCount }))}
      />
      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        The reader elsewhere on this site follows <em>Fī Riyāḍ al-Tafsīr</em>: one work, one printed
        edition, fifty-six lessons in sequence. These pages invert that. They gather every place in
        the corpus where a given verse is commented on, glossed, cited as proof, argued from in a
        legal ruling, or built into a poem — across works separated by decades, compiled by
        different hands, and never bound together. Each entry names the witness it comes from and
        how well attested the attribution is.
      </p>
      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Readings by his students are held separate throughout, on their own line here and in their
        own section on each verse page. Muḥammad al-Mishrī was his khalīfa in Mauritania and reads
        him closely, but a disciple&rsquo;s gloss is evidence of how the school received a verse, not
        of what Shaykh Ibrāhīm said about it.
      </p>

      <ul className="space-y-2">
        {verses.map(v => {
          const meta = SURAH_LIST.find(s => s.id === v.surah);
          return (
            <li key={`${v.surah}:${v.ayah}`}>
              <Link href={`/verse/${v.surah}/${v.ayah}`}
                className="block rounded-xl border px-4 py-3 hover:border-gold/40 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-english text-[14px] font-semibold text-gold/85">
                    {v.surah}:{v.ayah}
                  </span>
                  <span className="font-english text-[12.5px]"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                    Sūrat {meta?.nameEn ?? v.surah}
                  </span>
                  <span className="ml-auto font-english text-[11px]"
                    style={{ color: 'var(--body-faint, rgba(255,255,255,0.35))' }}>
                    {v.entries.length > 0
                      ? `${v.entries.length} ${v.entries.length === 1 ? 'locus' : 'loci'}`
                      : 'nothing from him yet'}
                    {v.school.length > 0 && ` + ${v.school.length} in the school`}
                    {v.acts.length > 0 && <>{' · '}{v.acts.join(', ')}</>}
                    {v.anyAudio && ' · audio'}
                  </span>
                </div>
                <div className="font-english text-[12px] mt-1"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.42))' }}>
                  {v.works.join(' · ')}
                </div>
                {/* The school's works are named on a separate line, never in
                    the same list, so the eye cannot read a disciple's title as
                    one of his. */}
                {v.schoolWorks.length > 0 && (
                  <div className="font-english text-[11.5px] mt-1 pl-2 border-l"
                    style={{
                      borderColor: 'rgba(255,255,255,0.14)',
                      color: 'var(--body-faint, rgba(255,255,255,0.34))',
                    }}>
                    In the school: {v.schoolWorks.join(' · ')}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
