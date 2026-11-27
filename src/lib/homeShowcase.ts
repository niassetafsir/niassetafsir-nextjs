// What the homepage shows under the search box: one verse as he comments on
// it in two works, his works by kind, and the size of the corpus. The counts
// are read from the data at build time.
//
// The example is commentary only (AK, 15 Nov 2026: "a scholarly site, not
// devotional practice"): Q. 6:103, «The sights do not grasp Him», on whether
// Allah is seen. The 1964 tafsīr distinguishes perception (idrāk) from seeing;
// Kāshif al-ilbās (1931) answers the denier who cites the verse against the
// masters' witnessing, and argues that a saint's karāma can particularise its
// general statement. If a locus disappears from the corpus, its card drops out
// rather than breaking the page.

import corpus from '@/data/corpus.json';
import { getLocus, getWitness, getWork, workSummaries, workEntries } from '@/lib/corpus';
import { getLesson } from '@/lib/lessons';
import { commentaryParagraphs } from '@/lib/niasseVerseExcerpt';
import { isShownLink } from '@/lib/scholarlyActs';

export const SHOWCASE_VERSE = { surah: 6, ayah: 103, name: '«The sights do not grasp Him»' };

export interface ShowcaseCard {
  /** "Tafsīr", "Treatise" — the kind of work. */
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

const PICKS: {
  locus: string; kind: string; short: string;
  arFrom?: string; enFrom?: string; lessonPara?: [number, number];
  /** Text given here rather than read from the locus: the Lesson 16 comment
   *  runs across two of the edition's paragraphs (¶106–107). The English is
   *  AK's, from the Volume Two translation. */
  ar?: string; en?: string; where?: string; href?: string;
}[] = [
  {
    locus: 'firiyad-L16-p105', kind: 'Tafsīr', short: 'Fī Riyāḍ al-Tafsīr (1964)',
    where: 'Lesson 16, vol. 3', href: '/lesson/16#ar-para-104',
    ar: '(لا تُدْرِكُهُ الابْصَرُ) لا تراه الإدراك غير الرؤية يرى الإنسان شيئا ولا يدركه (وَهُوَ يُدْرِكُ الاَبْصَرَ) يراها ويدركها كما نعلمه ولا ندركه، نراه ولا ندركه',
    en: '«The sights do not grasp Him» — they do not see Him. Grasping is other than seeing: a man sees a thing and does not grasp it — «and He grasps the sights» — He sees them and grasps them. Just as we know Him and do not grasp Him, we see Him and do not grasp Him.',
  },
  { locus: 'kashif-110', kind: 'Treatise', short: 'Kāshif al-ilbās (1931)' },
  { locus: 'kashif-112', kind: 'Treatise', short: 'Kāshif al-ilbās (1931)' },
];

export async function showcaseCards(): Promise<ShowcaseCard[]> {
  const out: ShowcaseCard[] = [];
  for (const p of PICKS) {
    const locus = getLocus(p.locus);
    const witness = locus && getWitness(locus.witnessId);
    const work = witness && getWork(witness.workId);
    if (!locus || !work) continue;

    let ar = p.ar ?? locus.textAr ?? '';
    let en = p.en ?? locus.textEn ?? '';
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
      where: p.where ?? (locus.address.raw ?? '').replace(/\s*\(PDF[^)]*\)/g, ''),
      ar: cut(from(ar, p.arFrom), 220),
      en: cut(from(en, p.enFrom), 300),
      href: p.href ?? `/verse/${SHOWCASE_VERSE.surah}/${SHOWCASE_VERSE.ayah}`,
    });
  }
  return out;
}

// ---------------------------------------------------------------- his works

/** The catalogue's genres, gathered into kinds a reader recognises. */
export const KIND_OF: Record<string, string> = {
  tafsir: 'Tafsīr',
  fatwa: 'Fatwās', fatawa: 'Fatwās', fiqh: 'Fatwās',
  rihla: 'Journeys',
  poetry: 'Poems',
  khutab: 'Sermons',
  letters: 'Letters', rasail: 'Letters',
  'sufi-doctrine': 'Treatises', esoteric: 'Treatises', polemic: 'Treatises',
  risala: 'Treatises', muallafat: 'Treatises',
  biography: 'Sayings and accounts', nawadir: 'Sayings and accounts', asanid: 'Sayings and accounts',
};
export const KIND_ORDER = ['Tafsīr', 'Treatises', 'Fatwās', 'Letters', 'Sermons', 'Journeys', 'Poems', 'Sayings and accounts'];

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
  // Counted exactly as the Beyond page counts, so the two never disagree:
  // his own words with text, outside Fī Riyāḍ. A student's report of his
  // words counts; a student's own reading does not (isNiasse).
  const s = workSummaries().filter(r => r.work.publish !== false || r.uses > 0);
  const verses = new Set<string>();
  const works = new Set<string>();
  for (const { work } of s) {
    if (work.id === 'fi-riyad') continue;
    for (const e of workEntries(work.id)) {
      if (!e.isNiasse || !e.hasText) continue;
      works.add(work.id);
      for (let a = e.ayahStart; a <= (e.ayahEnd ?? e.ayahStart); a++) verses.add(`${e.surah}:${a}`);
    }
  }
  return { works: s.length, worksWithPassages: works.size, verses: verses.size };
}
