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

// "Application" covers two different things. Most are rites: a verse recited
// for travel, a cure, a wird. Those stay off. These are the rest: places where
// he (or, in al-Qanābil, his student) argues from the verse or reads it, which
// is commentary in AK's sense even though the act recorded is application.
// Keyed by locus and verse; the corpus data is unchanged.
const ARGUED_APPLICATIONS: ReadonlySet<string> = new Set([
  'rijal-015:4:46', 'rijal-026:9:40', 'rijal-035:17:110', 'rijal-037:19:5',
  'rijal-039:24:37', 'rijal-052:38:88', 'rijal-056:41:33', 'rijal-057:42:38',
  'rijal-066:62:4', 'rihlat-077:9:91',
  'kashif-041:110:2', 'kashif-042:57:21', 'kashif-042:62:4', 'kashif-122:83:26',
  'kashif-215:46:11', 'kashif-237:62:3',
  'qanabil-p05-07:13:39', 'qanabil-p09-11:98:7', 'qanabil-p12-16:9:102',
  'qanabil-p19-22:17:81', 'qanabil-p26-26:3:73', 'qanabil-p26-26:57:29',
  'qanabil-p40-35:2:269', 'qanabil-p40-35:3:7', 'qanabil-p42-39:99:2',
]);

/** A link is shown when any of its acts is one the site shows. */
export function isShownLink(link: { acts: string[]; locusId?: string; surah?: number; ayahStart?: number }): boolean {
  if (link.acts.some(a => SHOWN_ACTS.has(a as ExegeticalAct))) return true;
  return ARGUED_APPLICATIONS.has(`${link.locusId}:${link.surah}:${link.ayahStart}`);
}
