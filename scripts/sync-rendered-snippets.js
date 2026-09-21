#!/usr/bin/env node
/**
 * The four rendered data files — footnotesData.json, term_concordance.json,
 * scholar_body.json, scholars.json — each hold frozen copies of passages that
 * live in src/data/lessons/*.json.  Nothing generates them, so every time the
 * lesson text is repaired they fall behind it silently: the site then shows a
 * corrected word in the body and the uncorrected one in the footnote panel or
 * the glossary beside it.  This couples them.
 *
 * Every record carries a `sourceAnchor`:
 *
 *   "b18#4f1a9c2e8b7d3a60=8c0e14ab9d2f7e35"   lesson 18, arabicBody
 *   "f24#8c0e…#37-198"                        lesson 24, footnotes, chars 37-198
 *   "f1#1b2c…!lesson"                         the LESSON is the broken witness here
 *   "b23#77ff…!settled:Q9.112"                both readings are wrong; the aya settles it
 *   "f6#31aa…!review"                         unresolved
 *   "absent" | "unmatched" | "short"          no source to check against
 *
 * THE FIRST FINGERPRINT IS NOT A HASH OF THE TEXT.  It hashes the passage's
 * letter skeleton: marks, tatweel, spacing and punctuation dropped, every
 * letter folded into the confusion class the OCR repairs work in — qaf/fa,
 * jim/ha, the dotted set b/t/th/n/y, nun/lam, ra/zay, sad/dad, dal/dhal,
 * ayn/ghayn, the alif/hamza/wasla family, ta marbuta/ha.  A repair pass only
 * moves letters inside those classes, so it leaves the skeleton untouched;
 * rewording, re-splitting or deleting a passage changes it.  The anchor
 * survives what happens weekly and breaks on what happens rarely.
 *
 * The second fingerprint, after "=", is an exact hash of the snippet as it
 * stood the last time it agreed with the lesson letter for letter.  That is
 * what makes staleness PROVABLE: if the snippet still hashes to it and the
 * lesson now reads differently, only the lesson can have moved, so the record
 * is behind and --sync will carry the lesson's reading over.  Nothing else is
 * treated as proof.  Where both sides have moved, or where the two never
 * agreed, the check names both readings and says so — it does not guess which
 * is right, because frequency and plausibility both get that wrong: a rare
 * reading can be the sound one and a common word can be nonsense in place.
 *
 *   node scripts/sync-rendered-snippets.js                    check (prebuild)
 *   node scripts/sync-rendered-snippets.js --sync --write     carry the lesson over
 *   node scripts/sync-rendered-snippets.js --anchor --write   (re-)stamp anchors
 *   node scripts/sync-rendered-snippets.js --disagreements    every live difference
 *   node scripts/sync-rendered-snippets.js --witnesses        ones the lesson should be fixed from
 *   node scripts/sync-rendered-snippets.js --settled          ones an aya settles, unwritable
 *   node scripts/sync-rendered-snippets.js --mark --decisions=FILE --write
 *
 * The build stops only on a record that is provably stale, on a snippet whose
 * passage has been reworded, and on one whose source has vanished.  A
 * disagreement a person still has to judge is reported, not gated: a gate that
 * cries wolf gets switched off.
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
addClass('A', [0x0628, 0x062A, 0x062B, 0x0646, 0x064A, 0x0649, 0x0644]);
addClass('B', [0x0641, 0x0642]);
addClass('C', [0x062C, 0x062D]);
addClass('D', [0x0635, 0x0636]);
addClass('E', [0x0631, 0x0632]);
addClass('F', [0x062F, 0x0630]);
addClass('G', [0x0639, 0x063A]);
const SOFT = new Map();
[0x0627, 0x0623, 0x0625, 0x0622, 0x0671].forEach(c => SOFT.set(String.fromCharCode(c), 'H'));
SOFT.set(String.fromCharCode(0x0629), 'I');
SOFT.set(String.fromCharCode(0x0647), 'I');
const fold = ch => CLASS.get(ch) || SOFT.get(ch) || ch;

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
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const tidy = w => w.replace(/\s+/g, ' ').trim();
const compact = w => w.replace(/\s+/g, '');

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
      for (const t of d) {
        const occ = t.occurrences || [];
        for (let i = 0; i < occ.length; i++) yield { rec: occ[i], label: `${t.term}[${i}]` };
      }
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

// ---------------------------------------------------------------- anchoring
const MIN_ANCHOR = 14;   // folded letters; below this a snippet cannot be placed
const MIN_GLOBAL = 60;   // folded letters, before searching outside its own lesson:
                         // an isnad formula runs to about fifty and would
                         // otherwise anchor a record to whichever lesson
                         // happened to repeat it
const MIN_FRAGMENT = 40; // folded letters for a fragment, which must also be
                         // unique in the field it anchors to

function locate(text, lessonId, unique) {
  const { sk } = skeleton(text);
  if (sk.length < MIN_ANCHOR) return null;
  for (const which of ['b', 'f']) {
    const src = lessonField(lessonId, which);
    if (!src) continue;
    const n = occurrences(src.sk, sk).length;
    if (n) return unique && n > 1 ? null : { lesson: lessonId, which };
  }
  if (sk.length < MIN_GLOBAL) return null;
  // Outside its own lesson a passage must be unique in the whole corpus.
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

function parseAnchor(v) {
  if (typeof v !== 'string') return { state: 'none' };
  if (v === 'absent' || v === 'unmatched' || v === 'short') return { state: v };
  const m = /^([bf])(\d+)#([0-9a-f]{16})(?:#(\d+)-(\d+))?(?:=([0-9a-f]{16}))?(?:!([a-z]+(?::[\w.:-]+)?))?$/.exec(v);
  if (!m) return { state: 'malformed' };
  return { state: 'anchored', which: m[1], lesson: +m[2], fp: m[3],
           start: m[4] === undefined ? null : +m[4], end: m[5] === undefined ? null : +m[5],
           agreed: m[6] || null, flag: m[7] || null };
}
const flagName = f => (f || '').split(':')[0];
const flagRef = f => (f || '').split(':')[1] || '';

// ------------------------------------------------------------- comparison
//
// Two jobs must not be confused here.
//
// Deciding WHAT A PASSAGE SAYS — whether this sentence quotes that aya, which
// of two readings is the sound one — is not something a similarity score can
// answer, and this file never tries: a difference it cannot account for is
// reported for a person to judge, never guessed at.
//
// Deciding WHETHER TWO STRINGS ARE THE SAME PASSAGE is a different question,
// and a bounded edit distance is a fair answer to it.  That is the only job
// the threshold below does: it decides whether the sentence in the lesson is
// the same sentence this record copied, so that the letters can then be
// compared and shown.  It licenses no claim about which letters are right.
//
// The rule stopped being "the eight confusion classes", then stopped being
// "the same length with three positions substituted", because both described
// the shape repairs happened to take that week rather than what a repair is.
// What holds across all of them: a repair corrects letters inside words it
// leaves standing, while a reword adds, removes or reorders words.  So:
//
//   * the whole snippet must align against the candidate, end to end;
//   * the edit distance must be small relative to length — one edit per fifty
//     letters, never fewer than three;
//   * no single run of inserted or dropped letters may exceed two, so a
//     clause can never qualify however small the distance is beside a long
//     passage;
//   * exactly one window may fit — not the cheapest of several, since a
//     lesson repeats its formulas and there is no basis for preferring the
//     closer copy of two.
//
// Word order comes free: the alignment preserves it, and a reordering shows up
// as a large distance.  Word count is guarded by the run cap.  A dropped or
// restored one-letter word passes as a repair, which is what it is.
const EDIT_FLOOR = 2;      // two edits at the very least: a pass can correct one
                           // letter and drop another in the same sentence
const EDIT_RATE = 50;      // and one more per fifty letters beyond that
const MAX_RUN = 2;         // a longer run of indels is a clause, not a correction
const MIN_REALIGN = 40;    // folded letters.  The floor and the budget meet here:
                           // forty letters is about ten words and buys two edits,
                           // five per cent of them, which a different sentence
                           // does not fit through.  A floor of three edits at
                           // twenty-four letters — six words — did, so both moved.
                           // Fragment anchors need forty letters as well, so
                           // nothing anchored is left unable to be placed.
const editBudget = n => Math.max(EDIT_FLOOR, Math.ceil(n / EDIT_RATE));

const tokenRange = (s, i) => {
  let a = i, b = i;
  while (a > 0 && TOKEN.test(s[a - 1])) a--;
  while (b < s.length - 1 && TOKEN.test(s[b + 1])) b++;
  return [a, b];
};

/**
 * Global alignment of the whole pattern against hay starting at `start`,
 * allowing the end to fall anywhere within the budget.  Returns the cost, the
 * longest run of inserted or dropped letters, and the edit script.
 */
function align(pattern, hay, start, budget) {
  const n = pattern.length;
  const m = Math.min(hay.length - start, n + budget);
  if (m < n - budget) return null;
  const INF = 1e9;
  const width = m + 1;
  const D = new Int32Array((n + 1) * width).fill(INF);
  const at = (i, j) => i * width + j;
  D[0] = 0;
  for (let j = 1; j <= Math.min(budget, m); j++) D[at(0, j)] = j;
  for (let i = 1; i <= n; i++) {
    const lo = Math.max(0, i - budget), hi = Math.min(m, i + budget);
    for (let j = lo; j <= hi; j++) {
      let best = INF;
      if (j > 0) {
        const sub = D[at(i - 1, j - 1)];
        if (sub < INF) best = sub + (pattern[i - 1] === hay[start + j - 1] ? 0 : 1);
        const ins = D[at(i, j - 1)];                       // a letter the lesson has
        if (ins + 1 < best) best = ins + 1;
      }
      const del = D[at(i - 1, j)];                          // a letter only the record has
      if (del + 1 < best) best = del + 1;
      D[at(i, j)] = best;
    }
  }
  let endJ = -1, cost = INF;
  for (let j = Math.max(0, n - budget); j <= m; j++) {
    if (D[at(n, j)] < cost) { cost = D[at(n, j)]; endJ = j; }
  }
  if (endJ < 0 || cost >= INF) return null;

  const ops = [];
  let i = n, j = endJ, run = 0, maxRun = 0;
  while (i > 0 || j > 0) {
    const here = D[at(i, j)];
    if (i > 0 && j > 0 && here === D[at(i - 1, j - 1)] + (pattern[i - 1] === hay[start + j - 1] ? 0 : 1)) {
      ops.push({ op: 'pair', k: i - 1, j: start + j - 1 }); i--; j--; run = 0;
    } else if (i > 0 && here === D[at(i - 1, j)] + 1) {
      ops.push({ op: 'del', k: i - 1, j: start + j }); i--; run++;
    } else if (j > 0 && here === D[at(i, j - 1)] + 1) {
      ops.push({ op: 'ins', k: i, j: start + j - 1 }); j--; run++;
    } else break;
    if (run > maxRun) maxRun = run;
  }
  ops.reverse();
  return { cost, ops, maxRun, at: start, end: start + endJ };
}

/**
 * Where this passage now sits in the field, if it still sits there at all.
 * Candidates come from blocks of the pattern that survived untouched; each is
 * then aligned in full.  A tie is no answer, so it returns nothing.
 */
function realign(pattern, hay) {
  const n = pattern.length;
  if (n < MIN_REALIGN || !hay.length) return null;
  const budget = editBudget(n);
  const blocks = budget + 1;
  const size = Math.floor(n / blocks);
  if (size < 6) return null;
  const starts = new Set();
  for (let b = 0; b < blocks; b++) {
    const off = b * size;
    const block = pattern.slice(off, b === blocks - 1 ? n : off + size);
    for (let i = hay.indexOf(block); i !== -1; i = hay.indexOf(block, i + 1)) {
      for (let d = -budget; d <= budget; d++) {
        const st = i - off + d;
        if (st >= 0 && st + n - budget <= hay.length) starts.add(st);
      }
      if (starts.size > 400) break;
    }
  }
  // Every window inside the budget is a candidate for being this passage, so
  // more than one of them — at whatever cost — means the passage has not been
  // identified.  Windows that overlap are the same passage aligned a letter or
  // two apart, and the cheapest of those is the right alignment; windows that
  // do not overlap are rival answers, and there is no basis for preferring the
  // cheaper.  A lesson repeats its formulas, so this happens.
  const accepted = [];
  for (const st of starts) {
    const a = align(pattern, hay, st, budget);
    if (a && a.cost <= budget && a.maxRun <= MAX_RUN) accepted.push(a);
  }
  if (!accepted.length) return null;
  accepted.sort((x, y) => x.at - y.at || x.cost - y.cost);
  let clusters = 0, reach = -1, best = null;
  for (const a of accepted) {
    if (a.at >= reach) clusters++;
    reach = Math.max(reach, a.end);
    if (!best || a.cost < best.cost) best = a;
  }
  return clusters > 1 ? { ambiguous: true } : best;
}

function compare(frag, src) {
  const { sk, idx } = skeleton(frag);
  const YA = String.fromCharCode(0x064A), ALIF_MAKSURA = String.fromCharCode(0x0649);
  // hamza seat, alif form, ta marbuta and alif maksura / ya are orthographic
  // variants; no repair pass moves them
  const variant = (a, b) => (a === ALIF_MAKSURA && b === YA) || (a === YA && b === ALIF_MAKSURA)
    || (SOFT.has(a) && SOFT.get(a) === SOFT.get(b));

  const read = ops => {
    const drift = [], ortho = [], k2j = new Map(), j2k = new Map();
    for (const o of ops) {
      if (o.op === 'pair') {
        k2j.set(o.k, o.j); j2k.set(o.j, o.k);
        const a = frag[idx[o.k]], b = src.text[src.idx[o.j]];
        if (a === b) continue;
        (variant(a, b) ? ortho : drift).push({ kind: 'sub', k: o.k, j: o.j, at: idx[o.k],
                                              from: a, to: b, srcAt: src.idx[o.j] });
      } else if (o.op === 'del') {
        drift.push({ kind: 'del', k: o.k, j: o.j, at: idx[o.k], from: frag[idx[o.k]], to: '',
                     srcAt: src.idx[Math.min(o.j, src.idx.length - 1)] });
      } else {
        drift.push({ kind: 'ins', k: o.k, j: o.j, at: idx[Math.min(o.k, idx.length - 1)],
                     from: '', to: src.text[src.idx[o.j]], srcAt: src.idx[o.j] });
      }
    }
    return { drift, ortho, k2j, j2k };
  };

  let best = null;
  for (const h of occurrences(src.sk, sk)) {
    const ops = [];
    for (let k = 0; k < sk.length; k++) ops.push({ op: 'pair', k, j: h + k });
    const r = read(ops);
    if (!best || r.drift.length < best.drift.length)
      best = Object.assign({ found: true, at: h, pidx: idx, edits: 0, maxRun: 0 }, r);
    if (!r.drift.length) break;
  }
  if (best) return best;

  // Not at this skeleton.  Repairs now insert and drop letters as well as
  // substitute them, so look for the same passage rather than the same shape.
  const win = realign(sk, src.sk);
  if (!win) return { found: false };
  if (win.ambiguous) return { found: false, ambiguous: true };
  return Object.assign({ found: true, at: win.at, pidx: idx, edits: win.cost, maxRun: win.maxRun },
                       read(win.ops));
}

/**
 * The word a difference sits in, on both sides.  footnotesData.json spaces
 * some words internally where the lesson does not, so the record side is read
 * off the alignment — the span facing the lesson's word — rather than by
 * looking for token boundaries in the snippet, which would return a single
 * letter and compare nonsense.
 */
function alignedWords(frag, cmp, src, d) {
  const [ts, te] = tokenRange(src.text, d.srcAt);
  let j0 = d.j, j1 = d.j;
  while (j0 > 0 && src.idx[j0 - 1] >= ts) j0--;
  while (j1 < src.idx.length - 1 && src.idx[j1 + 1] <= te) j1++;
  const ks = [];
  for (let j = j0; j <= j1; j++) if (cmp.j2k.has(j)) ks.push(cmp.j2k.get(j));
  const lesson = src.text.slice(ts, te + 1);
  if (!ks.length) return { lesson, record: '—', partial: false };
  const k0 = Math.min(...ks), k1 = Math.max(...ks);
  const cut0 = k0 === 0 && !cmp.j2k.has(j0);
  const cut1 = k1 === cmp.pidx.length - 1 && !cmp.j2k.has(j1);
  return { lesson,
           record: (cut0 ? '…' : '') + frag.slice(cmp.pidx[k0], cmp.pidx[k1] + 1) + (cut1 ? '…' : ''),
           partial: cut0 || cut1 };
}

/**
 * Rewrite the snippet as the lesson now has it, keeping the snippet's own
 * spacing and punctuation.  Letters are substituted in place; a letter the
 * lesson dropped goes with the marks that sat on it; a letter the lesson has
 * arrives with its marks, after the previous letter and its marks and before
 * whatever spacing follows.
 */
function applyEdits(frag, cmp, src) {
  const marksAfter = (s, i) => { let j = i + 1; while (j < s.length && MARK.test(s[j])) j++; return j; };
  const drop = new Map(), put = new Map(), sub = new Map();
  for (const d of cmp.drift) {
    if (d.kind === 'sub') sub.set(d.at, d.to);
    else if (d.kind === 'del') drop.set(d.k, true);
    else {
      if (!put.has(d.k)) put.set(d.k, []);
      put.get(d.k).push(src.text.slice(src.idx[d.j], marksAfter(src.text, src.idx[d.j])));
    }
  }
  let out = '', cursor = 0;
  for (let k = 0; k < cmp.pidx.length; k++) {
    const at = cmp.pidx[k];
    const gapEnd = at;                       // non-letters before this letter
    let gap = frag.slice(cursor, gapEnd);
    // Marks at the head of the gap belong to the previous letter and an
    // inserted letter goes after them.  footnotesData.json puts spaces between
    // a letter and its own marks ("al-la <fatha> ha"), so the run to step over
    // is marks and the spacing between them, up to the last mark.
    let head = 0, seen = 0;
    for (let q = 0; q < gap.length && (MARK.test(gap[q]) || /\s/.test(gap[q])); q++)
      if (MARK.test(gap[q])) { seen++; head = q + 1; }
    out += gap.slice(0, head);
    if (put.has(k)) out += put.get(k).join('');
    out += gap.slice(head);
    const after = marksAfter(frag, at);
    if (!drop.has(k)) out += (sub.has(at) ? sub.get(at) : frag[at]) + frag.slice(at + 1, after);
    cursor = after;
  }
  let tail = frag.slice(cursor);
  let head = 0; while (head < tail.length && MARK.test(tail[head])) head++;
  out += tail.slice(0, head);
  if (put.has(cmp.pidx.length)) out += put.get(cmp.pidx.length).join('');
  out += tail.slice(head);
  return out;
}

// ------------------------------------------------------------------ modes
const argv = process.argv.slice(2);
const MODE = argv.includes('--restore') ? 'restore'
  : argv.includes('--anchor') ? 'anchor'
  : argv.includes('--sync') ? 'sync'
  : argv.includes('--mark') ? 'mark'
  : argv.includes('--witnesses') ? 'witnesses'
  : argv.includes('--settled') ? 'settled'
  : argv.includes('--disagreements') ? 'disagreements'
  : 'check';
const WRITE = argv.includes('--write');
const HERE = 'node scripts/sync-rendered-snippets.js';
const decisionFile = (argv.find(a => a.startsWith('--decisions=')) || '').split('=')[1];
const FROM = (argv.find(a => a.startsWith('--from=')) || '').split('=')[1];
const DECISIONS = decisionFile
  ? new Map(fs.readFileSync(decisionFile, 'utf8').trim().split('\n')
      .map(l => l.split('\t')).map(([f, label, flag]) => [`${f}\t${label}`, flag]))
  : null;

const tally = { records: 0, anchored: 0, absent: 0, unmatched: 0, short: 0, ortho: 0,
                agreed: 0, changed: 0, skipped: 0, marked: 0, realigned: 0,
                kept: [], spent: [], notes: [], problems: [], open: [] };

/** the anchor string for a snippet as it stands now */
function stamp(text, lessonId, keepFlag, existing, raw) {
  // Re-anchoring a record whose difference is a handful of corrected letters
  // would re-fingerprint the damaged snippet and freeze it as the accepted
  // reading.  Keep the anchor as it is and say so: --sync is what that case
  // wants.
  if (existing && existing.state === 'anchored') {
    const frag0 = existing.start === null ? text : text.slice(existing.start, existing.end);
    const src0 = lessonField(existing.lesson, existing.which);
    if (src0 && hash(skeleton(frag0).sk) === existing.fp) {
      const cmp0 = compare(frag0, src0);
      if (cmp0.found && cmp0.edits) { tally.kept.push({ raw }); return raw; }
    }
  }
  if (skeleton(text).sk.length < MIN_ANCHOR) return 'short';
  const a = anchorFor(text, lessonId);
  if (!a) {
    const hasBoth = lessonField(lessonId, 'b') && lessonField(lessonId, 'f');
    return hasBoth ? 'unmatched' : 'absent';
  }
  const frag = text.slice(a.start, a.end);
  const whole = a.start === 0 && a.end === text.length;
  let v = `${a.which}${a.lesson}#${hash(skeleton(frag).sk)}` + (whole ? '' : `#${a.start}-${a.end}`);
  const src = lessonField(a.lesson, a.which);
  const cmp = compare(frag, src);
  // A judgement written into the data is an editorial decision, and a build
  // step does not get to delete one.  When the difference it was recorded
  // against has gone, the flag stays and is reported as spent; clearing it is
  // a deliberate act: --mark with "-".
  if (cmp.found && !cmp.drift.length) return v + '=' + hash(frag) + (keepFlag ? '!' + keepFlag : '');
  if (keepFlag) v += '!' + keepFlag;
  return v;
}

/** the named records as a git revision had them, for --restore */
function asOf(rev, target) {
  const raw = require('child_process')
    .execFileSync('git', ['-C', ROOT, 'show', `${rev}:${target.file}`], { maxBuffer: 1 << 28 })
    .toString('utf8');
  const out = new Map();
  for (const { rec, label } of target.walk(JSON.parse(raw)))
    out.set(label, { text: rec[target.field], anchor: rec.sourceAnchor });
  return out;
}

for (const target of TARGETS) {
  const file = path.join(ROOT, target.file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let dirty = false;
  const wanted = MODE === 'restore'
    ? [...DECISIONS.keys()].some(k => k.startsWith(target.file + '\t')) : false;
  const before = wanted ? asOf(FROM, target) : null;

  for (const { rec, label } of target.walk(data)) {
    const text = rec[target.field];
    const lessonId = rec.lessonId;
    if (typeof text !== 'string' || typeof lessonId !== 'number') continue;
    tally.records++;
    const a = parseAnchor(rec.sourceAnchor);

    if (MODE === 'restore') {
      if (!DECISIONS.has(`${target.file}\t${label}`) || !before) continue;
      const was = before.get(label);
      if (!was) { console.log(`  ${target.file}  ${label} — not in ${FROM}`); continue; }
      if (was.text === text && was.anchor === rec.sourceAnchor) { console.log(`  ${target.file}  ${label} — already as ${FROM} has it`); continue; }
      rec[target.field] = was.text;
      if (was.anchor === undefined) delete rec.sourceAnchor; else rec.sourceAnchor = was.anchor;
      dirty = true; tally.marked++;
      console.log(`  ${target.file}  ${label}  restored to ${FROM}: anchor ${was.anchor}`);
      continue;
    }

    if (MODE === 'mark') {
      const flag = DECISIONS.get(`${target.file}\t${label}`);
      if (flag === undefined) continue;
      const base = (rec.sourceAnchor || '').split('!')[0];
      const v = flag === '-' ? base : base + '!' + flag;
      if (v !== rec.sourceAnchor) { rec.sourceAnchor = v; dirty = true; tally.marked++;
        console.log(`  ${target.file}  ${label}  -> ${v}`); }
      continue;
    }

    if (MODE === 'anchor') {
      const v = stamp(text, lessonId, a.flag, a, rec.sourceAnchor);
      if (a.flag && parseAnchor(v).agreed)
        tally.spent.push(`${target.file}  ${label}  !${a.flag}`);
      if (rec.sourceAnchor !== v) { rec.sourceAnchor = v; dirty = true; }
      const st = parseAnchor(v);
      if (st.state === 'anchored') { tally.anchored++; if (st.agreed) tally.agreed++; }
      else tally[st.state]++;
      continue;
    }

    if (a.state === 'none' || a.state === 'malformed') {
      tally.problems.push({ file: target.file, label, lessonId, kind: 'no anchor',
        detail: a.state === 'none' ? 'this record has no `sourceAnchor`'
          : `\`sourceAnchor\` is not readable: ${JSON.stringify(rec.sourceAnchor)}`,
        fix: `stamp it with \`${HERE} --anchor --write\`` });
      continue;
    }
    if (a.state !== 'anchored') {
      tally[a.state]++;
      if (MODE !== 'check') continue;
      const now = parseAnchor(stamp(text, lessonId, null, null, null));
      if (now.state === 'anchored')
        tally.notes.push(`${target.file}  ${label}  marked "${a.state}" but its passage is now in `
          + `lesson ${now.lesson} ${FIELD[now.which]} — re-anchor with \`${HERE} --anchor --write\``);
      continue;
    }

    tally.anchored++;
    const frag = a.start === null ? text : text.slice(a.start, a.end);
    const src = lessonField(a.lesson, a.which);

    if (hash(skeleton(frag).sk) !== a.fp) {
      if (MODE !== 'check') continue;
      tally.problems.push({ file: target.file, label, lessonId, kind: 'snippet reworded',
        detail: 'the snippet no longer matches the passage it is anchored to (words added, removed or reordered).\n'
          + `      anchor says lesson ${a.lesson} ${FIELD[a.which]}; snippet begins: ${tidy(frag.slice(0, 60))}`,
        fix: `re-anchor with \`${HERE} --anchor --write\` if the snippet was changed on purpose` });
      continue;
    }
    if (!src) {
      if (MODE !== 'check') continue;
      tally.problems.push({ file: target.file, label, lessonId, kind: 'source gone',
        detail: `lesson ${a.lesson} no longer has ${FIELD[a.which]} text at all`,
        fix: `restore the lesson field, or re-anchor with \`${HERE} --anchor --write\`` });
      continue;
    }
    const cmp = compare(frag, src);
    if (!cmp.found) {
      if (MODE !== 'check') continue;
      if (cmp.ambiguous) {
        // More than one passage in the lesson fits this snippet.  Re-anchoring
        // would pick one of them, which is the thing not to do.
        tally.open.push({ file: target.file, label, lesson: a.lesson, which: a.which, flag: a.flag,
          note: 'more than one passage in this lesson fits the snippet, so it cannot be placed — '
            + 'a person has to say which', show: [] });
        continue;
      }
      if (skeleton(frag).sk.length < MIN_REALIGN) {
        // Too little text to place by alignment, so whether the passage was
        // repaired or reworded cannot be told apart here.  Say so; do not
        // stop a build on a guess.
        tally.open.push({ file: target.file, label, lesson: a.lesson, which: a.which, flag: a.flag,
          note: 'its passage is not where it was, and the snippet is too short to place by alignment',
          show: [] });
        continue;
      }
      tally.problems.push({ file: target.file, label, lessonId, kind: 'passage reworded',
        detail: `lesson ${a.lesson} ${FIELD[a.which]} holds no passage close enough to be this one — `
          + `no window aligns within ${editBudget(skeleton(frag).sk.length)} letter edits without a run of `
          + `more than ${MAX_RUN}, so words have been added, removed or reordered\n`
          + `      snippet begins: ${tidy(frag.slice(0, 60))}`,
        fix: `read the lesson passage first; if it was reworded on purpose, re-anchor with `
          + `\`${HERE} --anchor --write\`` });
      continue;
    }
    if (cmp.ortho.length) tally.ortho++;
    if (!cmp.drift.length) {
      if (MODE === 'check' && a.flag)
        tally.notes.push(`${target.file}  ${label}  marked !${a.flag} but it now agrees with `
          + `lesson ${a.lesson} ${FIELD[a.which]} — the judgement is spent; clear it deliberately with `
          + `\`${HERE} --mark --decisions=FILE --write\` listing "${target.file}\t${label}\t-"`);
      continue;
    }

    // a live difference
    const words = cmp.drift.map(d => {
      const w = alignedWords(frag, cmp, src, d);
      return { d, abs: (a.start === null ? 0 : a.start) + d.at,
               record: tidy(w.record), lesson: tidy(w.lesson), partial: w.partial };
    });
    const seen = new Set();
    const show = words.filter(w => !seen.has(w.record + w.lesson) && seen.add(w.record + w.lesson));
    // Provable: this snippet is byte-for-byte what it was when it last agreed
    // with the lesson, so the lesson is what moved.
    const proven = a.agreed && hash(frag) === a.agreed && !a.flag;

    if (MODE === 'sync') {
      if (a.flag) {
        tally.skipped++;
        console.log(`  left alone  ${target.file}  ${label} — marked !${a.flag}`);
        continue;
      }
      const newFragment = applyEdits(frag, cmp, src);
      const fixed = a.start === null ? newFragment
        : text.slice(0, a.start) + newFragment + text.slice(a.end);
      rec[target.field] = fixed;
      // The snippet now says what the lesson says, so both fingerprints are
      // restamped here rather than waiting for --anchor: a repair that lands
      // outside the fold's classes changes the skeleton too, and leaving the
      // old one behind would read as a reworded passage on the next run.  The
      // lesson, field and span are kept exactly as they were — this restamps
      // an anchor, it does not go looking for a new one.
      // an inserted or dropped letter moves the end of the span, so it is
      // recomputed from the rewritten fragment rather than carried over
      const span = a.start === null ? '' : `#${a.start}-${a.start + newFragment.length}`;
      rec.sourceAnchor = `${a.which}${a.lesson}#${hash(skeleton(newFragment).sk)}${span}`
        + `=${hash(newFragment)}`;
      dirty = true; tally.changed++;
      show.forEach(w => console.log(`  ${target.file}  ${label}  ${w.record} -> ${w.lesson}`));
      continue;
    }
    if (MODE === 'witnesses') {
      if (flagName(a.flag) !== 'lesson') continue;
      show.forEach(w => console.log([target.file, label, a.lesson, FIELD[a.which], w.d.srcAt,
        compact(w.lesson), compact(w.record), w.partial ? 'partial-span' : ''].join('\t')));
      continue;
    }
    if (MODE === 'settled') {
      if (flagName(a.flag) !== 'settled') continue;
      show.forEach(w => console.log([target.file, label, a.lesson, FIELD[a.which], w.d.srcAt,
        flagRef(a.flag), compact(w.lesson), compact(w.record)].join('\t')));
      continue;
    }
    if (MODE === 'disagreements') {
      show.forEach(w => console.log([target.file, label, a.lesson, FIELD[a.which], w.d.srcAt,
        compact(w.record), compact(w.lesson), a.flag || (proven ? 'stale' : 'unjudged')].join('\t')));
      continue;
    }

    const lines = show.slice(0, 6)
      .map(w => `        record: ${w.record}    lesson: ${w.lesson}`).join('\n')
      + (show.length > 6 ? `\n        ... and ${show.length - 6} more` : '');

    if (cmp.edits) tally.realigned++;
    const how = cmp.edits
      ? ` (the passage is still there: ${cmp.edits} letter${cmp.edits > 1 ? 's' : ''} corrected, `
        + `inserted or dropped inside words that stand unchanged — a repair, not a reword)` : '';
    if (proven) {
      tally.problems.push({ file: target.file, label, lessonId, kind: 'record is stale',
        detail: `this snippet has not changed since it agreed with lesson ${a.lesson} `
          + `${FIELD[a.which]}, so the lesson is what moved${how}:\n${lines}`,
        fix: `carry it over with \`${HERE} --sync --write\`\n`
          + `      if the lesson's reading is the wrong one, record that instead: `
          + `\`${HERE} --mark --decisions=FILE --write\` with "${target.file}\t${label}\tlesson"` });
    } else {
      tally.open.push({ file: target.file, label, lesson: a.lesson, which: a.which,
                        flag: a.flag, show });
    }
  }

  if (dirty && WRITE) fs.writeFileSync(file, target.ser(data));
  else if (dirty) console.log(`(dry run) ${target.file} would change — pass --write`);
}

// ----------------------------------------------------------------- output
if (MODE === 'witnesses' || MODE === 'settled' || MODE === 'disagreements') process.exit(0);
if (MODE === 'restore') {
  console.log(`${tally.marked} record${tally.marked === 1 ? '' : 's'} restored from ${FROM}`
    + (WRITE ? '' : ' (dry run — pass --write)'));
  process.exit(0);
}
if (MODE === 'mark') {
  console.log(`${tally.marked} anchors marked` + (WRITE ? '' : ' (dry run — pass --write)'));
  process.exit(0);
}
if (MODE === 'anchor') {
  if (tally.spent.length) {
    console.log(`${tally.spent.length} judgement${tally.spent.length === 1 ? '' : 's'} kept though spent — `
      + `the record now agrees with the lesson, and clearing a judgement is a deliberate act, `
      + `not something a re-anchor does:`);
    tally.spent.forEach(x => console.log(`  ${x}`));
    console.log(`  clear them with \`${HERE} --mark --decisions=FILE --write\` and "-" as the flag`);
  }
  if (tally.kept.length)
    console.log(`${tally.kept.length} anchor${tally.kept.length === 1 ? '' : 's'} left as they were: `
      + `their snippet differs from the lesson at single positions inside words, which is a repair to `
      + `carry over with \`${HERE} --sync --write\`, not a passage to re-anchor on`);
  console.log(`anchored ${tally.anchored} of ${tally.records} records `
    + `(${tally.agreed} agree with the lesson letter for letter) · `
    + `${tally.absent} source absent · ${tally.unmatched} unmatched · ${tally.short} too short`);
  if (!WRITE) console.log('(dry run — pass --write to stamp the files)');
  process.exit(0);
}
if (MODE === 'sync') {
  console.log(`${tally.changed} snippet${tally.changed === 1 ? '' : 's'} carried over from the lesson text`
    + (tally.skipped ? `, ${tally.skipped} left alone as judged` : '')
    + (WRITE ? '' : ' (dry run — pass --write)'));
  process.exit(0);
}

console.log(`snippet check: ${tally.records} records · ${tally.anchored} checked against the lesson text · `
  + `${tally.absent} source absent · ${tally.unmatched} unmatched · ${tally.short} too short`);
if (tally.ortho) console.log(`${tally.ortho} records differ only in hamza, alif or alif-maksura form — `
  + `tolerated, no repair pass moves those`);
tally.notes.slice(0, 10).forEach(n => console.log(`note  ${n}`));
if (tally.notes.length > 10) console.log(`note  ... and ${tally.notes.length - 10} more`);

if (tally.open.length) {
  const byFlag = {};
  tally.open.forEach(o => (byFlag[flagName(o.flag) || 'unjudged'] = (byFlag[flagName(o.flag) || 'unjudged'] || 0) + 1));
  console.log(`\n${tally.open.length} open disagreement${tally.open.length === 1 ? '' : 's'} `
    + `(${Object.entries(byFlag).map(([k, v]) => `${v} ${k}`).join(', ')}) — reported, not gated:`);
  for (const o of tally.open.slice(0, 12)) {
    const tag = flagName(o.flag) === 'settled' ? `settled by ${flagRef(o.flag)}`
      : flagName(o.flag) === 'lesson' ? 'the lesson is the broken witness'
      : flagName(o.flag) === 'review' ? 'neither reading judged yet'
      : 'not judged yet';
    console.log(`  ${o.file}  ${o.label}  (lesson ${o.lesson} ${FIELD[o.which]}) — ${o.note || tag}`);
    o.show.slice(0, 3).forEach(w => console.log(`      record: ${w.record}    lesson: ${w.lesson}`));
  }
  if (tally.open.length > 12) console.log(`  ... and ${tally.open.length - 12} more — \`${HERE} --disagreements\``);
}

if (!tally.problems.length) {
  console.log('\nno record is provably behind the lesson text.');
  process.exit(0);
}
console.log('');
for (const p of tally.problems.slice(0, 40)) {
  console.log(`FAIL  ${p.file}  ${p.label}  (lesson ${p.lessonId})`);
  console.log(`      ${p.kind}: ${p.detail}`);
  if (p.fix) console.log(`      ${p.fix}`);
  console.log('');
}
if (tally.problems.length > 40) console.log(`... and ${tally.problems.length - 40} more\n`);
const kinds = {};
tally.problems.forEach(p => (kinds[p.kind] = (kinds[p.kind] || 0) + 1));
console.log(Object.entries(kinds).map(([k, v]) => `${v} ${k}`).join(', ') + ' — build stopped.');
process.exit(1);
