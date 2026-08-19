#!/usr/bin/env node
/**
 * propose-verse-ranges.mjs — an attempt to derive the missing verseRange for
 * lessons 31–56 from the citation index. IT DOES NOT WORK. Kept for the
 * back-test that proves it, so nobody spends another afternoon on the idea.
 *
 * THE ATTEMPT. Those 26 lessons carry a sūra-name range ("Sūrat Fāṭir – Sūrat
 * Al-Ṣāffāt") and no āyāt, so half the corpus is unaddressable by verse. Two
 * constraints looked like they might close the gap:
 *
 *   1. Filter citations to the lesson's own sūras. Niasse quotes proof-texts
 *      constantly — lesson 31 covers al-Kahf and cites 1:1, 6:x and 7:x along
 *      the way — so the raw min/max over all citations is noise.
 *   2. The lessons are contiguous. Lesson N ends where N+1 begins, so one known
 *      seam propagates in both directions.
 *
 * Chained together these produce a clean-looking range for all 26, nine of them
 * anchored at both ends by sūra boundaries. The output is entirely convincing.
 *
 * THE BACK-TEST. Lessons 20–30 already have real ranges, so run the same
 * inference over them and score it:
 *
 *   node scripts/propose-verse-ranges.mjs --backtest
 *
 *   0 of 11 reproduced. 1 of 11 got even the start right.
 *
 * WHY IT FAILS. The `sura` field is a label, not a span. Lesson 20 lists
 * "Al-Aʿrāf" and actually runs Q 7:171–8:40, straight through into al-Anfāl,
 * which the field never mentions. Every inference here is built on that field
 * marking where a lesson begins and ends, and it does not. Worse, the two eras
 * of data disagree: lessons 20–30 use `sura` as a one-word label while 31–56
 * use it as a slash-separated list. A method calibrated on one is wrong on the
 * other.
 *
 * The seams are in the print edition and nowhere else. See
 * claude/verse-range-worksheet-31-56.md.
 *
 * WHAT IS WORTH KEEPING: the back-test. Any future attempt at these ranges —
 * page-number interpolation, paragraph-count proportions, an LLM reading the
 * Arabic — should be scored against lessons 20–30 before a single value is
 * written to a lesson file. This one produced 26 confident, well-formatted,
 * wrong answers, and only the back-test told the difference.
 *
 *   node scripts/propose-verse-ranges.mjs              # bounds and evidence
 *   node scripts/propose-verse-ranges.mjs --backtest   # score it. do this.
 *   node scripts/propose-verse-ranges.mjs --candidates # the wrong answers
 */

import fs from 'node:fs';

const LESSONS = 'src/data/lessons';
// --backtest runs the same inference over lessons that already HAVE ranges, so
// the method can be scored against known answers instead of merely believed.
const BACKTEST = process.argv.includes('--backtest');
const FIRST = BACKTEST ? 20 : 31, LAST = BACKTEST ? 30 : 56;

const surahTable = () => {
  const t = fs.readFileSync('src/lib/verseRanges.ts', 'utf8');
  return [...t.matchAll(/\{ id: (\d+), ayahCount: (\d+), nameAr: '([^']*)', nameEn: '([^']*)' \}/g)]
    .map(m => ({ id: +m[1], ayahCount: +m[2], nameAr: m[3], nameEn: m[4] }));
};

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

const SUR = surahTable();
const byName = Object.fromEntries(SUR.map(s => [norm(s.nameEn), s]));
const byId = Object.fromEntries(SUR.map(s => [s.id, s]));

const citations = JSON.parse(fs.readFileSync('src/data/verseCitations.json', 'utf8'));

const lesson = id => JSON.parse(fs.readFileSync(`${LESSONS}/${String(id).padStart(2, '0')}.json`, 'utf8'));

/** Every surah:ayah this lesson's commentary quotes, deduplicated. */
function refsFor(id) {
  const c = citations[String(id)] || {};
  const out = [];
  for (const para of Object.keys(c))
    for (const slot of Object.keys(c[para])) {
      const m = String(c[para][slot]).match(/^(\d+):(\d+)/);
      if (m) out.push({ s: +m[1], a: +m[2] });
    }
  return out;
}

const pad = (s, n) => String(s).padEnd(n);

const rows = [];
for (let id = FIRST; id <= LAST; id++) {
  const l = lesson(id);
  const suras = String(l.sura).split('/').map(s => s.trim()).filter(Boolean)
    .map(n => byName[norm(n)]).filter(Boolean);
  if (suras.length === 0) { rows.push({ id, error: `unrecognised sura field: ${l.sura}` }); continue; }

  const own = new Set(suras.map(s => s.id));
  const mine = refsFor(id).filter(r => own.has(r.s));

  const first = suras[0], last = suras[suras.length - 1];
  const inFirst = mine.filter(r => r.s === first.id).map(r => r.a).sort((a, b) => a - b);
  const inLast = mine.filter(r => r.s === last.id).map(r => r.a).sort((a, b) => a - b);

  rows.push({
    id,
    claimed: l.verseRange,
    suras: suras.map(s => s.id),
    surasEn: suras.map(s => s.nameEn),
    // The lesson opens at or before the earliest āya seen in its first sūra.
    lowestSeen: inFirst.length ? inFirst[0] : null,
    // And reaches at least as far as the latest āya seen in its last sūra.
    highestSeen: inLast.length ? inLast[inLast.length - 1] : null,
    refs: mine.length,
    lastAyahCount: last.ayahCount,
  });
}

// Contiguity: lesson N ends one āya before lesson N+1 begins, when they share
// the boundary sūra. Where they do not, N runs to the end of its last sūra.
for (let i = 0; i < rows.length - 1; i++) {
  const cur = rows[i], next = rows[i + 1];
  if (cur.error || next.error) continue;
  const boundary = cur.suras[cur.suras.length - 1];
  cur.endsAtLeast = cur.highestSeen;
  if (next.suras[0] === boundary && next.lowestSeen != null) {
    cur.endAtMost = next.lowestSeen - 1;   // next lesson starts at or before this
  } else if (next.suras[0] > boundary) {
    cur.endExactly = cur.lastAyahCount;    // sūra completes inside this lesson
  }
  next.startAtMost = next.lowestSeen;
}
const first = rows.find(r => !r.error);
if (first) first.startAtMost = first.lowestSeen;

/*
 * Chain the bounds into a candidate range for every lesson.
 *
 * A lesson starts where the previous one stopped. The previous one stopped one
 * āya before this one's earliest cited āya — or, when the two lessons do not
 * share a sūra, at the end of the previous lesson's closing sūra, which is an
 * exact boundary rather than an inferred one.
 *
 * THE ONE SYSTEMATIC ERROR, and it always leans the same way: `lowestSeen` is
 * the earliest āya CITED, not the earliest āya TREATED. Where a lesson opens on
 * verses Niasse glosses without quoting, its true start is earlier, and the
 * previous lesson's derived end is correspondingly too late. So every inferred
 * boundary below is an upper bound on the seam, never a lower one. Boundaries
 * marked `sūra-end` are not inferred at all.
 */
for (let i = 0; i < rows.length; i++) {
  const r = rows[i], next = rows[i + 1], prev = rows[i - 1];
  if (r.error) continue;

  const firstSura = r.suras[0], lastSura = r.suras[r.suras.length - 1];

  if (!prev || prev.error || prev.suras[prev.suras.length - 1] !== firstSura) {
    r.startS = firstSura; r.startA = 1; r.startKind = 'sūra-start';
  } else {
    r.startS = firstSura; r.startA = r.lowestSeen ?? 1;
    r.startKind = r.lowestSeen != null ? 'first cited' : 'unbounded';
  }

  if (!next || next.error || next.suras[0] !== lastSura) {
    r.endS = lastSura; r.endA = byId[lastSura].ayahCount; r.endKind = 'sūra-end';
  } else if (next.lowestSeen != null) {
    r.endS = lastSura; r.endA = next.lowestSeen - 1; r.endKind = 'before next';
  } else {
    r.endS = lastSura; r.endA = byId[lastSura].ayahCount; r.endKind = 'unbounded';
  }

  r.candidate = r.startS === r.endS
    ? `Q. ${r.startS}:${r.startA}–${r.endA}`
    : `Q. ${r.startS}:${r.startA}–${r.endS}:${r.endA}`;
  r.confidence = (r.startKind === 'sūra-start' && r.endKind === 'sūra-end') ? 'exact'
    : (r.startKind === 'unbounded' || r.endKind === 'unbounded') ? 'weak' : 'bounded';
}

if (BACKTEST) {
  const parse = r => {
    const m = String(r).match(/Q\.\s*(\d+):(\d+)[–-](?:(\d+):)?(\d+)/);
    return m ? { s1: +m[1], a1: +m[2], s2: m[3] ? +m[3] : +m[1], a2: +m[4] } : null;
  };
  console.log(pad('L', 4) + pad('actual', 20) + pad('inferred', 20) + 'verdict');
  console.log('-'.repeat(76));
  let exact = 0, startOk = 0, n = 0;
  for (const r of rows) {
    if (r.error) continue;
    const a = parse(r.claimed);
    if (!a) { console.log(pad(r.id, 4) + pad(r.claimed, 20) + pad(r.candidate, 20) + 'unparsed'); continue; }
    n++;
    const sameStart = a.s1 === r.startS && a.a1 === r.startA;
    const sameEnd = a.s2 === r.endS && a.a2 === r.endA;
    if (sameStart) startOk++;
    if (sameStart && sameEnd) exact++;
    console.log(pad(r.id, 4) + pad(r.claimed, 20) + pad(r.candidate, 20) +
      (sameStart && sameEnd ? 'exact' : sameStart ? 'start ok, end off' : sameEnd ? 'end ok, start off' : 'both off'));
  }
  console.log(`\n${exact}/${n} reproduced exactly · ${startOk}/${n} got the start right.`);
  console.log('The start is what matters: it is the seam, and each lesson\'s start');
  console.log('fixes the previous lesson\'s end.');
  process.exit(0);
}

if (process.argv.includes('--candidates')) {
  console.log(pad('L', 4) + pad('candidate verseRange', 26) + pad('confidence', 12) + 'boundaries');
  console.log('-'.repeat(92));
  for (const r of rows) {
    if (r.error) { console.log(pad(r.id, 4) + r.error); continue; }
    console.log(pad(r.id, 4) + pad(r.candidate, 26) + pad(r.confidence, 12) + `${r.startKind} → ${r.endKind}`);
  }
  console.log('\nEvery inferred seam is an UPPER bound: citations show where a lesson had');
  console.log('certainly begun, not where it began. Check against the print edition.');
  process.exit(0);
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 1));
  process.exit(0);
}

console.log(pad('L', 4) + pad('sūras', 16) + pad('starts ≤', 10) + pad('reaches ≥', 11) + pad('ends', 12) + 'refs  claimed');
console.log('-'.repeat(100));
for (const r of rows) {
  if (r.error) { console.log(pad(r.id, 4) + r.error); continue; }
  const ends = r.endExactly != null ? `${r.endExactly} (sūra end)`
    : r.endAtMost != null ? `≤ ${r.endAtMost}` : '?';
  console.log(
    pad(r.id, 4) +
    pad(r.suras.join(','), 16) +
    pad(r.lowestSeen ?? '—', 10) +
    pad(r.highestSeen ?? '—', 11) +
    pad(ends, 12) +
    pad(r.refs, 6) +
    r.claimed
  );
}
console.log('\n"starts ≤" is the earliest āya actually cited in the lesson\'s opening sūra:');
console.log('the lesson begins at or before it, never after. "reaches ≥" is the latest');
console.log('āya cited in its closing sūra. Neither is the answer; both bound it.');
const noSignal = rows.filter(r => !r.error && r.lowestSeen == null);
if (noSignal.length) console.log(`\nNo citation in the opening sūra, so no bound at all: ${noSignal.map(r => r.id).join(', ')}`);
