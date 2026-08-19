// Hand-curated, paragraph-level mapping of Shaykh Ibrāhīm's Lesson 1
// commentary (on Sūrat al-Fātiḥa specifically) to individual verses, for the
// per-verse Jalālayn / Rūḥ al-Bayān comparison panels
// (src/components/JalalaynVerseView.tsx via src/lib/niasseVerseExcerpt.ts).
//
// Built 2026-08-16 by close reading of Lesson 1's full Arabic (arabicBody)
// and English (englishText) commentary, cross-checked against the verse
// boundaries already established in src/lib/verseIndex.ts's hand-curated
// entries for lesson 1 (paraIndex 29/58/59/60 for verses 1:1 / 1:2-4 / 1:5-6
// / 1:7).
//
// WHY HAND-CURATED RATHER THAN ALGORITHMIC: this replaces a real bug (AK,
// 2026-08-16 live-site report): the comparison panels were showing the same
// static excerpt of Niasse's Arabic commentary -- and the same static
// English excerpt -- under every single verse, and the Arabic/English
// excerpts didn't correspond to the same content as each other either. The
// root cause was JalalaynVerseView.tsx computing ONE commentary excerpt for
// the whole lesson (via a crude indexOf('ينبغي'/'قال') heuristic on the
// Arabic, and the first 1000 characters of the English translation) and
// reusing it identically inside every per-verse card.
//
// A generic per-verse fix isn't safe here because Niasse's lecture doesn't
// discuss al-Fātiḥa's seven verses in one clean linear pass. He first
// classifies each verse briefly by rhetorical genre (arabicBody paragraphs
// 58-60 -- ḥamd/tawḥīd/waʿd/waʿīd/sharīʿa/ḥaqīqa/duʿāʾ/qiṣṣa/mawʿiẓa), then
// digresses into an unrelated ḥadīth about the five pillars of Islam
// (61-64), then returns for a second, more substantive pass of
// verse-by-verse exegesis (65-70). Several of his paragraphs bundle two or
// three verses together in one block of prose with no clean internal seam
// (e.g. paragraph 59 treats "iyyāka naʿbudu", "wa-iyyāka nastaʿīn", and
// "ihdinā l-ṣirāṭ al-mustaqīm" -- spanning verses 5 and 6 -- as one
// continuous unit). A generic "next verse starts here" algorithm over
// paragraph indices was tried and confirmed to badly over- and
// under-include: it pulls Sūrat al-Baqara's header paragraphs into verse
// 7's excerpt, and it omits the substantive second exegesis pass (65-67)
// for verses 2-4 entirely. The mapping below reflects an actual
// verse-by-verse reading of the prose instead.
//
// SCOPE: deliberately limited to Sūrat al-Fātiḥa (verses 1:1-1:7) -- lesson
// 1's commentary continues into the opening of al-Baqara (Q. 2:1-2:5), but
// that's out of scope until al-Baqara's own Jalālayn/Rūḥ al-Bayān Arabic
// text is transcribed (see src/data/jalalaynArabic/SOURCE.md /
// ruhAlBayanArabic/SOURCE.md -- not yet done for any sūrah but al-Fātiḥa).
//
// Paragraph indices below are 0-based into arabicBody.split('\n') after
// filtering poem/basmala lines -- the same "commentaryParagraphs" indexing
// verseIndex.ts and arabicCommentary.ts (formerly quranicFragments.ts) use (see src/lib/niasseVerseExcerpt.ts,
// which re-derives that same filtered array from arabicBody so these
// indices stay meaningful). English indices are 0-based into the
// <p class="en-para"> blocks of englishText, in document order.
//
// ENGLISH INDICES RE-ANCHORED 2026-08-19 -- READ THIS BEFORE TRUSTING THEM.
// The indices below were curated against a 37-paragraph English translation
// of Lesson 1. Commit cd03f3a replaced `englishText` with a different, fuller
// translation of the same lesson: 81 paragraphs, 46,963 characters against the
// former 22,854, running through to the closing invocation where the earlier
// one stopped partway. The old indices pointed into an array that no longer
// exists, so they have been re-derived by reading the new translation against
// ARABIC_PARAS (which is unchanged -- `arabicBody` was not touched).
//
// The re-anchoring is a close reading, not an algorithm, and it has NOT been
// checked by AK. Old -> new, for anyone auditing it:
//   1:1  13-25  ->  14-55    1:2  26-28  ->  56,58,59,60,61,62
//   1:5  29-31  ->  57,63    1:6  32,33  ->  57,64
//   1:7  32,34  ->  57,64,65
//
// THE OLD GAP AT 1:3 AND 1:4 IS CLOSED. The former translation skipped the
// discussion of al-Raḥmān al-Raḥīm and Māliki yawmi l-dīn that the Arabic
// carries in paragraph 67, and this file recorded that honestly as an empty
// array. The new translation has it: paragraph 62 walks through al-ḥamd /
// rabb al-ʿālamīn / al-Raḥmān al-Raḥīm / Māliki yawmi l-dīn in sequence, and
// paragraph 59 glosses the same four names against the five pillars. Both
// verses now point at real English.
//
// Where a verse still has no English, the UI (JalalaynVerseView) shows an
// explicit "translation not yet available for this verse" note rather than
// silently reusing another verse's text -- the bug this file exists to fix.

export const ARABIC_PARAS: Record<string, number[]> = {
  // Istiʿādha + basmala discussion, then sūrah-level front matter (names,
  // Meccan/Medinan status, virtues/faḍāʾil ḥadīths) -- kept attached to
  // verse 1:1 since there's no separate slot for sūrah-level material, same
  // convention already used in ruhAlBayanArabic/SOURCE.md.
  '1:1': Array.from({ length: 57 - 29 + 1 }, (_, i) => 29 + i),
  // Brief genre-classification pass (58) + detailed second-pass exegesis of
  // al-ḥamdu lillāhi rabbi l-ʿālamīn / al-raḥmāni l-raḥīm / māliki yawmi
  // l-dīn (65-67). Not further splittable at the paragraph level -- 67 in
  // particular walks through all three verses in one continuous block.
  '1:2': [58, 65, 66, 67],
  '1:3': [58, 65, 66, 67],
  '1:4': [58, 65, 66, 67],
  // "iyyāka naʿbudu wa-iyyāka nastaʿīn" (68) plus its mention in the brief
  // pass (59, shared with 1:6 -- see below).
  '1:5': [59, 68],
  // "ihdinā l-ṣirāṭ al-mustaqīm" (69) plus its mention in the brief pass
  // (59, shared with 1:5).
  '1:6': [59, 69],
  // "ṣirāṭ alladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā
  // l-ḍāllīn" (60-61) plus its mention in the detailed pass (69, shared
  // with 1:6) and the closing note on "āmīn" (70).
  '1:7': [60, 61, 69, 70],
};

export const ENGLISH_PARAS: Record<string, number[]> = {
  // Istiʿādha (14-27), basmala (28-41), then the sūra's own front matter --
  // names, Meccan status, faḍāʾil ḥadīths (42-55). Attached to 1:1 on the
  // same convention ARABIC_PARAS uses: sūrah-level material has no slot of
  // its own. Paragraphs 0-13 are the introduction on the science of tafsīr
  // and belong to no verse.
  '1:1': Array.from({ length: 55 - 14 + 1 }, (_, i) => 14 + i),
  // 56 is the genre-classification pass over al-ḥamd / rabb al-ʿālamīn /
  // al-raḥmān al-raḥīm / mālik yawm al-dīn; 58 closes it. 59 reads the same
  // four names against the five pillars, 60 supplies the elided "say", 61
  // defines ḥamd, 62 glosses each name in turn.
  '1:2': [56, 58, 59, 60, 61, 62],
  // 56, 59 and 62 each treat al-Raḥmān and al-Raḥīm explicitly.
  '1:3': [56, 59, 62],
  // 56, 59 and 62 each treat Māliki yawmi l-dīn explicitly; 62 carries the
  // longest gloss, on dominion and Q. 40:16.
  '1:4': [56, 59, 62],
  // 57 is the brief pass ("You alone we worship -- this is sharīʿa"), shared
  // with 1:6 and 1:7; 63 is the substantive treatment, where praise earns the
  // servant the address.
  '1:5': [57, 63],
  // 57 shared as above; 64 opens on "Guide us to the Straight Path".
  '1:6': [57, 64],
  // 64 runs on from 1:6 into "the path of those upon whom You have bestowed
  // Your grace" within the same paragraph, so it answers for 1:7 too; 65 is
  // verse 7's own exegesis and the closing note on āmīn.
  '1:7': [57, 64, 65],
};

// ---------------------------------------------------------------------------
// UNITS
// ---------------------------------------------------------------------------
//
// ARABIC_PARAS / ENGLISH_PARAS above are a *many-to-many* map: they answer
// "which paragraphs bear on this verse", and the same paragraph deliberately
// answers for several verses. That is right for annotating a verse, and wrong
// for paging, because a reader stepping 1:2 -> 1:3 -> 1:4 would be shown the
// identical block [58, 65, 66, 67] three times over and read it as a caching
// bug rather than as one passage covering three verses.
//
// UNITS is the *partition*: every paragraph belongs to exactly one unit, and
// the units follow the segmentation Niasse's own prose has. The boundaries are
// the ones src/lib/verseIndex.ts already discovered independently for lesson 1
// (its hand-curated entries break at paraIndex 29 / 58 / 59 / 60, i.e. at
// 1:1 | 1:2-4 | 1:5-6 | 1:7).
//
// TWO PARAGRAPHS HAD TO BE ASSIGNED RATHER THAN SHARED, and both calls are
// arguable -- flagged here rather than buried:
//
//   - Arabic 69 straddles the 1:6/1:7 boundary. It opens on "ihdinā l-ṣirāṭ
//     al-mustaqīm" and then runs on into "ṣirāṭ alladhīna anʿamta ʿalayhim"
//     within the same paragraph. ARABIC_PARAS gives it to both 1:6 and 1:7.
//     Here it goes to the 1:7 unit alone, where the bulk of its text sits.
//     Splitting the paragraph in the source would be the better fix and is
//     not attempted here.
//   - English 57 is the brief genre pass and covers 1:5, 1:6 and 1:7 in three
//     consecutive clauses. It goes to the 1:5-6 unit alone.
//   - English 64 straddles 1:6 and 1:7 the way Arabic 69 does, but the call
//     goes the other way: it stays with the 1:5-6 unit, because 63 breaks off
//     mid-thought and 64 finishes it. See the note on that unit below.
//
// SCOPE: lesson 1 / al-Fātiḥa only, for the same reason as the maps above --
// this segmentation came out of reading the prose, not out of an algorithm,
// and no other lesson has been read this way yet. Lessons without a UNITS
// entry fall back to the verse-rail presentation, which asserts no
// segmentation at all. See src/components/ComparativeCommentary.tsx.

export interface CommentaryUnitMap {
  /** Display label, e.g. "Q. 1:2–1:4". */
  label: string;
  /** Short gloss of what the unit covers, shown under the label. */
  gloss: string;
  /** Verse keys ("1:2") whose Jalālayn / Rūḥ al-Bayān glosses belong here. */
  verses: string[];
  /** Indices into the filtered Arabic commentary paragraphs. */
  ar: number[];
  /** Indices into the <p class="en-para"> blocks of englishText. */
  en: number[];
}

export const FATIHA_UNITS: CommentaryUnitMap[] = [
  {
    label: 'Q. 1:1',
    gloss: 'Istiʿādha, basmala, and the faḍāʾil of the sūra',
    verses: ['1:1'],
    ar: Array.from({ length: 57 - 29 + 1 }, (_, i) => 29 + i),
    en: Array.from({ length: 55 - 14 + 1 }, (_, i) => 14 + i),
  },
  {
    label: 'Q. 1:2–1:4',
    gloss: 'al-ḥamd · rabb al-ʿālamīn · al-raḥmān al-raḥīm · mālik yawm al-dīn',
    verses: ['1:2', '1:3', '1:4'],
    ar: [58, 65, 66, 67],
    en: [56, 58, 59, 60, 61, 62],
  },
  {
    label: 'Q. 1:5–1:6',
    gloss: 'iyyāka naʿbudu wa-iyyāka nastaʿīn · ihdinā l-ṣirāṭ al-mustaqīm',
    verses: ['1:5', '1:6'],
    ar: [59, 68],
    // 64 straddles 1:6 and 1:7. It goes here rather than to the 1:7 unit
    // because 63 ends mid-thought ("The servant then says:") and 64 completes
    // it -- splitting them would break the sentence across two pager cards.
    // The many-to-many map above still gives 64 to 1:7 as well.
    en: [57, 63, 64],
  },
  {
    label: 'Q. 1:7',
    gloss: 'ṣirāṭ alladhīna anʿamta ʿalayhim · the closing note on āmīn',
    verses: ['1:7'],
    ar: [60, 61, 69, 70],
    en: [65],
  },
];
