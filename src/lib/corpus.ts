// The cross-corpus verse index.
//
// The reader that /lesson/[id] and /surah/[id] serve is keyed on the LESSON:
// one work (Fī Riyāḍ al-Tafsīr), one printed edition, one address scheme.
// That is one projection of a more general relation. Shaykh Ibrāhīm commented
// on Qurʾānic verses in at least four distinct bodies of material -- the
// 1383/1964 Arabic Ramaḍān sessions behind Fī Riyāḍ, the 1375/1956 Shaʿbān
// sessions behind al-Ḥikam al-quṭbiyya, sixty-two cassettes of Wolof exegesis
// recorded 1950-1960, and the proof-textual use running through Kāshif
// al-ilbās, the fatāwā and the dawāwīn -- and no printed edition can put them
// on one page, because they were compiled by different people in different
// countries and have never been bound together.
//
// Four entities, and the middle one is the one the old data lacked:
//
//   work     a bibliographic unit
//   witness  a specific instantiation of it -- a print edition, a cassette
//            set, a manuscript. Fī Riyāḍ has three (the 1964 recordings, Tunis
//            2010 in six volumes, Tunis 2022 in ten). Their pagination does
//            not agree, which is why every published page citation for this
//            text fails against the edition this site follows.
//   locus    a passage inside a witness, addressed in that witness's own
//            scheme (volume-page, lesson-paragraph, cassette-timecode).
//   link     locus -> āya, carrying WHAT KIND of act it is and HOW WELL
//            attested the attribution is.
//
// The act typing is not decoration. A tawassul acrostic on Q 40:44, a
// proof-text in Kāshif, and five pages of exegesis in Fī Riyāḍ are three
// different things, and a page that stacked them under one heading would tell
// the reader something false.
//
// PAYLOAD: corpus.json is ~43 KB and is imported at module scope, so it is
// bundled wherever this module is imported. Keep it on the server -- pass
// only the narrow view types below into client components. See
// src/lib/volumes.ts for why this matters on this site.

import corpusRaw from '@/data/corpus.json';
import lessonRangesRaw from '@/data/lessonRanges.json';
import { VERSE_INDEX } from '@/lib/verseIndex';

/** What Niasse is DOING with the verse at this locus. Never optional. */
export type ExegeticalAct =
  | 'tafsir'     // sustained interpretation of the verse as a verse
  | 'gloss'      // a single interpretive equivalence, often inherited
  | 'prooftext'  // the verse warrants a claim argued from other authorities
  | 'juristic'   // the verse is the dalīl of a ruling
  | 'poetic'     // the verse as structure -- acrostic, tawassul, ḥurūf
  | 'lemma';     // quoted only as a heading or recitation cue

/**
 * How well attested the attribution is.
 *  curated  -- a human verified this link against the text
 *  auto     -- produced by scripts/match-verses.js, never individually checked
 *  reported -- asserted by a catalogue or a secondary source, not checked
 *              against the text at all
 */
export type Confidence = 'curated' | 'auto' | 'reported';

/**
 * Verse-boundary numbering diverges between Warsh ʿan Nāfiʿ and Ḥafṣ ʿan
 * ʿĀṣim. The site's own edition follows Warsh; the reference corpus used to
 * build the Fī Riyāḍ indices is Ḥafṣ. Corpus-wide this stops being an edge
 * case, since each witness may number differently.
 */
export type Rasm = 'warsh' | 'hafs' | 'unknown';

/**
 * What Niasse DOES to the authority he is reading with.
 *
 * `sourceFrame` records which prior commentary stands behind a locus; it says
 * nothing about what he does to it. If the claim is that he adjudicates
 * between positions -- sometimes affirming, sometimes departing, sometimes
 * extending -- then the adjudication has to be a field, or it can never be
 * shown from the data.
 *
 * This can only ever be filled in by a human reading the passage. The
 * automated matcher produces `type` and nothing else; a stance that has not
 * been read in is absent, not neutral.
 */
export type Stance =
  | 'affirms'     // takes the received position as it stands
  | 'qualifies'   // accepts it within limits he sets
  | 'rejects'     // sets it aside for another
  | 'extends'     // grants it, then carries it further
  | 'reconciles'  // holds two positions together
  | 'silent';     // draws on it without comment

/**
 * How a session or text came about. The distinction matters because the
 * delivery of tafsir was itself an act of authority in the Fayda: standing up
 * to give it unbidden is not the same speech-situation as being asked for it,
 * and neither is the same as answering a letter about one verse.
 */
export type Prompt =
  | 'unprompted'  // he began it himself
  | 'requested'   // students asked for the session
  | 'responsum'   // written answer to a question put to him
  | 'annual'      // the recurring Ramadan cycle
  | 'unknown';

/** Who produced a work, and how they stand to Shaykh Ibrahim. */
export type Relation =
  | 'self'      // Shaykh Ibrahim's own words
  | 'student'   // a member of the school commenting in his own right
  | 'compiler'  // someone transcribing or arranging his words
  | 'critic';   // an opponent

/**
 * The circumstance a body of commentary was delivered in. Attaches to a
 * witness (a whole session-set) or to a single locus.
 */
export interface Occasion {
  id: string;
  label: string;
  hijri?: string;
  gregorian?: string;
  place?: string;
  language?: string;
  prompt: Prompt;
  /** Who asked, where the request is recorded. */
  requestedBy?: string;
  audience?: string;
  note?: string;
}

export interface Work {
  id: string;
  titleAr?: string;
  titleTranslit?: string;
  titleEn?: string;
  genre?: string;
  attestation?: 'A' | 'B' | 'C' | 'D';
  byNiasse?: boolean;
  compiler?: string;
  alaNumber?: number | null;
  composed?: { hijri?: string; gregorian?: string; certainty?: string };
  exegeticalRegister?: ExegeticalAct[];
  publish?: boolean;
  /** Whose words these are. Defaults to Shaykh Ibrahim. */
  author?: string;
  relation?: Relation;
  /**
   * Some works exist only as one member of a larger publishing project and
   * cannot be cited without it. The nine mahawir of the Mawsuʿat al-athar
   * al-nathriyya forced this field: each carries its own title and its own
   * pagination beginning at 1, so a bare "vol. 2, p. 5" addresses nothing
   * until you know which mahwar is meant.
   */
  series?: string;
  seriesAr?: string;
  /** Ordinal within the series; `seriesPart` distinguishes a multi-juzʾ member. */
  seriesIndex?: number;
  seriesPart?: number;
  /** Editorial note about the work itself, not about its compiler. */
  note?: string;
}

export interface Witness {
  id: string;
  workId: string;
  medium: 'print' | 'audio' | 'manuscript' | 'lithograph' | 'digital';
  language?: string;
  year?: string;
  editor?: string;
  publisher?: string;
  place?: string;
  volumes?: number | null;
  addressScheme: string;
  isBase?: boolean;
  derivesFrom?: string | null;
  occasionId?: string;
}

export interface LocusAddress {
  volume?: number;
  page?: number;
  lesson?: number;
  paragraph?: number;
  cassette?: number;
  startMs?: number;
  endMs?: number;
  line?: number;
  raw?: string;
}

export interface Locus {
  id: string;
  witnessId: string;
  address: LocusAddress;
  textAr?: string;
  textEn?: string;
  transcriptionStatus?: 'none' | 'ocr' | 'draft' | 'verified';
  occasionId?: string;
  /**
   * How this text came to be here, in the reader's language.
   *
   * `transcriptionStatus` grades the Arabic; it says nothing about the
   * English. A draft translation awaiting the editor's pass looks exactly like
   * a finished one on the page unless the page says otherwise, and on a site
   * whose whole apparatus exists to keep a reader from mistaking one voice for
   * another, an unsigned translation presented silently would be the same
   * failure in a new place.
   */
  editorialNote?: string;
}

export interface VerseLink {
  locusId: string;
  surah: number;
  ayahStart: number;
  ayahEnd?: number;
  type: ExegeticalAct;
  confidence: Confidence;
  rasm: Rasm;
  note?: string;
  /** Only ever set by a human reader. See Stance. */
  stance?: Stance;
  /** Whom the stance is toward -- 'jalalayn', 'sawi', 'ruh-al-bayan', a name. */
  stanceToward?: string[];
  /**
   * Set when the link was not found in the text at all but follows from a
   * session's span. `auto` alone would read as "the matcher found this here",
   * which is a stronger claim than the data supports.
   */
  derivation?: 'session-range';
}

interface Corpus {
  works: Work[];
  witnesses: Witness[];
  loci: Locus[];
  verseLinks: VerseLink[];
  occasions?: Occasion[];
}

const corpus = corpusRaw as unknown as Corpus;

const WORKS = new Map(corpus.works.map(w => [w.id, w]));
const WITNESSES = new Map(corpus.witnesses.map(w => [w.id, w]));
const OCCASIONS = new Map((corpus.occasions ?? []).map(o => [o.id, o]));

export function getOccasion(id?: string): Occasion | undefined {
  return id ? OCCASIONS.get(id) : undefined;
}

export const STANCE_LABEL: Record<Stance, string> = {
  affirms: 'affirms', qualifies: 'qualifies', rejects: 'departs from',
  extends: 'extends', reconciles: 'reconciles', silent: 'draws on',
};

export const PROMPT_LABEL: Record<Prompt, string> = {
  unprompted: 'delivered unbidden', requested: 'held at students\u2019 request',
  responsum: 'answered in writing', annual: 'the annual Rama\u1e0d\u0101n cycle',
  unknown: '',
};

export function getWork(id: string): Work | undefined {
  return WORKS.get(id);
}
export function getWitness(id: string): Witness | undefined {
  return WITNESSES.get(id);
}

// ---------------------------------------------------------------------------
// Fī Riyāḍ loci, derived rather than duplicated
// ---------------------------------------------------------------------------
// VERSE_INDEX (src/lib/verseIndex.ts) already resolves verse -> lesson +
// paragraph for all 56 lessons: hand-curated for lessons 1-3, matcher output
// for 4-56. Rather than copy those thousands of rows into corpus.json and
// create a second source of truth that would silently drift from the matcher,
// they are lifted into loci at module load. Change the matcher and this
// follows automatically.
//
// Confidence follows the tiering documented in verseIndex.ts: lessons 1-3 were
// spot-checked by hand, 4-56 were not. rasm is 'hafs' throughout, because the
// reference corpus the matcher ran against is Ḥafṣ even though the printed
// edition this site follows is Warsh -- that mismatch is a real caveat and the
// interface says so rather than hiding it.

const HAND_CURATED_LESSONS = new Set([1, 2, 3]);

const DERIVED_LOCI: Locus[] = [];
const DERIVED_LINKS: VerseLink[] = [];
const SEEN_LOCUS_IDS = new Set<string>();

for (const [lessonKey, entries] of Object.entries(VERSE_INDEX)) {
  const lessonId = Number(lessonKey);
  for (const entry of entries) {
    const [sRaw, aRaw] = entry.verse.split(':');
    const surah = Number(sRaw);
    const ayah = Number(aRaw);
    if (!Number.isFinite(surah) || !Number.isFinite(ayah)) continue;

    const locusId = `firiyad-L${lessonId}-p${entry.paraIndex}`;
    if (!SEEN_LOCUS_IDS.has(locusId)) {
      SEEN_LOCUS_IDS.add(locusId);
      DERIVED_LOCI.push({
        id: locusId,
        witnessId: 'fi-riyad-site-transcription',
        address: {
          lesson: lessonId,
          paragraph: entry.paraIndex,
          raw: `Lesson ${lessonId}, ¶${entry.paraIndex + 1}`,
        },
        transcriptionStatus: 'verified',
      });
    }
    DERIVED_LINKS.push({
      locusId,
      surah,
      ayahStart: ayah,
      type: 'tafsir',
      confidence: HAND_CURATED_LESSONS.has(lessonId) ? 'curated' : 'auto',
      rasm: 'hafs',
    });
  }
}

// ---------------------------------------------------------------------------
// Session coverage: which majlis treats a given āya
// ---------------------------------------------------------------------------
// DERIVED_LOCI above resolves a verse to the PARAGRAPH that quotes it, which
// only exists where the automated matcher found the quotation -- 784 verses.
// But the fifty-seven sessions run consecutively through the whole muṣḥaf, so
// for any āya there is a session that treats it, whether or not a quotation
// was matched inside it. lessonRanges.json records each session's span, chained
// from the sessions' own verseRange fields; the chain closes with no gaps from
// 1:1 to 114:6 and sums to 6,236 āyāt, which is the Ḥafṣ total -- so the
// tiling is complete and self-consistent.
//
// This is a COVERAGE claim, not a located citation: it says the session
// commenting on this stretch is Lesson N, opening at vol. X p. Y. It is not a
// claim that a discrete comment on this one āya sits at that page. So it is
// emitted only where nothing located exists, always at `auto`, and always with
// the distinction written into the note.
//
// `exact` marks the thirty-one sessions whose own verseRange gives explicit
// āya numbers. The remaining twenty-six are titled by sūra only, so their
// bounds come from chaining and are reliable in the interior of a session and
// soft at its edges.

interface LessonRange {
  start: [number, number];
  end: [number, number];
  exact: boolean;
  volume: number | null;
  page: number | null;
  /** Āyāt inside the span. */
  span?: number;
  /** How many of those are actually quoted in the transcription. */
  attested?: number;
}

// JSON widens the two-element arrays to number[], so the cast goes through
// unknown rather than pretending the import already has tuple types.
const LESSON_RANGES: [number, LessonRange][] = Object.entries(
  lessonRangesRaw as unknown as Record<string, LessonRange>
)
  .map(([k, v]) => [Number(k), v] as [number, LessonRange])
  .sort((a, b) => a[0] - b[0]);

const RANGE_WITNESS = 'fi-riyad-tunis-2022';

function withinRange(surah: number, ayah: number, r: LessonRange): boolean {
  const afterStart =
    surah > r.start[0] || (surah === r.start[0] && ayah >= r.start[1]);
  const beforeEnd = surah < r.end[0] || (surah === r.end[0] && ayah <= r.end[1]);
  return afterStart && beforeEnd;
}

/** The session whose span contains this āya, or undefined. */
export function sessionForVerse(
  surah: number,
  ayah: number
): { lessonId: number; range: LessonRange } | undefined {
  const hit = LESSON_RANGES.find(([, r]) => withinRange(surah, ayah, r));
  return hit ? { lessonId: hit[0], range: hit[1] } : undefined;
}

const COVERAGE_LOCI: Locus[] = LESSON_RANGES.map(([lessonId, r]) => ({
  id: `firiyad-session-${lessonId}`,
  witnessId: RANGE_WITNESS,
  address: {
    lesson: lessonId,
    volume: r.volume ?? undefined,
    page: r.page ?? undefined,
    raw:
      r.volume != null && r.page != null
        ? `Lesson ${lessonId} — vol. ${r.volume}, p. ${r.page}`
        : `Lesson ${lessonId}`,
  },
  transcriptionStatus: 'none',
}));

const ALL_LOCI = new Map<string, Locus>(
  corpus.loci
    .concat(DERIVED_LOCI)
    .concat(COVERAGE_LOCI)
    .map(l => [l.id, l] as [string, Locus])
);

export function getLocus(id: string): Locus | undefined {
  return ALL_LOCI.get(id);
}

// ---------------------------------------------------------------------------
// The reverse index: āya -> links
// ---------------------------------------------------------------------------
// A link may span a range (ayahStart..ayahEnd), so every verse in the range is
// indexed. Built once at module load.

const BY_VERSE = new Map<string, VerseLink[]>();

function keyOf(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}

for (const link of corpus.verseLinks.concat(DERIVED_LINKS)) {
  const end = link.ayahEnd ?? link.ayahStart;
  for (let a = link.ayahStart; a <= end; a++) {
    const k = keyOf(link.surah, a);
    const bucket = BY_VERSE.get(k);
    if (bucket) bucket.push(link);
    else BY_VERSE.set(k, [link]);
  }
}

export function getVerseLinks(surah: number, ayah: number): VerseLink[] {
  return BY_VERSE.get(keyOf(surah, ayah)) ?? [];
}

/** Every āya that has at least one link, as `${surah}:${ayah}` keys. */
export function indexedVerses(): string[] {
  return Array.from(BY_VERSE.keys());
}

/**
 * Āyāt with at least one link from a work OTHER than the Fī Riyāḍ
 * transcription -- i.e. the cross-corpus ones, which are the whole point of
 * this route and the only ones worth prerendering. Everything else renders on
 * demand.
 */
export function crossCorpusVerses(): { surah: number; ayah: number }[] {
  const out: { surah: number; ayah: number }[] = [];
  Array.from(BY_VERSE.entries()).forEach(([k, links]: [string, VerseLink[]]) => {
    const hasOther = links.some((l: VerseLink) => {
      const locus = ALL_LOCI.get(l.locusId);
      return Boolean(locus) && locus!.witnessId !== 'fi-riyad-site-transcription';
    });
    if (!hasOther) return;
    const parts = k.split(':').map(Number);
    out.push({ surah: parts[0], ayah: parts[1] });
  });
  return out.sort((x, y) => x.surah - y.surah || x.ayah - y.ayah);
}

// ---------------------------------------------------------------------------
// The view model
// ---------------------------------------------------------------------------

/** A locus resolved with its witness, work and link, ready to render. */
export interface VerseEntry {
  link: VerseLink;
  locus: Locus;
  witness: Witness;
  work: Work;
  occasion?: Occasion;
  /** False when the words are a student's rather than Shaykh Ibrahim's. */
  isNiasse: boolean;
  /** Sort key: Gregorian year of composition, or +Infinity if undatable. */
  year: number;
  /** Human-readable date for display. */
  dateLabel: string;
  /**
   * Whether there is anything to READ here. False for loci we know exist but
   * have not ingested, and for material that has never been located at all.
   * The interface lists these rather than hiding them: a silent gap reads as
   * "he never said anything here", which would be false.
   */
  hasText: boolean;
}

/**
 * Display order of the acts. Exegesis first, because a reader arriving at a
 * verse page wants the commentary on the verse before the uses of it.
 */
export const ACT_ORDER: ExegeticalAct[] = [
  'tafsir',
  'gloss',
  'prooftext',
  'juristic',
  'poetic',
  'lemma',
];

export const ACT_LABEL: Record<ExegeticalAct, string> = {
  tafsir: 'tafsīr',
  gloss: 'gloss',
  prooftext: 'proof-text',
  juristic: 'juristic',
  poetic: 'poetic',
  lemma: 'lemma',
};

export const ACT_HEADING: Record<ExegeticalAct, string> = {
  tafsir: 'Exegesis of the verse',
  gloss: 'Glossed in passing',
  prooftext: 'The verse used, not interpreted',
  juristic: 'The verse as legal proof',
  poetic: 'The verse in verse',
  lemma: 'Quoted as a heading',
};

export const ACT_BLURB: Record<ExegeticalAct, string> = {
  tafsir:
    'Sustained interpretation of the verse as a verse — lemma, gloss, expansion.',
  gloss:
    'A single interpretive equivalence, often a received one, rather than commentary proper.',
  prooftext:
    'Here the verse warrants a claim argued from other authorities. It is not the object of commentary.',
  juristic: 'The verse standing as the dalīl of a legal ruling.',
  poetic:
    'The verse as structure — acrostic, tawassul, or the letters themselves — not as an object of interpretation.',
  lemma: 'Quoted as a heading or a recitation cue, without comment.',
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  curated: 'verified',
  auto: 'matched, unchecked',
  reported: 'reported',
};

export const DERIVATION_LABEL = 'session coverage';
export const DERIVATION_NOTE =
  'Not found in the text. The session running through this stretch of the muṣḥaf is ' +
  'Lesson N, so the commentary on this āya is there; where on the page has not been located.';

export const CONFIDENCE_NOTE: Record<Confidence, string> = {
  curated: 'This attribution was checked against the text by a human.',
  auto:
    'Produced by the automated citation matcher and never individually checked. A paragraph can cover more than one verse.',
  reported:
    'Asserted by a catalogue or by secondary scholarship, and not verified against the text.',
};

/** Best-effort Gregorian year for ordering. Undatable sorts last. */
function yearOf(work: Work): number {
  const g = work.composed?.gregorian;
  if (!g) return Number.POSITIVE_INFINITY;
  const m = g.match(/\d{4}/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
}

function dateLabelOf(work: Work, witness: Witness): string {
  const c = work.composed;
  if (c?.hijri && c?.gregorian) return `${c.hijri} / ${c.gregorian}`;
  if (c?.gregorian) return c.gregorian;
  if (c?.hijri) return c.hijri;
  if (witness.year) return witness.year;
  return 'undated';
}

/** Resolve every link on a verse into a renderable entry. */
export function getVerseEntries(surah: number, ayah: number): VerseEntry[] {
  const out: VerseEntry[] = [];
  for (const link of getVerseLinks(surah, ayah)) {
    const locus = getLocus(link.locusId);
    if (!locus) continue;
    const witness = getWitness(locus.witnessId);
    if (!witness) continue;
    const work = getWork(witness.workId);
    if (!work) continue;
    out.push({
      link,
      locus,
      witness,
      work,
      occasion: getOccasion(locus.occasionId ?? witness.occasionId),
      isNiasse: (work.relation ?? 'self') !== 'student',
      year: yearOf(work),
      dateLabel: dateLabelOf(work, witness),
      hasText: Boolean(locus.textAr || locus.textEn) ||
        witness.id === 'fi-riyad-site-transcription',
    });
  }

  // Session coverage, only where nothing located in Fī Riyāḍ already stands.
  // Adding it alongside a matched paragraph would say the same thing twice,
  // less precisely.
  const haveFiRiyad = out.some(e => e.work.id === 'fi-riyad');
  if (!haveFiRiyad) {
    const session = sessionForVerse(surah, ayah);
    const locus = session && getLocus(`firiyad-session-${session.lessonId}`);
    const witness = locus && getWitness(locus.witnessId);
    const work = witness && getWork(witness.workId);
    if (session && locus && witness && work) {
      const { lessonId, range } = session;
      out.push({
        link: {
          locusId: locus.id,
          surah,
          ayahStart: ayah,
          type: 'tafsir',
          confidence: 'auto',
          derivation: 'session-range',
          rasm: 'hafs',
          note: coverageNote(lessonId, range),
        },
        locus,
        witness,
        work,
        occasion: getOccasion(locus.occasionId ?? witness.occasionId),
        isNiasse: true,
        year: yearOf(work),
        dateLabel: dateLabelOf(work, witness),
        hasText: false,
      });
    }
  }
  return out;
}

function fmt(v: [number, number]): string {
  return `Q ${v[0]}:${v[1]}`;
}

/**
 * The wording here was wrong in the first cut and the correction matters.
 *
 * It said Lesson N "is the session that treats this āya", which reads as a
 * claim that a comment on this verse exists at that page. The sessions do tile
 * the muṣḥaf, but they do not comment on every āya they pass over: across the
 * corpus only 1,228 of the 6,236 āyāt inside the session spans are quoted
 * anywhere in the transcription, and that count is generous (it includes the
 * fuzzy match tier, which is excluded from everything else public-facing).
 *
 * The distribution is the real finding. Lesson 2 quotes all twenty āyāt in its
 * span; Lesson 43 quotes 25 of 345. The 1383/1964 cycle runs the whole Qurʾān
 * in fifty-seven majālis, so it is close to verse-by-verse through al-Baqara
 * and increasingly selective thereafter. A reader looking for Q 36:39 should
 * be told that plainly, not sent to vol. 8 p. 55 on a promise.
 */
function coverageNote(lessonId: number, r: LessonRange): string {
  const bounds = `${fmt(r.start)}–${fmt(r.end)}`;
  const density =
    r.span && r.attested !== undefined
      ? ` Of the ${r.span} āyāt in that span, ${r.attested} are quoted in the transcription; ` +
        'this one is not among them, so whether he comments on it is not established.'
      : '';
  const provenance = r.exact
    ? `Lesson ${lessonId} runs from ${bounds}.`
    : `Lesson ${lessonId} is titled by sūra rather than by āya; its bounds (${bounds}) are ` +
      'inferred from where the neighbouring sessions begin, so they are soft at the edges.';
  return (
    `${provenance}${density} The page given is where the lesson opens — start there and read on.`
  );
}

/** Split Shaykh Ibrahim's own loci from the school's. */
export function splitBySpeaker(entries: VerseEntry[]) {
  return {
    niasse: entries.filter(e => e.isNiasse),
    school: entries.filter(e => !e.isNiasse),
  };
}

/** Entries grouped by act, in ACT_ORDER, each group ordered oldest first. */
export function groupByAct(
  entries: VerseEntry[]
): { act: ExegeticalAct; entries: VerseEntry[] }[] {
  return ACT_ORDER.map(act => ({
    act,
    entries: entries
      .filter(e => e.link.type === act)
      .sort((a, b) => a.year - b.year),
  })).filter(g => g.entries.length > 0);
}

/** One mark per work on the career timeline, oldest first. */
export interface TimelineMark {
  workId: string;
  label: string;
  year: number;
  dateLabel: string;
  hasText: boolean;
  detail: string;
}

export function timelineMarks(entries: VerseEntry[]): TimelineMark[] {
  const byWork = new Map<string, VerseEntry[]>();
  for (const e of entries) {
    const bucket = byWork.get(e.work.id);
    if (bucket) bucket.push(e);
    else byWork.set(e.work.id, [e]);
  }
  const marks: TimelineMark[] = [];
  Array.from(byWork.entries()).forEach(([workId, group]: [string, VerseEntry[]]) => {
    const first = group[0];
    if (!Number.isFinite(first.year)) return;
    const shortTitle =
      first.work.titleTranslit?.split(/\s+/).slice(0, 2).join(' ') ?? workId;
    const anyText = group.some((g: VerseEntry) => g.hasText);
    marks.push({
      workId,
      label: shortTitle,
      year: first.year,
      dateLabel: first.dateLabel,
      hasText: anyText,
      detail:
        `${first.work.titleTranslit ?? workId}, ${first.dateLabel}. ` +
        `${group.length} ${group.length === 1 ? 'locus' : 'loci'}, ` +
        `${ACT_LABEL[first.link.type]}.` +
        (anyText ? '' : ' Text not yet available.'),
    });
  });
  return marks.sort((a, b) => a.year - b.year);
}
