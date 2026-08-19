import fs from 'fs';
import path from 'path';
import { getAllLessons } from './lessons';

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
  // Lesson 57 is a placeholder for sūras already covered by 56 and is
  // redirected away in app/lesson/[id]/page.tsx, so it is not a lesson.
  const lessons = (await getAllLessons()).filter(l => l.id <= 56);
  const total = lessons.length;

  const hasArabic = lessons.filter(l => (l.arabicBody || l.arabicText || '').length > 500);
  const translated = lessons.filter(l => l.hasEnglish && (l.englishText || '').length > 2000);
  const withAudio = lessons.filter(l => l.arabicAudioUrl || l.arabicPlaylistId);
  const withWolof = lessons.filter(l => l.wolofAudioUrl || l.wolofPlaylistId);
  const withJalalaynEn = lessons.filter(l => (l.jalalaynText || '').length > 200);

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
        detail: 'English',
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
