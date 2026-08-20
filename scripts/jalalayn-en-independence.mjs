#!/usr/bin/env node
/**
 * Independence check for our English Jalālayn.
 *
 * src/data/jalalaynEnglish/*.txt is translated from the Arabic for this
 * project. It must not converge on extended runs of words with the Royal Aal
 * al-Bayt English Jalālayn (Feras Hamza, © 2007), which the lesson files used to
 * carry in a `jalalaynText` field.
 *
 * That text is gone -- AK's instruction, 2026-08-20: never use anyone else's
 * translation. Deleting it would also have deleted this check, since the check
 * needs something to compare against. So before removing it we took a one-way
 * fingerprint: translation-drafts/jalalayn-en-fingerprint.txt holds the first
 * ten hex digits of the SHA-1 of each distinct lowercased 10-word run, 148,637
 * of them. A hash proves a run WAS present; it cannot reconstruct the run. The
 * guard survives; the translation does not.
 *
 * Short overlaps are expected and fine: the Arabic is terse and technical, the
 * Qurʾānic lemmas have standard renderings, and "that is" is how everyone
 * translates ay. Long overlaps are not, and mean the passage should be rewritten
 * before it ships.
 *
 *   node scripts/jalalayn-en-independence.mjs
 *
 * Exits 1 if any run of FAIL_AT words or longer is shared.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

const FAIL_AT = 10;
// The fingerprint hashes runs of exactly this length, so this is the only
// length that can be tested. Change it and the fingerprint must be rebuilt --
// which is no longer possible, the source text having been deleted.
const N = 10;

const OURS = 'src/data/jalalaynEnglish';
const FINGERPRINT = 'translation-drafts/jalalayn-en-fingerprint.txt';

const words = s =>
  s.replace(/\[[\d:]+\]/g, ' ')      // [1:2] verse markers
    .replace(/\[Q\.[^\]]*\]/g, ' ')  // [Q. 40:16] citations
    .replace(/[^A-Za-z' ]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

const runs = (w, n) => {
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
};

if (!fs.existsSync(OURS)) {
  console.error(`No ${OURS} — nothing to check.`);
  process.exit(0);
}

const ours = fs.readdirSync(OURS)
  .filter(f => /^\d\d\.txt$/.test(f))
  .map(f => fs.readFileSync(path.join(OURS, f), 'utf8'))
  .join('\n');

if (!fs.existsSync(FINGERPRINT)) {
  console.error(`No ${FINGERPRINT} — nothing to check against.`);
  process.exit(0);
}

const theirRuns = new Set(
  fs.readFileSync(FINGERPRINT, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
);

const A = words(ours);
console.log(`ours: ${A.length} words · fingerprint: ${theirRuns.size} distinct ${N}-word runs\n`);

// Only runs of exactly N can be compared, because that is the length that was
// hashed. A shared run LONGER than N necessarily contains a shared run of N, so
// nothing escapes -- but the reported length is a floor, not the true worst.
const mine = runs(A, N);
const shared = [...mine].filter(g => theirRuns.has(sha(g)));
let worst = 0;
if (shared.length) {
  worst = N;
  console.log(`${N}-word runs shared: ${shared.length}`);
  for (const g of shared.slice(0, 10)) console.log(`   "${g}"`);
}

if (!worst) {
  console.log(`No shared run of ${N} words or longer.`);
}

if (worst >= FAIL_AT) {
  console.error(`\nFAIL: a shared run of ${worst} words. Rewrite that passage.`);
  process.exit(1);
}
console.log(`\nOK — longest shared run is ${worst || 0} words, under the ${FAIL_AT}-word limit.`);
