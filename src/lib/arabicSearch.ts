// Server-only search over Shaykh Ibrāhīm's own Arabic commentary in Fī Riyāḍ
// al-Tafsīr -- the prose, not just the Qurʾān he quotes.
//
// The client-side index (public/data/search-main.json) carries the English and
// the Qurʾānic citation fragments only. His Arabic for all 56 sessions is about
// 12 MB of lesson files; shipping it to every phone that opens /search would be
// slow, and a single public file of the whole book is a bulk download nobody
// needs. So the Arabic is searched here, on the server, and a query returns
// only a short passage around each match with a link to the paragraph. The
// full text is published on the lesson pages already (AK, 16 Aug 2026).
//
// Matching folds what Arabic spelling varies on and readers type loosely:
// vowels and Qurʾānic marks, tatweel, the hamza seats and alif forms, final
// yāʾ/alif maqṣūra and tāʾ marbūṭa/hāʾ. Every word of the query must occur in
// the paragraph, in any order.

import { getAllLessons } from '@/lib/lessons';
import { commentaryParagraphs } from '@/lib/niasseVerseExcerpt';

export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ٰٟؐ-ؚۖ-ۭـ]/g, '')
    .replace(/[آأإٱٲٳ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[«»()\[\]{}"'.,:;!?،؛؟]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Para {
  lessonId: number;
  lessonTitle: string;
  lessonTitleAr: string;
  verseRange: string;
  paraIndex: number;
  text: string;
  norm: string;
}

let INDEX: Promise<Para[]> | null = null;

function index(): Promise<Para[]> {
  if (!INDEX) {
    INDEX = getAllLessons().then(lessons => {
      const out: Para[] = [];
      for (const l of lessons) {
        const body = l.arabicBody || l.arabicText;
        if (!body) continue;
        commentaryParagraphs(body).forEach((text, paraIndex) => {
          out.push({
            lessonId: l.id,
            lessonTitle: l.englishTitle ?? '',
            lessonTitleAr: l.arabicTitle ?? '',
            verseRange: l.verseRange ?? '',
            paraIndex,
            text,
            norm: normalizeArabic(text),
          });
        });
      }
      return out;
    });
  }
  return INDEX;
}

export interface ArabicHit {
  lessonId: number;
  lessonTitle: string;
  lessonTitleAr: string;
  verseRange: string;
  paraIndex: number;
  snippet: string;
}

/** Mark the matched words with \u0001…\u0002 so the page can highlight them. */
export const MARK_OPEN = '\u0001';
export const MARK_CLOSE = '\u0002';

/** A readable passage that opens a few words before the first match and runs
 *  on from it, so the matched words sit in the lines a preview shows. */
function snippetAround(text: string, terms: string[], width = 240): string {
  const words = text.split(/\s+/);
  const isHit = (w: string) => { const n = normalizeArabic(w); return terms.some(t => n.includes(t)); };
  let hit = words.findIndex(isHit);
  if (hit < 0) hit = 0;
  const start = Math.max(0, hit - 5);
  let end = start, len = 0;
  while (end < words.length && len < width) { len += words[end].length + 1; end++; }
  const body = words.slice(start, end).map(w => (isHit(w) ? MARK_OPEN + w + MARK_CLOSE : w)).join(' ');
  return (start > 0 ? '… ' : '') + body + (end < words.length ? ' …' : '');
}

export async function searchArabic(q: string, limit = 50): Promise<{ total: number; hits: ArabicHit[] }> {
  const terms = normalizeArabic(q).split(' ').filter(t => t.length > 1);
  if (terms.length === 0) return { total: 0, hits: [] };
  const paras = await index();
  const matched = paras.filter(p => terms.every(t => p.norm.includes(t)));
  return {
    total: matched.length,
    hits: matched.slice(0, limit).map(p => ({
      lessonId: p.lessonId,
      lessonTitle: p.lessonTitle,
      lessonTitleAr: p.lessonTitleAr,
      verseRange: p.verseRange,
      paraIndex: p.paraIndex,
      snippet: snippetAround(p.text, terms),
    })),
  };
}
