// Per-lesson verse index: maps each Qur'anic verse discussed in a lesson to
// the paragraph (in BilingualText's `commentaryParagraphs` / `ar-para-N` id
// scheme) where it is FIRST quoted, so a verse-jump bar can scroll straight
// to it -- Jalalayn-style, per-ayah navigation, layered on top of Niasse's
// lesson-based oral commentary rather than restructuring it.
//
// Built by matching the Arabic «guillemet»-quoted Qur'anic clauses embedded
// in each lesson's commentary against a reference Qur'an text (Hafs ʿan
// ʿĀṣim, Uthmani script, via api.alquran.cloud). CAVEAT: the site's own
// Arabic edition follows the Warsh ʿan Nāfiʿ rasm (per the About page), and
// Warsh/Hafs verse-numbering conventions diverge in a handful of places
// across the Qur'an (content is nearly identical; verse-boundary numbering
// is not always). Treat these verse numbers as reading-navigation aids, not
// citation-grade until spot-checked against the print edition's own
// numbering.
//
// paraIndex is 0-based, matching the index BilingualText.tsx assigns after
// filtering poem/basmala lines out of arabicBody||arabicText.split('\n').

export interface VerseIndexEntry {
  /** e.g. "2:26" */
  verse: string;
  /** 0-based index into commentaryParagraphs / id="ar-para-{paraIndex}" */
  paraIndex: number;
  /** Set when the match is uncertain (partial quote, compound citation, etc.) */
  uncertain?: boolean;
}

export const VERSE_INDEX: Record<number, VerseIndexEntry[]> = {};
