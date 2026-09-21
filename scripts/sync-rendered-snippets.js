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
const tokenRange = (s, i) => {
  let a = i, b = i;
  while (a > 0 && TOKEN.test(s[a - 1])) a--;
  while (b < s.length - 1 && TOKEN.test(s[b + 1])) b++;
  return [a, b];
};

/**
 * The word a difference sits in, on both sides.  footnotesData.json spaces
 * some words internally where the lesson does not, so the record side is read
 * off the skeleton alignment — the span facing the lesson's word — rather than
 * by looking for token boundaries in the snippet, which would return a single
 * letter and compare nonsense.
 */
function alignedWords(frag, cmp, src, d) {
  const [ts, te] = tokenRange(src.text, d.srcAt);
  let k0 = d.k, k1 = d.k;
  while (k0 > 0 && src.idx[cmp.at + k0 - 1] >= ts) k0--;
  while (k1 < cmp.pidx.length - 1 && cmp.at + k1 + 1 < src.idx.length
         && src.idx[cmp.at + k1 + 1] <= te) k1++;
  const cut0 = k0 === 0 && src.idx[cmp.at] > ts;
  const cut1 = k1 === cmp.pidx.length - 1 && src.idx[cmp.at + k1] < te;
  return { lesson: src.text.slice(ts, te + 1),
           record: (cut0 ? '…' : '') + frag.slice(cmp.pidx[k0], cmp.pidx[k1] + 1) + (cut1 ? '…' : ''),
           partial: cut0 || cut1 };
}

const MAX_SUBS = 3;   // substituted positions still count as a repair

/**
 * Find `pattern` inside `hay` at the SAME LENGTH with at most k positions
 * substituted.  Splitting the pattern into k+1 blocks means at least one block
 * survives untouched however the k substitutions fall, so the candidate
 * offsets are cheap to enumerate and then check.  A tie between two equally
 * close windows is no answer at all, so it returns nothing.
 */
function relocate(pattern, hay, k) {
  const n = pattern.length;
  if (!n || n > hay.length) return null;
  const blocks = k + 1;
  const size = Math.floor(n / blocks);
  if (size < 6) return null;                 // too short to place this way
  const seen = new Set();
  let best = null, tied = false;
  for (let b = 0; b < blocks; b++) {
    const off = b * size;
    const block = pattern.slice(off, b === blocks - 1 ? n : off + size);
    for (let i = hay.indexOf(block); i !== -1; i = hay.indexOf(block, i + 1)) {
      const start = i - off;
      if (start < 0 || start + n > hay.length || seen.has(start)) continue;
      seen.add(start);
      let dist = 0;
      for (let j = 0; j < n && dist <= k; j++) if (pattern[j] !== hay[start + j]) dist++;
      if (dist > k) continue;
      if (!best || dist < best.dist) { best = { at: start, dist }; tied = false; }
      else if (dist === best.dist && start !== best.at) tied = true;
    }
  }
  return tied ? null : best;
}

function compare(frag, src) {
  const { sk, idx } = skeleton(frag);
  const YA = String.fromCharCode(0x064A), ALIF_MAKSURA = String.fromCharCode(0x0649);
  const differences = at => {
    const drift = [], ortho = [];
    for (let k = 0; k < sk.length; k++) {
      const a = frag[idx[k]], b = src.text[src.idx[at + k]];
      if (a === b) continue;
      // hamza seat, alif form, ta marbuta and alif maksura / ya are
      // orthographic variants; no repair pass moves them
      const variant = (a === ALIF_MAKSURA && b === YA) || (a === YA && b === ALIF_MAKSURA)
        || (SOFT.has(a) && SOFT.get(a) === SOFT.get(b));
      (variant ? ortho : drift).push({ k, at: idx[k], from: a, to: b, srcAt: src.idx[at + k] });
    }
    return { drift, ortho };
  };

  let best = null;
  for (const h of occurrences(src.sk, sk)) {
    const { drift, ortho } = differences(h);
    if (!best || drift.length < best.drift.length)
      best = { found: true, at: h, drift, ortho, pidx: idx, substituted: 0 };
    if (!drift.length) break;
  }
  if (best) return best;

  // Nothing at this skeleton.  The repairs no longer stay inside the classes
  // the fold folds across — a pass that settles a word by its aya writes
  // whatever the aya has: a transposition, a two-letter change, a letter from
  // no class at all — so a repaired passage can carry a skeleton this record
  // has never seen.  Look for it at the same length with a few positions
  // substituted.  Same length means no word was added, removed or reordered,
  // and that is what separates a repair from a reword.
  const win = relocate(sk, src.sk, MAX_SUBS);
  if (!win) return { found: false };
  const { drift, ortho } = differences(win.at);
  return { found: true, at: win.at, drift, ortho, pidx: idx, substituted: win.dist };
}

// ------------------------------------------------------------------ modes
const argv = process.argv.slice(2);
const MODE = argv.includes('--anchor') ? 'anchor'
  : argv.includes('--sync') ? 'sync'
  : argv.includes('--mark') ? 'mark'
  : argv.includes('--witnesses') ? 'witnesses'
  : argv.includes('--settled') ? 'settled'
  : argv.includes('--disagreements') ? 'disagreements'
  : 'check';
const WRITE = argv.includes('--write');
const HERE = 'node scripts/sync-rendered-snippets.js';
const decisionFile = (argv.find(a => a.startsWith('--decisions=')) || '').split('=')[1];
const DECISIONS = decisionFile
  ? new Map(fs.readFileSync(decisionFile, 'utf8').trim().split('\n')
      .map(l => l.split('\t')).map(([f, label, flag]) => [`${f}\t${label}`, flag]))
  : null;

const tally = { records: 0, anchored: 0, absent: 0, unmatched: 0, short: 0, ortho: 0,
                agreed: 0, changed: 0, skipped: 0, marked: 0, substituted: 0,
                kept: [], notes: [], problems: [], open: [] };

/** the anchor string for a snippet as it stands now */
function stamp(text, lessonId, keepFlag, existing, raw) {
  // Re-anchoring a record whose difference is a handful of substituted
  // positions would re-fingerprint the damaged snippet and freeze it as the
  // accepted reading.  Keep the anchor as it is and say so: --sync is what
  // that case wants.
  if (existing && existing.state === 'anchored') {
    const frag0 = existing.start === null ? text : text.slice(existing.start, existing.end);
    const src0 = lessonField(existing.lesson, existing.which);
    if (src0 && hash(skeleton(frag0).sk) === existing.fp) {
      const cmp0 = compare(frag0, src0);
      if (cmp0.found && cmp0.substituted) { tally.kept.push({ raw }); return raw; }
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
  if (cmp.found && !cmp.drift.length) return v + '=' + hash(frag);   // they agree: record it
  if (keepFlag) v += '!' + keepFlag;                                 // still differs: keep the judgement
  return v;
}

for (const target of TARGETS) {
  const file = path.join(ROOT, target.file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let dirty = false;

  for (const { rec, label } of target.walk(data)) {
    const text = rec[target.field];
    const lessonId = rec.lessonId;
    if (typeof text !== 'string' || typeof lessonId !== 'number') continue;
    tally.records++;
    const a = parseAnchor(rec.sourceAnchor);

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
      tally.problems.push({ file: target.file, label, lessonId, kind: 'passage reworded',
        detail: `lesson ${a.lesson} ${FIELD[a.which]} no longer holds this passage at any reading of it — `
          + `words have been added, removed or reordered, not just letters corrected\n`
          + `      snippet begins: ${tidy(frag.slice(0, 60))}`,
        fix: `read the lesson passage first; if it was reworded on purpose, re-anchor with `
          + `\`${HERE} --anchor --write\`` });
      continue;
    }
    if (cmp.ortho.length) tally.ortho++;
    if (!cmp.drift.length) {
      if (MODE === 'check' && a.flag)
        tally.notes.push(`${target.file}  ${label}  marked !${a.flag} but it now agrees with `
          + `lesson ${a.lesson} ${FIELD[a.which]} — clear it with \`${HERE} --anchor --write\``);
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
      const chars = Array.from(text);
      words.forEach(w => { chars[w.abs] = w.d.to; });
      const fixed = chars.join('');
      rec[target.field] = fixed;
      // The snippet now says what the lesson says, so both fingerprints are
      // restamped here rather than waiting for --anchor: a repair that lands
      // outside the fold's classes changes the skeleton too, and leaving the
      // old one behind would read as a reworded passage on the next run.  The
      // lesson, field and span are kept exactly as they were — this restamps
      // an anchor, it does not go looking for a new one.
      const span = a.start === null ? '' : `#${a.start}-${a.end}`;
      const newFrag = a.start === null ? fixed : fixed.slice(a.start, a.end);
      rec.sourceAnchor = `${a.which}${a.lesson}#${hash(skeleton(newFrag).sk)}${span}=${hash(newFrag)}`;
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

    if (cmp.substituted) tally.substituted++;
    const how = cmp.substituted
      ? ` (found at the same length with ${cmp.substituted} position${cmp.substituted > 1 ? 's' : ''} `
        + `substituted, which is a repair and not a reword)` : '';
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
if (MODE === 'mark') {
  console.log(`${tally.marked} anchors marked` + (WRITE ? '' : ' (dry run — pass --write)'));
  process.exit(0);
}
if (MODE === 'anchor') {
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
    console.log(`  ${o.file}  ${o.label}  (lesson ${o.lesson} ${FIELD[o.which]}) — ${tag}`);
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
