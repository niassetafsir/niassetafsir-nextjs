#!/usr/bin/env node
/**
 * Independence check for our English Jalālayn.
 *
 * src/data/jalalaynEnglish/*.txt is translated from the Arabic for this
 * project. src/data/lessons/*.json still carries a different English Jalālayn
 * in its `jalalaynText` field, verified 2026-08-19 to be Feras Hamza's
 * translation (© 2007 Royal Aal al-Bayt Institute for Islamic Thought). The two
 * must not converge on extended runs of words.
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

const FAIL_AT = 10;
const REPORT_FROM = 7;

const OURS = 'src/data/jalalaynEnglish';
const LESSONS = 'src/data/lessons';

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

const theirs = fs.readdirSync(LESSONS)
  .filter(f => /^\d\d\.json$/.test(f))
  .map(f => JSON.parse(fs.readFileSync(path.join(LESSONS, f), 'utf8')).jalalaynText || '')
  .join('\n');

if (!theirs.trim()) {
  console.log('No comparison text in lesson jalalaynText — nothing to check against.');
  process.exit(0);
}

const A = words(ours), B = words(theirs);
console.log(`ours: ${A.length} words · comparison: ${B.length} words\n`);

let worst = 0;
for (let n = 12; n >= REPORT_FROM; n--) {
  // Build each side's run set once. Rebuilding the comparison set inside the
  // filter is quadratic over 160,000 words and hangs.
  const mine = runs(A, n);
  const other = runs(B, n);
  const shared = [...mine].filter(g => other.has(g));
  if (shared.length === 0) continue;
  if (!worst) worst = n;
  console.log(`${n}-word runs shared: ${shared.length}`);
  for (const g of shared.slice(0, 10)) console.log(`   "${g}"`);
}

if (!worst) {
  console.log(`No shared run of ${REPORT_FROM} words or longer.`);
}

if (worst >= FAIL_AT) {
  console.error(`\nFAIL: a shared run of ${worst} words. Rewrite that passage.`);
  process.exit(1);
}
console.log(`\nOK — longest shared run is ${worst || 0} words, under the ${FAIL_AT}-word limit.`);
