import fs from 'fs';
import path from 'path';
import { getAllLessons } from './lessons';
import { hasApparatus } from './apparatus';

/**
 * Edition coverage, counted from the data at build time.
 *
 * Deliberately not a hand-maintained list. The homepage states these numbers
 * as a claim about the edition, and a claim that drifts from the files is
 * worse than no claim -- the previous homepage carried "Covers al-Fātiḥa &
 * al-Baqara 1–202 so far", which described the *translation's* reach and read
 * as though it described the site's, so a visitor concluded there were two
 * sūras here when in fact the Arabic is complete.
 */

export interface CoverageLayer {
  key: string;
  label: string;
  detail: string;
  count: number;
  total: number;
}

export interface Coverage {
  totalLessons: number;
  layers: CoverageLayer[];
  /** Lesson ids that have an English translation, in order. */
  translatedLessonIds: number[];
}

function countTextFiles(dir: string): number {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), 'src/data', dir))
      .filter(f => /^\d+\.txt$/.test(f)).length;
  } catch {
    return 0;
  }
}

export async function getCoverage(): Promise<Coverage> {
  // 57.json, a placeholder duplicating Lesson 56's sūras, has been deleted.
  // The filter stays as a guard in case one is reintroduced.
  const lessons = (await getAllLessons()).filter(l => l.id <= 56);
  const total = lessons.length;

  const hasArabic = lessons.filter(l => (l.arabicBody || l.arabicText || '').length > 500);
  const translated = lessons.filter(l => l.hasEnglish && (l.englishText || '').length > 2000);
  const withAudio = lessons.filter(l => l.arabicAudioUrl || l.arabicPlaylistId);
  const withWolof = lessons.filter(l => l.wolofAudioUrl || l.wolofPlaylistId);
  // This used to be `lessons.filter(l => l.jalalaynText.length > 200)`, which
  // reported "Tafsīr al-Jalālayn alongside · English · 30 of 56" on the strength
  // of Feras Hamza's translation (© 2007 Royal Aal al-Bayt) sitting unrendered
  // in the lesson files. The site was publishing someone else's work as its own
  // coverage. That text is deleted; this counts our own translation, in
  // src/data/jalalaynEnglish, which is al-Fātiḥa and therefore Lesson 1.
  const jalalaynEn = countTextFiles('jalalaynEnglish');
  const withJalalaynEn = lessons.filter(l => jalalaynEn > 0 && l.id === 1);

  // The full comparative apparatus needs the *Arabic* of both comparanda,
  // which is transcribed sūra by sūra -- see the two SOURCE.md files.
  const jalalaynAr = countTextFiles('jalalaynArabic');
  const ruhAr = countTextFiles('ruhAlBayanArabic');
  const bothAr = Math.min(jalalaynAr, ruhAr);
  const lessonsWithApparatus = lessons.filter(l => {
    // A lesson has the apparatus when its sūra has been transcribed. Only
    // al-Fātiḥa is done, so this is exact rather than approximate today; if
    // it stops being exact, count by sūra id instead of by file count.
    return bothAr > 0 && l.id === 1;
  }).length;

  return {
    totalLessons: total,
    translatedLessonIds: translated.map(l => l.id),
    layers: [
      {
        key: 'arabic',
        label: 'Arabic text of the tafsīr',
        detail: 'Transcribed and proofed from the ten-volume compiled edition',
        count: hasArabic.length,
        total,
      },
      {
        key: 'audio',
        label: 'Recorded audio',
        detail: withWolof.length ? 'Arabic and Wolof' : 'Arabic',
        count: withAudio.length,
        total,
      },
      {
        key: 'jalalayn',
        label: 'Tafsīr al-Jalālayn alongside',
        detail: 'English, translated for this edition',
        count: withJalalaynEn.length,
        total,
      },
      {
        key: 'english',
        label: 'English translation',
        detail: translated.length
          ? `Lessons ${translated[0].id}–${translated[translated.length - 1].id}`
          : 'Not yet begun',
        count: translated.length,
        total,
      },
      {
        key: 'apparatus',
        label: 'Full comparative apparatus',
        detail: 'Jalālayn and Rūḥ al-Bayān in Arabic, verse by verse',
        count: lessonsWithApparatus,
        total,
      },
    ],
  };
}

/**
 * The figures the About page states about the edition, counted from the data.
 *
 * They were written by hand and went stale in four places at once: the footnote
 * total was "1,994" on three pages while footnotesData.json held 1,997, and the
 * translation was described as covering "Lessons 1-2" while five lessons carry
 * one. A reader can check any of these against the site in about ten seconds, so
 * a wrong one costs more than no number at all.
 *
 * Claims about the *printed* edition -- the compiler's six thousand hadith
 * citations, the ten-volume recension superseding the six-volume -- stay written
 * by hand on the page. They are facts about a book, not measurements of this
 * repository, and counting files cannot check them.
 */
export interface EditionFacts {
  totalLessons: number;
  /** Lessons whose Arabic body is present. */
  arabicLessons: number;
  footnoteCount: number;
  /** How many distinct lessons the apparatus reaches. */
  footnoteLessons: number;
  translatedCount: number;
  translatedFirst: number | null;
  translatedLast: number | null;
  audioLessons: number;
  wolofLessons: number;
  /** Contiguous sūra span of the per-verse Qurʾān recitation, or null if it has
   *  gaps -- in which case the page should not claim a range. */
  quranAudioSurahs: { first: number; last: number } | null;
  /** Ḥadīth citations in the index, and the collections they run across. */
  hadithCitations: number;
  hadithCollections: number;
  /** Terms /glossary actually lists. NOT the concordance length: the merged
   *  page also lists the graph-only terms (ḥāl, nafs, ʿaql, tajallī), which
   *  the relation graph makes claims about but the concordance has not
   *  indexed. Counting the concordance alone gave "twenty" for a page showing
   *  twenty-four. */
  termCount: number;
}

/**
 * The join key /glossary uses to merge the concordance with the relation graph.
 *
 * MUST stay identical to `key()` in src/app/glossary/page.tsx. The two files
 * spell the same term differently ("al-Tawḥīd" against "tawḥīd"), and the count
 * is the size of the union under this normalisation -- so if the page's key and
 * this one drift apart, the stated total stops matching the list beneath it,
 * which is the exact failure this whole counter exists to prevent.
 */
function termKey(s: string): string {
  return s.normalize('NFC').toLowerCase()
    .replace(/^al-/, '')
    .replace(/[ʾʿ'’‘]/g, '')
    .replace(/[\s-]+/g, '-');
}

export async function getEditionFacts(): Promise<EditionFacts> {
  const c = await getCoverage();
  const lessons = (await getAllLessons()).filter(l => l.id <= 56);
  const translated = c.translatedLessonIds;

  let footnoteCount = 0;
  let footnoteLessons = 0;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'src/data/footnotesData.json'), 'utf8');
    // Count only what the site actually publishes. The file holds rows for all
    // 56 lessons, but the apparatus for lessons beyond the verified set is
    // hidden (src/lib/apparatus.ts), and a page that claims 2,034 footnotes
    // while showing 324 is the drift this whole counter exists to prevent.
    const rows: { lessonId: number }[] = (JSON.parse(raw) as { lessonId: number }[])
      .filter(r => hasApparatus(r.lessonId));
    footnoteCount = rows.length;
    footnoteLessons = new Set(rows.map(r => r.lessonId)).size;
  } catch {
    /* leave at 0; the page renders the count only when it is non-zero */
  }

  let quranAudioSurahs: EditionFacts['quranAudioSurahs'] = null;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'public/data/audio_index.json'), 'utf8');
    const nums: number[] = (JSON.parse(raw) as { surahNum?: number }[])
      .map(a => a.surahNum)
      // surahNum 0 is the closing Duʿāʾ Khatm al-Qurʾān, not a sūra. Left in, it
      // made the page say "Sūras 0–18".
      .filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 114)
      .sort((a, b) => a - b);
    // Only state a range when the sūras really are contiguous. If a gap opens
    // later, the page drops the range rather than printing a false one.
    const contiguous = nums.length > 0 && nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
    if (contiguous) quranAudioSurahs = { first: nums[0], last: nums[nums.length - 1] };
  } catch {
    /* leave null */
  }

  let hadithCitations = 0;
  let hadithCollections = 0;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'src/data/hadith.json'), 'utf8');
    const byCollection: Record<string, unknown[]> = JSON.parse(raw);
    const entries = Object.values(byCollection).filter(Array.isArray);
    hadithCollections = entries.length;
    hadithCitations = entries.reduce((n, rows) => n + rows.length, 0);
  } catch {
    /* leave at 0; pages render the count only when it is non-zero */
  }

  // The glossary's own two files live in public/data (the page is a client
  // component and fetches them), so they are read from there rather than
  // src/data -- same as audio_index.json above.
  let termCount = 0;
  try {
    const read = (f: string) =>
      JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data', f), 'utf8'));
    const concordance: { term: string }[] = read('term_concordance.json');
    const graph: { nodes?: { id: string }[] } = read('glossary_graph.json');
    const keys = new Set(concordance.map(t => termKey(t.term)));
    for (const n of graph.nodes ?? []) keys.add(termKey(n.id));
    termCount = keys.size;
  } catch {
    /* leave at 0 */
  }

  return {
    totalLessons: c.totalLessons,
    arabicLessons: c.layers.find(l => l.key === 'arabic')?.count ?? 0,
    footnoteCount,
    footnoteLessons,
    hadithCitations,
    hadithCollections,
    termCount,
    translatedCount: translated.length,
    translatedFirst: translated[0] ?? null,
    translatedLast: translated[translated.length - 1] ?? null,
    audioLessons: c.layers.find(l => l.key === 'audio')?.count ?? 0,
    wolofLessons: lessons.filter(l => l.wolofAudioUrl || l.wolofPlaylistId).length,
    quranAudioSurahs,
  };
}

/**
 * The opening of Lesson 1, for the homepage specimen.
 *
 * Fixed on Lesson 1 rather than rotating: only five lessons are translated, so
 * the pool is tiny, and this passage is the best specimen the work offers --
 * Niasse defining the discipline itself and ending on "a light in the heart of
 * the interpreter". A rotating specimen would also make the page
 * non-deterministic for caching and for search engines.
 *
 * Arabic paragraph 0 corresponds to English paragraphs 0-1: the Arabic runs
 * the definition of tafsīr and the tafsīr/taʾwīl distinction together in one
 * block, where the translation breaks them apart.
 */
export interface Specimen {
  arabic: string[];
  english: string[];
}

const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA = /^(أعوذ بالله|بسم الله|اللهم صل)/;

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#x27;|&apos;/g, "'");
}

export async function getSpecimen(): Promise<Specimen | null> {
  const lessons = await getAllLessons();
  const l1 = lessons.find(l => l.id === 1);
  if (!l1) return null;

  const arabic = (l1.arabicBody || l1.arabicText || '')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean)
    .filter(p => !POEM.test(p) && !BASMALA.test(p))
    .map(decodeEntities)
    .slice(0, 1);

  const english = Array.from(
    (l1.englishText || '').matchAll(/<p class="en-para">([\s\S]*?)<\/p>/g)
  )
    .map(m => decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!arabic.length || !english.length) return null;
  return { arabic, english };
}
