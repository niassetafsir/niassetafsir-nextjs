#!/usr/bin/env node
// align-warsh.mjs — re-key the Qurʾānic root map from Ḥafṣ token positions to
// the Warsh text the site actually renders.
//
// WHY THIS EXISTS
// The root annotation in root-lexicon-map.json comes from the Quranic Arabic
// Corpus, which is Ḥafṣ, and it is POSITIONAL: word 4 of a verse carries word
// 4's root. src/data/verse_text.json is Warsh (commit 8aa92c6). Where the two
// riwāyāt differ by a whole word rather than a vowel, every word after the
// divergence shifts by one and silently receives its neighbour's gloss.
//
// Confirmed instance, Q 3:133:
//   Ḥafṣ  وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ …
//   Warsh ۞سَارِعُوٓاْ إِلَيٰ مَغْفِرَةࣲ …
// One fewer word. Without this pass the whole āya is off by one.
//
// USAGE (from the niassetafsir repo root)
//   node align-warsh.mjs src/data/verse_text.json quran-morphology.txt > warsh-roots.json
//
// Emits { "surah:ayah": [ {w, text, root|null, via} ] } keyed to WARSH word
// positions, plus a report on stderr listing every verse where the alignment
// was not 1:1.

import { readFileSync } from 'node:fs';

const [, , warshPath, morphPath] = process.argv;
if (!warshPath || !morphPath) {
  console.error('usage: node align-warsh.mjs <verse_text.json> <quran-morphology.txt>');
  process.exit(1);
}

// Fold both orthographies to a bare consonant skeleton. Alif goes entirely:
// Uthmani writes a dagger alif where the imlāʾī/Warsh print writes a full one
// and omits one where it has none, so neither keeping nor dropping it aligns
// the two. Warsh's yeh barree (U+06D2, U+06D3) is not a combining mark and
// survives every \p{Mn} sweep — fold it to yāʾ explicitly or 2,072 verses
// mismatch. Same trap documented in warsh-rasm-switch.md.
const KEEP = new Set('بتثجحخدذرزسشصضطظعغفقكلمنهوي');
const MAP = { 'آ':'ا','أ':'ا','إ':'ا','ٱ':'ا','ٰ':'ا','ى':'ي','ة':'ه','ؤ':'و','ئ':'ي',
              'ء':'', 'ا':'', 'ے':'ي', 'ۓ':'ي' };

function bare(s) {
  let out = '';
  for (const ch of s) {
    const m = MAP[ch] ?? ch;
    if (KEEP.has(m)) out += m;
  }
  return out.replace(/(.)\1+/g, '$1');   // gemination is invisible to the match
}

// ---- Ḥafṣ side: whole words with their gold root, in order -----------------
const hafs = new Map();
for (const line of readFileSync(morphPath, 'utf8').split('\n')) {
  const p = line.split('\t');
  if (p.length < 4) continue;
  const [s, a, w] = p[0].split(':').map(Number);
  const k = `${s}:${a}`;
  if (!hafs.has(k)) hafs.set(k, new Map());
  const v = hafs.get(k);
  if (!v.has(w)) v.set(w, { text: '', root: null });
  const e = v.get(w);
  e.text += p[1];
  const r = /ROOT:([^|\s]+)/.exec(p[3]);
  if (r && !e.root) e.root = r[1];
}

// ---- Warsh side ------------------------------------------------------------
// The repo stores { "s:a": { ar, en } }; accept that, a bare { "s:a": text }
// map, or an array of {surah, ayah, text}.
const warshRaw = JSON.parse(readFileSync(warshPath, 'utf8'));
const verses = Array.isArray(warshRaw)
  ? Object.fromEntries(warshRaw.map(v => [`${v.surah}:${v.ayah}`, v.text]))
  : Object.fromEntries(Object.entries(warshRaw).map(([k, v]) =>
      [k, typeof v === 'string' ? v : (v.ar ?? v.text ?? '')]));

// ---- align ----------------------------------------------------------------
// Needleman–Wunsch on bare word skeletons. A pure zip would be wrong exactly
// where it matters; this recovers the insertion/deletion and leaves inserted
// Warsh words with root:null rather than borrowing a neighbour's.
function align(A, B) {
  const n = A.length, m = B.length;
  const d = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1,
                         d[i-1][j-1] + (A[i-1] === B[j-1] ? 0 : 1));
  const pairs = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i-1][j-1] + (A[i-1] === B[j-1] ? 0 : 1)) {
      pairs.push([i-1, j-1, A[i-1] === B[j-1]]); i--; j--;
    } else if (i > 0 && d[i][j] === d[i-1][j] + 1) { pairs.push([i-1, null, false]); i--; }
    else { pairs.push([null, j-1, false]); j--; }
  }
  return pairs.reverse();
}

const out = {};
const divergent = [];
let exact = 0, shifted = 0, unrooted = 0, total = 0;

for (const [key, text] of Object.entries(verses)) {
  const hv = hafs.get(key);
  if (!hv) { divergent.push(`${key}\tno Ḥafṣ verse`); continue; }
  const hw = [...hv.keys()].sort((a, b) => a - b).map(w => hv.get(w));
  const ww = text.split(/\s+/).filter(Boolean);
  const pairs = align(hw.map(x => bare(x.text)), ww.map(bare));

  const row = [];
  let mismatch = 0;
  for (const [hi, wi, ok] of pairs) {
    if (wi === null) { mismatch++; continue; }               // Ḥafṣ word absent in Warsh
    if (hi === null) { row.push({ w: wi + 1, text: ww[wi], root: null, via: 'warsh-only' }); mismatch++; continue; }
    row.push({ w: wi + 1, text: ww[wi], root: hw[hi].root, via: ok ? 'aligned' : 'fuzzy' });
    if (!ok) mismatch++;
  }
  row.sort((a, b) => a.w - b.w);
  out[key] = row;
  total++;
  if (mismatch === 0) exact++; else { shifted++; divergent.push(`${key}\t${mismatch} unmatched of ${ww.length}`); }
  unrooted += row.filter(r => !r.root).length;
}

console.error(`verses:            ${total}`);
console.error(`aligned 1:1:       ${exact} (${(100*exact/total).toFixed(1)}%)`);
console.error(`needed adjustment: ${shifted}`);
console.error(`Warsh words with no root: ${unrooted}`);
console.error(`\n--- verses where the alignment was not 1:1 ---`);
for (const d of divergent.slice(0, 200)) console.error(d);
if (divergent.length > 200) console.error(`… and ${divergent.length - 200} more`);

process.stdout.write(JSON.stringify(out));
