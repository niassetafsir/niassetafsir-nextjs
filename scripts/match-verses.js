#!/usr/bin/env node
/**
 * Matches every Qur'anic citation Niasse quotes in his Arabic commentary
 * (the spans already extracted by src/lib/arabicCommentary.ts (formerly quranicFragments.ts), inside ()
 * or guillemets) against the actual verse it comes from, using the full
 * verse-keyed Qur'an text in src/data/verse_text.json (rebuilt by
 * scripts/rebuild-verse-text.js -- run that FIRST if you haven't).
 *
 * This does NOT touch anything served to the site. It writes a report to
 * translation-drafts/verse-match-report.json (private working file, same
 * convention as the MT drafts) for AK + Claude to review before deciding
 * how/whether to surface verse numbers in the UI or extend VERSE_INDEX.
 *
 * Run with: node scripts/match-verses.js
 */

const fs = require('fs');
const path = require('path');

const VERSE_TEXT_FILE = path.join(__dirname, '..', 'src', 'data', 'verse_text.json');
const LESSONS_DIR = path.join(__dirname, '..', 'src', 'data', 'lessons');
const OUT_FILE = path.join(__dirname, '..', 'translation-drafts', 'verse-match-report.json');

// --- Surah <-> lesson range ------------------------------------------------
//
// Read at run time out of src/lib/surahLessons.ts, which is the single source
// for these two tables. They used to be transcribed here by hand as well, and
// the two copies were kept in step by nothing but care. That was survivable
// while the table only drove a browse widget. It is not survivable now: the
// scope tie-breaks below decide which of several rival ayat gets its number
// printed beside Niasse's Arabic, so one stale row here would change the
// printed text of the edition without changing anything a reader could see.
//
// Node cannot require() a .ts file and this repo is not growing a build step
// or a dependency for one object literal, so the literal is parsed out of the
// source. scripts/build-lesson-ranges.py already reads the same file the same
// way. Anything unexpected -- file moved, declaration renamed, table
// truncated -- throws here rather than quietly matching against a half table.

const SURAH_LESSONS_TS = path.join(__dirname, '..', 'src', 'lib', 'surahLessons.ts');

function readSuraTable(source, name, minEntries) {
  const block = new RegExp(`const\\s+${name}\\s*(?::[^=]*)?=\\s*\\{([^}]*)\\}`).exec(source);
  if (!block) {
    throw new Error(
      `${name} not found in ${SURAH_LESSONS_TS}. That file is the single source ` +
      `for the sura -> lesson tables; this script cannot match without it. If the ` +
      `declaration was renamed or reformatted, fix the parse here -- do not paste ` +
      `the table back into this file.`);
  }
  const table = {};
  for (const m of block[1].matchAll(/(\d+)\s*:\s*(\d+)/g)) table[Number(m[1])] = Number(m[2]);
  const found = Object.keys(table).length;
  if (found < minEntries) {
    throw new Error(
      `${name} in ${SURAH_LESSONS_TS} parsed to only ${found} entries, expected at ` +
      `least ${minEntries}. Refusing to run against a truncated table.`);
  }
  return table;
}

const surahLessonsSrc = fs.readFileSync(SURAH_LESSONS_TS, 'utf8');
const SURA_TO_LESSON = readSuraTable(surahLessonsSrc, 'SURA_TO_LESSON', 114);
const SURA_LESSON_END = readSuraTable(surahLessonsSrc, 'SURA_LESSON_END', 21);

// Invert to lesson -> surahs touched (informational only now -- matching
// itself searches the whole Qur'an, see note below). Lesson 1 also gets
// surah 1 folded in as a special case: it's the only lesson whose range
// starts a surah *before* SURA_TO_LESSON says that surah "begins".
const LESSON_SURAHS = {};
for (let surah = 1; surah <= 114; surah++) {
  const start = SURA_TO_LESSON[surah];
  if (!start) continue;
  const end = SURA_LESSON_END[surah] || start;
  for (let lessonId = start; lessonId <= end; lessonId++) {
    (LESSON_SURAHS[lessonId] = LESSON_SURAHS[lessonId] || []).push(surah);
  }
}
LESSON_SURAHS[1] = [...new Set([...(LESSON_SURAHS[1] || []), 2])];

// --- Mirrors src/lib/arabicCommentary.ts (formerly quranicFragments.ts) -- keep in sync ------------------

const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;
function isPoem(text) {
  return POEM_PATTERN.test(text.trim()) || BASMALA_PATTERN.test(text.trim());
}

// The same three formulas, written against NORMALIZED text, for the span-level
// guard further down. BASMALA_PATTERN above matches raw text and must keep
// doing so: isPoem() decides which paragraphs survive, and therefore what
// paraIndex every later paragraph carries, and verseCitations.json is keyed by
// that index. src/lib/arabicCommentary.ts filters the paragraphs the same way
// on the site, so the two isPoem() must agree character for character or the
// citations print against the wrong paragraphs.
//
// Spans are a different matter. A span is tested on its own, nothing downstream
// is indexed by it, and inside the parentheses the formulas are usually fully
// vocalised -- "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" -- which the raw pattern
// walks straight past, because the first character it compares is بِ and not ب.
// The guard existed to keep recitation formulas out of the fuzzy pass, and
// vocalised is how they are actually written, so it was letting through
// precisely the spans it was written to catch. Note the bare alif in "اعوذ":
// normalizeAr folds أ to ا, so a hamza here would never fire.
//
// Written as a PREFIX to strip rather than a span to discard. The guard used
// to null any span beginning with one of the formulas, and the compiler opens
// every sūra by printing the basmala and the first āya inside one set of
// parentheses -- "بسم الله الرحمن الرحيم سبحان الذي أسرى بعبده ليلا" -- so the
// guard was throwing away Q 17:1 along with the formula in front of it. It
// also swallowed Q 11:41, where "بِسْمِ ٱللَّهِ مَجْر۪ىٰهَا وَمُرْسَىٰهَا" is
// not a formula at all but Noah's words, and Q 27:31, quoted at Lesson 37 ¶109
// behind the basmala Solomon's letter opens with.
//
// So: strip whatever formula stands at the head, then match what is left. A
// span that was nothing but the formula reduces to '' and is still discarded,
// which is the behaviour the guard was written for. The two divine names are
// matched loosely (الرحم\S+ الر\S+) because the OCR mangles them constantly --
// الرحمل, الرحم, الرجيم all appear -- and a strict spelling would leak those
// sūra openings straight back into the fuzzy pass.
//
// The taṣliya is different and stays absolute: "اللهم صل على آل فلان" is never
// a citation, and stripping only "اللهم صل" would hand the remainder to the
// fuzzy pass to guess at.
const FORMULA_PREFIX = /^(?:اعوذ بالله(?: من الشيطان الرجيم)?|بسم الله(?: الرحم\S+ الر\S+)?)\s*/;
const TASLIYA_PATTERN_NORM = /^اللهم صل/;

/** The part of a span that could be a citation: '' for a bare formula. */
function stripRecitationFormula(spanNorm) {
  if (TASLIYA_PATTERN_NORM.test(spanNorm)) return '';
  return spanNorm.replace(FORMULA_PREFIX, '').trim();
}

function extractSpans(paragraph) {
  const spans = [];
  const patterns = [/\(([^()]{2,400})\)/g, /«([^»]{2,400})»/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(paragraph))) {
      const span = m[1].trim();
      if (/[.{}]/.test(span)) continue;
      spans.push(span);
    }
  }
  return spans;
}

// --- Arabic normalization for matching (diacritics, letter-form variants,
// punctuation) -- deliberately lossy, this is for MATCHING only, never
// used to alter displayed text. Uses the Unicode "combining mark" property
// (\p{Mn}) rather than a hand-picked codepoint range, so it strips ALL
// diacritics regardless of which script convention produced them --
// matters here because the rebuilt verse_text.json uses Uthmani-style
// marks (sukun, wasla) that a plain-tashkil-only range would miss.
//
// Editorial footnote markers ("[55]") are stripped as a unit, before the
// punctuation pass. That pass deletes the brackets but keeps the digits, so
// "[55]وأخرجوهم" normalized to "55وأخرجوهم" and could never match anything:
// the marker silently demoted exact citations to fuzzy ones or to nothing.
// Q. 2:191 in Lesson 5 was lost that way the moment its footnote was keyed. --

function normalizeAr(text) {
  return text
    .normalize('NFC')
    .replace(/\p{Mn}/gu, '')                 // all combining diacritics
    // Uthmani small waw/yeh (U+06E5, U+06E6 -- "عبادتهۦ", "ولهۥ") are category
    // Lm, not Mn, so the sweep above walks straight past them; they survive in
    // 2,147 of the 6,236 verses. Bidi and zero-width formatting characters
    // (RIGHT-TO-LEFT MARK, in 820 verses) survive for the same reason. Both
    // are invisible in every editor, and both sit mid-token, so they break
    // word-aligned containment silently: Q 7:206 stops matching "لا
    // يستكبرون عن عبادته" on the last letter of the last word.
    .replace(/[ۥۦ]/g, '')
    .replace(/\p{Cf}/gu, '')
    .replace(/\[\s*\d+\s*\]/g, ' ')          // editorial footnote markers, e.g. "[55]"
    .replace(/[۞۩]/g, '')          // standalone Quranic markers (rub el hizb, sajda)
    .replace(/ـ/g, '')                  // tatwil
    .replace(/[آأإٱ]/g, 'ا') // alif variants + wasla -> bare alif
    .replace(/ة/g, 'ه')            // ta marbuta -> ha
    .replace(/ى/g, 'ي')            // alif maqsura -> ya
    // Yeh barree (U+06D2, U+06D3). The Warsh reference writes final yāʾ this
    // way -- "فِے", "اَ۬لذِے" -- in 2,072 of the 6,236 verses, while the tafsīr
    // quotes the same words in imlāʾī spelling with a plain ي. Neither
    // codepoint is a combining mark or a format character, so both survive
    // every sweep above and then fail to compare equal to the ي they stand
    // for. Left unfolded, this starves a third of the Qurʾān of exact matches
    // and demotes those citations to fuzzy.
    .replace(/[ےۓ]/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')    // hamza-on-waw/ya -> bare hamza
    .replace(/[،؛؟!:"'«»()\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Alif-blindness in the matching passes ---------------------------------
//
// THE PROBLEM. normalizeAr() strips every combining mark, and the dagger alif
// U+0670 is a combining mark. So the reference text arrives here DEFECTIVELY
// spelled -- al-Fatiha 1:2 normalizes to "الحمد لله رب العلمين", 2:255 to
// "ما في السموت" -- while the tafsir prints the same words plene, "العالمين"
// and "السماوات". The two spellings are the same word and they are not equal
// strings, so pass 1's containment test could not see through the difference:
// the aya was invisible to its own citation, and the span either fell through
// to the fuzzy pass or matched a RIVAL aya that happened to contain its text
// verbatim. The second outcome is the damaging one, because it prints a verse
// number that is wrong rather than none at all.
//
// The printing is not consistent either -- it writes "العالمين" plene and
// "هذا" defective against the reference's dagger-alif "هٰذا" -- so there is no
// side to normalize towards. Ignoring the alif is the only answer that does
// not pick one.
//
// THE RULE. Inside a word of three characters or more, every alif after the
// first character is dropped. The first character is kept because a
// word-initial alif carries hamzat al-wasl and the definite article and is
// never the plene/defective variable; words of one or two characters are left
// alone because they carry no plene/defective variation either, and because
// shortening them would move them across the `length > 1` significance filter
// this file uses everywhere. A word that would fall below two characters is
// left alone for the same reason. So blinding never changes a word's length
// from >1 to <=1, which is why every significance count downstream -- 
// MIN_SPAN_WORDS, the overlap gate, quotedIdentifies(), the straddle test --
// reads the same number off a blinded string as off a plain one, and the
// blinded string can be substituted into those tests unchanged.
//
// WHAT IT COSTS. Alif is not nothing. `qala`/`qul`, `kitab`/`kutub` and
// `malik`/`malik` fold together under this rule, and the last of those is a
// qira'a distinction: Warsh reads "maliki yawmi l-din" at Q 1:4 where Hafs
// reads "maliki". Blinding cannot tell those apart. That is why the blinded
// hits are UNIONED with the plain ones and handed to the same scope-narrowing
// and uniqueness rule that governed pass 1 already: where blinding introduces
// a rival the lesson's scope cannot settle, the answer is 'ambiguous' and no
// number prints. Blinding buys coverage and corrected attributions; it pays
// for them in citations withdrawn into ambiguity, and it pays honestly.
//
// Applied to passes 1 and 2 only. Pass 3 was tried blinded and reverted: it
// takes the best word-overlap score with no uniqueness test, so blinding
// inflates rivals as readily as the right aya, 159 spans changed their fuzzy
// verse under it and the new choice was often worse -- Lesson 5's "mawaqit"
// span is Q 2:189, was reported as Q 2:189, and moved to Q 2:68. The fuzzy
// tier ships no number, so that bought nothing and cost accuracy.
//
// The attestation folds are deliberately
// NOT blinded: foldLine()'s head guard is position-sensitive -- it leaves a
// letter of the variable class unfolded at index 0 or behind up to two
// proclitics -- and deleting a medial alif shifts every later index, so
// blinding there would silently change which letters are guarded. That is a
// different change with different risks and it does not belong in this one.
const ALIF_CHAR = String.fromCharCode(0x0627);

function blindAlifWord(w) {
  if (w.length < 3) return w;
  const out = w[0] + w.slice(1).split(ALIF_CHAR).join('');
  return out.length < 2 ? w : out;
}

/** The same line with its medial and final alifs dropped. Word boundaries and
 *  every word's significance under `length > 1` are preserved exactly. */
function blindAlif(s) {
  return s.split(' ').map(blindAlifWord).join(' ');
}

// --- Load verse text, index by surah ---------------------------------------

const verseText = JSON.parse(fs.readFileSync(VERSE_TEXT_FILE, 'utf8'));
const versesBySurah = {}; // { surahId: [{key:'2:6', norm:'...', words:Set}] }
const ALL_VERSES = [];   // flat list, every surah -- see matching note below
for (const key of Object.keys(verseText)) {
  const [surahStr] = key.split(':');
  const surah = Number(surahStr);
  const entry = verseText[key];
  if (!entry || !entry.ar) continue;
  const norm = normalizeAr(entry.ar);
  const blind = blindAlif(norm);
  const rec = {
    key, norm, blind,
    words: new Set(norm.split(' ').filter(w => w.length > 1)),
    blindWords: new Set(blind.split(' ').filter(w => w.length > 1)),
  };
  (versesBySurah[surah] = versesBySurah[surah] || []).push(rec);
  ALL_VERSES.push(rec);
}

// --- Attestation: which āyāt a stretch of the commentary carries -----------
//
// The number printed beside a quotation and the set of āyāt that quotation
// witnesses are two different questions, and this file used to answer only the
// first. One span can carry five āyāt -- the compiler runs al-Fātiḥa 1:2
// through 1:6 inside one set of parentheses -- and the verse index, which
// inherited the citation's single answer, concluded that four of them are
// treated nowhere and left four verse pages empty over commentary sitting in
// plain view. Where two āyāt share a formula the matcher answers 'ambiguous',
// prints nothing and credits neither, when the passage may plainly hold both.
//
// So every span, and every paragraph, now also records `attests`: the āyāt
// whose own text that stretch demonstrably carries. Nothing here touches
// `match`. build-verse-citations.js still prints `match`, and only `match`, as
// the citation beside the Arabic; `attests` feeds the verse index alone.
//
// THE WARRANT, and it is the whole of it: containment of the āya's own text.
// No score, no ratio, no threshold anywhere below.
//
//   align  A maximal run of the stretch's words sits word-aligned in exactly
//          ONE place in the muṣḥaf, and the āya lies wholly inside that run.
//          Uniqueness is measured over the sūra's whole word stream, so the run
//          may cross āya boundaries: a span quoting the tail of 2:254, all of
//          2:255 and the head of 2:256 locates once and attests 2:255 alone,
//          and a span running 1:2-1:6 attests five. An āya only partly inside
//          the run is not attested -- the run has to hold every word of it.
//
//          Where the longest run occurs in more than one place, nothing is
//          attested, and that is what keeps the refrains honest. "فاتقوا الله
//          وأطيعون" is eight āyāt of Sūrat al-Shuʿarāʾ and on its own attests
//          none of them; the same words behind "إذ قال لهم أخوهم هود" locate
//          once and attest 26:125. It is also what answers the genuinely
//          ambiguous case the brief cares about: a formula that could be either
//          of two āyāt, quoted with nothing round it, attests neither, and the
//          matcher's existing silence is right.
//
//   short  The stretch IS an āya of two significant words, and no other āya has
//          that text. MIN_SPAN_WORDS below exists so that Q 2:1 "الم" does not
//          match half the corpus; that reasoning says nothing about an āya
//          which is itself two words long, and al-Fātiḥa -- the sūra every
//          visitor arrives on -- is bracketed lemma by lemma in exactly that
//          shape, "(الرحمن الرحيم)". An āya of one word is never attested this
//          way, and a two-word āya is never attested from inside a longer
//          stretch, only from a stretch that is nothing but the āya.
//
// Both rules run over the normalized text and then over each fold below,
// because the quotations are OCR'd.

// THE FOLDS, and why there are two of them.
//
// The scan's confusions are qāf/fāʾ, ḥāʾ/jīm, rāʾ/zāy, ṣād/ḍād, dāl/dhāl,
// ʿayn/ghayn, the dotted set bāʾ/tāʾ/thāʾ/nūn/yāʾ for each other, and nūn/lām.
// A fold has to be an equivalence relation -- it rewrites a word to a canonical
// form so two spellings can be compared with ===. Confusion is not one. Putting
// lām into the dotted set, as scripts/sync-rendered-snippets.js does, takes the
// transitive closure of two separate confusions and licenses a third nobody
// reports: lām becomes interchangeable with bāʾ, tāʾ, thāʾ and yāʾ, so الله and
// إليه fold equal, and 390 pairs of muṣḥaf words collide through that step
// alone. A snippet locator can absorb that; an attestation cannot.
//
// So the confusions are folded in two passes and their results unioned. Each
// pass is a genuine equivalence relation, and no word is ever compared under
// the closure of both:
//
//   dotted  bāʾ/tāʾ/thāʾ/nūn/yāʾ/alif-maqṣūra, plus the six undotted pairs
//   lamnun  lām/nūn, plus the same six undotted pairs
//
// A span carrying a dotted error and a lām/nūn error in the same stretch is not
// reachable by either pass. That is the intended price.
//
// THE HEAD GUARD, and it is load-bearing. A letter of the pass's own variable
// class is left unfolded when it stands at the head of a word, or behind up to
// two proclitics. Word-initially -- and immediately behind wa-, fa-, li-, sa-,
// which are the proclitics that attach to an imperfect verb -- those letters
// carry the person of the verb, and folding them there turns the Shaykh's own
// prose into an āya. Lesson 31 ¶16 says of the people of this world "ويضحكون
// ولا يبكون", they laugh and do not weep, and folded that is Q 53:60 "وتضحكون
// ولا تبكون", addressed to them. Guarding index 0 alone does not catch it: the
// marker sits at index 1 behind the wāw.
//
// The scan does make word-initial errors of this kind -- 26 of the 925 letter
// swaps tabulated in repair-quranic-letter-confusions.py are word-initial and
// dotted -- so the guard costs real coverage. It costs less than a verse page
// asserting a passage that does not treat it.
//
// bāʾ and kāf are deliberately NOT proclitics here. They attach to nouns, not
// to imperfect verbs, so they carry no person, and counting them would guard
// the yāʾ in "كي" -- which is how Lesson 32 ¶118 quotes Q 20:33.
const FOLD_UNDOTTED = [
  [0x0641, 0x0642],   // fāʾ / qāf
  [0x062C, 0x062D],   // jīm / ḥāʾ
  [0x0635, 0x0636],   // ṣād / ḍād
  [0x0631, 0x0632],   // rāʾ / zāy
  [0x062F, 0x0630],   // dāl / dhāl
  [0x0639, 0x063A],   // ʿayn / ghayn
];
const FOLD_VARIABLE = {
  dotted: [0x0628, 0x062A, 0x062B, 0x0646, 0x064A, 0x0649],
  lamnun: [0x0644, 0x0646],
};
// wāw, fāʾ, lām, sīn -- see above.
//
// The proclitic test runs on the FOLDED letter, not the raw one, and it has to.
// fāʾ is a proclitic and qāf is not, but the two fold together, so testing raw
// letters made "فليلون" guard its lām while "قليلون" folded it, and Q 26:54
// stopped matching its own OCR damage. Whatever governs the guard has to be
// something both spellings agree on, which is the folded form.
const PROCLITIC_CHARS = [0x0648, 0x0641, 0x0644, 0x0633].map(c => String.fromCharCode(c));
const MAX_PROCLITICS = 2;

const FOLD_MODES = Object.keys(FOLD_VARIABLE);
const FOLD_TABLE = {};       // mode -> Map(char -> tag)
const FOLD_GUARDED = {};     // mode -> Set(char) of that mode's variable class
const FOLD_PROCLITIC = {};   // mode -> Set(tag) a proclitic folds to
for (const mode of FOLD_MODES) {
  const table = new Map();
  FOLD_UNDOTTED.forEach(([a, b], i) => {
    table.set(String.fromCharCode(a), `U${i}`);
    table.set(String.fromCharCode(b), `U${i}`);
  });
  const guarded = new Set();
  for (const c of FOLD_VARIABLE[mode]) {
    const ch = String.fromCharCode(c);
    table.set(ch, 'V');
    guarded.add(ch);
  }
  FOLD_TABLE[mode] = table;
  FOLD_GUARDED[mode] = guarded;
  FOLD_PROCLITIC[mode] = new Set(PROCLITIC_CHARS.map(ch => table.get(ch) || ch));
}

// FOLD_SOFT is gone. It mapped the alif variants to one tag and tāʾ marbūṭa to
// hāʾ, both of which normalizeAr() has already done by the time anything
// reaches here, so it relabelled letters that were already identical and
// changed no comparison.

function foldLine(s, mode) {
  const table = FOLD_TABLE[mode], guarded = FOLD_GUARDED[mode];
  const proclitic = FOLD_PROCLITIC[mode];
  let out = '', at = 0, proclitics = 0;
  for (const ch of s) {
    if (ch === ' ') { out += ' '; at = 0; proclitics = 0; continue; }
    // head position: index 0, or behind a run of at most MAX_PROCLITICS
    // proclitic letters and nothing else
    const head = at === 0 || (proclitics === at && at <= MAX_PROCLITICS);
    const tag = table.get(ch) || ch;
    out += (head && guarded.has(ch)) ? ch : tag;
    if (proclitics === at && proclitic.has(tag)) proclitics++;
    at++;
  }
  return out;
}

// Ordered āyāt per sūra, one spelling per matching mode, built once off the
// same normalizeAr() the matcher uses.
const MODES = ['plain', ...FOLD_MODES];
const ORDERED = new Map(); // surah -> [{ key, ayah, norm, byMode: { mode: words[] } }]
for (const key of Object.keys(verseText)) {
  const entry = verseText[key];
  if (!entry || !entry.ar) continue;
  const [s, a] = key.split(':').map(Number);
  const norm = normalizeAr(entry.ar);
  const byMode = {};
  for (const mode of MODES) {
    byMode[mode] = (mode === 'plain' ? norm : foldLine(norm, mode)).split(' ').filter(Boolean);
  }
  if (!ORDERED.has(s)) ORDERED.set(s, []);
  ORDERED.get(s).push({ key, ayah: a, norm, byMode });
}
for (const list of ORDERED.values()) list.sort((x, y) => x.ayah - y.ayah);

// The two-word rule needs to know whether an āya's text is its alone.
const AYA_BY_TEXT = new Map();
for (const list of ORDERED.values()) {
  for (const v of list) {
    let twins = AYA_BY_TEXT.get(v.norm);
    if (!twins) AYA_BY_TEXT.set(v.norm, twins = []);
    twins.push(v.key);
  }
}

// Each sūra as one word stream, plus where every āya starts and ends in it.
// Positions are indexed by trigram so a stretch can be located without walking
// the muṣḥaf: each word position appears in exactly one bucket, so the lists
// are complete and a uniqueness claim made against them is sound.
const STREAMS = {};
function streams(mode) {
  if (STREAMS[mode]) return STREAMS[mode];
  const out = {};
  for (const [s, list] of ORDERED) {
    const words = [], starts = [], lens = [], ayahs = [];
    for (const v of list) {
      const w = v.byMode[mode];
      starts.push(words.length); lens.push(w.length); ayahs.push(v.ayah);
      for (const x of w) words.push(x);
    }
    out[s] = { words, starts, lens, ayahs };
  }
  return (STREAMS[mode] = out);
}
const TRIGRAMS = {};
function trigrams(mode) {
  if (TRIGRAMS[mode]) return TRIGRAMS[mode];
  const map = new Map(), st = streams(mode);
  for (const s of Object.keys(st)) {
    const w = st[s].words;
    for (let i = 0; i + 3 <= w.length; i++) {
      const k = `${w[i]}\u0000${w[i + 1]}\u0000${w[i + 2]}`;
      let l = map.get(k); if (!l) map.set(k, l = []);
      l.push(Number(s) * 100000 + i);
    }
  }
  return (TRIGRAMS[mode] = map);
}

/** The longest stretch of `words` from `i` that sits in the muṣḥaf, and
 *  whether it sits in exactly one place. */
function maximalMatch(words, i, mode) {
  const cands = trigrams(mode).get(`${words[i]}\u0000${words[i + 1]}\u0000${words[i + 2]}`);
  if (!cands) return null;
  const st = streams(mode);
  let best = 0, at = null, ties = 0;
  for (const enc of cands) {
    const s = Math.floor(enc / 100000), p = enc % 100000, A = st[s].words;
    let k = 3;
    while (i + k < words.length && p + k < A.length && A[p + k] === words[i + k]) k++;
    if (k > best) { best = k; at = [s, p]; ties = 1; }
    else if (k === best) ties++;
  }
  if (ties !== 1) return { len: best, unique: false };
  return { len: best, unique: true, surah: at[0], pos: at[1] };
}

/** The āyāt lying wholly inside [pos, pos+len) of a sūra's word stream. */
function ayatInside(surah, pos, len, mode) {
  const st = streams(mode)[surah], out = [];
  for (let i = 0; i < st.starts.length; i++) {
    if (st.starts[i] >= pos && st.starts[i] + st.lens[i] <= pos + len) {
      out.push(`${surah}:${st.ayahs[i]}`);
    }
  }
  return out;
}

// The recitation formulas, as a splitter rather than a head-of-string strip.
// stripRecitationFormula() takes a formula off the front of a span because a
// sūra opening prints the basmala and the first āya inside one set of
// parentheses. Attestation needs the formulas gone wherever they stand, and
// for a sharper reason: the basmala IS Q 1:1, every lesson opens with it, and
// a lesson that opens "بسم الله الرحمن الرحيم الحمد ..." reproduces the first
// five words of al-Fātiḥa exactly and locates there uniquely. Lesson 31 ¶2 did,
// and put Q 1:1 in the index off a piece of liturgical furniture. The formulas
// are not evidence of anything, here as everywhere else in this file, so the
// text is cut at them and each piece aligned on its own.
const FORMULA_ANYWHERE = new RegExp(
  `${FORMULA_PREFIX.source.replace(/^\^/, '')}|${TASLIYA_PATTERN_NORM.source.replace(/^\^/, '')}`, 'g');

// --- What is not the Shaykh speaking ---------------------------------------
//
// THE EDITION'S OWN APPARATUS. The 2022 edition cites its ḥadīth sources in
// the running text, and a source citation names the āya its chapter is built
// on: "صحيح البخاري: كتاب التوحيد/ باب قول الله تعالى «وجوه يومئذ ناضرة إلى
// ربها ناظرة» (7440)". That is al-Bukhārī's bāb title, not Niasse's quotation,
// and it was carrying Q 75:22 into the index as its ONLY locus, under a flag
// that reads "quoted without parentheses in the printing; identified here".
//
// The editorial signal is the slash between kitāb and bāb -- the apparatus
// writes it and running prose does not -- so the text is cut there and
// everything after it discarded. Cutting to the end of the paragraph is safe
// because the apparatus is always the last thing in one; the four known sites
// are Lesson 30 ¶179 (Q 75:22), Lesson 43 ¶4 (Q 37:139), and Lesson 52 ¶97 and
// Lesson 54 ¶123 (Q 84:8).
//
// This applies to the PROSE pass only. Spans are read out of ( ) and « », and
// the apparatus quotes inside " ", which extractSpans does not touch -- and
// anything that changed what extractSpans returns would change what prints.
const AR_BAB = String.fromCharCode(0x0628, 0x0627, 0x0628);
const APPARATUS_TAIL = new RegExp(`\\/\\s*${AR_BAB}(?=\\s)[\\s\\S]*$`);

// PARAGRAPHS THAT ARE NOT COMMENTARY. Hand-listed, because each is a judgement
// about what the paragraph is doing rather than about what it contains, and a
// rule general enough to catch them would catch a great deal else. Suppressing
// attestation here does not touch `match`, so nothing these paragraphs cite
// stops printing; they simply stop being offered as the place an āya is
// treated.
const NOT_COMMENTARY = {
  // The muqaṭṭaʿāt argument: the number of oaths opening a sūra matches the
  // number of letters in its opening letters -- one oath for ص and ق, two for
  // طه and يس, three for الم. To make the count the Shaykh recites ten incipits
  // in a row. Each is a tally mark. None is treated, and Q 53:1, 79:1, 79:3 and
  // 103:1 had this passage as their only locus, so /verse/103/1 opened on nine
  // hundred characters about how many letters begin a sūra.
  47: { 104: 'incipits counted, not treated', 105: 'incipits counted, not treated', 109: 'incipits counted, not treated' },
  // Two sentences on what an imperative means, commenting on Q 33:1, with
  // "يا أيها المدثر قم وأنذر" held up beside it as the contrasting case. Sole
  // locus for Q 74:1.
  40: { 62: 'grammatical foil, not commentary' },
};

/** Every āya a stretch of commentary attests, the formulas cut out of it. */
function attestsOf(textNorm) {
  const found = new Map();
  for (const piece of textNorm.split(FORMULA_ANYWHERE)) {
    const t = (piece || '').trim();
    if (t) for (const a of attestsOfPiece(t)) if (!found.has(a.verse)) found.set(a.verse, a);
  }
  return sortVerses([...found.keys()]).map(k => found.get(k));
}

function attestsOfPiece(textNorm) {
  const found = new Map();
  for (const mode of MODES) {
    const s = mode === 'plain' ? textNorm : foldLine(textNorm, mode);
    const words = s.split(' ').filter(Boolean);
    if (!words.length) continue;

    // An āya of two significant words, quoted as itself and nothing else.
    // 176 āyāt have exactly two significant words and 28 have one, which this
    // never touches. (By whitespace tokens the counts are 175 and 28; the one
    // āya that differs is Q 50:1, "ق والقرءان المجيد", whose first token is a
    // single letter. The test is on significant words because that is the
    // metric MIN_SPAN_WORDS itself uses.)
    if (mode === 'plain' && significantWords(textNorm) === 2) {
      const twins = AYA_BY_TEXT.get(textNorm);
      if (twins && twins.length === 1 && !found.has(twins[0])) {
        found.set(twins[0], { verse: twins[0], rule: 'short', mode, run: words.length });
      }
    }

    let i = 0;
    while (i + 3 <= words.length) {
      const m = maximalMatch(words, i, mode);
      if (!m || m.len < 3) { i++; continue; }
      if (m.unique) {
        for (const key of ayatInside(m.surah, m.pos, m.len, mode)) {
          if (!found.has(key)) found.set(key, { verse: key, rule: 'align', mode, run: m.len });
        }
      }
      i += Math.max(1, m.len);
    }
  }
  return sortVerses([...found.keys()]).map(k => found.get(k));
}

// --- Matching ----------------------------------------------------------

// Citations shorter than this are too ambiguous to match reliably (a lone
// word occurs in dozens of verses) -- report them as unmatched rather than
// guessing. Threshold is on normalized word count.
const MIN_SPAN_WORDS = 3;

// --- Scope: what this lesson is known to be commenting on ------------------
//
// Used ONLY to break ties in the substring pass (below), never to restrict
// which verses are searched -- matching still runs against the whole Qur'an,
// because tafsir cites cross-reference proof texts constantly.
//
// Two levels of evidence, strongest first:
//   1. the lesson's own explicit verseRange ("Q. 2:253-3:14"), which thirty
//      of the fifty-six sessions carry;
//   2. the sura(s) the curated SURA_TO_LESSON / SURA_LESSON_END tables above
//      assign to the lesson.
// Deliberately NOT src/data/lessonRanges.json: that file is built downstream
// of this script's own output, so reading it here would close a loop and make
// the matcher's results depend on the previous run's.

function posOf(surah, ayah) { return surah * 1000 + ayah; }

function explicitRange(verseRange) {
  const m = /Q\.\s*(\d+):(\d+)\s*[–\-]\s*(?:(\d+):)?(\d+)/.exec(verseRange || '');
  if (!m) return null;
  const s1 = Number(m[1]), a1 = Number(m[2]);
  const s2 = m[3] ? Number(m[3]) : s1, a2 = Number(m[4]);
  return { from: posOf(s1, a1), to: posOf(s2, a2), s1, s2 };
}

function lessonScope(id, lesson) {
  const range = explicitRange(lesson.verseRange);
  const surahs = new Set(LESSON_SURAHS[id] || []);
  // an explicit range may run past the sura the curated table assigns
  if (range) for (let s = range.s1; s <= range.s2; s++) surahs.add(s);
  return { range, surahs };
}

/** The āyāt a match id names. Pass 1 produces "2:255"; pass 2 produces the
 *  adjacent pair "2:255-2:256". Everything that reasons about where a match
 *  sits in the muṣḥaf goes through this, so both passes can share it. */
function versesOf(matchId) { return matchId.split('-'); }

/** Muṣḥaf order, for candidate lists that are read by a human or by
 *  build-lesson-ranges.py. */
function sortVerses(keys) {
  return keys.sort((a, b) => posOf(...a.split(':').map(Number)) - posOf(...b.split(':').map(Number)));
}

/** Narrow a candidate list to the strongest scope that keeps at least one of
 *  them, and say which scope that was. Returns the untouched list when the
 *  lesson's declared scope excludes every candidate -- that is the normal
 *  shape of a cross-reference, not a reason to discard it.
 *
 *  A candidate is in scope if ANY āya it names is, which for a single-āya
 *  candidate is the plain test this function always ran, and for a pair
 *  keeps a quotation that steps across the far edge of the lesson's declared
 *  range -- the boundary case pass 2 exists to catch in the first place. */
function narrowToScope(hits, scope) {
  if (hits.length < 2 || !scope) return { hits, scope: 'none' };
  if (scope.range) {
    const inRange = hits.filter(h => versesOf(h.verse).some(v => {
      const [s, a] = v.split(':').map(Number);
      return scope.range.from <= posOf(s, a) && posOf(s, a) <= scope.range.to;
    }));
    if (inRange.length) return { hits: inRange, scope: 'range' };
  }
  const inSurah = hits.filter(h => versesOf(h.verse)
    .some(v => scope.surahs.has(Number(v.split(':')[0]))));
  if (inSurah.length) return { hits: inSurah, scope: 'surah' };
  return { hits, scope: 'none' };
}

/** Is any āya this match id names inside the lesson's declared sūras?
 *  narrowToScope() cannot answer this: it reports scope 'none' whenever there
 *  was only one candidate to narrow, so a lone hit looks unscoped whether the
 *  lesson covers its sūra or not. Pass 2 needs the plain question. */
function inDeclaredScope(matchId, scope) {
  if (!scope || !scope.surahs) return false;
  return versesOf(matchId).some(v => scope.surahs.has(Number(v.split(':')[0])));
}

/** Pass 2 dropped its score gate deliberately: a clause occurring word-aligned
 *  in exactly one place in the Qur'an is better evidence than a length ratio.
 *  Blinding weakens that ground, because it manufactures occurrences out of
 *  damaged text -- Lesson 2 ¶1 quotes Q 2:6 "inna lladhina kafaru" with the
 *  nun read as a lam, and blinded that is "illa lladhina kafaru", which sits
 *  uniquely in Q 40:4, a sura the lesson never touches.
 *
 *  What it is NOT safe to gate on is a length ratio. The first draft of this
 *  used one, and a ratio measures the span against the aya's length, which is
 *  a fact about the aya. Lesson 34 ¶103 quotes "wa-dhkuru llaha fi ayyamin
 *  ma`dudat" -- signposted in the prose round it, "wa-qala llahu fi ayati
 *  l-hajj", sitting verbatim and word-aligned at the head of Q 2:203 and
 *  nowhere else, and needing blinding only because the reference writes
 *  `ma`dudat` with a dagger alif. It scored 0.2222 against a long aya and was
 *  dropped, while the SAME quotation printed in Lesson 6 ¶5 at the same score
 *  because that lesson declares al-Baqara. One quotation, two lessons, two
 *  answers, on sura scope alone.
 *
 *  So the test is in the unit the rest of this file reasons in. MIN_SPAN_WORDS
 *  is the floor at which a span identifies anything at all; blinding costs one
 *  word of evidence, so a blind-only hit the lesson's own scope does not
 *  corroborate has to clear that floor by one. The Q 40:4 span carries exactly
 *  three significant words and is withheld; the Q 2:203 span carries five and
 *  is not. */
function blindEnclosureHolds(spanNorm, matchId, scope) {
  if (inDeclaredScope(matchId, scope)) return true;
  return significantWords(spanNorm) > MIN_SPAN_WORDS;
}

/** The shape both passes hand back when the clause sits verbatim in more than
 *  one place and the lesson's own scope does not choose between them. The
 *  candidate list is flattened to individual āyāt: build-lesson-ranges.py
 *  reads it as the set of āyāt this span might attest, and src/lib/corpus.ts
 *  reads that as "as many as N are quoted", so it has to be a true superset
 *  and it has to parse as "sura:aya". */
function ambiguous(hits, scopeName) {
  let best = null;
  for (const h of hits) if (!best || h.score > best.score) best = h;
  return {
    verse: best.verse,
    score: best.score,
    type: 'ambiguous',
    scope: scopeName,
    candidates: sortVerses([...new Set(hits.flatMap(h => versesOf(h.verse)))]),
  };
}

/** Significant words, the length>1 filter this file uses everywhere: a lone
 *  particle is not evidence of anything. */
function significantWords(s) { return s.split(' ').filter(w => w.length > 1).length; }

/** What is left of a span either side of an aya it contains verbatim.
 *  `paddedSpan` is ` ${spanNorm} `, so the aya sits between two spaces and the
 *  slices land on token boundaries. */
function residueAround(paddedSpan, verseNorm) {
  const at = paddedSpan.indexOf(` ${verseNorm} `);
  return {
    before: paddedSpan.slice(0, at + 1).trim(),
    after: paddedSpan.slice(at + verseNorm.length + 1).trim(),
  };
}

/** True when this aya's text occurs, word-aligned, in no other aya.
 *  Memoized: the scan is over all 6,236 ayat and only a few dozen ayat ever
 *  reach it. */
const ayaIsUniqueCache = new Map();
function ayaIsUniqueString(rec, blind) {
  const cacheKey = `${blind ? 'b' : 'p'}:${rec.key}`;
  let unique = ayaIsUniqueCache.get(cacheKey);
  if (unique === undefined) {
    const text = blind ? rec.blind : rec.norm;
    const padded = ` ${text} `;
    unique = !ALL_VERSES.some(v => v.key !== rec.key
      && ` ${blind ? v.blind : v.norm} `.includes(padded));
    ayaIsUniqueCache.set(cacheKey, unique);
  }
  return unique;
}

// How far a span may reach past the aya it quotes and still be read as a
// citation of that aya alone. Same number, and the same reason, as the
// per-side test in pass 2: "a span whose reach into the neighbour is a single
// short particle is not a citation of that neighbour". Read the other way
// round here -- a span that reaches one short particle past its aya is still
// a citation of that aya, and usually the particle is not a reach at all but
// the OCR'd stump of the previous word: Lesson 23 quotes the whole of
// Q 10:8 with "غفلون" in front of it, which is not a reach into Q 10:7
// but what the scan made of the "غافلون" that ends it.
const MAX_QUOTED_RESIDUE_WORDS = 1;

/** Whether a span that CONTAINS this aya verbatim thereby identifies it.
 *
 *  Pass 1's containment test runs in both directions and ships both as
 *  'substring', whose warrant is "the clause sits verbatim in one aya". That
 *  warrant only covers one of the two. When the span sits inside the aya
 *  (`clause`), the aya accounts for every word of the span, and a rival aya
 *  containing the same clause is a second hit, so the ambiguity is caught.
 *  When the aya sits inside the SPAN (`quoted`), neither holds: the span is
 *  the aya plus something else, and a longer aya that also contains that
 *  something else is NOT a second hit, because it does not fit inside the
 *  span. The 'quoted' direction is therefore blind in exactly the place the
 *  'clause' direction sees, and two failures follow from it:
 *
 *    - Under-citation. Most of the quoted spans run across an aya boundary --
 *      Niasse quotes the tail of n-1 with the whole of n, or the whole of n
 *      with the head of n+1 -- and pass 1 printed one number for two ayat.
 *    - Misattribution. An aya that occurs verbatim inside a longer aya
 *      identifies nothing when it is merely contained in a span: the span may
 *      be quoting the longer one. Lesson 1 quotes Q 27:30, Solomon's letter,
 *      which opens "بسم الله الرحمن الرحيم" -- so Q 1:1 sits inside it verbatim and
 *      pass 1 printed Q 1:1, twice, on three pages.
 *
 *  So a quoted hit counts only when the aya accounts for essentially the whole
 *  span AND is not a string some other aya also contains. Everything else
 *  falls through to pass 2, which is the pass that already knows how to ask
 *  which ayat a boundary-crossing span witnesses, and answers 'ambiguous' --
 *  no printed number -- when it cannot tell. A quoted span cannot come back
 *  from pass 2 as 'enclosed': it is longer than the aya it contains, so it
 *  fits inside no single aya. It comes back as a pair whose two sides each
 *  carry two significant words, or it comes back as nothing.
 */
function quotedIdentifies(paddedSpan, c, blind) {
  const { before, after } = residueAround(paddedSpan, blind ? c.blind : c.norm);
  if (significantWords(before) > MAX_QUOTED_RESIDUE_WORDS) return false;
  if (significantWords(after) > MAX_QUOTED_RESIDUE_WORDS) return false;
  return ayaIsUniqueString(c, blind);
}

function findMatch(spanNorm, candidates, scope) {
  if (!spanNorm) return null;
  if (spanNorm.split(' ').filter(w => w.length > 1).length < MIN_SPAN_WORDS) {
    return null;
  }

  // Pass 1: single-verse substring match (either direction -- citation may
  // be a sub-clause of the verse, or may literally equal it). Only accepted
  // if it clears a real confidence threshold -- low-confidence candidates
  // are discarded here, not carried into later passes.
  //
  // A verbatim clause is routinely shared by several ayat: "يعلم ما بين
  // أيديهم" sits in 2:255, 20:110, 21:28 and 22:76, and "يا أيها الذين
  // آمنوا" opens eighty-nine verses. Before this pass kept every hit, the
  // winner was whichever verse was SHORTEST -- score is a length ratio, so
  // the same clause scores highest against the tersest verse containing it.
  // Length is not evidence. Lesson 7 was printing Q 20:110, from Surat Taha,
  // beside a paragraph that runs verse-by-verse through Ayat al-Kursi and
  // then names it.
  //
  // So: narrow to the lesson's declared scope, and only call it a match if
  // exactly one candidate survives. Where several do, the clause is reported
  // as 'ambiguous' with the full candidate list. build-verse-citations.js
  // ships substring and pair only, so an ambiguous clause prints no verse
  // number at all -- which is the point. A wrong aya number set in type
  // beside Niasse's words is worse than a silent one.
  //
  // Containment is tested on whole words. A bare .includes() on the
  // normalized strings makes Q 2:1 -- whose entire text is "الم" -- a
  // substring of any span containing المؤمنين, العالمين or المفسدون, so the
  // muqattaʿat matched half the corpus. The old length-ratio tie-break hid
  // it (three characters against a long span scores ~0.02, so some other
  // verse always won); narrowing by scope does not, because the scope of a
  // lesson on al-Baqara contains 2:1. Padding both sides with spaces makes
  // the test token-aligned. The overlap must also carry MIN_SPAN_WORDS
  // words, for the same reason the span itself must: one or two words
  // identify nothing.
  const paddedSpan = ` ${spanNorm} `;
  const spanBlind = blindAlif(spanNorm);
  const paddedSpanBlind = ` ${spanBlind} `;
  const hits = [];
  for (const c of candidates) {
    if (!c.norm) continue;
    const paddedVerse = ` ${c.norm} `;
    const paddedVerseBlind = ` ${c.blind} `;
    let overlap, within, viaBlind = false;
    if (paddedVerse.includes(paddedSpan)) { overlap = spanNorm; within = 'clause'; }
    else if (paddedSpan.includes(paddedVerse)) {
      // see quotedIdentifies(): a span that merely CONTAINS an aya is
      // not on that account a citation of it. Dropped rather than kept
      // as a weak hit, so it neither ships nor manufactures an
      // ambiguity: where a clause hit also exists it is the sounder
      // reading, and where none does the span belongs to pass 2.
      if (!quotedIdentifies(paddedSpan, c, false)) continue;
      overlap = c.norm; within = 'quoted';
    }
    else if (paddedVerseBlind.includes(paddedSpanBlind)) {
      // the same clause, one side spelled plene and the other defective
      overlap = spanNorm; within = 'clause'; viaBlind = true;
    }
    else if (paddedSpanBlind.includes(paddedVerseBlind)) {
      // the quoted branch, reached under blinding. quotedIdentifies() counts
      // significant words and blinding preserves those counts, so it is asked
      // the same question against the blinded pair. A failure here can only
      // drop a candidate the plain passes never reached.
      if (!quotedIdentifies(paddedSpanBlind, c, true)) continue;
      overlap = c.norm; within = 'quoted'; viaBlind = true;
    }
    else continue;
    if (overlap.split(' ').filter(w => w.length > 1).length < MIN_SPAN_WORDS) continue;
    const score = Math.min(spanNorm.length, c.norm.length) / Math.max(spanNorm.length, c.norm.length);
    hits.push({ verse: c.key, score, within, ...(viaBlind ? { blind: true } : {}) });
  }
  if (hits.length) {
    const narrowed = narrowToScope(hits, scope);
    // best-scoring survivor; ties fall to muṣḥaf order, which is the order
    // ALL_VERSES was built in, so the choice is at least reproducible.
    let best = null;
    for (const h of narrowed.hits) if (!best || h.score > best.score) best = h;

    if (narrowed.hits.length > 1) {
      // Several ayat contain this clause verbatim and the lesson's own scope
      // does not choose between them. Say so, and fall through to NOTHING:
      // pass 2 would happily concatenate an adjacent pair around one of the
      // rivals and hand back a 'pair', which this file ships as definite. The
      // Lesson 7 clause did exactly that in a draft of this fix, trading a
      // wrong Q 20:110 for a wrong Q 20:110-111.
      return ambiguous(narrowed.hits, narrowed.scope);
    }

    // Exactly one candidate. Where the lesson's declared range or sura picked
    // it out of a field of rivals, that IS the identification, and the score
    // is beside the point: "يعلم ما بين أيديهم" covers seven per cent of Ayat
    // al-Kursi, and Lesson 7 ¶24 is still walking through Ayat al-Kursi.
    // Where no scope narrowing happened -- the clause is simply unique in the
    // musḥaf, or the lesson's scope contained none of the rivals -- keep the
    // original confidence gate untouched, so a stock three-word phrase buried
    // in one long aya still falls through to the fuzzy pass as it always did.
    if (narrowed.scope !== 'none' || best.score >= 0.25) {
      return { verse: best.verse, score: best.score, type: 'substring', scope: narrowed.scope, within: best.within };
    }
  }

  // Pass 2: adjacent-pair concatenation, for citations spanning a verse
  // boundary (rare, but Niasse does sometimes quote across one).
  //
  // "Rare" is the operative word, and this pass did not believe it: it was
  // shipping 695 pairs as definite citations, on 695 spans, without ever
  // asking whether the pairing was unique. It was not. 634 of the 695 matched
  // more than one adjacent pair, and 615 matched exactly two -- (n-1, n) and
  // (n, n+1), which is not two readings of a boundary-crossing quotation but
  // the signature of a span sitting wholly INSIDE āya n and crossing no
  // boundary at all. Those spans arrive here because pass 1 found them and
  // then failed them on its confidence gate. Gluing a neighbour on does not
  // improve the identification; it doubles the text the span has to fit
  // inside, so the ratio score rises, and it prints a second āya number the
  // quotation never reached. 56 of the 695 were real.
  //
  // The remedy is pass 1's, for pass 1's reasons: collect every candidate,
  // narrow to the lesson's declared scope, ship only a unique survivor, and
  // otherwise say 'ambiguous' and print nothing.
  //
  // Containment is word-aligned here too, and by the same padding. A bare
  // .includes() on the concatenation let a span match inside a word, which is
  // all that held up 61 of the 695: pad both sides and they match nothing.
  // The normalization is already shared -- c.norm is normalizeAr() applied
  // once at load, so the Uthmani small waw/yeh and the RTL mark are gone from
  // both sides of this test exactly as they are from pass 1's.
  //
  // But withdrawing those 615 entirely would be the opposite error. The span
  // IS in the muṣḥaf and we know exactly where: printing nothing beside a
  // clause whose āya is not in doubt is as wrong as printing two āyāt when
  // one was quoted. So each candidate is asked which āyāt it actually
  // witnesses, before any of them is called a pair:
  //
  //   - if the span fits inside ONE of the two āyāt, word-aligned, that
  //     candidate witnesses that āya, and the pairing is an artefact of
  //     concatenation. Emitted as type 'enclosed'.
  //   - otherwise the span really does use the tail of a and the head of b,
  //     and the candidate witnesses the pair. Emitted as type 'pair'.
  //
  // Deduplicating by witness is what makes the intersection rule fall out
  // for free: a span inside āya n is witnessed as n by BOTH windows around
  // it, (n-1, n) and (n, n+1), so it collapses to the single hit n and
  // survives as unique. Two DIFFERENT enclosing āyāt stay two hits and go to
  // 'ambiguous', which is the guarantee that the āya is agreed by every
  // candidate and not merely by most of them. A mix of an enclosure and a
  // distant straddle is likewise two hits, and likewise ambiguous.
  //
  // This also catches the 14 spans the boundary test alone could not. A span
  // inside āya n normally produces two windows, but not when n opens or
  // closes a sūra: 2:286 ends al-Baqara and 5:1 opens al-Māʾida, so each had
  // exactly one window, looked unique, and shipped as a definite pair naming
  // a neighbouring āya the span never reached.
  //
  // On the confidence gate this appears to reopen: it does not. A span only
  // reaches pass 2 if pass 1 returned nothing, and pass 1 returns nothing
  // only when it found exactly ONE containing āya in the whole muṣḥaf and
  // that āya was long relative to the span. So every 'enclosed' match here is
  // a clause that occurs word-aligned in exactly one place in the Qur'an.
  // Uniqueness across 6,236 āyāt is a stronger warrant than a length ratio,
  // and pass 1 already says so for the case where scope narrowing picks the
  // winner: "that IS the identification, and the score is beside the point".
  // The ratio was only ever a proxy for the question uniqueness answers
  // outright. MIN_SPAN_WORDS still applies -- it is enforced on the span at
  // the top of this function, and an enclosed span is its own overlap.
  //
  // To reverse this, drop 'enclosed' from the tiers build-verse-citations.js
  // ships; the tier stays in the report either way.
  const pairHits = new Map(); // witness id -> hit. Keyed, so a repeated witness collapses.
  for (let i = 0; i < candidates.length - 1; i++) {
    const a = candidates[i], b = candidates[i + 1];
    const [as, aa] = a.key.split(':').map(Number);
    const [bs, ba] = b.key.split(':').map(Number);
    if (as !== bs || ba !== aa + 1) continue; // must be adjacent verses, same surah
    // Plain first, blinded only where plain finds nothing, so this pass can
    // gain candidates but never lose one.
    const combinedPlain = `${a.norm} ${b.norm}`;
    const combinedBlind = `${a.blind} ${b.blind}`;
    let viaBlind2;
    if (` ${combinedPlain} `.includes(paddedSpan)) viaBlind2 = false;
    else if (` ${combinedBlind} `.includes(paddedSpanBlind)) viaBlind2 = true;
    else continue;
    const combined = viaBlind2 ? combinedBlind : combinedPlain;
    const spanHere = viaBlind2 ? paddedSpanBlind : paddedSpan;
    const aHere = viaBlind2 ? a.blind : a.norm;
    const bHere = viaBlind2 ? b.blind : b.norm;
    const enclosedBy = ` ${aHere} `.includes(spanHere) ? a
      : ` ${bHere} `.includes(spanHere) ? b
      : null;
    if (enclosedBy) {
      const encScore = spanNorm.length / enclosedBy.norm.length;
      if (viaBlind2 && !blindEnclosureHolds(spanNorm, enclosedBy.key, scope)) continue;
      pairHits.set(enclosedBy.key, {
        verse: enclosedBy.key,
        score: encScore,
        enclosed: true,
      });
    } else {
      // A genuine straddle has to be a straddle on BOTH sides. The span sits
      // in the concatenation and in neither āya alone, which puts a boundary
      // inside it, but says nothing about how much falls either side -- and a
      // span whose reach into the neighbour is a single short particle is not
      // a citation of that neighbour. Lesson 16 ¶66 quotes "لرب العلمين وأن"
      // and would otherwise print Q 6:71-72 on the strength of وأن.
      //
      // Pass 1 already holds its overlap to MIN_SPAN_WORDS for the same
      // reason (see the substring pass). Here the test is per side, and lower:
      // two significant words, because a straddle divides a span that has
      // already cleared MIN_SPAN_WORDS as a whole.
      const boundary = aHere.split(' ').length;
      const words = combined.split(' ');
      const at = words.findIndex((_, k) =>
        ` ${words.slice(k).join(' ')} `.startsWith(spanHere.slice(0, -1)));
      if (at < 0) continue;
      const spanLen = (viaBlind2 ? spanBlind : spanNorm).split(' ').length;
      const left = words.slice(at, boundary).filter(w => w.length > 1).length;
      const right = words.slice(boundary, at + spanLen).filter(w => w.length > 1).length;
      if (left < 2 || right < 2) continue;
      const id = `${a.key}-${b.key}`;
      // numerator and denominator must be the same spelling. `combined` is the
      // blinded concatenation on the blind path, so measuring a plain span
      // against it inflated every blind straddle score by about 13%. Reported
      // plain against plain, which is what the enclosed branch above does and
      // what the number means to a reader: how much of the two ayat as the
      // reference spells them the span as printed covers.
      const pairScore = spanNorm.length / combinedPlain.length;
      if (viaBlind2 && !blindEnclosureHolds(spanNorm, id, scope)) continue;
      pairHits.set(id, { verse: id, score: pairScore });
    }
  }
  if (pairHits.size) {
    const narrowed = narrowToScope([...pairHits.values()], scope);
    if (narrowed.hits.length > 1) return ambiguous(narrowed.hits, narrowed.scope);
    const only = narrowed.hits[0];
    return {
      verse: only.verse,
      score: only.score,
      type: only.enclosed ? 'enclosed' : 'pair',
      scope: narrowed.scope,
    };
  }

  // Pass 3: word-overlap fallback for paraphrase-ish or partial matches.
  const spanWords = new Set(spanNorm.split(' ').filter(w => w.length > 1));
  if (spanWords.size === 0) return null;
  let pass3 = null;
  for (const c of candidates) {
    const cWords = c.words;
    let overlap = 0;
    for (const w of spanWords) if (cWords.has(w)) overlap++;
    const score = overlap / spanWords.size;
    if (score >= 0.55 && (!pass3 || score > pass3.score)) pass3 = { verse: c.key, score, type: 'fuzzy' };
  }
  return pass3;
}

// --- Run per lesson ----------------------------------------------------

function loadLesson(id) {
  const file = path.join(LESSONS_DIR, `${String(id).padStart(2, '0')}.json`);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.warn(`  ! failed to parse lesson ${id}: ${e.message}`); return null; }
}

const report = {};
let totalSpans = 0, totalMatched = 0, totalAmbiguous = 0;
let totalAttested = 0, totalParaAttested = 0, apparatusCut = 0;
const byScope = { range: 0, surah: 0, none: 0 };

for (let id = 1; id <= 56; id++) {
  const lesson = loadLesson(id);
  if (!lesson) continue;
  const raw = lesson.arabicBody || lesson.arabicText;
  if (!raw) continue;

  const surahs = LESSON_SURAHS[id] || [];
  // Search the WHOLE Qur'an, not just the surah(s) this lesson's title
  // covers -- tafsir routinely cites other surahs as cross-reference/proof
  // texts (an early pilot run scoped to same-surah-only matched only 23%,
  // and inspection showed most "unmatched" spans were verses from entirely
  // different surahs, e.g. a Q. 75:17 citation appearing in Lesson 1's
  // commentary on al-Fatiha/al-Baqara).
  const candidates = ALL_VERSES;
  const scope = lessonScope(id, lesson);

  const paragraphs = raw.split('\n').filter(p => p.trim()).filter(p => !isPoem(p));
  const lessonReport = [];
  // Attestation found in a paragraph but in none of its brackets: the
  // compiler quotes without parentheses constantly, and
  // add-editorial-verse-index.js already carries that kind of identification
  // into the index under `editorial: true`. Same warrant as the spans above it
  // -- containment of the āya's own text -- and a weaker claim about the
  // printing, so it is kept apart and flagged apart.
  const lessonParaAttests = {};

  paragraphs.forEach((p, paraIndex) => {
    const spans = extractSpans(p);
    const attestedInSpans = new Set();
    const attesting = !((NOT_COMMENTARY[id] || {})[paraIndex]);
    spans.forEach((span, spanIndex) => {
      totalSpans++;
      // Liturgical formulas (refuge formula, basmala, etc.) recur as fixed
      // sentence templates across many unrelated verses -- fuzzy word-
      // overlap matching reliably misattributes them (spot-checked: the
      // refuge formula matched to Q. 2:67, which is unrelated). They're
      // recitation formulas, not citations of a specific verse, so leave
      // them unmatched rather than guess. isPoem() already excludes this
      // at paragraph-start; this catches the same patterns mid-paragraph.
      // Only the formula itself is removed -- see stripRecitationFormula --
      // because the compiler prints the basmala and the sūra's first āya
      // inside one set of parentheses, and the āya is a citation.
      const spanNorm = normalizeAr(span);
      const citable = stripRecitationFormula(spanNorm);
      const match = citable ? findMatch(citable, candidates, scope) : null;
      const attests = (citable && attesting) ? attestsOf(citable) : [];
      for (const a of attests) attestedInSpans.add(a.verse);
      totalAttested += attests.length;
      if (match) totalMatched++;
      if (match && match.type === 'ambiguous') {
        totalAmbiguous++;
        byScope[match.scope]++;
      }
      lessonReport.push({
        paraIndex,
        spanIndex,
        text: span,
        ...(attests.length ? { attests } : {}),
        match: match ? {
          verse: match.verse,
          score: Number(match.score.toFixed(2)),
          type: match.type,
          ...(match.scope ? { scope: match.scope } : {}),
          ...(match.within ? { within: match.within } : {}),
          ...(match.candidates ? { candidates: match.candidates } : {}),
        } : null,
      });
    });

    // The paragraph as a whole, minus whatever its brackets already carried.
    // 34.7% of paragraphs in this corpus have unbalanced parentheses (the scan
    // loses brackets constantly), so a quotation whose closing paren was
    // dropped is invisible to extractSpans and visible here.
    const paraNorm = normalizeAr(p.replace(/<[^>]+>/g, '')).replace(APPARATUS_TAIL, ' ').trim();
    if (paraNorm !== normalizeAr(p.replace(/<[^>]+>/g, ''))) apparatusCut++;
    const paraAttests = (paraNorm && attesting)
      ? attestsOf(paraNorm).filter(a => !attestedInSpans.has(a.verse))
      : [];
    if (paraAttests.length) {
      lessonParaAttests[paraIndex] = paraAttests;
      totalParaAttested += paraAttests.length;
    }
  });

  report[id] = {
    surahs,
    spanCount: lessonReport.length,
    spans: lessonReport,
    ...(Object.keys(lessonParaAttests).length ? { paraAttests: lessonParaAttests } : {}),
  };
  console.log(`Lesson ${id}: ${lessonReport.length} citation(s), surah(s) ${surahs.join(',')}`);
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2), 'utf8');

const tiers = {};
for (const l of Object.values(report)) {
  for (const s of l.spans) if (s.match) tiers[s.match.type] = (tiers[s.match.type] || 0) + 1;
}

console.log(`\nTotal citations: ${totalSpans} · matched: ${totalMatched} (${((totalMatched/totalSpans)*100).toFixed(1)}%)`);
console.log(`  by tier: ${Object.entries(tiers).map(([t, n]) => `${t} ${n}`).join(' · ')}`);
console.log(`  ${totalAmbiguous} clause(s) sit verbatim in more than one aya even after`);
console.log(`  narrowing to the lesson's own scope -- reported as 'ambiguous' with the`);
console.log(`  full candidate list, and printed on no page. Narrowed by: explicit range`);
console.log(`  ${byScope.range}, sura set ${byScope.surah}, no declared scope matched ${byScope.none}.`);

const attestRules = {};
const attestedVerses = new Set();
for (const l of Object.values(report)) {
  for (const s of l.spans) for (const a of (s.attests || [])) {
    attestRules[`${a.rule}/${a.mode}`] = (attestRules[`${a.rule}/${a.mode}`] || 0) + 1;
    attestedVerses.add(a.verse);
  }
  for (const list of Object.values(l.paraAttests || {})) for (const a of list) {
    attestRules[`prose ${a.rule}/${a.mode}`] = (attestRules[`prose ${a.rule}/${a.mode}`] || 0) + 1;
    attestedVerses.add(a.verse);
  }
}
console.log(`\nAttested: ${totalAttested} aya(s) inside bracketed spans, ${totalParaAttested} more`);
console.log(`  in the prose round them -- ${attestedVerses.size} distinct ayat, each one carried`);
console.log(`  word for word by the passage that attests it. This feeds the verse index only;`);
console.log(`  the citation printed beside the Arabic is still 'match' and nothing else.`);
console.log(`  by rule: ${Object.entries(attestRules).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(' · ')}`);
console.log(`  ${apparatusCut} paragraph(s) had the edition's own kitāb/bāb apparatus cut off the end`);
console.log(`  before the prose pass read them; ${Object.values(NOT_COMMENTARY).reduce((n, o) => n + Object.keys(o).length, 0)} paragraph(s) are excluded outright.`);
console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
