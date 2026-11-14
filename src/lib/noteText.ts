/**
 * The scan split combining marks off their letters in the compiler's notes, so
 * the name of Allah reads `الل ّٰ ه` -- a shadda-with-dagger-alif standing alone
 * between two spaces. Rejoin a mark cluster only when it is isolated on both
 * sides; a mark ending a vocalised word and followed by a space is left alone,
 * so no two words are ever run together. The same repair the print build made
 * on 16 Oct 2026, applied here at display time.
 */
const ISOLATED_MARKS = /\s([\u064B-\u065F\u0670]+)\s/g;

export function cleanNoteArabic(text: string): string {
  return text.replace(ISOLATED_MARKS, '$1');
}
