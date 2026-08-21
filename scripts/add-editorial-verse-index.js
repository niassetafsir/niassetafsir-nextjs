#!/usr/bin/env node
/**
 * Adds the quotations the compiler never bracketed to the verse jump index,
 * marked as editorial identifications rather than merged into his.
 *
 * WHY THE INDEX HAS TO HAVE THEM
 *
 * A written tafsīr gives every verse a home -- the place the sequence reaches
 * it -- and every other mention is a cross-reference back to that home. This
 * one does not. It was delivered aloud over fifty-six sessions, and 48.8% of
 * the āyāt inside its own declared ranges are never quoted when the sequence
 * arrives at them. A verse can be treated substantively in session 40 and
 * passed over in silence in session 3.
 *
 * That asymmetry is what makes the index constitutive rather than convenient,
 * and it is measurable. Of the citations the compiler bracketed, 1.7% fall
 * outside their lesson's declared range. Of the unbracketed ones, 37.9% do --
 * twenty-two times as many. The parentheses mark the lemma under commentary;
 * what lies outside them is Niasse reaching across the muṣḥaf for a verse the
 * moment calls for. Lesson 1, on al-Fātiḥa, quotes Q 42:11 لَيْسَ كَمِثْلِهِ
 * شَيْءٌ and Q 75:16 لَا تُحَرِّكْ بِهِۦ لِسَانَكَ. Lesson 56, on the last three
 * sūras, reaches back to Q 2:286.
 *
 * Leaving them out makes the index wrong in the direction that matters most:
 * a reader concludes Niasse never treats a verse he demonstrably treats, and
 * the attestation figure understates his coverage. Since the interesting claim
 * about this tafsīr is a claim about SELECTIVITY, undercounting is the more
 * misleading error.
 *
 * WHY THEY ARE MARKED AND NOT MERGED
 *
 * Same discipline as the editor's notes in the apparatus. A citation the
 * compiler bracketed is one kind of evidence; one identified here by method is
 * another. The reader is told which he is looking at, and can turn these off.
 * `editorial: true` is the flag.
 *
 * WHAT THE IDENTIFICATION RESTS ON
 *
 * A run of five consecutive words occurring word-aligned in exactly ONE āya of
 * the 6,236 and nowhere else -- the same warrant the 'enclosed' tier uses, and
 * a stronger one than the length ratio the substring tier once used. Verified
 * on a 30-run sample drawn evenly across the corpus: all 30 identify the right
 * āya.
 *
 * A CAVEAT WORTH KEEPING
 *
 * "Unbracketed" is measured by regex, and 34.7% of paragraphs in this corpus
 * have unbalanced parentheses -- the OCR loses brackets constantly. So some
 * runs counted as unbracketed are bracketed material whose closing paren was
 * dropped. Sample item 15 was one: Lesson 30 ¶127 opens a parenthesis at
 * Q 17:36 and never closes it.
 *
 * This does not weaken the finding; it strengthens it. A broken bracket was
 * around the LEMMA, which is in range by definition, so contamination pushes
 * the out-of-range figure DOWN. The true rate for genuinely unbracketed
 * material is higher than 37.9%.
 *
 *   node scripts/add-editorial-verse-index.js            # report
 *   node scripts/add-editorial-verse-index.js --write    # apply
 */

const fs = require('fs');
const path = require('path');

const RUNS = path.join(__dirname, '..', 'translation-drafts', 'unbracketed-runs.json');
const INDEX = path.join(__dirname, '..', 'src', 'data', 'verseIndexAuto.json');

const WRITE = process.argv.includes('--write');

const runs = JSON.parse(fs.readFileSync(RUNS, 'utf8'));
const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));

// Drop anything the run finder could not place in a paragraph -- the jump
// index is keyed by paragraph and an entry without one points nowhere.
const placed = runs.filter(r => r.paraIndex !== null && r.paraIndex !== undefined);

let added = 0, alreadyThere = 0, newVerses = 0;
const seenVerses = new Set();
for (const l of Object.keys(index)) for (const e of index[l] || []) seenVerses.add(e.verse);

for (const r of placed) {
  const l = String(r.lesson);
  const list = index[l] || (index[l] = []);
  // Same verse at the same paragraph is the same citation, however found.
  if (list.some(e => e.verse === r.verse && e.paraIndex === r.paraIndex)) {
    alreadyThere++;
    continue;
  }
  if (!seenVerses.has(r.verse)) { newVerses++; seenVerses.add(r.verse); }
  list.push({ verse: r.verse, paraIndex: r.paraIndex, editorial: true });
  added++;
}

for (const l of Object.keys(index)) {
  index[l].sort((a, b) => a.paraIndex - b.paraIndex || a.verse.localeCompare(b.verse));
}

const total = Object.values(index).reduce((n, v) => n + v.length, 0);
const distinct = new Set(Object.values(index).flat().map(e => e.verse)).size;

console.log(`${placed.length} unbracketed runs with a paragraph`);
console.log(`  added        ${added}`);
console.log(`  already held ${alreadyThere}  (same verse, same paragraph -- the matcher found it too)`);
console.log(`  verses new to the index: ${newVerses}`);
console.log('');
console.log(`index now: ${total} entries, ${distinct} distinct āyāt`);

if (!WRITE) {
  console.log('\nReport only. Re-run with --write to apply.');
  process.exit(0);
}

fs.writeFileSync(INDEX, JSON.stringify(index), 'utf8');
console.log(`\nWrote ${path.relative(process.cwd(), INDEX)}`);
console.log('NOTE: build-verse-citations.js regenerates this file. Re-run this script after it.');
