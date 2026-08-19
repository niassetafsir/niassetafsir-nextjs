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
