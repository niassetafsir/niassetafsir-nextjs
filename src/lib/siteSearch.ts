// One search for the whole site: verses, topics, terms, and what Shaykh
// Ibrāhīm says, in Fī Riyāḍ al-Tafsīr and in his other works.
//
// The homepage box and /search both land here. The old /search covered the 56
// tafsīr lessons and Jalālayn only, so a word like tawḥīd never reached his
// treatises, fatwās or poems, and topics and terms were reachable only from the
// Research menu (AK, 15 Nov 2026: "search any verse or topic or term ... and
// find what Shaykh Ibrahim Niasse says about that verse or topic or term
// wherever it is found").
//
// Server-only: it reads the lesson files and the corpus.

import fs from 'fs/promises';
import path from 'path';
import verseText from '@/data/verse_text.json';
import corpus from '@/data/corpus.json';
import { TOPICS } from '@/lib/topics';
import { TERMS } from '@/lib/corpus';
import { SURAH_LIST } from '@/lib/verseRanges';
import { parseVerseRef, parseSurahName } from '@/lib/verseRefQuery';
import { normalizeArabic, searchArabic, MARK_OPEN, MARK_CLOSE } from '@/lib/arabicSearch';
import { getAllLessons } from '@/lib/lessons';
import { publicEnglish } from '@/lib/publicEnglish';
import { isShownLink } from '@/lib/scholarlyActs';

export { MARK_OPEN, MARK_CLOSE };

const isArabic = (s: string) => /[؀-ۿ]/.test(s);

/** Arabic, folded as arabicSearch folds it, plus the Warsh muṣḥaf's own
 *  marks (U+08D3–08FF) and its final yāʾ (ے), so "في" meets "فِے". */
export function foldAr(s: string): string {
  return normalizeArabic(s.replace(/[࣓-ࣿ]/g, '').replace(/ے/g, 'ي'));
}

/** Latin, with the transliteration's marks, ʿ and ʾ, and the article dropped. */
export function foldEn(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʾʿʼʻ‘’'`]/g, '')
    .toLowerCase()
    .replace(/\bal-/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const fold = (s: string) => (isArabic(s) ? foldAr(s) : foldEn(s));

/** Every word of the query occurs in the text. */
function allWords(textFolded: string, words: string[]): boolean {
  return words.every(w => textFolded.includes(w));
}

/** Wrap the query's words in MARK_OPEN … MARK_CLOSE, word by word. */
function markWords(text: string, words: string[], arabic: boolean): string {
  return text
    .split(/(\s+)/)
    .map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      const f = arabic ? foldAr(tok) : foldEn(tok);
      return f && words.some(w => f.includes(w)) ? MARK_OPEN + tok + MARK_CLOSE : tok;
    })
    .join('');
}

/** A passage of about `width` characters that opens just before the first
 *  match, so the matched words sit in what the reader sees. */
function excerpt(text: string, words: string[], arabic: boolean, width = 260): string {
  const toks = text.split(/\s+/).filter(Boolean);
  const hit = toks.findIndex(t => {
    const f = arabic ? foldAr(t) : foldEn(t);
    return words.some(w => f.includes(w));
  });
  const start = Math.max(0, (hit < 0 ? 0 : hit) - 6);
  let end = start, len = 0;
  while (end < toks.length && len < width) { len += toks[end].length + 1; end++; }
  const body = markWords(toks.slice(start, end).join(' '), words, arabic);
  return (start > 0 ? '… ' : '') + body + (end < toks.length ? ' …' : '');
}

// ---------------------------------------------------------------- verses

export interface VerseHit {
  surah: number;
  ayah: number;
  surahName: string;
  ar: string;
  en: string;
}

export interface SurahHit { surah: number; nameEn: string; nameAr: string; ayahCount: number }

const VERSES = Object.entries(verseText as Record<string, { ar: string; en: string }>)
  .map(([k, v]) => {
    const [s, a] = k.split(':').map(Number);
    return { surah: s, ayah: a, ar: v.ar, en: v.en, arF: foldAr(v.ar), enF: ' ' + foldEn(v.en) + ' ' };
  })
  .sort((x, y) => x.surah - y.surah || x.ayah - y.ayah);

const surahName = (n: number) => SURAH_LIST.find(s => s.id === n)?.nameEn ?? `Sūra ${n}`;

function toVerseHit(v: (typeof VERSES)[number]): VerseHit {
  return { surah: v.surah, ayah: v.ayah, surahName: surahName(v.surah), ar: v.ar, en: v.en };
}

// ---------------------------------------------------------------- terms

export interface TermHit {
  label: string;
  ar: string;
  gloss: string;
  href: string;
  /** How many passages the entry lists, when known. */
  count?: number;
}

interface ConcordanceRow { term: string; arabic: string; occurrenceCount: number; occurrences?: { englishExcerpt?: string }[] }

let CONCORDANCE: Promise<ConcordanceRow[]> | null = null;
function concordance(): Promise<ConcordanceRow[]> {
  if (!CONCORDANCE) {
    CONCORDANCE = fs
      .readFile(path.join(process.cwd(), 'public', 'data', 'term_concordance.json'), 'utf8')
      .then(s => JSON.parse(s) as ConcordanceRow[])
      .catch(() => []);
  }
  return CONCORDANCE;
}

/** The glossary's own key for a term (src/app/glossary/page.tsx). */
export function glossaryKey(s: string): string {
  return s.normalize('NFC').toLowerCase()
    .replace(/^al-/, '')
    .replace(/[ʾʿ'’‘]/g, '')
    .replace(/[\s-]+/g, '-');
}

/** A short term matches on the whole word, or the start of it; a reader
 *  typing "sirr" wants the secret, not every term containing those letters. */
function termMatches(q: string, ...fields: string[]): boolean {
  const fq = fold(q);
  if (!fq) return false;
  return fields.some(f => {
    if (!f) return false;
    const ff = fold(f);
    if (!ff) return false;
    if (ff === fq) return true;
    if (isArabic(q)) return ff.replace(/^ال/, '') === fq.replace(/^ال/, '') || ff.includes(fq);
    return ff.split(' ').some(w => w.startsWith(fq)) || (fq.length > 3 && ff.includes(fq));
  });
}

// ---------------------------------------------------------------- passages

export interface PassageHit {
  /** Where it is: "Lesson 7" or the work's title. */
  source: string;
  /** Under it: the verses the lesson covers, or the address in the work. */
  where: string;
  snippet: string;
  arabic: boolean;
  href: string;
}

interface EnPara { lessonId: number; title: string; range: string; text: string; norm: string }

let EN_INDEX: Promise<EnPara[]> | null = null;
function englishIndex(): Promise<EnPara[]> {
  if (!EN_INDEX) {
    EN_INDEX = getAllLessons().then(lessons => {
      const out: EnPara[] = [];
      for (const l of lessons) {
        if (!l.englishText) continue;
        const paras = l.englishText.match(/<p[^>]*>[\s\S]*?<\/p>/g) ?? [l.englishText];
        for (const p of paras) {
          const text = p.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, '’')
            .replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
          if (text.length < 30) continue;
          out.push({
            lessonId: l.id, title: l.englishTitle ?? '', range: l.verseRange ?? '',
            text, norm: ' ' + foldEn(text) + ' ',
          });
        }
      }
      return out;
    });
  }
  return EN_INDEX;
}

interface CorpusLocus {
  id: string; witnessId: string; address: { raw: string };
  textAr?: string; textEn?: string; copiedFrom?: string; attributedTo?: string;
}
interface CorpusWork { id: string; titleTranslit: string }
interface CorpusWitness { id: string; workId: string }
interface CorpusLink { locusId: string; surah: number; ayahStart: number; acts: string[] }

const C = corpus as unknown as {
  works: CorpusWork[]; witnesses: CorpusWitness[]; loci: CorpusLocus[]; verseLinks: CorpusLink[];
};
const WORK_OF = new Map(C.witnesses.map(w => [w.id, w.workId]));
const WORK_TITLE = new Map(C.works.map(w => [w.id, w.titleTranslit]));
const FIRST_LINK = new Map<string, CorpusLink>();
for (const l of C.verseLinks) if (isShownLink(l) && !FIRST_LINK.has(l.locusId)) FIRST_LINK.set(l.locusId, l);

/** His other works: every transcribed passage outside Fī Riyāḍ, in his own
 *  voice. Passages he copies from another author (al-Rāzī in Tabṣirat al-anām)
 *  and replies signed by someone else are left out: this search answers
 *  "what does he say". */
const WORK_PASSAGES = C.loci
  .filter(l => (l.textAr || l.textEn) && !l.copiedFrom && !l.attributedTo)
  .map(l => ({ l: { ...l, textEn: publicEnglish(l.id, WORK_OF.get(l.witnessId), l.textEn) }, work: WORK_OF.get(l.witnessId) ?? '' }))
  .filter(x => x.work && x.work !== 'fi-riyad' && FIRST_LINK.has(x.l.id))
  .map(({ l, work }) => ({
    l, work,
    arF: l.textAr ? foldAr(l.textAr) : '',
    enF: l.textEn ? ' ' + foldEn(l.textEn) + ' ' : '',
  }));

// ---------------------------------------------------------------- the search

export type Section = 'verses' | 'tafsir' | 'works';

export interface SearchResults {
  query: string;
  /** The verse a reference like 2:255 names. */
  verseRef: VerseHit | null;
  /** The sūra a name like "al-Kahf" names. */
  surah: SurahHit | null;
  verses: VerseHit[];
  versesTotal: number;
  topics: { slug: string; title: string; term: string; termAr: string; question: string }[];
  terms: TermHit[];
  tafsir: PassageHit[];
  tafsirTotal: number;
  works: PassageHit[];
  worksTotal: number;
}

const SHORT = 8;
const LONG = 200;

export async function siteSearch(raw: string, expand?: Section): Promise<SearchResults> {
  const query = raw.trim().slice(0, 120);
  const empty: SearchResults = {
    query, verseRef: null, surah: null, verses: [], versesTotal: 0, topics: [], terms: [],
    tafsir: [], tafsirTotal: 0, works: [], worksTotal: 0,
  };
  if (!query) return empty;

  const arabic = isArabic(query);
  const limit = (s: Section) => (expand === s ? LONG : SHORT);

  // A reference names one verse, and that is the whole answer.
  const ref = parseVerseRef(query);
  if (ref && ref.meta && !ref.ayahOutOfRange) {
    const v = VERSES.find(x => x.surah === ref.surah && x.ayah === ref.ayah);
    return { ...empty, verseRef: v ? toVerseHit(v) : null };
  }

  const s = parseSurahName(query);
  const surah: SurahHit | null = s
    ? { surah: s.surah, nameEn: s.meta.nameEn, nameAr: s.meta.nameAr, ayahCount: s.meta.ayahCount }
    : null;

  const words = (arabic ? foldAr(query) : foldEn(query)).split(' ').filter(w => w.length > 1);
  if (words.length === 0) return { ...empty, surah };

  // Verses whose words the query quotes. English is matched on whole words,
  // so "fire" does not find "fireside".
  const verseMatches = arabic
    ? VERSES.filter(v => allWords(v.arF, words))
    : VERSES.filter(v => words.every(w => v.enF.includes(' ' + w + ' ')));

  // Topics and terms.
  const topics = TOPICS
    .filter(t => termMatches(query, t.term, t.termAr, t.title, t.slug))
    .map(t => ({ slug: t.slug, title: t.title, term: t.term, termAr: t.termAr, question: t.question }));

  // The term indexes (/term, /glossary) are off the public site for now
  // (AK, 15 Nov 2026), so search no longer offers them as results.
  const terms: TermHit[] = [];

  // What he says: the tafsīr, Arabic or English, and the other works.
  let tafsir: PassageHit[] = [];
  let tafsirTotal = 0;
  if (arabic) {
    const r = await searchArabic(query, limit('tafsir'));
    tafsirTotal = r.total;
    tafsir = r.hits.map(h => ({
      source: `Lesson ${h.lessonId}`,
      where: h.lessonTitle || h.verseRange,
      snippet: h.snippet,
      arabic: true,
      href: `/lesson/${h.lessonId}#ar-para-${h.paraIndex}`,
    }));
  } else {
    const paras = (await englishIndex()).filter(p => words.every(w => p.norm.includes(' ' + w)));
    tafsirTotal = paras.length;
    tafsir = paras.slice(0, limit('tafsir')).map(p => ({
      source: `Lesson ${p.lessonId}`,
      where: p.title || p.range,
      snippet: excerpt(p.text, words, false),
      arabic: false,
      href: `/lesson/${p.lessonId}`,
    }));
  }

  const workMatches = WORK_PASSAGES.filter(x =>
    arabic ? allWords(x.arF, words) : words.every(w => x.enF.includes(' ' + w)));
  const works: PassageHit[] = workMatches.slice(0, limit('works')).map(({ l, work }) => {
    const link = FIRST_LINK.get(l.id)!;
    const useAr = arabic ? !!l.textAr : !l.textEn;
    const text = (useAr ? l.textAr : l.textEn) ?? '';
    return {
      source: WORK_TITLE.get(work) ?? work,
      where: `${l.address.raw} · on Q. ${link.surah}:${link.ayahStart}`,
      snippet: excerpt(text, words, useAr),
      arabic: useAr,
      href: `/verse/${link.surah}/${link.ayahStart}`,
    };
  });

  return {
    query,
    verseRef: null,
    surah,
    verses: verseMatches.slice(0, limit('verses')).map(toVerseHit),
    versesTotal: verseMatches.length,
    topics,
    terms,
    tafsir,
    tafsirTotal,
    works,
    worksTotal: workMatches.length,
  };
}
