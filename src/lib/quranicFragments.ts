// Server-only utility: reduces Niasse's full Arabic commentary text down to
// just the literal Qur'anic verse-citation fragments quoted inside it
// (parenthesised / guillemet-quoted / brace-quoted spans), for public
// display. AK holds translation + digital-publication rights to the tafsīr
// project itself, but the specific Majma' al-Yamama 2010 revised print
// edition's Arabic commentary text is a distinct, recent publication whose
// reproduction rights haven't been separately confirmed -- the bare Qur'an
// verses quoted inside it carry no such restriction regardless, since the
// Qur'anic text itself is not subject to copyright.
//
// IMPORTANT: this must run server-side (in a Server Component, e.g.
// src/app/lesson/[id]/page.tsx) and only the *output* of this function may
// be passed down into 'use client' components like BilingualText. Passing
// the raw arabicBody/arabicText into a client component would still ship
// the full text to the browser via React's props serialization even if the
// client only ever *renders* a subset of it -- the redaction has to happen
// before the client boundary, not after.

const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;

function isPoem(text: string) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

// Same citation-marker convention already used (by hand) to build
// src/lib/verseIndex.ts: Qur'anic clauses in this corpus are quoted in
// plain parentheses, guillemets, or occasionally stray braces (OCR
// artifacts around a paren-quoted span). Matching all three keeps this
// aligned with the existing VERSE_INDEX paraIndex values without needing
// them recomputed.
function extractSpans(paragraph: string): string[] {
  const spans: string[] = [];
  const patterns = [/\(([^()]{2,400})\)/g, /«([^»]{2,400})»/g, /\{([^{}]{2,400})\}/g];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(paragraph))) spans.push(m[1].trim());
  }
  return spans;
}

export interface RedactedLessonText {
  /** Opening istiʿādha/basmala/poem lines -- formulaic liturgical text, not
   *  original commentary, shown in full as before. */
  poemLines: string[];
  /** Parallel to the original (post-poem-filter) commentary paragraph array.
   *  '' where no Qur'anic citation was found in that paragraph -- so
   *  VERSE_INDEX paraIndex values still point at the right slot even though
   *  most slots are now empty and unrendered. */
  fragments: string[];
}

export function redactToQuranicFragments(raw: string): RedactedLessonText {
  const allParagraphs = raw.split('\n').filter(p => p.trim());
  const poemLines = allParagraphs.filter(isPoem);
  const commentaryParagraphs = allParagraphs.filter(p => !isPoem(p));
  const fragments = commentaryParagraphs.map(p => extractSpans(p).join('  ·  '));
  return { poemLines, fragments };
}
