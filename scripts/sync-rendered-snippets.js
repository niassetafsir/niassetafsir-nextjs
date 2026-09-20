#!/usr/bin/env node
/**
 * The four rendered data files — footnotesData.json, term_concordance.json,
 * scholar_body.json, scholars.json — each hold frozen copies of passages that
 * live in src/data/lessons/*.json.  Nothing generates them, so every time the
 * lesson text is repaired they fall behind it silently: the site then shows a
 * corrected word in the body and the uncorrected one in the footnote panel or
 * the glossary beside it.  That has now happened three times.
 *
 * This couples them.  Every record carries a `sourceAnchor` naming the lesson
 * and field its snippet came from, plus a fingerprint of that passage:
 *
 *     "b18#4f1a9c2e8b7d3a60"          lesson 18, arabicBody, whole snippet
 *     "f24#8c0e...#37-198"            lesson 24, arabicFootnotes, chars 37-198
 *     "absent"                        that lesson has no footnote text at all
 *     "unmatched"                     source exists, but not this passage
 *     "short"                         too little text to anchor on
 *     "f6#8c0e...!witness"            reviewed: this file holds the sound
 *                                     reading and the LESSON is what needs
 *                                     fixing; `--witnesses` lists these
 *     "f5#1b2c...!review"             reviewed: neither side is right yet
 *
 * THE FINGERPRINT IS NOT A HASH OF THE TEXT.  It is a hash of the passage's
 * letter skeleton: combining marks, tatweel, spacing and punctuation dropped,
 * and every letter folded into the confusion class the OCR repairs work in —
 * qaf/fa, jim/ha, the dotted set b/t/th/n/y, nun/lam, ra/zay, sad/dad,
 * dal/dhal, ayn/ghayn, the alif/hamza/wasla family, ta marbuta/ha.  A repair
 * pass only ever moves a letter inside one of those classes, so it leaves the
 * skeleton — and the fingerprint — untouched.  Rewording, re-splitting or
 * deleting a passage changes it.  That is the whole point: the anchor survives
 * the thing that happens weekly and breaks on the thing that happens rarely.
 *
 * Drift is then caught by comparison, not by the hash.  The check finds the
 * passage by its skeleton and compares it to the snippet letter by letter, so
 * an in-class correction that has not been carried over shows up as exactly
 * what it is: this record says X where the lesson now says Y.
 *
 *   node scripts/sync-rendered-snippets.js                 check (prebuild)
 *   node scripts/sync-rendered-snippets.js --sync [--write] carry corrections over
 *   node scripts/sync-rendered-snippets.js --anchor --write  (re-)stamp anchors
 *   node scripts/sync-rendered-snippets.js --witnesses      lesson-side fixes
 *                                                           this file vouches for
 *
 * A marked record is reported but does not stop the build; an unmarked
 * disagreement does.  Markers are not a way to silence the check: --anchor
 * drops one as soon as the anchor moves, and the check says so as soon as the
 * lesson is fixed and the difference disappears.
 *
 * The lesson text is the authority.  When the lesson is the broken witness and
 * one of these files holds the sound reading, fix the lesson — see
 * scripts/repair-witnessed-letter-confusions.py — and then re-run --sync.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const LESSONS = path.join(ROOT, 'src/data/lessons');

// ---------------------------------------------------------------- the fold
const MARK = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/;
const LETTER = /[ء-غف-يٱ]/;
const TOKEN = /[ء-غف-يٱؐ-ًؚ-ٰٟۖ-ۭـ]/;
const CLASS = new Map();
const addClass = (tag, cps) => cps.forEach(c => CLASS.set(String.fromCharCode(c), tag));
// classes a repair pass moves letters within — these are also the only
// substitutions --sync will copy
addClass('A', [0x0628, 0x062A, 0x062B, 0x0646, 0x064A, 0x0649, 0x0644]);
addClass('B', [0x0641, 0x0642]);
addClass('C', [0x062C, 0x062D]);
addClass('D', [0x0635, 0x0636]);
addClass('E', [0x0631, 0x0632]);
addClass('F', [0x062F, 0x0630]);
addClass('G', [0x0639, 0x063A]);
// folded for locating, never rewritten: alif/hamza/wasla, ta marbuta/ha
const SOFT = new Map();
[0x0627, 0x0623, 0x0625, 0x0622, 0x0671].forEach(c => SOFT.set(String.fromCharCode(c), 'H'));
SOFT.set(String.fromCharCode(0x0629), 'I');
SOFT.set(String.fromCharCode(0x0647), 'I');
const fold = ch => CLASS.get(ch) || SOFT.get(ch) || ch;

/** class-folded letters of s, and the index in s each folded letter came from */
function skeleton(s) {
  let sk = '';
  const idx = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (MARK.test(ch) || !LETTER.test(ch)) continue;
    sk += fold(ch);
    idx.push(i);
  }
  return { sk, idx };
}
const fingerprint = sk => crypto.createHash('sha256').update(sk).digest('hex').slice(0, 16);

function occurrences(hay, needle) {
  const out = [];
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) out.push(i);
  return out;
}

// ------------------------------------------------------------- lesson text
const FIELD = { b: 'arabicBody', f: 'arabicFootnotes' };
const cache = new Map();
function lessonField(id, which) {
  const key = id + which;
  if (!cache.has(key)) {
    const file = path.join(LESSONS, String(id).padStart(2, '0') + '.json');
    let v = null;
    if (fs.existsSync(file)) {
      const text = JSON.parse(fs.readFileSync(file, 'utf8'))[FIELD[which]] || '';
      if (text) v = Object.assign({ text }, skeleton(text));
    }
    cache.set(key, v);
  }
  return cache.get(key);
}
/**
 * How often each bare letter form (marks stripped) occurs across every lesson
 * body and footnote.  This is what tells apart the two ways a snippet and its
 * lesson can disagree: a snippet left behind by a repair pass reads a form the
 * corpus has all but abandoned, while a snippet that preserves a sound reading
 * the lesson lost reads the form the corpus uses everywhere else.
 */
let FREQ = null;
function freq(form) {
  if (!FREQ) {
    FREQ = new Map();
    for (const id of LESSON_IDS) for (const which of ['b', 'f']) {
      const src = lessonField(id, which);
      if (!src) continue;
      for (const w of src.text.match(new RegExp(TOKEN.source + '+', 'g')) || []) {
        const k = bare(w);
        FREQ.set(k, (FREQ.get(k) || 0) + 1);
      }
    }
  }
  return FREQ.get(bare(form)) || 0;
}
const bare = s => s.replace(new RegExp(MARK.source, 'g'), '');

const LESSON_IDS = fs.readdirSync(LESSONS)
  .filter(f => /^\d\d\.json$/.test(f)).map(f => parseInt(f, 10)).sort((a, b) => a - b);

// ------------------------------------------------------------- the records
const TARGETS = [
  { file: 'src/data/footnotesData.json', field: 'arabic',
    ser: d => JSON.stringify(d),
    walk: function* (d) { for (const r of d) yield { rec: r, label: r.id || ('lesson ' + r.lessonId) }; } },
  { file: 'public/data/term_concordance.json', field: 'context',
    ser: d => JSON.stringify(d, null, 2) + '\n',
    walk: function* (d) {
      for (const t of d) (t.occurrences || []).forEach((o, i) =>
        void 0); // placeholder replaced below
    } },
  { file: 'public/data/scholar_body.json', field: 'snippet',
    ser: d => JSON.stringify(d, null, 2),
    walk: function* (d) {
      for (const [name, list] of Object.entries(d))
        for (let i = 0; i < list.length; i++) yield { rec: list[i], label: `${name}[${i}]` };
    } },
  { file: 'public/data/scholars.json', field: 'excerpt',
    ser: d => JSON.stringify(d, null, 2),
    walk: function* (d) {
      for (const [name, list] of Object.entries(d))
        for (let i = 0; i < list.length; i++) yield { rec: list[i], label: `${name}[${i}]` };
    } },
];
TARGETS[1].walk = function* (d) {
  for (const t of d) {
    const occ = t.occurrences || [];
    for (let i = 0; i < occ.length; i++) yield { rec: occ[i], label: `${t.term}[${i}]` };
  }
};

// ---------------------------------------------------------------- anchoring
const MIN_ANCHOR = 14;   // folded letters; below this a snippet cannot be placed
const MIN_GLOBAL = 60;   // folded letters, before searching outside its own lesson:
                         // an isnad formula ("... may God be pleased with him,
                         // that the Prophet, peace be upon him, said") runs to
                         // about fifty and would otherwise anchor a record to
                         // whichever lesson happened to repeat it
const MIN_FRAGMENT = 40; // folded letters, for a fragment of a snippet.  A
                         // fragment also has to be unique in the field it
                         // anchors to: "the Messenger of God, peace be upon
                         // him" is thirty letters of formula and would
                         // otherwise pin a record to the wrong sentence

/** where this text sits: its own lesson first, then the rest of the corpus */
function locate(text, lessonId, unique) {
  const { sk } = skeleton(text);
  if (sk.length < MIN_ANCHOR) return null;
  for (const which of ['b', 'f']) {
    const src = lessonField(lessonId, which);
    if (!src) continue;
    const n = occurrences(src.sk, sk).length;
    if (n && !(unique && n > 1)) return { lesson: lessonId, which };
    if (n) return null;
  }
  if (sk.length < MIN_GLOBAL) return null;
  // Outside its own lesson a passage has to be unique in the whole corpus to
  // identify anything: one hit, in one field, in one lesson.
  const found = [];
  let hits = 0;
  for (const other of LESSON_IDS) {
    for (const which of ['b', 'f']) {
      const src = lessonField(other, which);
      if (!src) continue;
      const n = occurrences(src.sk, sk).length;
      if (n) { hits += n; found.push({ lesson: other, which }); }
    }
  }
  return found.length === 1 && hits === 1 ? found[0] : null;
}

const splitPoint = s => {
  const mid = s.length >> 1;
  let left = -1, right = -1;
  for (let i = mid; i >= 0; i--) if (/\s/.test(s[i])) { left = i; break; }
  for (let i = mid; i < s.length; i++) if (/\s/.test(s[i])) { right = i; break; }
  const c = [left, right].filter(i => i > 0);
  if (!c.length) return null;
  return c.length === 2 ? (mid - left <= right - mid ? left : right) : c[0];
};

/** the whole snippet if it can be placed, else its longest placeable fragment */
function anchorFor(text, lessonId) {
  const whole = locate(text, lessonId);
  if (whole) return Object.assign({ start: 0, end: text.length }, whole);
  let best = null;
  const stack = [[0, text.length, 0]];
  while (stack.length) {
    const [s, e, depth] = stack.pop();
    if (depth >= 4) continue;
    const cut = splitPoint(text.slice(s, e));
    if (cut === null) continue;
    for (const [ps, pe] of [[s, s + cut], [s + cut, e]]) {
      const frag = text.slice(ps, pe);
      if (skeleton(frag).sk.length < MIN_FRAGMENT) continue;
      const hit = locate(frag, lessonId, true);
      if (hit) {
        if (!best || pe - ps > best.end - best.start) best = Object.assign({ start: ps, end: pe }, hit);
      } else stack.push([ps, pe, depth + 1]);
    }
  }
  return best;
}

function stamp(text, lessonId) {
  if (skeleton(text).sk.length < MIN_ANCHOR) return 'short';
  const a = anchorFor(text, lessonId);
  if (a) {
    const frag = text.slice(a.start, a.end);
    const fp = fingerprint(skeleton(frag).sk);
    const whole = a.start === 0 && a.end === text.length;
    return `${a.which}${a.lesson}#${fp}` + (whole ? '' : `#${a.start}-${a.end}`);
  }
  // nothing to compare against, or a source that does not hold this passage
  const hasFootnotes = !!lessonField(lessonId, 'f');
  const hasBody = !!lessonField(lessonId, 'b');
  return (!hasFootnotes || !hasBody) ? 'absent' : 'unmatched';
}

function parseAnchor(v) {
  if (typeof v !== 'string') return { state: 'none' };
  if (v === 'absent' || v === 'unmatched' || v === 'short') return { state: v };
  const m = /^([bf])(\d+)#([0-9a-f]{16})(?:#(\d+)-(\d+))?(?:!(witness|review))?$/.exec(v);
  if (!m) return { state: 'malformed' };
  return { state: 'anchored', which: m[1], lesson: +m[2], fp: m[3],
           start: m[4] === undefined ? null : +m[4], end: m[5] === undefined ? null : +m[5],
           flag: m[6] || null };
}

// ------------------------------------------------------------- comparison
const tokenRange = (s, i) => {
  let a = i, b = i;
  while (a > 0 && TOKEN.test(s[a - 1])) a--;
  while (b < s.length - 1 && TOKEN.test(s[b + 1])) b++;
  return [a, b];
};

/**
 * The word a difference sits in, on both sides.  footnotesData.json spaces
 * some words internally where the lesson text does not, so the record side is
 * read off the skeleton alignment — the span facing the lesson's word — rather
 * than by looking for token boundaries in the snippet, which would return a
 * single letter and compare nonsense.
 */
function alignedWords(frag, cmp, src, d) {
  const [ts, te] = tokenRange(src.text, d.srcAt);
  let k0 = d.k, k1 = d.k;
  while (k0 > 0 && src.idx[cmp.at + k0 - 1] >= ts) k0--;
  while (k1 < cmp.pidx.length - 1 && cmp.at + k1 + 1 < src.idx.length
         && src.idx[cmp.at + k1 + 1] <= te) k1++;
  const cut0 = k0 === 0 && src.idx[cmp.at] > ts;          // fragment starts mid-word
  const cut1 = k1 === cmp.pidx.length - 1 && src.idx[cmp.at + k1] < te;
  return { lesson: src.text.slice(ts, te + 1),
           record: (cut0 ? '\u2026' : '') + frag.slice(cmp.pidx[k0], cmp.pidx[k1] + 1) + (cut1 ? '\u2026' : ''),
           recordAt: cmp.pidx[k0] };
}
const tidy = w => w.replace(/\s+/g, ' ').trim();
const compact = w => w.replace(/\s+/g, '');

/**
 * Compare a snippet fragment against every place the lesson holds that
 * skeleton.  Returns the best agreement: no differences if one place matches
 * letter for letter, otherwise the fewest differences found.
 */
function compare(frag, src) {
  const { sk, idx } = skeleton(frag);
  const hits = occurrences(src.sk, sk);
  if (!hits.length) return { found: false };
  let best = null;
  for (const h of hits) {
    const drift = [], ortho = [];
    for (let k = 0; k < sk.length; k++) {
      const a = frag[idx[k]], b = src.text[src.idx[h + k]];
      if (a === b) continue;
      const variant = (a === '\u0649' && b === '\u064A') || (a === '\u064A' && b === '\u0649');
      (!variant && CLASS.has(a) && CLASS.get(a) === CLASS.get(b) ? drift : ortho)
        .push({ k, at: idx[k], from: a, to: b, srcAt: src.idx[h + k] });
    }
    if (!best || drift.length < best.drift.length) best = { found: true, at: h, drift, ortho, pidx: idx };
    if (!drift.length) break;
  }
  return best;
}

// ------------------------------------------------------------------ modes
const argv = process.argv.slice(2);
const decisionFile = (argv.find(a => a.startsWith('--decisions=')) || '').split('=')[1];
const DECISIONS = decisionFile
  ? new Map(fs.readFileSync(decisionFile, 'utf8').trim().split('\n')
      .map(l => l.split('\t')).map(([f, label, rw, lw, verdict]) => [`${f}\t${label}\t${rw}\t${lw}`, verdict]))
  : null;
const MODE = argv.includes('--anchor') ? 'anchor' : argv.includes('--sync') ? 'sync'
  : argv.includes('--witnesses') ? 'witnesses' : argv.includes('--diffs') ? 'diffs'
  : argv.includes('--adjudicate') ? 'adjudicate' : 'check';
const WRITE = argv.includes('--write');
const HERE = 'node scripts/sync-rendered-snippets.js';

const tally = { records: 0, anchored: 0, absent: 0, unmatched: 0, short: 0,
                ortho: 0, changed: 0, left: 0, witness: 0, review: 0,
                notes: [], problems: [], witnesses: [] };

for (const target of TARGETS) {
  const file = path.join(ROOT, target.file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let dirty = false;

  for (const { rec, label } of target.walk(data)) {
    const text = rec[target.field];
    const lessonId = rec.lessonId;
    if (typeof text !== 'string' || typeof lessonId !== 'number') continue;
    tally.records++;

    if (MODE === 'anchor') {
      let v = stamp(text, lessonId);
      const was = parseAnchor(rec.sourceAnchor);
      // a reviewed exception survives re-anchoring only if it is still the same
      // anchor; a moved anchor has to be reviewed again
      if (was.flag && rec.sourceAnchor.split('!')[0] === v) v += '!' + was.flag;
      if (rec.sourceAnchor !== v) { rec.sourceAnchor = v; dirty = true; }
      const st = parseAnchor(v).state;
      tally[st === 'anchored' ? 'anchored' : st]++;
      continue;
    }

    const a = parseAnchor(rec.sourceAnchor);
    if (a.state === 'none' || a.state === 'malformed') {
      tally.problems.push({ file: target.file, label, lessonId, kind: 'no anchor',
        detail: a.state === 'none'
          ? 'this record has no `sourceAnchor`'
          : `\`source\` is not a valid anchor: ${JSON.stringify(rec.sourceAnchor)}` });
      continue;
    }
    if (a.state !== 'anchored') {
      tally[a.state]++;
      // not an error: there is nothing to compare against.  Say so when that
      // changes, so the record can be picked up rather than sitting unchecked.
      const now = stamp(text, lessonId);
      if (parseAnchor(now).state === 'anchored')
        tally.notes.push(`${target.file}  ${label}  marked "${a.state}" but its passage is now in `
          + `lesson ${parseAnchor(now).lesson} ${FIELD[parseAnchor(now).which]} — re-anchor with \`${HERE} --anchor --write\``);
      continue;
    }

    tally.anchored++;
    const frag = a.start === null ? text : text.slice(a.start, a.end);
    if (fingerprint(skeleton(frag).sk) !== a.fp) {
      tally.problems.push({ file: target.file, label, lessonId, kind: 'snippet edited',
        detail: 'the snippet no longer matches the passage it is anchored to (words added, removed or reordered).\n'
          + `      anchor says lesson ${a.lesson} ${FIELD[a.which]}; snippet begins: ${frag.slice(0, 60).replace(/\n/g, ' ')}`,
        fix: `re-anchor with \`${HERE} --anchor --write\` if the snippet was changed on purpose` });
      continue;
    }
    const src = lessonField(a.lesson, a.which);
    if (!src) {
      tally.problems.push({ file: target.file, label, lessonId, kind: 'source gone',
        detail: `lesson ${a.lesson} no longer has ${FIELD[a.which]} text at all`,
        fix: `restore the lesson field, or re-anchor with \`${HERE} --anchor --write\`` });
      continue;
    }
    const cmp = compare(frag, src);
    if (!cmp.found) {
      tally.problems.push({ file: target.file, label, lessonId, kind: 'source moved',
        detail: `the passage this snippet copies is no longer in lesson ${a.lesson} ${FIELD[a.which]}\n`
          + `      snippet begins: ${frag.slice(0, 60).replace(/\n/g, ' ')}`,
        fix: `if the lesson was reworded on purpose, re-anchor with \`${HERE} --anchor --write\`` });
      continue;
    }
    if (cmp.ortho.length) tally.ortho++;
    if (!cmp.drift.length) {
      if (a.flag) tally.notes.push(`${target.file}  ${label}  marked !${a.flag} but it now agrees with `
        + `lesson ${a.lesson} ${FIELD[a.which]} — clear the marker with \`${HERE} --anchor --write\``);
      continue;
    }

    // Which side does the corpus back?  A difference where the lesson's form is
    // the one the corpus uses is a snippet left behind by a repair pass.  A
    // difference where the SNIPPET's form is the common one is the opposite
    // case: the lesson is the broken witness and these files kept the sound
    // reading.  That has happened at least six times already, so --sync never
    // touches those — the lesson has to be fixed instead.
    const base = a.start === null ? 0 : a.start;
    const diffs = cmp.drift.map(d => {
      const w = alignedWords(frag, cmp, src, d);
      const fr = freq(compact(w.record)), fl = freq(compact(w.lesson));
      return { d, abs: base + d.at, record: tidy(w.record), lesson: tidy(w.lesson), fr, fl,
               verdict: fl > fr ? 'stale' : fr > fl ? 'witness' : 'unclear' };
    });
    const stale = diffs.filter(x => x.verdict === 'stale');
    const witness = diffs.filter(x => x.verdict !== 'stale');
    const show = list => {
      const seen = new Set();
      return list.filter(x => !seen.has(x.record + x.lesson) && seen.add(x.record + x.lesson));
    };

    if (MODE === 'diffs') {
      show(diffs).forEach(x => console.log([target.file, label, a.lesson, FIELD[a.which], x.d.srcAt,
        tidy(x.record), tidy(x.lesson), x.fr, x.fl, x.verdict,
        tidy(src.text.slice(Math.max(0, x.d.srcAt - 45), x.d.srcAt + 35))].join('\t')));
      continue;
    }

    if (MODE === 'witnesses') {
      const list = a.flag === 'witness' ? diffs : a.flag ? [] : witness;
      show(list).forEach(x => console.log(
        [target.file, label, a.lesson, FIELD[a.which], x.d.srcAt, compact(x.lesson), compact(x.record),
         /\u2026/.test(x.record) ? 'partial-span' : ''].join('\t')));
      continue;
    }

    if (MODE === 'adjudicate') {
      // keyed by the pair of words, not by the changed letter: a word can need
      // two letters put right, and both have to follow the same verdict
      const verdict = d => DECISIONS.get(`${target.file}\t${label}\t${d.record}\t${d.lesson}`) || 'unjudged';
      const take = diffs.filter(d => verdict(d) === 'sync');
      const keep = diffs.filter(d => verdict(d) !== 'sync');
      if (take.length) {
        const chars = Array.from(text);
        take.forEach(x => { chars[x.abs] = x.d.to; });
        rec[target.field] = chars.join('');
        dirty = true; tally.changed++;
        show(take).forEach(x => console.log(`  sync    ${target.file}  ${label}  ${x.record} -> ${x.lesson}`));
      }
      if (keep.length) {
        const flag = keep.some(d => verdict(d) === 'witness') ? 'witness' : 'review';
        if (keep.some(d => verdict(d) === 'unjudged'))
          console.log(`  UNJUDGED ${target.file}  ${label} — left as is, will fail the check`);
        else {
          rec.sourceAnchor = rec.sourceAnchor.split('!')[0] + '!' + flag;
          dirty = true; tally.left++;
          show(keep).forEach(x => console.log(`  ${flag}  ${target.file}  ${label}  `
            + `record ${x.record}  vs lesson ${x.lesson}`));
        }
      }
      continue;
    }

    if (MODE === 'sync') {
      if (a.flag) {
        tally.left += diffs.length;
        console.log(`  left alone  ${target.file}  ${label} — marked !${a.flag}: `
          + `the lesson, not this file, is what needs fixing here`);
        continue;
      }
      if (stale.length) {
        const chars = Array.from(text);
        stale.forEach(x => { chars[x.abs] = x.d.to; });
        rec[target.field] = chars.join('');
        dirty = true;
        tally.changed++;
        show(stale).forEach(x => console.log(`  ${target.file}  ${label}  ${x.record} -> ${x.lesson}`));
      }
      if (witness.length) {
        tally.left += witness.length;
        show(witness).forEach(x => console.log(`  left alone  ${target.file}  ${label}  `
          + `record ${x.record} (${x.fr}x in the corpus) vs lesson ${x.lesson} (${x.fl}x) `
          + `— the lesson looks like the broken witness`));
      }
      continue;
    }

    if (a.flag) {
      tally[a.flag]++;
      show(diffs).forEach(x => tally.notes.push(`${target.file}  ${label}  !${a.flag}  `
        + `record ${x.record}  vs lesson ${a.lesson} ${FIELD[a.which]} ${x.lesson}`));
      continue;
    }

    const lines = l => show(l).slice(0, 6)
      .map(x => `        record: ${x.record}  (${x.fr}x)    lesson: ${x.lesson}  (${x.fl}x)`).join('\n')
      + (show(l).length > 6 ? `\n        ... and ${show(l).length - 6} more` : '');

    if (stale.length) tally.problems.push({ file: target.file, label, lessonId, kind: 'out of sync',
      detail: `${stale.length} word${stale.length > 1 ? 's' : ''} behind lesson ${a.lesson} `
        + `${FIELD[a.which]} — the lesson's readings are the ones the corpus uses:\n${lines(stale)}`,
      fix: `carry them over with \`${HERE} --sync --write\`` });

    if (witness.length) tally.witnesses.push({ file: target.file, label, lessonId, kind: 'lesson may be the broken witness',
      detail: `${witness.length} word${witness.length > 1 ? 's' : ''} differ from lesson ${a.lesson} `
        + `${FIELD[a.which]}, and here this file holds the reading the corpus backs:\n${lines(witness)}`,
      fix: `fix the lesson (scripts/repair-witnessed-letter-confusions.py), then re-run — `
        + `\`${HERE} --witnesses\` prints these as lesson/field/offset/from/to` });
  }

  if (dirty && WRITE) fs.writeFileSync(file, target.ser(data));
  else if (dirty) console.log(`(dry run) ${target.file} would change — pass --write`);
}

// ----------------------------------------------------------------- output
if (MODE === 'anchor') {
  console.log(`anchored ${tally.anchored} of ${tally.records} records · `
    + `${tally.absent} source absent · ${tally.unmatched} unmatched · ${tally.short} too short`);
  if (!WRITE) console.log('(dry run — pass --write to stamp the files)');
  process.exit(0);
}
if (MODE === 'witnesses' || MODE === 'diffs') process.exit(0);
if (MODE === 'adjudicate') {
  console.log(`${tally.changed} snippets synced, ${tally.left} marked as reviewed exceptions`
    + (WRITE ? '' : ' (dry run — pass --write)'));
  process.exit(0);
}
if (MODE === 'sync') {
  console.log(`${tally.changed} snippet${tally.changed === 1 ? '' : 's'} brought back into line`
    + (tally.left ? `, ${tally.left} difference${tally.left === 1 ? '' : 's'} left for the lesson to fix` : '')
    + (WRITE ? '' : ' (dry run — pass --write)'));
  process.exit(0);
}

console.log(`snippet check: ${tally.records} records \u00b7 ${tally.anchored} checked against the lesson text \u00b7 `
  + `${tally.absent} source absent \u00b7 ${tally.unmatched} unmatched \u00b7 ${tally.short} too short`);
tally.notes.slice(0, 20).forEach(n => console.log(`note  ${n}`));
if (tally.notes.length > 20) console.log(`note  ... and ${tally.notes.length - 20} more`);
if (tally.ortho) console.log(`${tally.ortho} records differ only in hamza, alif or alif-maksura form — tolerated, no repair pass moves those`);

const all = tally.problems.concat(tally.witnesses);
if (!all.length) {
  console.log('all anchored snippets agree with the lesson text.');
  process.exit(0);
}
console.log('');
for (const p of all.slice(0, 40)) {
  console.log(`FAIL  ${p.file}  ${p.label}  (lesson ${p.lessonId})`);
  console.log(`      ${p.kind}: ${p.detail}`);
  if (p.fix) console.log(`      ${p.fix}`);
  console.log('');
}
if (all.length > 40) console.log(`... and ${all.length - 40} more\n`);
const behind = tally.problems.filter(p => p.kind === 'out of sync').length;
const other = tally.problems.length - behind;
console.log([
  behind ? `${behind} snippet${behind === 1 ? '' : 's'} behind the lesson text` : '',
  other ? `${other} whose passage has moved or been edited` : '',
  tally.witnesses.length ? `${tally.witnesses.length} where the lesson looks like the broken witness` : '',
].filter(Boolean).join(', ') + ' — build stopped.');
process.exit(1);
