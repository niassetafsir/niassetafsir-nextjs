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

import autoIndexRaw from '@/data/verseIndexAuto.json';

export interface VerseIndexEntry {
  /** e.g. "2:26" */
  verse: string;
  /** 0-based index into commentaryParagraphs / id="ar-para-{paraIndex}" */
  paraIndex: number;
  /** Set when the match is uncertain (partial quote, compound citation, etc.) */
  uncertain?: boolean;
}

// Lessons 1-3 below were hand-curated/spot-checked (see the comments on
// each). Lessons 4-56 are filled in from the automated citation matcher
// (scripts/match-verses.js + scripts/build-verse-citations.js), using only
// its high-confidence (substring/pair) matches -- see the 2026-08-16 review
// notes in match-verses.js for what that excludes and why. Always marked
// uncertain: true, since these haven't been individually spot-checked the
// way 1-3 were, and a paragraph can plausibly cover more than one verse.
const HAND_CURATED_VERSE_INDEX: Record<number, VerseIndexEntry[]> = {
  1: [
    { verse: '1:1', paraIndex: 29, uncertain: true },
    { verse: '1:2', paraIndex: 58, uncertain: true },
    { verse: '1:3', paraIndex: 58, uncertain: true },
    { verse: '1:4', paraIndex: 58, uncertain: true },
    { verse: '1:5', paraIndex: 59, uncertain: true },
    { verse: '1:6', paraIndex: 59, uncertain: true },
    { verse: '1:7', paraIndex: 60, uncertain: true },
    { verse: '2:1', paraIndex: 73, uncertain: true },
    { verse: '2:2', paraIndex: 73, uncertain: true },
    { verse: '2:3', paraIndex: 73, uncertain: true },
    { verse: '2:4', paraIndex: 74, uncertain: true },
    { verse: '2:5', paraIndex: 75, uncertain: true },
  ],
  // Recomputed against `arabicBody` (the field the site actually renders),
  // not `arabicText` -- the two have different paragraph layouts for this
  // lesson (arabicText also turned out to be truncated mid-lesson and to
  // contain inline footnote fragments arabicBody omits). Several verses
  // share a paraIndex because Niasse's commentary bundles them into one
  // dense paragraph; those are marked uncertain since the jump lands on a
  // paragraph covering more than one verse.
  2: [
    { verse: '2:6', paraIndex: 0 },
    { verse: '2:7', paraIndex: 9, uncertain: true },
    { verse: '2:8', paraIndex: 9, uncertain: true },
    { verse: '2:9', paraIndex: 9, uncertain: true },
    { verse: '2:10', paraIndex: 9, uncertain: true },
    { verse: '2:11', paraIndex: 10, uncertain: true },
    { verse: '2:12', paraIndex: 10, uncertain: true },
    { verse: '2:13', paraIndex: 10, uncertain: true },
    { verse: '2:14', paraIndex: 10, uncertain: true },
    { verse: '2:15', paraIndex: 10, uncertain: true },
    { verse: '2:16', paraIndex: 12, uncertain: true },
    { verse: '2:17', paraIndex: 12, uncertain: true },
    { verse: '2:18', paraIndex: 12, uncertain: true },
    { verse: '2:19', paraIndex: 12, uncertain: true },
    { verse: '2:20', paraIndex: 14 },
    { verse: '2:21', paraIndex: 23 },
    { verse: '2:22', paraIndex: 24 },
    { verse: '2:23', paraIndex: 33 },
    { verse: '2:24', paraIndex: 35 },
    { verse: '2:25', paraIndex: 37 },
  ],
  3: [
    { verse: '2:26', paraIndex: 0 },
    { verse: '2:27', paraIndex: 5, uncertain: true },
    { verse: '2:28', paraIndex: 5, uncertain: true },
    { verse: '2:29', paraIndex: 8, uncertain: true },
    { verse: '2:30', paraIndex: 8, uncertain: true },
    { verse: '2:31', paraIndex: 10, uncertain: true },
    { verse: '2:32', paraIndex: 10, uncertain: true },
    { verse: '2:33', paraIndex: 12, uncertain: true },
    { verse: '2:34', paraIndex: 29, uncertain: true },
    { verse: '2:35', paraIndex: 34, uncertain: true },
    // 2:36-2:59 not yet extracted -- falls back to lesson-top landing.
  ],
};

const AUTO_VERSE_INDEX = autoIndexRaw as unknown as Record<string, VerseIndexEntry[]>;

// Merge: hand-curated lessons win outright (their entries are never mixed
// with or overridden by the automated ones, even partially) -- everything
// else falls back to the automated index when available.
export const VERSE_INDEX: Record<number, VerseIndexEntry[]> = { ...HAND_CURATED_VERSE_INDEX };
for (const key of Object.keys(AUTO_VERSE_INDEX)) {
  const lessonId = Number(key);
  if (HAND_CURATED_VERSE_INDEX[lessonId]) continue;
  VERSE_INDEX[lessonId] = AUTO_VERSE_INDEX[key];
}
