import Link from 'next/link';
import { SURAH_LIST } from '@/lib/verseRanges';
import {
  ACT_LABEL,
  crossCorpusVerses,
  getVerseEntries,
  getWitness,
} from '@/lib/corpus';

export const metadata = {
  title: 'Across the corpus — verse index',
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
    const entries = getVerseEntries(v.surah, v.ayah);
    const works = Array.from(
      new Set(
        entries
          .map(e => e.work.titleTranslit ?? e.work.id)
          .filter(Boolean) as string[]
      )
    );
    const acts = Array.from(new Set(entries.map(e => ACT_LABEL[e.link.type])));
    const anyAudio = entries.some(e => getWitness(e.locus.witnessId)?.medium === 'audio');
    return { ...v, entries, works, acts, anyAudio };
  });

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Across the corpus
      </h1>
      <p className="font-english text-xs italic mb-2"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
        {verses.length} verses engaged in more than one of Shaykh Ibrāhīm&rsquo;s works
      </p>
      <p className="font-english text-[13px] leading-relaxed mb-8"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        The reader elsewhere on this site follows <em>Fī Riyāḍ al-Tafsīr</em>: one work, one printed
        edition, fifty-six lessons in sequence. These pages invert that. They gather every place in
        the corpus where a given verse is commented on, glossed, cited as proof, argued from in a
        legal ruling, or built into a poem — across works separated by decades, compiled by
        different hands, and never bound together. Each entry names the witness it comes from and
        how well attested the attribution is.
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
                    {v.entries.length} {v.entries.length === 1 ? 'locus' : 'loci'}
                    {' · '}{v.acts.join(', ')}
                    {v.anyAudio && ' · audio'}
                  </span>
                </div>
                <div className="font-english text-[12px] mt-1"
                  style={{ color: 'var(--body-faint, rgba(255,255,255,0.42))' }}>
                  {v.works.join(' · ')}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
