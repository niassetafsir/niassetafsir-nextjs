// Which uses of a verse the site shows.
//
// AK, 15 Nov 2026: "i want quranic commentary not litanies ... where he
// explains a verse or comments on it. it's a scholarly site, not devotional
// practice." The corpus records every use of a verse; the site shows the ones
// that say something about the verse or argue from it, and leaves out the
// verse recited, set into a formula or a poem's structure, or brought to bear
// on a rite. The data keeps them all: this is a display rule, not a deletion.

import type { ExegeticalAct } from '@/lib/corpus';

export const SHOWN_ACTS: ReadonlySet<ExegeticalAct> = new Set<ExegeticalAct>([
  'tafsir',     // what he says about it
  'gloss',      // an interpretive equivalence
  'juristic',   // the verse as legal proof
  'prooftext',  // the verse warranting a claim he argues
  'allusion',   // its words worked into his own argument
]);

/** A link is shown when any of its acts is one the site shows. */
export function isShownLink(link: { acts: string[] }): boolean {
  return link.acts.some(a => SHOWN_ACTS.has(a as ExegeticalAct));
}
