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
// KNOWN GAP: the English translation appears to skip a substantive
// discussion of verses 1:3 (al-Raḥmān al-Raḥīm) and 1:4 (Māliki yawmi
// l-dīn) that IS present in the Arabic (paragraph 67, which walks through
// al-ḥamd / rabb al-ʿālamīn / al-Raḥmān al-Raḥīm / māliki yawmi l-dīn in
// sequence). English paragraph 26 ("...Lord of all the worlds") jumps
// directly to paragraph 29 ("You alone we worship"), i.e. from verse 2
// straight to verse 5, with no equivalent English paragraph for verses 3-4
// in between. This is left as a genuine, disclosed gap (empty array) below
// rather than papered over with a wrong or duplicated excerpt -- the UI
// (JalalaynVerseView) shows an explicit "translation not yet available for
// this verse" note when `en` is null instead of silently reusing another
// verse's English text, which is the exact bug this file exists to fix.

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
  '1:1': [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  '1:2': [26, 27, 28],
  '1:3': [], // gap -- see file header
  '1:4': [], // gap -- see file header
  '1:5': [29, 30, 31],
  '1:6': [32, 33],
  // Paragraph 32 is the combined verse-6/verse-7 quotation ("...the path of
  // those upon whom You have bestowed favor..."), shared with 1:6 above;
  // 34 is verse 7's specific exegesis.
  '1:7': [32, 34],
};
