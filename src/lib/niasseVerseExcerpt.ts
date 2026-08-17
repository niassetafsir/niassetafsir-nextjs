import { ARABIC_PARAS, ENGLISH_PARAS } from './lesson1FatihaVerseMap';

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

export function getNiasseVerseExcerpts(
  lessonId: number,
  arabicBody: string | null | undefined,
  englishText: string | null | undefined
): Record<string, NiasseVerseExcerpt> | null {
  if (lessonId !== 1 || !arabicBody) return null;

  const commentaryParagraphs = arabicBody
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .filter(p => p.trim())
    .filter(p => !isPoem(p))
    .map(decodeEntities);

  const enParas = englishText
    ? Array.from(englishText.matchAll(/<p class="en-para">([\s\S]*?)<\/p>/g)).map(m =>
        decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim()
      )
    : [];

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
