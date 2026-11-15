// Ask the Tafsīr, in his words.
//
// A reader asks a question; the answer is made only of his text. The search
// by meaning (meaningSearch.ts) finds the candidate paragraphs; a model then
// picks the sentences in them that answer the question, puts them in order and
// says whose voice each is (his own, the Jalālayn gloss he reads out, the
// editor, a student). It writes nothing of its own.
//
// Every quotation the model returns is checked against the paragraph it names,
// letter for letter after the same folding the search uses (vowels, hamza
// seats, tāʾ marbūṭa). A quotation that is not found is dropped, and what the
// reader sees is the original text of the paragraph, cut at the matched span,
// never the model's copy of it. English is shown only where the site already
// has a translation of the lesson and the translator's alignment places this
// paragraph (bilingualAlignment.ts).
//
// Needs ANTHROPIC_API_KEY. Rate-limited per visitor (AK, 16 Nov 2026).
//
// Server-only.

import { arabicParagraphs, normalizeArabic } from '@/lib/arabicSearch';
import { foldAr, WORK_PASSAGES, FIRST_LINK, WORK_TITLE } from '@/lib/siteSearch';
import { expand, weigh, rank } from '@/lib/meaningSearch';
import { getAllLessons } from '@/lib/lessons';
import { BILINGUAL_ALIGNMENT } from '@/lib/bilingualAlignment';

export type Voice = 'niasse' | 'jalalayn' | 'editor' | 'student' | 'reported';

export interface AskQuote {
  /** The paragraph's original text at the matched span(s); segments joined with " … ". */
  ar: string;
  voice: Voice;
  /** Draft English of the whole paragraph, where the site has an aligned translation. */
  en?: string;
  source: string;
  where: string;
  href: string;
  path: 'tafsir' | 'works' | 'students';
}

export interface AskAnswer {
  available: boolean;
  error?: string;
  /** True when the passages found do not answer the question. */
  none: boolean;
  quotes: AskQuote[];
}

interface Candidate {
  id: string;
  path: AskQuote['path'];
  text: string;
  source: string;
  where: string;
  href: string;
  lessonId?: number;
  paraIndex?: number;
  /** For a tafsīr window: the first paragraph's index and each paragraph's length (+1 for the joining space). */
  windowStart?: number;
  windowLens?: number[];
}

const MODEL = process.env.ANTHROPIC_ASK_MODEL || process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

const SYSTEM = `You select quotations from the Arabic works of Shaykh Ibrāhīm Niasse (d. 1975) and his students to answer a reader's question. You never write an answer of your own.

You receive the question and numbered candidate passages (C1, C2, ...). Each says which path it comes from:
- "tafsir": a lesson of his oral Qurʾān commentary Fī Riyāḍ al-Tafsīr. In these, the Qurʾān lemma is followed by the Jalālayn gloss he reads out (short glosses right after Qurʾānic words, often in parentheses), and then his own commentary in a plain spoken register.
- "works": his other writings.
- "students": a student's commentary (the student's own words, not his).

Output ONLY a JSON object:
{"none": false, "quotes": [{"c": "C3", "voice": "niasse", "text": "..."}]}

Rules:
- Choose at most 5 quotations, only from passages that actually answer the question. Order them so they read as an answer: the most direct first.
- "text" must be copied EXACTLY from the passage, character for character, one continuous stretch. To skip material inside a stretch, use " … " between two exact pieces. Keep each quotation to 1–4 sentences.
- "voice": "niasse" for his own words; "jalalayn" for the Jalālayn gloss he reads out; "editor" for an editor's note; "student" for a student's own words (path "students"); "reported" for words a student reports from him.
- Never quote the Qurʾān alone; quote what is said about it.
- If no passage answers the question, output {"none": true, "quotes": []}.
- Output JSON only.`;

// ---------------------------------------------------------------- limits

const HOURLY = Number(process.env.ASK_HOURLY_LIMIT || 12);
const DAILY_ALL = Number(process.env.ASK_DAILY_LIMIT || 400);
const hits = new Map<string, number[]>();
let day = '', dayCount = 0;

/** A visitor may ask HOURLY questions an hour; this server instance answers at
 *  most DAILY_ALL a day. In-memory, so per instance: the Anthropic console's
 *  monthly spend limit is the hard cap behind it. */
export function allow(visitor: string): boolean {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) { day = today; dayCount = 0; }
  if (dayCount >= DAILY_ALL) return false;
  const recent = (hits.get(visitor) ?? []).filter(t => now - t < 3600_000);
  if (recent.length >= HOURLY) { hits.set(visitor, recent); return false; }
  recent.push(now);
  hits.set(visitor, recent);
  if (hits.size > 5000) hits.clear();
  dayCount++;
  return true;
}

// ---------------------------------------------------------------- matching

/** Folded text with a map from each folded character back to the original. */
function foldWithMap(s: string): { f: string; map: number[] } {
  let f = '';
  const map: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const ch0 = s[i];
    // Spaces and the punctuation the folding turns into spaces stay spaces;
    // vowel marks and tatweel fold to nothing.
    const c = /[\s«»()\[\]{}"'.,:;!?،؛؟]/.test(ch0) ? ' ' : foldAr(ch0);
    for (const ch of c) { f += ch; map.push(i); }
  }
  // foldAr collapses spaces and trims per character; normalise runs of spaces.
  let g = '', gm: number[] = [];
  for (let i = 0; i < f.length; i++) {
    if (f[i] === ' ' && (g.endsWith(' ') || g === '')) continue;
    g += f[i]; gm.push(map[i]);
  }
  return { f: g, map: gm };
}

/** The original text of every " … " segment of `quote`, found in order in
 *  `para`, or null if any segment is missing. */
function locate(quote: string, para: string): { text: string; start: number } | null {
  const { f, map } = foldWithMap(para);
  const segs = quote.split(/\s*(?:…|\.\.\.)\s*/).map(s => normalizeArabic(foldAr(s))).filter(s => s.length >= 6);
  if (!segs.length) return null;
  const out: string[] = [];
  let from = 0, first = -1;
  for (const seg of segs) {
    const at = f.indexOf(seg, from);
    if (at < 0) return null;
    const end = at + seg.length - 1;
    // Extend to the end of the original word so a final letter's marks stay.
    let a = map[at], b = map[end] + 1;
    if (first < 0) first = a;
    while (b < para.length && !/\s/.test(para[b]) && /[ً-ٰٟۖ-ۭ࣓-ࣿ]/.test(para[b])) b++;
    out.push(para.slice(a, b).trim());
    from = end + 1;
  }
  return { text: out.join(' … '), start: first };
}

// ---------------------------------------------------------------- english

interface EnLesson { paras: string[]; para2en: Map<number, number[]> }
let EN: Promise<Map<number, EnLesson>> | null = null;
function englishByLesson(): Promise<Map<number, EnLesson>> {
  if (!EN) {
    EN = getAllLessons().then(lessons => {
      const m = new Map<number, EnLesson>();
      for (const l of lessons) {
        const al = BILINGUAL_ALIGNMENT[l.id];
        if (!l.hasEnglish || !l.englishText || !al) continue;
        const paras: string[] = [];
        for (const p of l.englishText.split(/(?=<p[^>]*>)/)) {
          if (!/<p[^>]*\bclass="[^"]*\ben-para\b[^"]*"/.test(p)) continue;
          const text = p.replace(/<sup[\s\S]*?<\/sup>/g, '').replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’')
            .replace(/&quot;/g, '"').replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
          if (text) paras.push(text);
        }
        const para2en = new Map<number, number[]>();
        for (const b of al.blocks) for (const a of b.arabicIndices) para2en.set(a, b.englishIndices);
        m.set(l.id, { paras, para2en });
      }
      return m;
    });
  }
  return EN;
}

// ---------------------------------------------------------------- the answer

const CACHE = new Map<string, AskAnswer>();

export async function askTafsir(raw: string): Promise<AskAnswer> {
  const q = raw.trim().slice(0, 300);
  const empty: AskAnswer = { available: true, none: true, quotes: [] };
  if (!q) return empty;
  if (!process.env.ANTHROPIC_API_KEY) return { ...empty, available: false };
  const cached = CACHE.get(q.toLowerCase());
  if (cached) return cached;

  try {
    const exp = await expand(q);

    // Candidates: the best tafsīr paragraphs, then his other works, then his
    // students, in the proportions a reader would want.
    const paras = await arabicParagraphs();
    const arPhrases = weigh(exp.arabic, foldAr, paras.map(p => p.norm), false);
    // A paragraph here is a printed page's run of text, so a story or an
    // argument often breaks across two or three of them (the pulpit story at
    // Q. 55:29 spans three). Each candidate is therefore the ranked paragraph
    // with its neighbours, and overlapping windows are merged.
    const byKey = new Map(paras.map(p => [`${p.lessonId}:${p.paraIndex}`, p]));
    type Win = { lessonId: number; lo: number; hi: number; top: (typeof paras)[number] };
    const wins: Win[] = [];
    for (const { x } of rank(paras, p => p.norm, arPhrases, 12)) {
      const lo = x.paraIndex - 1, hi = x.paraIndex + 1;
      // Touching or overlapping a window already in this lesson: widen it (to
      // five paragraphs at most) rather than open a second one.
      const w = wins.find(w => w.lessonId === x.lessonId && lo <= w.hi + 1 && hi >= w.lo - 1);
      if (w) {
        const nlo = Math.min(w.lo, lo), nhi = Math.max(w.hi, hi);
        if (nhi - nlo < 5) { w.lo = nlo; w.hi = nhi; }
        continue;
      }
      if (wins.length < 6) wins.push({ lessonId: x.lessonId, lo, hi, top: x });
    }
    const tafsir: Candidate[] = wins.map(w => {
      const win: (typeof paras)[number][] = [];
      for (let i = w.lo; i <= w.hi; i++) { const p = byKey.get(`${w.lessonId}:${i}`); if (p) win.push(p); }
      return {
        id: '', path: 'tafsir', text: win.map(p => p.text).join(' '),
        source: `Fī Riyāḍ al-Tafsīr, Lesson ${w.lessonId}`,
        where: w.top.lessonTitle || w.top.verseRange,
        href: `/lesson/${w.lessonId}#ar-para-${w.top.paraIndex}`,
        lessonId: w.lessonId, paraIndex: w.top.paraIndex,
        windowStart: win[0].paraIndex,
        windowLens: win.map(p => p.text.length + 1),
      } as Candidate;
    });
    const withAr = WORK_PASSAGES.filter(w => w.arF);
    const wPhrases = weigh(exp.arabic, foldAr, withAr.map(w => w.arF), false);
    const fromWork = (path: 'works' | 'students') => ({ x }: { x: (typeof WORK_PASSAGES)[number] }): Candidate => {
      const link = FIRST_LINK.get(x.l.id)!;
      return {
        id: '', path, text: x.l.textAr ?? '',
        source: WORK_TITLE.get(x.work) ?? x.work,
        where: `${x.l.address.raw} · on Q. ${link.surah}:${link.ayahStart}`,
        href: `/verse/${link.surah}/${link.ayahStart}`,
      };
    };
    const works = rank(withAr.filter(w => !w.student), w => w.arF, wPhrases, 3).map(fromWork('works'));
    const students = rank(withAr.filter(w => w.student), w => w.arF, wPhrases, 2).map(fromWork('students'));
    const cands = [...tafsir, ...works, ...students].map((c, i) => ({ ...c, id: `C${i + 1}` }));
    if (!cands.length) {
      CACHE.set(q.toLowerCase(), empty);
      return empty;
    }

    const prompt = `Question: ${q}\n\n` + cands.map(c =>
      `${c.id} [${c.path}] ${c.source}${c.where ? ' · ' + c.where : ''}\n${c.text.slice(0, 2500)}`).join('\n\n');

    const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`model ${res.status}`);
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = (data.content ?? []).map(c => c.text ?? '').join('');
    const parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as {
      none?: boolean; quotes?: { c?: string; voice?: string; text?: string }[];
    };

    const en = await englishByLesson();
    const byId = new Map(cands.map(c => [c.id, c]));
    const voices: Voice[] = ['niasse', 'jalalayn', 'editor', 'student', 'reported'];
    const quotes: AskQuote[] = [];
    for (const qt of (parsed.quotes ?? []).slice(0, 5)) {
      const c = byId.get(String(qt.c));
      if (!c || typeof qt.text !== 'string') continue;
      const found = locate(qt.text, c.text);
      if (!found) continue; // not in the passage: dropped
      const ar = found.text;
      // Which paragraph of the window the quotation starts in: link and
      // translate that one.
      let paraIndex = c.paraIndex;
      if (c.windowStart != null && c.windowLens) {
        let off = 0;
        paraIndex = c.windowStart;
        for (let k = 0; k < c.windowLens.length; k++) {
          if (found.start < off + c.windowLens[k]) { paraIndex = c.windowStart + k; break; }
          off += c.windowLens[k];
        }
      }
      const href = c.lessonId != null && paraIndex != null ? `/lesson/${c.lessonId}#ar-para-${paraIndex}` : c.href;
      let voice = (voices.includes(qt.voice as Voice) ? qt.voice : 'niasse') as Voice;
      // The path decides what the model may not: a student's own words are never his.
      if (c.path === 'students' && voice !== 'reported') voice = 'student';
      if (c.path !== 'students' && (voice === 'student' || voice === 'reported')) voice = 'niasse';
      let english: string | undefined;
      if (c.lessonId != null && paraIndex != null) {
        const l = en.get(c.lessonId);
        const idx = l?.para2en.get(paraIndex);
        if (l && idx && idx.length) english = idx.map(i => l.paras[i]).filter(Boolean).join(' ');
      }
      quotes.push({ ar, voice, en: english, source: c.source, where: c.where, href, path: c.path });
    }
    const answer: AskAnswer = { available: true, none: quotes.length === 0, quotes };
    if (CACHE.size > 500) CACHE.clear();
    CACHE.set(q.toLowerCase(), answer);
    return answer;
  } catch (e) {
    return { ...empty, none: false, error: e instanceof Error ? e.message : 'failed' };
  }
}
