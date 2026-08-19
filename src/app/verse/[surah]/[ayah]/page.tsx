import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getLesson } from '@/lib/lessons';
import { commentaryParagraphs } from '@/lib/niasseVerseExcerpt';
import { EDITION_LABEL, formatRef, lessonRef, suraRef } from '@/lib/edition';
import verseText from '@/data/verse_text.json';
import {
  ACT_BLURB,
  ACT_HEADING,
  crossCorpusVerses,
  getVerseEntries,
  groupByAct,
  splitBySpeaker,
  timelineMarks,
  type VerseEntry,
} from '@/lib/corpus';
import VerseCorpusTimeline from '@/components/VerseCorpusTimeline';
import VerseLocusCard, { type LocusExcerpt } from '@/components/VerseLocusCard';
import VersePicker from '@/components/VersePicker';

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

/** Cap on how many Fī Riyāḍ lessons a single page will open to build snippets. */
const MAX_LESSON_READS = 6;
const SNIPPET_CHARS = 260;

export async function generateStaticParams() {
  return crossCorpusVerses().map(v => ({
    surah: String(v.surah),
    ayah: String(v.ayah),
  }));
}

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
      ar: truncated ? raw.slice(0, SNIPPET_CHARS).trimEnd() : raw,
      href: `/lesson/${lessonId}#ar-para-${para}`,
      truncated,
      printedRef: formatRef(lessonRef(lessonId)),
    });
  }

  const loaded = entries.filter(e => e.hasText).length;

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

        {text?.ar && (
          <p className="font-arabic text-[26px] leading-[2] mb-3 text-right" dir="rtl"
            style={{ color: 'var(--body-text, rgba(255,255,255,0.92))', textAlign: 'right' }}>
            {text.ar}
          </p>
        )}
        {text?.en && (
          <p className="font-english text-[15px] italic"
            style={{ color: 'var(--body-faint, rgba(255,255,255,0.55))' }}>
            {text.en}
          </p>
        )}

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
          The site&rsquo;s Arabic edition follows Warsh ʿan Nāfiʿ; the reference text quoted here and
          the matcher behind the Fī Riyāḍ loci are Ḥafṣ ʿan ʿĀṣim. Content is nearly identical, but
          verse-boundary numbering diverges in a handful of places. Each locus carries its own
          witness&rsquo;s numbering. Page references follow the ten-volume Tunis 2022 printing this
          site was transcribed from; published scholarship on this text cites the six-volume Tunis
          2010 printing, whose pagination is different.
        </p>
      </div>

      {allEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed px-5 py-6"
          style={{ borderColor: 'rgba(255,255,255,0.16)' }}>
          <p className="font-english text-[14px] leading-relaxed"
            style={{ color: 'var(--body-faint, rgba(255,255,255,0.6))' }}>
            <strong style={{ color: 'var(--body-text, rgba(255,255,255,0.85))' }}>
              No locus recorded for this verse yet.
            </strong>{' '}
            That is a statement about the index, not about the corpus. Most of Shaykh Ibrāhīm&rsquo;s
            Qurʾānic commentary is oral and untranscribed — sixty-two cassettes of Wolof exegesis
            covering the whole Qurʾān have never been transcribed at all — so an empty page here
            means the work has not been done, not that he passed the verse over.
          </p>
          <Link href={`/surah/${surah}`}
            className="inline-block mt-4 font-english text-[12.5px] text-gold/70 hover:text-gold underline">
            Read Sūrat {meta.nameEn} in the lesson sequence →
          </Link>
        </div>
      ) : (
        <>
          {entries.length === 0 && (
            <div className="rounded-xl border border-dashed px-5 py-5 mb-10"
              style={{ borderColor: 'rgba(255,255,255,0.16)' }}>
              <p className="font-english text-[13.5px] leading-relaxed"
                style={{ color: 'var(--body-sub, rgba(255,255,255,0.78))' }}>
                <strong style={{ color: 'var(--body-text, #FFFFFF)' }}>
                  Nothing from Shaykh Ibrāhīm on this verse yet — but the school reads it.
                </strong>{' '}
                What follows is a student&rsquo;s commentary, not his. Where he treats the verse
                himself, it has not been located or not yet ingested.
              </p>
            </div>
          )}

          {/* ── summary ───────────────────────────────────────── */}
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
                  key={`${entry.locus.id}-${entry.link.type}`}
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
                <VerseLocusCard key={`school-${entry.locus.id}-${entry.link.type}`} entry={entry} />
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
          </p>
        </>
      )}

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
