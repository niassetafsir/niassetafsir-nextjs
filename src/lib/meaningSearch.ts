// Search by meaning: a reader asks in their own words ("Imam Malik quizzing
// the scholars", "what does he say about polygamy?") and gets the passages
// where Shaykh Ibrāhīm speaks to that, even when none of the reader's words
// occur in them.
//
// How it works. The site has no embeddings index and no database. Instead, a
// small model rewrites the question into the words the passages themselves
// would use: short Arabic phrases in the register of the lessons (names,
// Qurʾānic wording, technical terms), English phrases for the translated
// lessons, and the verses the question touches. Every phrase is then matched
// against the same folded paragraphs the keyword search uses, and paragraphs
// are ranked by how many phrases they contain, rare phrases counting for more.
//
// The model never writes the answer and never quotes the tafsīr: it only
// proposes search phrases, and every result shown is the text itself, with its
// lesson and paragraph. The phrases it used are shown to the reader.
//
// Needs ANTHROPIC_API_KEY in the Vercel environment. Without it, meaningSearch
// returns { available: false } and the page says so; keyword search is
// unaffected (AK, 15 Nov 2026).
//
// Server-only.

import { arabicParagraphs, MARK_OPEN, MARK_CLOSE } from '@/lib/arabicSearch';
import {
  foldAr, foldEn, excerpt, englishIndex, WORK_PASSAGES, FIRST_LINK, WORK_TITLE,
  VERSES, toVerseHit, type VerseHit, type PassageHit,
} from '@/lib/siteSearch';

export { MARK_OPEN, MARK_CLOSE };

export interface Expansion {
  arabic: string[];
  english: string[];
  verses: string[];
}

export interface MeaningResults {
  available: boolean;
  error?: string;
  expansion: Expansion | null;
  verses: VerseHit[];
  tafsir: PassageHit[];
  works: PassageHit[];
  students: PassageHit[];
}

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

const SYSTEM = `You help readers search the Qurʾān commentary Fī Riyāḍ al-Tafsīr by Shaykh Ibrāhīm Niasse (d. 1975): 56 oral lessons in Arabic (classical, with a plain spoken register), with the Jalālayn gloss read out and editor's footnotes, plus his other Arabic works. Some lessons have English translations.

Given a reader's question, output ONLY a JSON object with the search phrases that the passages themselves are likely to contain:
{"arabic": [...], "english": [...], "verses": [...]}

Rules:
- "arabic": 6 to 14 short phrases, each 1 to 3 words, without vowel marks, in the wording the commentary would actually use: proper names (مالك بن أنس, مالك), Qurʾānic wording of the relevant verses (مثنى وثلاث ورباع), technical terms (تعدد الزوجات, وجه الله), and concrete words of the scene or argument (المنبر, العلماء). Prefer distinctive words. Never output very common words alone (الله, قال, الناس, كان, هذا).
- "english": up to 8 short phrases a translation would use (e.g. "Malik", "pulpit", "co-wives", "face of God"). Keep them specific.
- "verses": up to 6 references "surah:ayah" that the question is about or that the commentary would discuss for it. Only include verses you are confident about.
- Do not answer the question. Do not add commentary. Output JSON only.`;

const CACHE = new Map<string, Expansion>();

function clean(xs: unknown, max: number): string[] {
  if (!Array.isArray(xs)) return [];
  const out: string[] = [];
  for (const x of xs) {
    if (typeof x !== 'string') continue;
    const t = x.trim().slice(0, 60);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

export async function expand(q: string): Promise<Expansion> {
  const key = q.toLowerCase();
  const hit = CACHE.get(key);
  if (hit) return hit;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: SYSTEM,
        messages: [{ role: 'user', content: q }],
      }),
    });
    if (!res.ok) throw new Error(`model ${res.status}`);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).map(c => c.text ?? '').join('');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const exp: Expansion = {
      arabic: clean(parsed.arabic, 14),
      english: clean(parsed.english, 8),
      verses: clean(parsed.verses, 6).filter(v => /^\d{1,3}:\d{1,3}$/.test(v)),
    };
    if (CACHE.size > 500) CACHE.clear();
    CACHE.set(key, exp);
    return exp;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- ranking

export interface Phrase { text: string; words: string[]; weight: number }

/** Each phrase folded as the paragraphs are, and matched as a whole: "في أي
 *  شأن" must occur as written, not as three common words scattered through a
 *  paragraph. Weighted by rarity across `docs`, since a phrase in a handful of
 *  paragraphs tells more than one in thousands. Phrases found nowhere, or in
 *  more than a fifth of the paragraphs, are dropped, as are one-word phrases
 *  under three letters. */
export function weigh(phrases: string[], fold: (s: string) => string, docs: string[], pad: boolean): Phrase[] {
  const N = docs.length || 1;
  const out: Phrase[] = [];
  for (const p of phrases) {
    const text = fold(p);
    const words = text.split(' ').filter(Boolean);
    if (!words.length || (words.length === 1 && words[0].length < 3)) continue;
    const needle = pad ? ' ' + text : text;
    let df = 0;
    for (const d of docs) if (d.includes(needle)) df++;
    if (df === 0 || df > N * 0.2) continue;
    out.push({ text: needle, words: words.filter(w => w.length > 2), weight: Math.log(1 + N / df) });
  }
  return out;
}

export function rank<T>(items: T[], text: (x: T) => string, phrases: Phrase[], limit: number) {
  const scored: { x: T; score: number; words: string[] }[] = [];
  for (const x of items) {
    const d = text(x);
    let score = 0, n = 0;
    const words: string[] = [];
    for (const p of phrases) {
      if (d.includes(p.text)) { score += p.weight; n++; words.push(...p.words); }
    }
    // Two distinct phrases together outrank one rare phrase alone.
    if (n > 0) scored.push({ x, score: score * (1 + 0.5 * (n - 1)), words });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ---------------------------------------------------------------- the search

export async function meaningSearch(raw: string, limit = 12): Promise<MeaningResults> {
  const q = raw.trim().slice(0, 300);
  const none: MeaningResults = { available: true, expansion: null, verses: [], tafsir: [], works: [], students: [] };
  if (!q) return none;
  if (!process.env.ANTHROPIC_API_KEY) return { ...none, available: false };

  let exp: Expansion;
  try {
    exp = await expand(q);
  } catch (e) {
    return { ...none, error: e instanceof Error ? e.message : 'failed' };
  }

  // Verses the question is about.
  const verses = exp.verses
    .map(r => r.split(':').map(Number))
    .map(([s, a]) => VERSES.find(v => v.surah === s && v.ayah === a))
    .filter((v): v is (typeof VERSES)[number] => !!v)
    .map(toVerseHit);

  // The tafsīr, Arabic: all 56 lessons.
  const paras = await arabicParagraphs();
  const arPhrases = weigh(exp.arabic, foldAr, paras.map(p => p.norm), false);
  const arHits = rank(paras, p => p.norm, arPhrases, limit).map(({ x, words }) => ({
    source: `Lesson ${x.lessonId}`,
    where: x.lessonTitle || x.verseRange,
    snippet: excerpt(x.text, words, true, 320),
    arabic: true,
    href: `/lesson/${x.lessonId}#ar-para-${x.paraIndex}`,
    _lesson: x.lessonId,
    _para: x.paraIndex,
  }));

  // The tafsīr, English: the translated lessons. Shown only where the Arabic
  // did not already surface the same lesson, so one passage is not listed twice.
  const en = await englishIndex();
  const enPhrases = weigh(exp.english, foldEn, en.map(p => p.norm), true);
  const seenLessons = new Set(arHits.map(h => h._lesson));
  const enHits = rank(en, p => p.norm, enPhrases, limit)
    .filter(({ x }) => !seenLessons.has(x.lessonId))
    .slice(0, 4)
    .map(({ x, words }) => ({
      source: `Lesson ${x.lessonId}`,
      where: x.title || x.range,
      snippet: excerpt(x.text, words, false, 320),
      arabic: false,
      href: `/lesson/${x.lessonId}`,
    }));

  // His other works, and his students' commentaries, ranked apart.
  const withAr = WORK_PASSAGES.filter(w => w.arF);
  const wArPhrases = weigh(exp.arabic, foldAr, withAr.map(w => w.arF), false);
  const toHit = ({ x, words }: { x: (typeof WORK_PASSAGES)[number]; words: string[] }): PassageHit => {
    const link = FIRST_LINK.get(x.l.id)!;
    return {
      source: WORK_TITLE.get(x.work) ?? x.work,
      where: `${x.l.address.raw} · on Q. ${link.surah}:${link.ayahStart}`,
      snippet: excerpt(x.l.textAr ?? '', words, true, 320),
      arabic: true,
      href: `/verse/${link.surah}/${link.ayahStart}`,
    };
  };
  const works = rank(withAr.filter(w => !w.student), w => w.arF, wArPhrases, 6).map(toHit);
  const students = rank(withAr.filter(w => w.student), w => w.arF, wArPhrases, 4).map(toHit);

  const tafsir: PassageHit[] = [
    ...arHits.map(({ _lesson, _para, ...h }) => h),
    ...enHits,
  ];

  return { available: true, expansion: exp, verses, tafsir, works, students };
}
