import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getLesson } from '@/lib/lessons';
import { commentaryParagraphs, curatedFatihaPair } from '@/lib/niasseVerseExcerpt';
import { EDITION_LABEL, formatRef, lessonRef, suraRef } from '@/lib/edition';
import verseText from '@/data/verse_text.json';
import verseTranslation from '@/data/verseTranslation.json';
import {
  ACT_HEADING,
  crossCorpusVerses,
  getVerseEntries,
  groupByAct,
  splitBySpeaker,
  type VerseEntry,
  CORPUS_VERSE_LINKS,
  wordsDate,
} from '@/lib/corpus';
import VerseLocusCard, { shortTitle, type LocusExcerpt } from '@/components/VerseLocusCard';
import { fatwaVerseExcerpt } from '@/lib/fatwaVerseExcerpts';
import VersePicker from '@/components/VersePicker';
import Fold from '@/components/Fold';
import SourceComparison from '@/components/SourceComparison';
import { comparisonsForVerse } from '@/lib/sourceComparison';

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
const BASE_TRANSLATOR = 'tr. M. M. Pickthall';
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

/**
 * A paragraph in the transcription can open on the tail of the previous
 * sentence ("مشربهم. وهذه الآية …"). When the paragraph before it does not
 * close on a sentence mark, drop that tail so the excerpt opens where a
 * sentence does.
 */
function startAtSentence(raw: string | undefined, prev: string | undefined): string | undefined {
  if (!raw || !prev) return raw;
  if (/[.!؟:»"”)\]]\s*$/.test(prev.trim())) return raw;
  const m = raw.slice(0, 160).match(/[.!؟:]\s+/);
  return m && m.index !== undefined ? raw.slice(m.index + m[0].length) : raw;
}

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
    title: `Shaykh Ibrāhīm Niasse on Q ${surah}:${ayah}`,
    description:
      `What Shaykh Ibrāhīm Niasse says about Q ${surah}:${ayah} (Sūrat ${meta.nameEn}), ` +
      `from his tafsīr and his other works.`,
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
  const { niasse: entries, school, copied } = splitBySpeaker(allEntries);
  const groups = groupByAct(entries);
  // His uses of this verse in time: one line per work, earliest first, the
  // tafsīr sessions last. Shown only where more than one work uses the verse.
  const KIND_SHORT: Record<string, string> = {
    tafsir: 'explains it', gloss: 'glosses it', prooftext: 'quotes it', juristic: 'cites it as legal proof',
    application: 'applies it', allusion: 'alludes to it', poetic: 'uses it in verse', formula: 'as a set formula',
    lemma: 'quotes it as a heading',
  };
  const byWork = new Map<string, { title: string; date: ReturnType<typeof wordsDate>; kinds: Set<string> }>();
  for (const e of entries) {
    const row = byWork.get(e.work.id) ?? { title: shortTitle(e.work), date: wordsDate(e.work), kinds: new Set<string>() };
    for (const a of e.link.acts) if (KIND_SHORT[a]) row.kinds.add(KIND_SHORT[a]);
    byWork.set(e.work.id, row);
  }
  const chrono = Array.from(byWork.values()).sort((a, b) => (a.date?.year ?? 1e9) - (b.date?.year ?? 1e9) || a.title.localeCompare(b.title));
  const schoolGroups = groupByAct(school);
  const comparisons = comparisonsForVerse(surah, ayah);
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

  // Where a curated pair exists, it wins. The Arabic paragraph below is chosen
  // by the matcher and has no English counterpart anywhere in the data, so a
  // card built from it is Arabic-only whatever the lesson's translation state.
  // al-Fātiḥa is the one stretch read verse by verse in both languages
  // (src/lib/lesson1FatihaVerseMap.ts), and that reading is the only matched
  // Arabic-and-English object this site holds. Used once per page: two loci
  // showing the same pair would be the reuse bug wearing a new coat.
  let pairShown = false;

  for (const e of lessonLoci) {
    const lessonId = e.locus.address.lesson as number;
    const para = e.locus.address.paragraph;
    const lesson = lessonCache.get(lessonId);
    const body = lesson?.arabicBody || lesson?.arabicText;
    if (!lesson || !body || para === undefined) continue;

    const pair = pairShown
      ? null
      : curatedFatihaPair(lessonId, `${surah}:${ayah}`, text?.ar, body, lesson.englishText);
    if (pair) {
      pairShown = true;
      const arCut = pair.ar !== null && pair.ar.length > SNIPPET_CHARS;
      const enCut = pair.en !== null && pair.en.length > SNIPPET_CHARS;
      excerpts.set(e.locus.id, {
        ar: pair.ar === null ? null : arCut ? trimToWord(pair.ar, SNIPPET_CHARS) : pair.ar,
        en: pair.en === null ? null : enCut ? trimToWord(pair.en, SNIPPET_CHARS) : pair.en,
        href: `/lesson/${lessonId}#ar-para-${pair.anchorPara}`,
        truncated: arCut || enCut,
        printedRef: formatRef(lessonRef(lessonId)),
      });
      continue;
    }

    const paras = commentaryParagraphs(body);
    const raw = startAtSentence(paras[para], paras[para - 1]);
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
          Shaykh Ibrāhīm Niasse on Q {surah}:{ayah}
        </h1>

        {/* The āya stands as plain text. A lexicon panel used to sit on its
            words; its dictionaries named no printed edition, and the page
            leads with what Shaykh Ibrāhīm says, not with a word study. */}
        {text?.ar && (
          <p className="font-arabic text-[26px] leading-[2] mb-3 text-right" dir="rtl" translate="no"
            style={{ color: 'var(--body-text, rgba(255,255,255,0.92))', textAlign: 'right' }}>
            {text.ar}
          </p>
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


      </div>

      {/* Both branches that used to stand here — "No locus recorded for this
          verse yet" and "Nothing from Shaykh Ibrāhīm on this verse yet" — were
          unreachable. getVerseEntries appends a session-coverage entry wherever
          no Fī Riyāḍ entry stands, the fifty-six sessions tile 1:1 to 114:6 with
          no gaps, and that entry is always his, so allEntries and entries were
          never empty for any of the 6,236. The copy they carried now sits on
          the coverage card in VerseLocusCard, where a reader will see it. */}

      {/* ── the acts ──────────────────────────────────────── */}
      {chrono.length > 1 && (
        <section className="mb-3 border-b" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
          <Fold summary={<>
            <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/70">
              Across his works, by date
            </h2>
            <span className="ml-auto font-english text-[11px] text-gold/50">{chrono.length}</span>
          </>}>
            <ol className="font-english text-[13.5px] space-y-1.5 mb-2" style={{ color: 'var(--body-sub, rgba(255,255,255,0.8))' }}>
              {chrono.map(r => (
                <li key={r.title} className="flex gap-3">
                  <span className="shrink-0 w-[7.5rem] text-gold/80 tabular-nums">{r.date?.label ?? 'Date not known'}</span>
                  <span><em>{r.title}</em>{r.kinds.size > 0 && <span style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}> · {Array.from(r.kinds).join(', ')}</span>}</span>
                </li>
              ))}
            </ol>
          </Fold>
        </section>
      )}

      {/* Each kind of passage folds; the first stands open and opening
          another shuts it, so a heavily treated verse stays a short page. */}
      {groups.map((group, gi) => (
        <section key={group.act} className="mb-3 border-b" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
          <Fold defaultOpen={gi === 0} group="verse-section" summary={<>
            <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/70">
              {ACT_HEADING[group.act]}
            </h2>
            <span className="ml-auto font-english text-[11px] text-gold/50">{group.entries.length}</span>
          </>}>
          {group.entries.map((entry, i) => {
            // A run of passages from the same lesson or page carries one
            // citation and one link, printed under its last passage.
            const place = (e: typeof entry) =>
              `${e.work.id}|${e.locus.address.lesson ?? e.locus.address.raw ?? e.locus.id}`;
            const next = group.entries[i + 1];
            const sameAsNext = next !== undefined && place(next) === place(entry);
            let start = i;
            while (start > 0 && place(group.entries[start - 1]) === place(entry)) start--;
            const ex = excerpts.get(entry.locus.id);
            const firstHref = excerpts.get(group.entries[start].locus.id)?.href;
            return (
              <VerseLocusCard
                key={`${entry.locus.id}-${entry.link.acts.join('+')}`}
                entry={entry}
                excerpt={ex && firstHref ? { ...ex, href: firstHref } : ex}
                hideCitation={sameAsNext}
              />
            );
          })}
          </Fold>
        </section>
      ))}

      {comparisons.length > 0 && <SourceComparison entries={comparisons} />}

      {schoolGroups.length > 0 && (
        <section className="mt-8 border-b" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
          <Fold group="verse-section" summary={<>
            <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/70">
              Commentaries of his students
            </h2>
            <span className="ml-auto font-english text-[11px] text-gold/50">
              {schoolGroups.reduce((n, g) => n + g.entries.length, 0)}
            </span>
          </>}>
          <p className="font-english text-[13px] italic mb-5"
            style={{ color: 'var(--body-sub, rgba(255,255,255,0.78))' }}>
            How scholars of the Fayḍa who learned from him read the same verse. These are their
            words, not his.
          </p>
          {schoolGroups.map(g => g.entries.map(entry => (
            <VerseLocusCard key={`school-${entry.locus.id}-${entry.link.acts.join('+')}`} entry={entry} />
          )))}
          </Fold>
        </section>
      )}

      {copied.length > 0 && (
        <section className="mt-14 pt-8 border-t" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
          <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-1.5">
            Commentaries he copied
          </h2>
          <p className="font-english text-[13px] italic mb-5"
            style={{ color: 'var(--body-sub, rgba(255,255,255,0.78))' }}>
            Not Shaykh Ibrāhīm&rsquo;s words. Other authors&rsquo; treatment of this verse, which he
            transcribed into his own works — evidence of what he read and chose to pass on. Each card
            names the author speaking.
          </p>
          {copied
            .slice()
            .sort((a, b) => a.year - b.year)
            .map(entry => (
              <VerseLocusCard key={`copied-${entry.locus.id}`} entry={entry} />
            ))}
        </section>
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
