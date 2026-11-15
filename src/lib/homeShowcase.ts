// What the homepage shows under the search box: one verse as he uses it in
// three works, his works by kind, and the size of the corpus. Everything is
// read from the data at build time; nothing here is a hand-typed number.
//
// The verse is Āyat al-Kursī (Q. 2:255) because it is the one verse every
// reader knows and because the corpus already holds it in three kinds of
// writing: exegesis in the 1964 tafsīr, a devotional litany in Rijāl wa-adwār,
// and verse in the Conakry riḥla. If any of the three loci disappears from the
// corpus, that card drops out rather than breaking the page.

import corpus from '@/data/corpus.json';
import { getLocus, getWitness, getWork, workSummaries } from '@/lib/corpus';
import { getLesson } from '@/lib/lessons';
import { commentaryParagraphs } from '@/lib/niasseVerseExcerpt';

export const SHOWCASE_VERSE = { surah: 2, ayah: 255, name: 'Āyat al-Kursī' };

export interface ShowcaseCard {
  /** "Tafsīr", "Litany", "Poem" — what he does with the verse here. */
  kind: string;
  title: string;
  where: string;
  ar: string;
  en: string;
  href: string;
}

/** Cut at a word boundary near `max` characters. */
function cut(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const sp = t.lastIndexOf(' ', max);
  return t.slice(0, sp > max * 0.6 ? sp : max) + ' …';
}

/** Start the text at `from`, if it occurs. */
function from(s: string, anchor?: string): string {
  if (!anchor) return s;
  const i = s.indexOf(anchor);
  return i >= 0 ? s.slice(i) : s;
}

const PICKS: { locus: string; kind: string; short: string; arFrom?: string; enFrom?: string; lessonPara?: [number, number] }[] = [
  { locus: 'firiyad-L7-p20', kind: 'Tafsīr', short: 'Fī Riyāḍ al-Tafsīr', lessonPara: [7, 20], arFrom: 'وهذه الآية', enFrom: 'This āya contains' },
  { locus: 'rijal-008', kind: 'Litany', short: 'Rijāl wa-adwār' },
  { locus: 'rihlat-138', kind: 'Poem', short: 'Nafaḥāt al-Malik al-Ghanī (the Conakry journey)' },
];

export async function showcaseCards(): Promise<ShowcaseCard[]> {
  const out: ShowcaseCard[] = [];
  for (const p of PICKS) {
    const locus = getLocus(p.locus);
    const witness = locus && getWitness(locus.witnessId);
    const work = witness && getWork(witness.workId);
    if (!locus || !work) continue;

    let ar = locus.textAr ?? '';
    let en = locus.textEn ?? '';
    if (p.lessonPara) {
      const lesson = await getLesson(p.lessonPara[0]);
      const body = lesson?.arabicBody || lesson?.arabicText || '';
      ar = commentaryParagraphs(body)[p.lessonPara[1]] ?? ar;
      const paras = (lesson?.englishText ?? '').match(/<p[^>]*class="[^"]*en-para[^"]*"[^>]*>[\s\S]*?<\/p>/g) ?? [];
      const hit = paras.map(x => x.replace(/<[^>]+>/g, '')).find(x => p.enFrom && x.includes(p.enFrom));
      if (hit) en = hit;
    }
    if (!ar) continue;

    out.push({
      kind: p.kind,
      title: p.short,
      where: locus.address.raw ?? '',
      ar: cut(from(ar, p.arFrom), 110),
      en: cut(from(en, p.enFrom), 130),
      href: `/verse/${SHOWCASE_VERSE.surah}/${SHOWCASE_VERSE.ayah}`,
    });
  }
  return out;
}

// ---------------------------------------------------------------- his works

/** The catalogue's genres, gathered into kinds a reader recognises. */
const KIND_OF: Record<string, string> = {
  tafsir: 'Tafsīr',
  fatwa: 'Fatwās', fatawa: 'Fatwās', fiqh: 'Fatwās',
  rihla: 'Journeys',
  poetry: 'Poems',
  khutab: 'Sermons',
  letters: 'Letters', rasail: 'Letters',
  'sufi-doctrine': 'Treatises', esoteric: 'Treatises', polemic: 'Treatises',
  risala: 'Treatises', muallafat: 'Treatises',
  awrad: 'Litanies',
  biography: 'Sayings and accounts', nawadir: 'Sayings and accounts', asanid: 'Sayings and accounts',
};
const KIND_ORDER = ['Tafsīr', 'Treatises', 'Fatwās', 'Letters', 'Sermons', 'Journeys', 'Poems', 'Litanies', 'Sayings and accounts'];

export interface WorkKind { kind: string; works: number }

export function worksByKind(): WorkKind[] {
  const n = new Map<string, number>();
  for (const w of (corpus as unknown as { works: { genre: string }[] }).works) {
    const k = KIND_OF[w.genre];
    if (k) n.set(k, (n.get(k) ?? 0) + 1);
  }
  return KIND_ORDER.filter(k => n.has(k)).map(k => ({ kind: k, works: n.get(k)! }));
}

// ---------------------------------------------------------------- the numbers

export function corpusCounts() {
  const s = workSummaries();
  const others = s.filter(x => x.work.id !== 'fi-riyad');
  const verses = new Set<string>();
  const C = corpus as unknown as {
    witnesses: { id: string; workId: string }[];
    loci: { id: string; witnessId: string; textAr?: string; textEn?: string; copiedFrom?: string }[];
    verseLinks: { locusId: string; surah: number; ayahStart: number; ayahEnd?: number }[];
  };
  const workOf = new Map(C.witnesses.map(w => [w.id, w.workId]));
  const loci = new Map(C.loci.map(l => [l.id, l]));
  for (const v of C.verseLinks) {
    const l = loci.get(v.locusId);
    if (!l || l.copiedFrom || workOf.get(l.witnessId) === 'fi-riyad') continue;
    for (let a = v.ayahStart; a <= (v.ayahEnd ?? v.ayahStart); a++) verses.add(`${v.surah}:${a}`);
  }
  return {
    works: s.length,
    worksWithPassages: others.filter(x => x.withText > 0).length,
    passages: others.reduce((a, x) => a + x.withText, 0),
    verses: verses.size,
  };
}
