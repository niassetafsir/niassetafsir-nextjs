// Arabic <-> English paragraph alignment for lessons that have English translation.
//
// Background: BilingualText.tsx used to pair Arabic and English paragraphs by raw
// array index (arabic[i] next to english[i]). That's wrong -- the English prose
// consolidates, splits, and reorders relative to the Arabic, and for Lessons 1-2
// the two texts don't even cover the same span yet (English currently translates
// well past where the digitized Arabic stops; a smaller amount of Arabic content
// -- mostly narrative/etymological asides -- has no English yet either).
//
// This file is a DRAFT built from a close reading of the current lesson 01/02
// data (Aug 2026). High-confidence pairings are marked with a plain rationale.
// Anything uncertain, unresolved, or simply unanalyzed is marked explicitly in
// `note` rather than forced into a guessed pairing -- these need a native-reader
// pass (ideally AK, as translator) before being treated as final. Nothing here
// is silently dropped: every Arabic commentary paragraph and every English
// body paragraph appears exactly once, either in a `blocks` entry or in
// `englishOnly`.
//
// Indexing:
//  - arabicIndices index into `commentaryParagraphs` in BilingualText.tsx, i.e.
//    arabicText.split('\n').filter(p => p.trim()) with poem/basmala lines
//    (isPoem()) removed. 0-based.
//  - englishIndices index into the `enParagraphs` array in BilingualText.tsx
//    *after* the en-para/en-fn fix below, i.e. only <p class="en-para"> blocks,
//    in document order. 0-based.

export interface AlignmentBlock {
  /** Arabic commentaryParagraphs indices covered by this block, in order. */
  arabicIndices: number[];
  /** English en-para indices covered by this block, in order. May be empty
   *  (Arabic paragraph with no English translation yet). */
  englishIndices: number[];
  /** Rationale, or an explicit uncertainty/review flag. */
  note?: string;
}

export interface EnglishOnlyGroup {
  /** English en-para indices with no current Arabic source, in order. */
  indices: number[];
  note?: string;
}

export interface LessonAlignment {
  blocks: AlignmentBlock[];
  englishOnly: EnglishOnlyGroup[];
}

export const BILINGUAL_ALIGNMENT: Record<number, LessonAlignment> = {
  1: {
    blocks: [
      { arabicIndices: [0, 1, 2], englishIndices: [], note: 'Section title / lesson header / orphaned durūd continuation -- editorial, not commentary prose.' },
      { arabicIndices: [3], englishIndices: [0, 1], note: 'Tafsīr vs. taʾwīl definition, Q.16:44, Q.43:3.' },
      { arabicIndices: [4, 5, 6], englishIndices: [2, 3], note: "ʿAlī's \"dhū wujūh\" quote + requirements of tafsīr (language, rulings, rhetoric, light in the heart)." },
      { arabicIndices: [7, 8], englishIndices: [4], note: 'Book as guidance/light. FLAG: English adds ḥadīth phrasing (citron/date simile) not literally present in this Arabic paragraph -- possible translator elaboration, needs check.' },
      { arabicIndices: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], englishIndices: [], note: 'UNTRANSLATED -- Q.24:55 promise, ʿUmar\'s conquests, decline narrative, Ibn ʿAbbās tafsīr-transmission chain. NEEDS REVIEW: may in fact correspond to EN9-13 below (unverified, flagged there too).' },
      { arabicIndices: [19], englishIndices: [5], note: '"Tafsīr is the noblest science" -- exact match.' },
      { arabicIndices: [20, 21, 22], englishIndices: [], note: 'UNCERTAIN -- names of the Qurʾān (Qurʾān/Furqān, jamʿ/farq), al-Qurṭubī on scholarly transmission. EN6 may be a loose paraphrase of this; not confirmed.' },
      { arabicIndices: [23], englishIndices: [7, 8], note: 'Wisdom of istiʿādha (entering the King\'s presence) + Q.16:98. FLAG: EN8\'s rajīm-root etymology not literally present here -- likely translator addition, needs check.' },
      { arabicIndices: [24, 25, 26, 27, 28, 29, 30], englishIndices: [], note: 'UNTRANSLATED -- best form of istiʿādha (Jibrīl taught it), etymology of shayṭān/Iblīs, Satan\'s whispering as a sign of true faith, the Prophet-meets-Iblīs narrative. NEEDS REVIEW: may correspond to EN9-13 below (unverified).' },
      { arabicIndices: [31, 32], englishIndices: [14, 15], note: 'Basmala verse-status debate (al-Shāfiʿī named). FLAG: EN15 names Nāfiʿ/ʿĀṣim/al-Kisāʾī, not explicit in this paragraph -- likely drawn from a footnote, needs check.' },
      { arabicIndices: [33], englishIndices: [16], note: 'Evidence 1: basmala written in every muṣḥaf; Jibrīl marking sūra boundaries.' },
      { arabicIndices: [34], englishIndices: [], note: 'UNTRANSLATED -- Evidence 2, Nūḥ/Sulaymān precedent for starting with Allah\'s name.' },
      { arabicIndices: [35, 36], englishIndices: [], note: 'UNCERTAIN -- Q.108 (al-Kawthar) revelation/laughter ḥadīth, Fātiḥa-as-seven-verses ḥadīth. No confident English match located.' },
      { arabicIndices: [37, 38, 39, 40, 41, 42], englishIndices: [19, 20], note: 'TENTATIVE -- likely the al-Raḥmān/al-Raḥīm distinction, but exact paragraph-level correspondence was not pinned down. Needs a native-reader check before treating as confirmed.' },
      { arabicIndices: [43, 44], englishIndices: [18], note: 'Grammar of "in the name of Allah" (implicit verb) + etymology of the name Allāh.' },
    ],
    englishOnly: [
      { indices: [6], note: 'Possibly a loose paraphrase of Arabic 20-22 (names of the Qurʾān / al-Qurṭubī); unconfirmed.' },
      { indices: [9, 10, 11, 12, 13], note: 'Not matched in this pass. May correspond to the untranslated Arabic block at 9-18 or 24-30 above -- needs a native-reader check.' },
      { indices: [17], note: 'Not matched in this pass -- needs review.' },
      { indices: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], note: 'Full Fātiḥa commentary (al-ḥamdu lillāh, iyyāka naʿbudu, ihdinā l-ṣirāṭ, the four-caliphs reading of Q.2:3-4). Confirmed: no Arabic source exists in the current data -- the digitized Arabic simply stops before this point.' },
    ],
  },
  2: {
    blocks: [
      { arabicIndices: [0], englishIndices: [], note: '"الدرس الثاني" -- lesson title, editorial.' },
      { arabicIndices: [], englishIndices: [0, 1], note: 'Istiʿādha + basmala + durūd. Arabic source is in the poem/invocation block (isPoem-filtered), rendered separately above the bilingual columns -- not part of commentaryParagraphs indexing, so it can\'t be keyed by an arabicIndices entry under the current rendering split.' },
      { arabicIndices: [1], englishIndices: [2], note: '"Four verses believers / two disbelievers / thirteen hypocrites" -- exact match.' },
      { arabicIndices: [2, 3], englishIndices: [3], note: 'Kufr definition, four categories (ends "yatabarraʾu baʿḍukum min baʿḍ" = EN3\'s "disavow one another").' },
      { arabicIndices: [4, 5, 6], englishIndices: [4], note: "Kufr varieties + Abū Ṭālib's verse (2 lines of poetry = 2 Arabic paragraphs -> 1 English paragraph)." },
      { arabicIndices: [7], englishIndices: [5], note: 'Full kufr definition (tawḥīd/ṣalāh/ṣawm/zakāh/ḥajj/resurrection), zunnār/ghiyār, Q.4:48.' },
      { arabicIndices: [8], englishIndices: [6], note: "Abū Jahl/Abū Lahab -- equal whether warned or not." },
      { arabicIndices: [9], englishIndices: [7, 8, 9], note: "Nūḥ (Q.11:36), Hūd (Q.26:136), Q.52:16/14:21, and the \"seal on hearts\" verse consolidated -- one Arabic block -> three English paragraphs." },
      { arabicIndices: [10], englishIndices: [10, 11, 12, 13], note: "Hypocrites' duplicity, disease-in-heart verses, deception, grammatical note on yukhādiʿūna, qirāʾa variant -- one Arabic block -> four English paragraphs." },
      { arabicIndices: [11, 12], englishIndices: [], note: 'UNCERTAIN -- "lā tukhādiʿ Allāh" ḥadīth (al-Qurṭubī 1/196). Does not clearly match footnote fn-2-2 (which is about the Ḥafṣ/Warsh reading, not this ḥadīth). Needs review.' },
      { arabicIndices: [13, 14], englishIndices: [14, 15, 16], note: 'Corruption-in-earth verse, philosopher/Zayd dialogue, "we believe" vs. "we are with you" duplicity, mockery.' },
      { arabicIndices: [15], englishIndices: [17, 18, 19, 20], note: 'Two parables (kindled fire; rainstorm/thunder/lightning), "Allah could take their hearing/sight".' },
      { arabicIndices: [16], englishIndices: [], note: 'Thunder=angel / lightning=whip-of-iron citation -- this matches footnote content (fn-2-3), not a body paragraph; deliberately excluded from body pairing.' },
      { arabicIndices: [17, 18], englishIndices: [], note: 'Not matched in this pass -- needs review.' },
    ],
    englishOnly: [
      { indices: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], note: 'Disconnected letters (Alif Lām Mīm), the four-caliphs/four-qualities passage, "O Mankind, worship your Lord" (Q.2:21-22), the inimitability challenge (Q.2:23-24), Fire/Paradise (Q.2:24-25), closing durūd. Confirmed: no Arabic source exists in the current data.' },
    ],
  },
};
