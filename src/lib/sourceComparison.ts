// Niasse beside the commentaries he read: the Jalālayn, al-Ṣāwī's Ḥāshiya and
// Ismāʿīl Ḥaqqī's Rūḥ al-bayān, verse by verse, with AK's ruling on each.
//
// The data is AK's working comparison for dissertation chapters 4–7 (9 Nov
// 2026), parsed into src/data/sourceComparison.json. It is unpublished
// dissertation material and parts of it are unfinished, so it is OFF unless
// NEXT_PUBLIC_SOURCE_COMPARISON=1. Set that variable for Vercel's Preview
// environment only, and the comparison shows on preview deployments while the
// public site stays as it is. AK turns it on in Production when he chooses.
//
// The rulings are AK's words, kept as he wrote them ("follows, with close
// verbal overlap"). `keys` sorts them into the six moves the dissertation names,
// so a page can count them; the label is what a reader sees.
//
// PAYLOAD: the JSON is ~1.5 MB. Import this module only from server
// components and pass the one verse's entries down.

import raw from '@/data/sourceComparison.json';

export const SOURCE_COMPARISON_ON = process.env.NEXT_PUBLIC_SOURCE_COMPARISON === '1';

export type ComparedSource = 'jalalayn' | 'sawi' | 'ruh-al-bayan';
export type RulingKey = 'follows' | 'extends' | 'selects' | 'corrects' | 'departs' | 'silent' | 'not-compared' | 'other';

export interface Ruling {
  source: ComparedSource;
  /** AK's own wording. */
  label: string;
  keys: RulingKey[];
}

export interface ComparisonEntry {
  id: string;
  /** The dissertation section, e.g. "4.2 “You did not throw when you threw”". */
  section: string | null;
  heading: string;
  /** [surah, ayah] or [surah, ayahStart, ayahEnd]. */
  verses: number[][];
  /** Where in Fī Riyāḍ, as vol:page. */
  fir: string | null;
  kind: string | null;
  niasse: string | null;
  jalalayn: string | null;
  sawi: string | null;
  ruhAlBayan: string | null;
  relation: string | null;
  rulings: Ruling[];
  /** Entries that only point back to an earlier section carry their note here. */
  crossRef: string | null;
}

const DATA = raw as unknown as { entries: ComparisonEntry[] };

const BY_VERSE = new Map<string, ComparisonEntry[]>();
for (const e of DATA.entries) {
  for (const v of e.verses) {
    const [s, a, b] = v;
    for (let x = a; x <= (b ?? a); x++) {
      const k = `${s}:${x}`;
      const bucket = BY_VERSE.get(k);
      if (bucket) { if (!bucket.includes(e)) bucket.push(e); }
      else BY_VERSE.set(k, [e]);
    }
  }
}

export function comparisonsForVerse(surah: number, ayah: number): ComparisonEntry[] {
  if (!SOURCE_COMPARISON_ON) return [];
  return BY_VERSE.get(`${surah}:${ayah}`) ?? [];
}

export const SOURCE_NAME: Record<ComparedSource, string> = {
  jalalayn: 'Tafsīr al-Jalālayn',
  sawi: 'al-Ṣāwī, Ḥāshiya',
  'ruh-al-bayan': 'Rūḥ al-bayān',
};
