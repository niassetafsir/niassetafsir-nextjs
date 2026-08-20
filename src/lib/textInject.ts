// Pure text-transform helpers shared between the 'use client' bilingual
// reading views (BilingualText.tsx, SurahReader.tsx) and server-rendered
// pages (the print page) that need the SAME footnote-link / verse-number /
// quranic-verse-highlight treatment applied to Arabic and English text.
// Deliberately no 'use client' directive here -- these are plain string
// functions, safe to call from a Server Component, which a 'use client'
// module's exports are not guaranteed to be.

// Poem pattern — the opening invocation present in every lesson
const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;

export function isPoem(text: string) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

export function highlightEnVerses(html: string): string {
  // Mirror the Arabic «...» quranic-verse treatment (see injectFootnoteLinks
  // below) on the English side: the translator renders quoted Qur'anic
  // clauses in parentheses. Skip short parenthetical glosses that are just a
  // single italicized transliterated term, e.g. "(<em>wujūb</em>)" -- those
  // are technical-term glosses, not verse quotations, and shouldn't be
  // colored as one. This is a heuristic, not a perfect classifier -- a few
  // longer glosses may still get colored; nothing is removed or altered,
  // only wrapped for styling.
  return html.replace(/\(([^()]{1,700})\)/g, (match, inner) => {
    const isBareItalicGloss = /^<em>[^<]*<\/em>$/.test(inner.trim());
    const plainWords = inner.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean);
    if (isBareItalicGloss || plainWords.length < 3) return match;
    return `<span class="quranic-verse">(${inner})</span>`;
  });
}

export function stripEnFootnotes(html: string): string {
  // Remove the compiled footnote block (en-footnotes div) from display
  // Keep only the inline superscript links in body text
  return html.replace(/<div class="en-footnotes"[\s\S]*?<\/div>\s*(?=<|$)/g, '')
             .replace(/<div class="en-footnotes"[\s\S]*/g, '');
}

export function injectFootnoteLinks(text: string, lessonId?: number, footnoteOrder?: string[], cursor?: { i: number }): string {
  if (!lessonId) return text;

  // Strip inline bibliographic refs like "تفسير القرطبي ج35/" before [N]
  // Uses Unicode code points to avoid regex literal issues in TSX
  // Strip inline bibliographic citations: "scholartitle ج35/" or "188-185/" before [N]
  // Only matches short citation refs (1-5 Arabic words + vol/page), not Quranic verses
  const bibPattern = /(?:[؀-ۿ]+\s+){0,4}[؀-ۿ]*\s*(?:ج\s*\d[\d\s/]*|\d+\s*[-–]\s*\d+\s*\/\s*\d*)\s*(?=\[\d+\])/g;
  let result = text.replace(bibPattern, '');

  // Convert [N] to footnote superscript links
  result = result.replace(/\[(\d+)\]/g, (_match, num) => {
    let id = `fn-${lessonId}-${num}`;
    if (footnoteOrder && cursor && cursor.i < footnoteOrder.length) {
      id = footnoteOrder[cursor.i];
      cursor.i += 1;
    }
    // The href stays a real link to the apparatus: it is the fallback without
    // JS, it is what a middle-click or cmd-click should do, and the print page
    // has no panel to switch to. data-fn is what LessonExperience delegates on,
    // so an ordinary click opens the footnote in the Citations panel on this
    // page rather than navigating the reader out of the lesson.
    return `<a href="/footnotes#${id}" data-fn="${id}" class="fn-superscript" title="Footnote ${num}">[${num}]</a>`;
  });

  // Wrap Quranic verse citations «...» in colour span
  result = result.replace(/«([^»]{3,300})»/g, (_match, verse) => {
    return `<span class="quranic-verse">«${verse}»</span>`;
  });

  return result;
}

// Appends a small verse-number badge right after a matched Qur'anic
// citation, for views that render the FULL Arabic paragraph text --
// SurahReader.tsx, BilingualText.tsx's own bilingual/Arabic views, and the
// print page.
//
// paraCitations is spanIndex(as string) -> "surah:ayah", high-confidence
// matches only -- see src/data/verseCitations.json. The regex bounds and
// leak-guard below MUST mirror scripts/match-verses.js's own span-matching
// exactly, since that's what indexed spanIndex in the first place -- paren
// matches first (left to right), then guillemet matches (left to right),
// sharing one running counter; anything the leak-guard rejects (a stray
// '.', '{', or '}' inside -- an OCR-mangled bracket pairing with real
// commentary prose swept up in between) is skipped without incrementing
// the counter, same as the indexing script dropping it from its output.
export function injectVerseNumbers(text: string, paraCitations?: Record<string, string>): string {
  if (!paraCitations || Object.keys(paraCitations).length === 0) return text;

  let spanIndex = 0;
  const withVerse = (full: string, inner: string) => {
    const span = inner.trim();
    if (/[.{}]/.test(span)) return full;
    const verse = paraCitations[String(spanIndex)];
    spanIndex += 1;
    return verse ? `${full}<sup class="verse-ref">${verse}</sup>` : full;
  };

  let result = text.replace(/\(([^()]{2,400})\)/g, withVerse);
  result = result.replace(/«([^»]{2,400})»/g, withVerse);
  return result;
}
