#!/usr/bin/env node
/**
 * validate-tafsir-text.mjs — check a `[s:v]`-marked tafsīr file before it ships.
 *
 *   node scripts/validate-tafsir-text.mjs src/data/jalalaynArabic/02.txt
 *   node scripts/validate-tafsir-text.mjs src/data/**\/*.txt
 *
 * These files are the edition. A transcription error in them is not a bug that
 * shows up as a stack trace -- it is wrong text presented as a critical edition,
 * which nobody notices. This checks the things a reader cannot:
 *
 *   structure  markers well-formed, ascending, no duplicates, no gaps
 *   scope      every marked verse exists in that sūra
 *   content    no empty blocks, no HTML, no Latin text, no conflict markers,
 *              no replacement characters or mojibake from a bad encoding
 *   shape      per-verse length against the al-Fātiḥa baseline for the same
 *              work, so a truncated or duplicated block stands out
 *   fidelity   diacritic density against the same baseline -- OCR and careless
 *              copying both strip tashkīl, and that is invisible at a glance
 *
 * Exit code 1 on any error, 0 otherwise. Warnings do not fail.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node scripts/validate-tafsir-text.mjs <file.txt> [more.txt ...]');
  process.exit(2);
}

const versesAll = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/data/verse_text.json'), 'utf8')
);
function ayahCount(surah) {
  let n = 0;
  while (versesAll[`${surah}:${n + 1}`]) n++;
  return n;
}

const TASHKIL = /[ً-ْٰٓ-ٕ]/g;
const ARABIC = /[ء-ي]/g;

function diacriticRatio(s) {
  const letters = (s.match(ARABIC) || []).length;
  const marks = (s.match(TASHKIL) || []).length;
  return letters ? marks / letters : 0;
}

function parse(text) {
  const blocks = [];
  const parts = text.split(/(\[\d+:\d+\])/);
  for (let i = 1; i < parts.length; i += 2) {
    const m = parts[i].match(/\[(\d+):(\d+)\]/);
    blocks.push({
      surah: +m[1],
      verse: +m[2],
      body: (parts[i + 1] || '').trim(),
      marker: parts[i],
    });
  }
  return { blocks, preamble: parts[0].trim() };
}

/** Baseline from the al-Fātiḥa file of the same work, if present. */
function baselineFor(file) {
  const dir = path.dirname(file);
  const base = path.join(dir, '01.txt');
  if (!fs.existsSync(base) || path.resolve(base) === path.resolve(file)) return null;
  const { blocks } = parse(fs.readFileSync(base, 'utf8'));
  if (!blocks.length) return null;
  const lens = blocks.map(b => b.body.length).sort((a, b) => a - b);
  return {
    median: lens[Math.floor(lens.length / 2)],
    min: lens[0],
    max: lens[lens.length - 1],
    diac: diacriticRatio(blocks.map(b => b.body).join(' ')),
    n: blocks.length,
    from: base,
  };
}

let failed = false;
for (const file of files) {
  const errors = [];
  const warnings = [];
  console.log(`\n=== ${file} ===`);
  if (!fs.existsSync(file)) { console.log('  ERROR  file does not exist'); failed = true; continue; }

  const text = fs.readFileSync(file, 'utf8');
  const { blocks, preamble } = parse(text);

  if (!blocks.length) errors.push('no [s:v] markers found at all');
  if (preamble) warnings.push(`${preamble.length} characters before the first marker will not be rendered`);
  if (/<<<<<<< |>>>>>>> [0-9a-f]{7}/.test(text)) errors.push('contains merge-conflict markers');
  if (text.includes('�')) errors.push('contains U+FFFD replacement characters (encoding damage)');
  if (/Ã[-¿]|Ø[-¿]/.test(text)) errors.push('looks like mojibake (UTF-8 read as Latin-1)');

  const surahs = [...new Set(blocks.map(b => b.surah))];
  if (surahs.length > 1) errors.push(`mixes sūras ${surahs.join(', ')} -- one file per sūra`);
  const surah = surahs[0];

  const expectedName = String(surah).padStart(2, '0') + '.txt';
  if (surah && path.basename(file) !== expectedName) {
    errors.push(`file is named ${path.basename(file)} but contains sūra ${surah} (expected ${expectedName})`);
  }

  const total = surah ? ayahCount(surah) : 0;
  if (surah && !total) errors.push(`sūra ${surah} is not in verse_text.json`);

  const seen = new Map();
  let prev = 0;
  for (const b of blocks) {
    if (total && (b.verse < 1 || b.verse > total)) {
      errors.push(`${b.marker} is outside sūra ${surah} (1–${total})`);
    }
    if (seen.has(b.verse)) errors.push(`${b.marker} appears more than once`);
    seen.set(b.verse, b);
    if (b.verse < prev) errors.push(`${b.marker} comes after [${surah}:${prev}] -- markers must ascend`);
    prev = b.verse;
    if (!b.body) errors.push(`${b.marker} has an empty body`);
    if (/<[a-zA-Z/][^>]*>/.test(b.body)) errors.push(`${b.marker} contains HTML tags`);
    const latin = (b.body.match(/[A-Za-z]/g) || []).length;
    if (latin > 20) warnings.push(`${b.marker} contains ${latin} Latin letters -- stray navigation or footer text?`);
  }

  if (total && seen.size) {
    const missing = [];
    for (let v = 1; v <= total; v++) if (!seen.has(v)) missing.push(v);
    if (missing.length) {
      const shown = missing.slice(0, 25).join(', ') + (missing.length > 25 ? ` … +${missing.length - 25}` : '');
      warnings.push(`${missing.length} of ${total} āyāt have no block: ${shown}`);
    }
  }

  const base = baselineFor(file);
  if (base && blocks.length) {
    const doc = diacriticRatio(blocks.map(b => b.body).join(' '));
    const rel = base.diac ? doc / base.diac : 1;
    const pct = (x) => (x * 100).toFixed(1) + '%';
    if (rel < 0.5) {
      errors.push(
        `diacritic density ${pct(doc)} against ${pct(base.diac)} in ${path.basename(base.from)} ` +
        `(${(rel * 100).toFixed(0)}% of baseline) -- tashkīl looks stripped, which is what OCR and careless copying do`
      );
    } else if (rel < 0.8) {
      warnings.push(`diacritic density ${pct(doc)} vs ${pct(base.diac)} baseline -- lower than expected`);
    }
    for (const b of blocks) {
      if (b.body.length < Math.max(20, base.min / 4)) {
        warnings.push(`${b.marker} is only ${b.body.length} chars (baseline min ${base.min}) -- truncated?`);
      }
      if (b.body.length > base.max * 25) {
        warnings.push(`${b.marker} is ${b.body.length} chars (baseline max ${base.max}) -- two verses run together?`);
      }
    }
  }

  const lens = blocks.map(b => b.body.length);
  console.log(`  blocks ${blocks.length}${total ? ` of ${total} āyāt` : ''}` +
    (lens.length ? ` · chars ${Math.min(...lens)}–${Math.max(...lens)} · total ${text.length}` : '') +
    ` · diacritic density ${(diacriticRatio(text) * 100).toFixed(1)}%` +
    (base ? ` (baseline ${(base.diac * 100).toFixed(1)}%)` : ''));

  for (const w of warnings) console.log(`  WARN   ${w}`);
  for (const e of errors) console.log(`  ERROR  ${e}`);
  if (!errors.length && !warnings.length) console.log('  clean');
  if (errors.length) failed = true;
}

console.log(failed ? '\nFAILED' : '\nOK');
process.exit(failed ? 1 : 0);
