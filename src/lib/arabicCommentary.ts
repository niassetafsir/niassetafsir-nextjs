// Server-only utility: splits Niasse's full Arabic commentary text into an
// ordered list of paragraphs (opening istiʿādha/ṣalawāt/poem lines filtered
// out separately), for display on the lesson page and the print page.
//
// History: this module used to be quranicFragments.ts and REDUCED the
// commentary down to just its literal Qur'anic-verse-citation fragments,
// out of caution about reproduction rights for the Majmaʿ al-Yamāma 2010
// revised print edition's specific Arabic commentary text (the bare Qur'an
// quoted inside it carries no such restriction regardless, since Qur'anic
// text itself isn't copyrightable). AK -- the project's translator/editor,
// who holds the relevant rights -- confirmed on 2026-08-16 that the full
// commentary text may be published site-wide; see CLAUDE.md ("Full Arabic
// commentary text published site-wide"). This module now returns the full
// paragraph text instead of redacting it. SurahReader.tsx / SurahLessonData
// already rendered lesson.arabicBody in full and unredacted before this
// change -- that was the tell that the old redaction was incompletely
// applied, not evidence it was safe to skip fixing here too.

const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;

function isPoem(text: string) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

export interface ArabicCommentary {
  /** Opening istiʿādha/basmala/poem lines -- formulaic liturgical text, not
   *  original commentary -- shown separately, above the bilingual columns. */
  poemLines: string[];
  /** Full commentary paragraphs, in document order, poem lines removed.
   *  Index-parallel to VERSE_INDEX paraIndex and to verseCitations.json's
   *  per-paragraph keys -- do not change the filtering logic here without
   *  also checking those (src/lib/verseIndex.ts, src/data/verseCitations.json). */
  paragraphs: string[];
}

export function splitArabicCommentary(raw: string): ArabicCommentary {
  const allParagraphs = raw.split('\n').filter(p => p.trim());
  const poemLines = allParagraphs.filter(isPoem);
  const paragraphs = allParagraphs.filter(p => !isPoem(p));
  return { poemLines, paragraphs };
}
