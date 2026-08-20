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
const BASMALA_PATTERN_NORM = /^(اعوذ بالله|بسم الله|اللهم صل)/;

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
  const rec = { key, norm, words: new Set(norm.split(' ').filter(w => w.length > 1)) };
  (versesBySurah[surah] = versesBySurah[surah] || []).push(rec);
  ALL_VERSES.push(rec);
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
  const hits = [];
  for (const c of candidates) {
    if (!c.norm) continue;
    const paddedVerse = ` ${c.norm} `;
    let overlap;
    if (paddedVerse.includes(paddedSpan)) overlap = spanNorm;
    else if (paddedSpan.includes(paddedVerse)) overlap = c.norm;
    else continue;
    if (overlap.split(' ').filter(w => w.length > 1).length < MIN_SPAN_WORDS) continue;
    const score = Math.min(spanNorm.length, c.norm.length) / Math.max(spanNorm.length, c.norm.length);
    hits.push({ verse: c.key, score });
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
      return { verse: best.verse, score: best.score, type: 'substring', scope: narrowed.scope };
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
    const combined = `${a.norm} ${b.norm}`;
    if (!` ${combined} `.includes(paddedSpan)) continue;
    const enclosedBy = ` ${a.norm} `.includes(paddedSpan) ? a
      : ` ${b.norm} `.includes(paddedSpan) ? b
      : null;
    if (enclosedBy) {
      pairHits.set(enclosedBy.key, {
        verse: enclosedBy.key,
        score: spanNorm.length / enclosedBy.norm.length,
        enclosed: true,
      });
    } else {
      const id = `${a.key}-${b.key}`;
      pairHits.set(id, { verse: id, score: spanNorm.length / combined.length });
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

  paragraphs.forEach((p, paraIndex) => {
    const spans = extractSpans(p);
    spans.forEach((span, spanIndex) => {
      totalSpans++;
      // Liturgical formulas (refuge formula, basmala, etc.) recur as fixed
      // sentence templates across many unrelated verses -- fuzzy word-
      // overlap matching reliably misattributes them (spot-checked: the
      // refuge formula matched to Q. 2:67, which is unrelated). They're
      // recitation formulas, not citations of a specific verse, so leave
      // them unmatched rather than guess. isPoem() already excludes this
      // at paragraph-start; this catches the same patterns mid-paragraph.
      const spanNorm = normalizeAr(span);
      const match = BASMALA_PATTERN_NORM.test(spanNorm) ? null : findMatch(spanNorm, candidates, scope);
      if (match) totalMatched++;
      if (match && match.type === 'ambiguous') {
        totalAmbiguous++;
        byScope[match.scope]++;
      }
      lessonReport.push({
        paraIndex,
        spanIndex,
        text: span,
        match: match ? {
          verse: match.verse,
          score: Number(match.score.toFixed(2)),
          type: match.type,
          ...(match.scope ? { scope: match.scope } : {}),
          ...(match.candidates ? { candidates: match.candidates } : {}),
        } : null,
      });
    });
  });

  report[id] = { surahs, spanCount: lessonReport.length, spans: lessonReport };
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
console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
