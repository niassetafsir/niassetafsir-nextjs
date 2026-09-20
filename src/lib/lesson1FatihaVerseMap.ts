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
// 53-56 -- ḥamd/tawḥīd/waʿd/waʿīd/sharīʿa/ḥaqīqa/duʿāʾ/qiṣṣa/mawʿiẓa), then
// reads the same divine names against the five pillars of Islam (57-59),
// then returns for a second, more substantive pass of verse-by-verse
// exegesis (60-65). Several of his paragraphs bundle two or three verses
// together in one block of prose with no clean internal seam (e.g. paragraph
// 54 treats "iyyāka naʿbudu", "wa-iyyāka nastaʿīn", and "ihdinā l-ṣirāṭ
// al-mustaqīm" -- spanning verses 5 and 6 -- as one continuous unit, and 64
// runs from ihdinā straight through to wa-lā l-ḍāllīn). A generic "next verse
// starts here" algorithm over paragraph indices was tried and confirmed to
// badly over- and under-include: it pulls Sūrat al-Baqara's header paragraphs
// into verse 7's excerpt, and it omits the substantive second exegesis pass
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
// THE ARABIC INDICES HAVE NOW BROKEN TWICE. READ THIS BEFORE TRUSTING THEM.
//
// They are coupled to `arabicBody` and nothing enforces the coupling, so a
// rebuild of that field moves every index and the panels go on rendering
// plausible Arabic about the wrong verse. It has happened twice:
//
//   2026-08-19  `arabicBody` was rebuilt and the array shifted by about four.
//               Q 1:2-1:4 went to 65-67 and Q 1:5, 1:6, 1:7 to 68, 69, 70, so
//               four of the seven verses were showing commentary on a
//               different sura, including البقرة's bare verse count under
//               iyyāka naʿbudu. Corrected then to the indices this file carried
//               until September.
//
//   2026-09-20  A rescan repair removed one paragraph below index 54, and
//               every index from 54 up was one too high again. Q 1:5 showed
//               the clause belonging to 1:7 and the commentary on 1:6; Q 1:6
//               showed 1:7 twice; Q 1:7 showed a two-word orphan, the five
//               names paragraph belonging to 1:2-1:4, and the heading
//               سورة البقرة itself -- the same failure as 2026-08-19, from a
//               different cause. Every index >= 54 was decremented by one and
//               1:1's upper bound moved from 53 to 52.
//
// THE ANCHORS. Three fixed points locate the array without reading all of it.
// The genre pass, which opens فن الحمد and runs the nine sciences down
// the sura clause by clause, is the paragraph the 1:2-1:4 block must start
// at. The heading سورة الفاتحة stands above the front matter attached to
// 1:1. The heading سورة البقرة is the first paragraph past the end of the
// map; if any index reaches it, the map has drifted.
//
// THE CHECK. Join a verse's curated Arabic and ask whether it contains three
// consecutive words of that āya, normalised (marks dropped, alif and ya and
// ta marbuta unified). It is the same warrant the rest of the verse index
// rests on and it costs nothing to run. As shipped in September the map
// passed 3 of 7; corrected it passes 5. The two that still fail do not fail
// from drift: Q 1:3 is الرحمن الرحيم and has only two words to match, so the
// run length is capped at the length of the āya itself; Q 1:5's paragraph
// carries إياك نعبد in OCR badly enough that no three-word run survives. The
// gate in src/lib/niasseVerseExcerpt.ts declines to pair a verse it cannot
// confirm rather than pairing it anyway, so 1:5 shows Arabic alone.
//
// After any edit to lesson 1's `arabicBody`, re-derive these against the
// anchors above and re-run the check. ENGLISH_PARAS is indexed into
// `englishText` and did not move in either break; leave it alone unless that
// field is rebuilt.
//
// The 2026-08-19 English re-anchoring stands as recorded: commit cd03f3a
// replaced `englishText` with a fuller translation of the same lesson, 81
// paragraphs against the former 37, and the indices below were re-derived by
// reading it against ARABIC_PARAS. That reading has NOT been checked by AK.
//
// THE OLD GAP AT 1:3 AND 1:4 IS CLOSED. The former translation skipped the
// discussion of الرحمن الرحيم and Māliki yawmi l-dīn that the Arabic carries; the
// current one has it. Both verses point at real English.
//
// Where a verse has no English, the UI shows no English -- JalalaynVerseView
// says so explicitly, and the verse page renders the Arabic alone. Neither
// reuses another verse's text, which is the bug this file exists to prevent.

export const ARABIC_PARAS: Record<string, number[]> = {
  // istiʿādha + basmala discussion, then sura-level front matter (names,
  // Meccan/Medinan status, virtues/faḍāʾil hadiths) -- kept attached to
  // verse 1:1 since there's no separate slot for sura-level material, same
  // convention already used in ruhAlBayanArabic/SOURCE.md. Ends at 52: 53 is
  // the genre pass, which belongs to the 1:2-1:4 block.
  //
  // This block is 39 paragraphs and is front matter, not a comment on the
  // basmala as such, so src/app/verse/[surah]/[ayah]/page.tsx does not pair
  // it -- 900 characters cut from its opening would tell a reader nothing
  // about the āya.
  '1:1': Array.from({ length: 52 - 14 + 1 }, (_, i) => 14 + i),
  // Genre-classification pass (53, which maps al-ḥamd to praise, rabb al-ʿālamīn
  // to tawhid, al-rahman al-rahim to promise, malik yawm al-din to warning),
  // the five-names reading against the five pillars (57-59), the elided
  // "qūlū" (60), the definition of ḥamd (61), and the paragraph that
  // glosses each of the four names in turn (62).
  '1:2': [53, 57, 58, 59, 60, 61, 62],
  // 61 is only about hamd, so it drops out here; 62 carries al-Rahman and
  // al-Rahim explicitly, as do 53 and 57-59.
  '1:3': [53, 57, 58, 59, 62],
  // Same, for Māliki yawmi l-dīn -- 62 holds the longest treatment, on
  // dominion and Q. 40:16.
  '1:4': [53, 57, 58, 59, 62],
  // "iyyāka naʿbudu wa-iyyaka nastaʿin" (63) plus its mention in the brief
  // pass (54, shared with 1:6 -- see below).
  '1:5': [54, 63],
  // "ihdinā l-ṣirāṭ al-mustaqīm" (64) plus its mention in the brief pass
  // (54, shared with 1:5).
  '1:6': [54, 64],
  // "ṣirāṭ alladhīna anʿamta ʿalayhim ghayri l-maghdubi ʿalayhim wa-la
  // l-dallin" (55-56) plus 64, which runs on from ihdina into this verse
  // inside one paragraph, and the closing note on āmīn (65).
  '1:7': [55, 56, 64, 65],
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
// the ones src/lib/verseIndex.ts discovered independently for lesson 1, in
// that file's own paragraph numbering: 1:1 | 1:2-4 | 1:5-6 | 1:7.
//
// THREE PARAGRAPHS HAD TO BE ASSIGNED RATHER THAN SHARED, and each call is
// arguable -- flagged here rather than buried:
//
//   - Arabic 55 and English 57 are the brief genre pass and cover 1:5, 1:6
//     and 1:7 in three consecutive clauses. Both go to the 1:5-6 unit alone.
//   - Arabic 65 straddles the 1:6/1:7 boundary. It opens on "ihdinā l-ṣirāṭ
//     al-mustaqīm" and runs on into "ṣirāṭ alladhīna anʿamta ʿalayhim" and
//     "wa-lā l-ḍāllīn" within the same paragraph. ARABIC_PARAS gives it to
//     both 1:6 and 1:7; here it stays with the 1:5-6 unit, alongside its
//     English counterpart. Splitting the paragraph in the source would be the
//     better fix and is not attempted here.
//   - English 64 straddles the same boundary and makes the same move, so that
//     the Arabic and English straddlers do not land in different units.
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
    gloss: 'istiʿādha, basmala, and the faḍāʾil of the sūra',
    verses: ['1:1'],
    ar: Array.from({ length: 52 - 14 + 1 }, (_, i) => 14 + i),
    en: Array.from({ length: 55 - 14 + 1 }, (_, i) => 14 + i),
  },
  {
    label: 'Q. 1:2–1:4',
    gloss: 'al-ḥamd · rabb al-ʿālamīn · al-raḥmān al-raḥīm · mālik yawm al-dīn',
    verses: ['1:2', '1:3', '1:4'],
    ar: [53, 57, 58, 59, 60, 61, 62],
    en: [56, 58, 59, 60, 61, 62],
  },
  {
    label: 'Q. 1:5–1:6',
    gloss: 'iyyāka naʿbudu wa-iyyāka nastaʿīn · ihdinā l-ṣirāṭ al-mustaqīm',
    verses: ['1:5', '1:6'],
    // Arabic 64 and English 64 both straddle 1:6 and 1:7, and both stay here
    // rather than going to the 1:7 unit: Arabic 63 and English 63 each end
    // mid-thought (the servant is granted leave to ask, then asks), and the
    // paragraph that follows completes the sentence. Splitting them would
    // break one utterance across two pager cards, and would put the Arabic
    // and English straddlers in different units. The many-to-many map above
    // still gives both to 1:7 as well.
    ar: [54, 63, 64],
    en: [57, 63, 64],
  },
  {
    label: 'Q. 1:7',
    gloss: 'ṣirāṭ alladhīna anʿamta ʿalayhim · the closing note on āmīn',
    verses: ['1:7'],
    ar: [55, 56, 65],
    en: [65],
  },
];
