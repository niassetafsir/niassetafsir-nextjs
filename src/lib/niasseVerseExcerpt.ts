import { ARABIC_PARAS, ENGLISH_PARAS, FATIHA_UNITS } from './lesson1FatihaVerseMap';

// Must stay identical to the poem/basmala filter in verseIndex.ts's
// commentary-paragraph indexing and arabicCommentary.ts (formerly quranicFragments.ts) / BilingualText.tsx
// -- see CLAUDE.md's "Verse-citation system" section. Only used here to
// recover the SAME paragraph numbering src/lib/lesson1FatihaVerseMap.ts was
// hand-curated against.
const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;
function isPoem(t: string) {
  const s = t.trim();
  return POEM_PATTERN.test(s) || BASMALA_PATTERN.test(s);
}

export interface NiasseVerseExcerpt {
  ar: string | null;
  en: string | null;
}

// Per-verse Niasse excerpt (Arabic + English), hand-curated for Lesson 1 /
// Sūrat al-Fātiḥa only (see lesson1FatihaVerseMap.ts for the rationale).
// Returns null for any lesson this hasn't been curated for yet, or for any
// verse key with no entry, rather than falling back to a generic
// "beginning of the lesson" excerpt -- showing no verse-specific excerpt is
// more honest than showing the wrong one, which is the bug this replaces
// (AK, live-site report, 2026-08-16).
// Both arabicBody and englishText are normally injected via
// dangerouslySetInnerHTML elsewhere (BilingualText.tsx, the print page),
// which decodes HTML entities for free. Here the extracted paragraph text
// is rendered as a plain JSX text child ({excerpt.ar} / {excerpt.en}),
// which does NOT decode entities -- so &#x27; etc. would otherwise leak
// into the page verbatim (caught live 2026-08-16: "Allāh&#x27;s Name"
// instead of "Allāh's Name"). Decode numeric (decimal AND hex) entities
// plus the common named ones actually seen in the data.
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * The commentary-paragraph array that `paraIndex` counts into, everywhere on
 * this site: src/lib/verseIndex.ts, scripts/match-verses.js and
 * BilingualText.tsx all index the same filtered list. Exported so the
 * cross-corpus verse page (src/lib/corpus.ts, /verse/[surah]/[ayah]) can
 * resolve a Fī Riyāḍ locus to its actual paragraph WITHOUT adding a fourth
 * copy of the poem/basmala filter -- CLAUDE.md warns that these
 * implementations must stay byte-identical or verse numbers silently attach
 * to the wrong citation, and a fourth copy is a fourth thing to forget.
 */
export function commentaryParagraphs(arabicBody: string): string[] {
  return arabicBody
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .filter(p => p.trim())
    .filter(p => !isPoem(p))
    .map(decodeEntities);
}

/** Recover the same filtered paragraph arrays the hand-curated maps index into. */
function splitParagraphs(
  arabicBody: string,
  englishText: string | null | undefined
): { ar: string[]; en: string[] } {
  const ar = commentaryParagraphs(arabicBody);

  const en = englishText
    ? Array.from(englishText.matchAll(/<p class="en-para">([\s\S]*?)<\/p>/g)).map(m =>
        decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim()
      )
    : [];

  return { ar, en };
}

export function getNiasseVerseExcerpts(
  lessonId: number,
  arabicBody: string | null | undefined,
  englishText: string | null | undefined
): Record<string, NiasseVerseExcerpt> | null {
  if (lessonId !== 1 || !arabicBody) return null;

  const { ar: commentaryParagraphs, en: enParas } = splitParagraphs(arabicBody, englishText);

  const result: Record<string, NiasseVerseExcerpt> = {};
  for (const verse of Object.keys(ARABIC_PARAS)) {
    const arIdx = ARABIC_PARAS[verse] || [];
    const enIdx = ENGLISH_PARAS[verse] || [];
    const ar = arIdx.map(i => commentaryParagraphs[i]).filter(Boolean).join('\n\n');
    const en = enIdx.length > 0 ? enIdx.map(i => enParas[i]).filter(Boolean).join('\n\n') : null;
    result[verse] = { ar: ar || null, en };
  }
  return result;
}

/**
 * The curated Arabic and English for one āya of al-Fātiḥa, paired.
 *
 * The verse page picks its Arabic by paragraph: VERSE_INDEX resolves an āya to
 * the paragraph that quotes it, and the card shows that paragraph. There is no
 * English counterpart to a paragraph anywhere in this repository --
 * BILINGUAL_ALIGNMENT is empty, and the paragraph counts rule index pairing
 * out (Lesson 5 has 124 Arabic paragraphs against 28 English). So the card
 * cannot translate the paragraph it chose.
 *
 * It can show a pair that was curated as a pair. ARABIC_PARAS and
 * ENGLISH_PARAS were read against each other for Lesson 1, verse by verse, and
 * that is the one matched Arabic-and-English object this repository holds. The
 * verse page uses it for al-Fātiḥa and nothing else.
 *
 * THE GATE. These indices are coupled to `arabicBody` and have broken twice
 * (see lesson1FatihaVerseMap.ts). A stale index still returns a real
 * paragraph, so bounds-checking catches nothing -- the 2026-09 break put the
 * heading of البقرة under Q 1:7 and every array was in range. The check
 * has to be against the āya: does the curated Arabic contain a run of
 * consecutive words from the verse it claims to comment on? Where it does not,
 * this returns null and the card falls back to the Arabic paragraph alone.
 * The run is three words, or the whole āya where it is shorter -- Q 1:3 is
 * الرحمن الرحيم, two words, and cannot supply three.
 *
 * Q 1:5 fails the gate today and is meant to: its paragraph carries
 * إياك نعبد in OCR too damaged for any three-word run to survive. The gate
 * cannot tell scanning damage from drift, and silence is the right answer to
 * both.
 *
 * Q 1:1 is not paired at all. ARABIC_PARAS attaches the whole of the sura's
 * front matter to it -- 39 paragraphs, by the convention documented there --
 * so its block is not a comment on the basmala and 900 characters cut from its
 * opening would say nothing about the āya.
 */
const PAIRED_VERSES = new Set(['1:2', '1:3', '1:4', '1:5', '1:6', '1:7']);

/** Marks, tatwil and the pause signs, dropped before comparing. */
const AR_MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u0610-\u061A]/g;

/**
 * Enough normalisation to compare a printed āya against OCR of a lecture
 * quoting it: marks off, the alif forms and alif maqsura and ta marbuta
 * unified, hamza carriers dropped, everything but Arabic letters treated as a
 * space.
 */
function normalizeAr(s: string): string {
  return s
    .replace(AR_MARKS, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0624\u0626\u0621]/g, '')
    .replace(/[^\u0621-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Does `text` quote this āya -- a run of consecutive words, word-aligned? */
function quotesAya(text: string, ayaAr: string): boolean {
  const words = normalizeAr(ayaAr).split(' ').filter(Boolean);
  if (words.length === 0) return false;
  const run = Math.min(3, words.length);
  const hay = normalizeAr(text);
  for (let i = 0; i + run <= words.length; i++) {
    if (hay.includes(words.slice(i, i + run).join(' '))) return true;
  }
  return false;
}

export interface CuratedVersePair extends NiasseVerseExcerpt {
  /** First curated Arabic paragraph, so a deep link lands where the pair opens. */
  anchorPara: number;
}

/** The pair for this āya, or null where nothing confirms it. */
export function curatedFatihaPair(
  lessonId: number,
  verse: string,
  ayaAr: string | null | undefined,
  arabicBody: string | null | undefined,
  englishText: string | null | undefined
): CuratedVersePair | null {
  if (!ayaAr || !PAIRED_VERSES.has(verse)) return null;
  const all = getNiasseVerseExcerpts(lessonId, arabicBody, englishText);
  const pair = all?.[verse];
  if (!pair?.ar) return null;
  if (!quotesAya(pair.ar, ayaAr)) return null;
  const anchorPara = (ARABIC_PARAS[verse] ?? [])[0];
  if (anchorPara === undefined) return null;
  return { ar: pair.ar, en: pair.en, anchorPara };
}

/** One page of the unit pager: Niasse's own prose plus the verses it covers. */
export interface CommentaryUnit {
  label: string;
  gloss: string;
  /** Verse keys ("1:2") whose Jalālayn / Rūḥ al-Bayān glosses sit under this unit. */
  verses: string[];
  ar: string | null;
  en: string | null;
  /** Paragraph indices, surfaced in the UI so the segmentation stays inspectable. */
  arParas: number[];
  enParas: number[];
}

/**
 * Resolve the hand-curated unit partition for a lesson into actual text.
 *
 * Returns null for any lesson without a curated partition -- which today is
 * every lesson but the first. Callers must degrade to a presentation that
 * asserts no segmentation (the verse rail) rather than rendering an empty
 * pager: see src/components/ComparativeCommentary.tsx.
 */
export function getNiasseUnits(
  lessonId: number,
  arabicBody: string | null | undefined,
  englishText: string | null | undefined
): CommentaryUnit[] | null {
  if (lessonId !== 1 || !arabicBody) return null;

  const { ar: arParas, en: enParas } = splitParagraphs(arabicBody, englishText);

  const units = FATIHA_UNITS.map(u => ({
    label: u.label,
    gloss: u.gloss,
    verses: u.verses,
    ar: u.ar.map(i => arParas[i]).filter(Boolean).join('\n\n') || null,
    en: u.en.map(i => enParas[i]).filter(Boolean).join('\n\n') || null,
    arParas: u.ar,
    enParas: u.en,
  }));

  // If the paragraph indices no longer resolve -- which is what happens when
  // arabicBody is re-imported and its paragraph count shifts -- the maps are
  // stale and every excerpt would be wrong rather than merely missing. Fail
  // over to the unsegmented presentation instead of showing mismatched text.
  return units.some(u => u.ar) ? units : null;
}
