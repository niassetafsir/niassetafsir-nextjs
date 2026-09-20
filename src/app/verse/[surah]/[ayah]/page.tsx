import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getLesson } from '@/lib/lessons';
import { commentaryParagraphs } from '@/lib/niasseVerseExcerpt';
import { EDITION_LABEL, formatRef, lessonRef, suraRef } from '@/lib/edition';
import verseText from '@/data/verse_text.json';
import verseTranslation from '@/data/verseTranslation.json';
import {
  ACT_BLURB,
  ACT_HEADING,
  crossCorpusVerses,
  getVerseEntries,
  groupByAct,
  splitBySpeaker,
  timelineMarks,
  type VerseEntry,
  CORPUS_VERSE_LINKS,
} from '@/lib/corpus';
import VerseCorpusTimeline from '@/components/VerseCorpusTimeline';
import VerseLocusCard, { type LocusExcerpt } from '@/components/VerseLocusCard';
import { fatwaVerseExcerpt } from '@/lib/fatwaVerseExcerpts';
import VersePicker from '@/components/VersePicker';
import RootPanel from '@/components/RootPanel';
import verseRootsData from '@/data/verseRoots.json';

// /verse/[surah]/[ayah] -- every place in the corpus where Shaykh Ibrāhīm
// engages this verse.
//
// The reader at /lesson/[id] and /surah/[id] is keyed on the lesson, which is
// one printed edition of one work. This route inverts the key. It exists
// because the answer to "what did he say about Q 24:35" is not in one book: it
// is in the 1956 Shaʿbān sessions, the 1964 Ramaḍān cycle, sixty-two
// untranscribed Wolof cassettes, and the doctrinal prose of Kāshif al-ilbās,
// and no printed edition can put those on one page.
//
// PRERENDERING. Indexing every āya the Fī Riyāḍ matcher touches would mean
// thousands of static pages for a route whose interest is cross-corpus, so
// generateStaticParams covers only the āyāt with a locus outside the Fī Riyāḍ
// transcription. Everything else renders on demand -- next.config.mjs sets no
// `output: 'export'`, so dynamic segments work on this deployment.

const VERSES = verseText as unknown as Record<string, { ar: string; en: string }>;

// Editorial renderings. See src/data/verseTranslation.json for the method
// note; the short version is that the bāʾ is read instrumentally throughout,
// which is why 1:1 is "By Allah's Name" and not "In the name of Allah".
const TRANSLATOR = (verseTranslation as { _translator: string })._translator;
const BASE_TRANSLATOR = 'Pickthall';
const RENDERINGS = (verseTranslation as unknown as {
  verses: Record<string, { en: string; note?: string }>;
}).verses;

/** Cap on how many Fī Riyāḍ lessons a single page will open to build snippets. */
const MAX_LESSON_READS = 6;
/**
 * How much of the Shaykh's paragraph the card shows before the deep link.
 *
 * The median commentary paragraph runs to about 1,400 characters, so the old
 * 260 showed a fifth of one and cut it mid-word -- enough to prove a match,
 * not enough to read. Fī Riyāḍ is published here under rights AK holds, so the
 * only real constraint is the page, and 900 characters carries most of an
 * argument while leaving "Read in context" something to do.
 */
const SNIPPET_CHARS = 900;

/** Cut at the last word break so a snippet never ends inside a word. */
function trimToWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd();
}

export async function generateStaticParams() {
  return crossCorpusVerses().map(v => ({
    surah: String(v.surah),
    ayah: String(v.ayah),
  }));
}

// How far the corpus beyond Fī Riyāḍ actually reaches. Counted here rather than
// written in, because a hand-typed figure goes stale the moment a locus is added.
const OTHER_WORK_VERSES = (() => {
  const seen = new Set<string>();
  for (const l of CORPUS_VERSE_LINKS) {
    for (let a = l.ayahStart; a <= (l.ayahEnd ?? l.ayahStart); a++) seen.add(`${l.surah}:${a}`);
  }
  return seen.size;
})();

export async function generateMetadata({
  params,
}: {
  params: { surah: string; ayah: string };
}) {
  const surah = Number(params.surah);
  const ayah = Number(params.ayah);
  const meta = SURAH_LIST.find(s => s.id === surah);
  if (!meta) return {};
  return {
    title: `Q ${surah}:${ayah} across the corpus — Shaykh Ibrāhīm Niasse`,
    description:
      `Every place in Shaykh Ibrāhīm Niasse's corpus where Q ${surah}:${ayah} ` +
      `(Sūrat ${meta.nameEn}) is commented on, cited, or used.`,
  };
}

export default async function VersePage({
  params,
}: {
  params: { surah: string; ayah: string };
}) {
  const surah = Number(params.surah);
  const ayah = Number(params.ayah);
  const meta = SURAH_LIST.find(s => s.id === surah);
  if (!meta || !Number.isFinite(ayah) || ayah < 1 || ayah > meta.ayahCount) notFound();

  const allEntries = getVerseEntries(surah, ayah);
  const { niasse: entries, school } = splitBySpeaker(allEntries);
  const groups = groupByAct(entries);
  const schoolGroups = groupByAct(school);
  const marks = timelineMarks(entries);
  const text = VERSES[`${surah}:${ayah}`];
  const rendering = RENDERINGS[`${surah}:${ayah}`];

  // Root annotation for this one āya. VERSE_ROOTS is 634 KB and stays on the
  // server: only this verse's array crosses into the client bundle, which is
  // the rule src/lib/volumes.ts exists to enforce.
  //
  // The roots come from the Quranic Arabic Corpus, which is Ḥafṣ, re-keyed to
  // this Warsh text by scripts/align-warsh.mjs. 125 of the 6,236 āyāt differ in
  // word count between the two riwāyāt -- Q 3:133 reads سَارِعُوٓاْ here against
  // Ḥafṣ وَسَارِعُوا, one word fewer -- so a positional map built on Ḥafṣ cannot
  // be laid over this text without that alignment pass.
  const arWords = text?.ar ? text.ar.split(/\s+/).filter(Boolean) : [];
  const verseRoots =
    (verseRootsData as Record<string, (string | null)[]>)[`${surah}:${ayah}`] ?? [];
  const printed = formatRef(suraRef(surah));

  // Resolve Fī Riyāḍ loci to their actual paragraphs, one lesson at a time and
  // capped -- the lesson JSONs are 100-400 KB each and this page must never
  // become the "ship the whole tafsīr" bug in a new place. Nothing here
  // crosses into a client bundle: the page is a server component and only the
  // rendered snippet reaches the browser.
  const excerpts = new Map<string, LocusExcerpt>();
  const lessonLoci = entries
    .filter(e => e.locus.address.lesson !== undefined && !e.locus.textAr)
    .slice(0, MAX_LESSON_READS);
  const lessonIds = Array.from(new Set(lessonLoci.map(e => e.locus.address.lesson as number)));
  const lessonCache = new Map<number, Awaited<ReturnType<typeof getLesson>>>();
  for (const id of lessonIds) lessonCache.set(id, await getLesson(id));

  for (const e of lessonLoci) {
    const lessonId = e.locus.address.lesson as number;
    const para = e.locus.address.paragraph;
    const lesson = lessonCache.get(lessonId);
    const body = lesson?.arabicBody || lesson?.arabicText;
    if (!lesson || !body || para === undefined) continue;
    const paras = commentaryParagraphs(body);
    const raw = paras[para];
    if (!raw) continue;
    const truncated = raw.length > SNIPPET_CHARS;
    excerpts.set(e.locus.id, {
      ar: truncated ? trimToWord(raw, SNIPPET_CHARS) : raw,
      href: `/lesson/${lessonId}#ar-para-${para}`,
      truncated,
      printedRef: formatRef(lessonRef(lessonId)),
    });
  }

  // Per-verse cuts from the fatāwā. The locus already carries a default
  // excerpt; this replaces it where the answer expounds this particular āya.
  for (const e of entries) {
    const cut = fatwaVerseExcerpt(e.locus.id, surah, ayah);
    if (!cut) continue;
    excerpts.set(e.locus.id, { ar: cut.ar ?? null, en: cut.en ?? null });
  }

  // What the cards will actually print, which is not what `hasText` grades.
  // `hasText` is a property of the locus; whether a snippet resolves is a
  // property of this render. A paragraph index that no longer lands inside its
  // lesson, and every locus past MAX_LESSON_READS, carry hasText and show an
  // empty box, so counting them said "9 of 9 text available" over six snippets
  // and three blanks. Mirror VerseLocusCard's own test instead.
  const loaded = entries.filter(e => {
    const x = excerpts.get(e.locus.id);
    return Boolean(x?.ar || x?.en || e.locus.textAr || e.locus.textEn);
  }).length;

  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* ── the verse ───────────────────────────────────────── */}
      <div className="pb-6 mb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
        <div className="font-english text-[11px] tracking-[0.12em] uppercase mb-3"
          style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
          <Link href={`/surah/${surah}`} className="hover:text-gold">
            Sūrat {meta.nameEn}
          </Link>
          {' · '}
          <span className="text-gold font-semibold">{surah} : {ayah}</span>
        </div>

        <h1 className="font-english text-[20px] font-semibold leading-snug mb-3.5"
          style={{ color: 'var(--body-text, rgba(255,255,255,0.92))' }}>
          Q {surah}:{ayah} in the tafsīr of Shaykh Ibrāhīm Niasse
        </h1>

        {text?.ar && (
          arWords.length > 0 && verseRoots.length === arWords.length ? (
            <RootPanel words={arWords} roots={verseRoots} />
          ) : (
            // The root array is index-parallel to this exact tokenisation of
            // verse_text.json's Warsh text -- see scripts/align-warsh.mjs. If
            // the two ever disagree the āya renders unannotated rather than
            // attaching every gloss one word off, which is the failure the
            // whole alignment step exists to prevent.
            <p className="font-arabic text-[26px] leading-[2] mb-3 text-right" dir="rtl" translate="no"
              style={{ color: 'var(--body-text, rgba(255,255,255,0.92))', textAlign: 'right' }}>
              {text.ar}
            </p>
          )
        )}
        {/* The English is never unattributed. AK's renderings carry
            interpretive weight -- the bāʾ read instrumentally, faʿīl's
            active/passive ambiguity made explicit -- and a reader has to be
            able to see that they are reading a construal rather than a
            report. Where he has not yet rendered a verse the base translation
            shows, named as such, so the two are never confused. Same
            discipline the loci use for Niasse against his students. */}
        {rendering ? (
          <>
            <p className="font-english text-[15px] italic"
              style={{ color: 'var(--body-text, rgba(255,255,255,0.82))' }}>
              {rendering.en}
            </p>
            <p className="font-english text-[11.5px] mt-1.5"
              style={{ color: 'var(--gold-light, #E8D4A0)' }}>
              Rendered by {TRANSLATOR}
              {rendering.note && (
                <span title={rendering.note} className="cursor-help"> · why</span>
              )}
            </p>
            {text?.en && (
              <p className="font-english text-[12.5px] italic mt-2"
                style={{ color: 'var(--body-faint, rgba(255,255,255,0.42))' }}>
                {text.en} <span className="not-italic">— {BASE_TRANSLATOR}</span>
              </p>
            )}
          </>
        ) : (
          text?.en && (
            <p className="font-english text-[15px] italic"
              style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
              {text.en} <span className="not-italic text-[12px]">— {BASE_TRANSLATOR}</span>
            </p>
          )
        )}

        <p className="font-english text-[13px] leading-relaxed mt-5"
          style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
          Shaykh Ibrāhīm Niasse (d. 1975) read the whole Qurʾān aloud at Medina Baye over
          fifty-six sessions between ẓuhr and ʿaṣr in Ramaḍān 1383/1964, and his students wrote
          those sessions down as <em>Fī Riyāḍ al-Tafsīr</em>. He comes back to the same āya elsewhere
          — in the fatwās, the <em>Ḥikam</em>, the poetry — decades apart.{' '}
          <Link href="/about/tafsir" className="text-gold/80 hover:text-gold underline">
            About the tafsīr →
          </Link>
        </p>

        {printed && (
          <p className="font-english text-[12px] mt-4"
            style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
            In the printed edition: Sūrat {meta.nameEn} begins at{' '}
            <strong style={{ color: 'var(--body-text, rgba(255,255,255,0.75))' }}>{printed}</strong>{' '}
            <span style={{ opacity: 0.75 }}>({EDITION_LABEL})</span>
          </p>
        )}

        <p className="font-english text-[11.5px] mt-4 pl-2.5 border-l-2 leading-relaxed"
          style={{
            borderColor: 'rgba(201,168,76,0.3)',
            color: 'var(--body-faint, rgba(255,255,255,0.35))',
          }}>
          The āya above is Warsh ʿan Nāfiʿ, the rasm of the printed edition. The root behind each
          underlined word comes from a Ḥafṣ ʿan ʿĀṣim corpus, realigned to this Warsh text
          word by word; 125 of the 6,236 āyāt differ in word count between the two riwāyāt, and
          those were aligned rather than assumed. A word carries no underline where the corpus
          supplies no root. Lexicon entries are a reading aid and carry no page reference; the
          edition does not cite them. Page references elsewhere on this site follow the ten-volume
          Tunis 2022 printing this site was transcribed from; published scholarship on this text
          cites the six-volume Tunis 2010 printing, whose pagination is different.
        </p>
      </div>

      {/* Both branches that used to stand here — "No locus recorded for this
          verse yet" and "Nothing from Shaykh Ibrāhīm on this verse yet" — were
          unreachable. getVerseEntries appends a session-coverage entry wherever
          no Fī Riyāḍ entry stands, the fifty-six sessions tile 1:1 to 114:6 with
          no gaps, and that entry is always his, so allEntries and entries were
          never empty for any of the 6,236. The copy they carried now sits on
          the coverage card in VerseLocusCard, where a reader will see it. */}
      {/* ── summary ──────────────────────────────────── */}
      {entries.length > 0 && (
      <div className="flex flex-wrap gap-x-9 gap-y-3 mb-9">
        <Stat n={String(entries.length)} label={entries.length === 1 ? 'locus' : 'loci in the corpus'} />
        <Stat n={String(groups.length)} label={groups.length === 1 ? 'act' : 'distinct acts'} />
        {marks.length > 1 && (
          <Stat
            n={`${marks[0].year} – ${marks[marks.length - 1].year}`}
            label="attested span"
          />
        )}
        <Stat n={`${loaded} of ${entries.length}`} label="text available" />
      </div>
      )}

      <VerseCorpusTimeline marks={marks} />

      {/* ── the acts ──────────────────────────────────────── */}
      {groups.map(group => (
        <section key={group.act} className="mb-10">
          <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">
            {ACT_HEADING[group.act]}
          </h2>
          <p className="font-english text-[13px] italic mb-5"
            style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
            {ACT_BLURB[group.act]}
          </p>
          {group.entries.map(entry => (
            <VerseLocusCard
              key={`${entry.locus.id}-${entry.link.acts.join('+')}`}
              entry={entry}
              excerpt={excerpts.get(entry.locus.id)}
            />
          ))}
        </section>
      ))}

      {schoolGroups.length > 0 && (
        <section className="mt-14 pt-8 border-t" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
          <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">
            Read in the school
          </h2>
          <p className="font-english text-[13px] italic mb-5"
            style={{ color: 'var(--body-sub, rgba(255,255,255,0.78))' }}>
            Not Shaykh Ibrāhīm&rsquo;s words. Students and successors reading the same verse — kept
            below and apart, because a school&rsquo;s reading is evidence of transmission, not of
            what the master said.
          </p>
          {schoolGroups.map(g => g.entries.map(entry => (
            <VerseLocusCard key={`school-${entry.locus.id}-${entry.link.acts.join('+')}`} entry={entry} />
          )))}
        </section>
      )}

      <p className="font-english text-[12.5px] leading-relaxed pt-6 border-t"
        style={{
          borderColor: 'rgba(255,255,255,0.10)',
          color: 'var(--body-faint, rgba(255,255,255,0.4))',
        }}>
        Entries are grouped by what Shaykh Ibrāhīm is <em>doing</em> with the verse, then ordered
        oldest first inside each group, so the same words can be seen carrying different work
        across a career. Every entry names the witness it comes from and how well attested the
        attribution is. Loci that are known but not yet available are listed rather than hidden.
        {' '}Beyond <em>Fī Riyāḍ al-Tafsīr</em>, {OTHER_WORK_VERSES} āyāt have so far been indexed
        from his other writings — the <em>Ḥikam</em>, the fatwās, <em>Kāshif al-Ilbās</em>, the
        <em>Qanābīl</em>, the <em>Tafsīr Maʿānī</em> cassettes. A verse with nothing under this
        heading has not been searched in them and found wanting; it has not been searched.
      </p>

      <NeighbourNav surah={surah} ayah={ayah} max={meta.ayahCount} />

      <div className="mt-6">
        <VersePicker
          surahs={SURAH_LIST.map(s => ({ id: s.id, name: s.nameEn, ayahCount: s.ayahCount }))}
          initialSurah={surah}
          initialAyah={ayah}
        />
      </div>
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-english text-[22px] font-semibold leading-none tracking-tight"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        {n}
      </div>
      <div className="font-english text-[11px] mt-1"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.4))' }}>
        {label}
      </div>
    </div>
  );
}

function NeighbourNav({ surah, ayah, max }: { surah: number; ayah: number; max: number }) {
  return (
    <nav className="flex justify-between items-center mt-10 pt-5 border-t font-english text-[12.5px]"
      style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
      {ayah > 1 ? (
        <Link href={`/verse/${surah}/${ayah - 1}`} className="text-gold/70 hover:text-gold">
          ← {surah}:{ayah - 1}
        </Link>
      ) : <span />}
      <Link href={`/surah/${surah}`}
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}
        className="hover:text-gold">
        Sūrah {surah}
      </Link>
      {ayah < max ? (
        <Link href={`/verse/${surah}/${ayah + 1}`} className="text-gold/70 hover:text-gold">
          {surah}:{ayah + 1} →
        </Link>
      ) : <span />}
    </nav>
  );
}

export type { VerseEntry };
