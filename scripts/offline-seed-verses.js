#!/usr/bin/env node
/**
 * Prints every verse URL the offline demo should contain: every āya the jump
 * index points at, so no chip in a lesson leads to a missing page.
 */
const idx = require('../src/data/verseIndexAuto.json');
const port = process.argv[2] || '3199';
const seen = new Set();
for (const lesson of Object.keys(idx)) {
  for (const e of idx[lesson] || []) seen.add(e.verse);
}
for (const v of seen) {
  const [s, a] = v.split(':');
  console.log(`http://localhost:${port}/verse/${s}/${a}`);
}
