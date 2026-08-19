'use client';
import { useState, useEffect, useRef } from 'react';
import type { CommentaryUnit } from '@/lib/niasseVerseExcerpt';
import { parseVerseSpan, spanIncludes } from '@/lib/verseRanges';

/**
 * ComparativeCommentary — Niasse, Jalālayn and Rūḥ al-Bayān in one view.
 *
 * Replaces the two separate <Panel> blocks that each rendered
 * JalalaynVerseView with the SAME niasseByVerse prop, which printed Shaykh
 * Ibrāhīm's excerpt twice on every lesson page.
 *
 * WHY COLUMNS RATHER THAN A STACK (rebuilt 2026-08-19, on AK's report that
 * the view "isn't intuitive"). The three works used to stack in a fixed
 * order, longest first. Measured on the Q. 1:1 unit: the page ran 16,646px,
 * and Niasse occupied 739 to 15,107 of it. Jalālayn's gloss on 1:1 is one
 * line; Rūḥ al-Bayān's is 6,875 characters. So the reader scrolled some
 * fifteen screens past one commentary to reach the next, by which point
 * there is nothing left to compare against. Three texts one after another
 * is an anthology, not a comparison.
 *
 * Now: the reader picks which works to show, and the chosen ones sit side by
 * side in columns that scroll independently. Independent scrolling is what
 * makes the length asymmetry survivable — over al-Fātiḥa, Jalālayn runs
 * 1,531 characters and Rūḥ al-Bayān 54,038, a factor of 35, and 176x on 1:1
 * alone. In a shared scroll the long one dictates the page; in its own box it
 * does not. Each column header carries its work's character count for that
 * unit, so the disparity is stated rather than hidden.
 *
 * ONE LANGUAGE AT A TIME, governing every column (AK's choice). Two languages
 * per column would double the width each needs and three columns would not
 * fit. Rūḥ al-Bayān has no English yet — that column says so rather than
 * disappearing, so the layout does not shift under the reader.
 *
 * TWO PRESENTATIONS, chosen by whether a hand-curated partition exists:
 *
 *   units != null  -> UNIT PAGER, one unit at a time, columns across.
 *                     Lesson 1 only today (see lesson1FatihaVerseMap.ts).
 *   units == null  -> VERSE RAIL. A sticky chip row over a stack of verses,
 *                     each verse a row of columns. Asserts no segmentation,
 *                     needs nothing but the [s:v] markers already in the text
 *                     files, and so works on any lesson once transcribed.
 *
 * WHY NOT A PER-VERSE PAGER: the per-verse map is many-to-many by design —
 * 1:2, 1:3 and 1:4 all resolve to the same paragraphs — so stepping through
 * verses would show the same Niasse text three times running.
 */

interface NiasseVerseExcerpt {
  ar: string | null;
  en: string | null;
}

interface ComparativeCommentaryProps {
  jalalaynText: string | null;
  /** English Jalālayn, same [s:v] format. Absent for most sūras. */
  jalalaynEnText?: string | null;
  ruhText: string | null;
  niasseByVerse?: Record<string, NiasseVerseExcerpt> | null;
  units?: CommentaryUnit[] | null;
  verseRange: string;
  jalalaynUrl: string;
  usulUrl: string;
}

interface ParsedVerse {
  key: string;          // "1:2", no brackets
  surah: number;
  verse: number;
}

type SourceId = 'niasse' | 'jalalayn' | 'ruh';
type Lang = 'ar' | 'en';

const GOLD = '#8a6d1f';
const BLUE = '#1d4ed8';
const RUH = '#7c2d12';

const SOURCES: { id: SourceId; ar: string; en: string; colour: string }[] = [
  { id: 'niasse', ar: 'الشيخ إبراهيم نياس', en: 'Niasse', colour: GOLD },
  { id: 'jalalayn', ar: 'تفسير الجلالين', en: 'Jalālayn', colour: BLUE },
  { id: 'ruh', ar: 'روح البيان', en: 'Rūḥ al-Bayān', colour: RUH },
];

const commas = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Split "[1:1]\ntext\n[1:2]\ntext" into a key -> body map. */
function parseByVerse(text: string | null | undefined): Record<string, string> {
  if (!text) return {};
  const out: Record<string, string> = {};
  const blocks = text.split(/(\[\d+:\d+\])/);
  for (let i = 1; i < blocks.length; i += 2) {
    const m = blocks[i].match(/\[(\d+):(\d+)\]/);
    if (!m) continue;
    const body = (blocks[i + 1] || '').trim();
    if (body) out[m[1] + ':' + m[2]] = body;
  }
  return out;
}

function orderedKeys(...maps: Record<string, string>[]): ParsedVerse[] {
  const seen = new Set<string>();
  for (const m of maps) for (const k of Object.keys(m)) seen.add(k);
  return Array.from(seen)
    .map(k => {
      const [s, v] = k.split(':');
      return { key: k, surah: parseInt(s, 10), verse: parseInt(v, 10) };
    })
    .sort((a, b) => (a.surah - b.surah) || (a.verse - b.verse));
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

function SourceControls({
  active, setActive, lang, setLang, counts,
}: {
  active: Set<SourceId>;
  setActive: (s: Set<SourceId>) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  counts: Record<SourceId, number>;
}) {
  // At least one work must stay on — turning the last one off would leave an
  // empty panel with no way back.
  const toggle = (id: SourceId) => {
    const next = new Set(active);
    if (next.has(id)) { if (next.size === 1) return; next.delete(id); }
    else next.add(id);
    setActive(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3 pb-3"
      style={{ borderBottom: '1px solid rgba(13,31,10,0.12)' }}>
      <span className="font-english text-[10px] uppercase tracking-wider font-semibold"
        style={{ color: 'rgba(13,31,10,0.4)' }}>Show</span>

      {SOURCES.map(s => {
        const on = active.has(s.id);
        const n = counts[s.id];
        return (
          <button key={s.id} onClick={() => toggle(s.id)} aria-pressed={on}
            className="font-english text-[11.5px] px-3 py-1.5 rounded-full transition-all flex items-center gap-2"
            style={{
              border: '1px solid ' + (on ? s.colour : 'rgba(13,31,10,0.2)'),
              background: on ? s.colour : 'rgba(255,255,255,0.45)',
              color: on ? '#fdfaf0' : 'rgba(13,31,10,0.55)',
              fontWeight: on ? 600 : 400,
            }}>
            {lang === 'ar' ? <span className="font-arabic-sans" dir="rtl">{s.ar}</span> : s.en}
            {n > 0 && (
              <span className="text-[9.5px]" style={{ opacity: on ? 0.8 : 0.6 }}>
                {commas(n)}
              </span>
            )}
          </button>
        );
      })}

      <div className="flex items-center gap-1 ml-auto rounded-full p-0.5"
        style={{ border: '1px solid rgba(13,31,10,0.18)', background: 'rgba(255,255,255,0.45)' }}>
        {(['ar', 'en'] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
            className={(l === 'ar' ? 'font-arabic-sans' : 'font-english') + ' text-[11.5px] px-3 py-1 rounded-full transition-all'}
            style={{
              background: lang === l ? 'rgba(13,31,10,0.82)' : 'transparent',
              color: lang === l ? '#F5EDD6' : 'rgba(13,31,10,0.6)',
              fontWeight: lang === l ? 600 : 400,
            }}>
            {l === 'ar' ? 'عربي' : 'English'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Column                                                              */
/* ------------------------------------------------------------------ */

function Column({
  source, lang, chars, subtitle, children, scroll,
}: {
  source: SourceId;
  lang: Lang;
  chars: number;
  subtitle?: string;
  children: React.ReactNode;
  /** Unit pager gives each column its own scroll; the verse rail does not. */
  scroll: boolean;
}) {
  const s = SOURCES.find(x => x.id === source)!;
  const tint = source === 'niasse' ? 'rgba(138,109,31,' : source === 'jalalayn' ? 'rgba(29,78,216,' : 'rgba(124,45,18,';
  return (
    <div className="rounded-xl overflow-hidden flex flex-col min-w-0"
      style={{ border: '2px solid ' + tint + '0.34)', background: tint + '0.05)' }}>
      <div className="px-3.5 py-2 flex items-baseline gap-2 flex-wrap"
        style={{ background: tint + '0.10)', borderBottom: '1px solid ' + tint + '0.2)' }}>
        <span className="font-arabic-sans text-[13px] font-bold" dir="rtl" style={{ color: s.colour }}>{s.ar}</span>
        <span className="font-english text-[10.5px]" style={{ color: tint + '0.75)' }}>{s.en}</span>
        {subtitle && (
          <span className="font-english text-[9.5px]" style={{ color: tint + '0.6)' }}>· {subtitle}</span>
        )}
        {chars > 0 && (
          <span className="font-english text-[9.5px] ml-auto" style={{ color: tint + '0.6)' }}>
            {commas(chars)} chars
          </span>
        )}
      </div>
      <div
        className="px-3.5 py-3"
        style={scroll ? { maxHeight: '62vh', overflowY: 'auto' } : undefined}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {children}
      </div>
    </div>
  );
}

function Body({ text, lang }: { text: string; lang: Lang }) {
  return lang === 'ar' ? (
    <div className="font-arabic-sans text-sm leading-8 whitespace-pre-line" style={{ color: '#0D1F0A' }}>{text}</div>
  ) : (
    <div className="font-english text-sm leading-7 whitespace-pre-line" style={{ color: 'rgba(13,31,10,0.82)' }}>{text}</div>
  );
}

function Missing({ what }: { what: string }) {
  return (
    <p className="font-english text-[12px] italic" dir="ltr" style={{ color: 'rgba(13,31,10,0.45)' }}>{what}</p>
  );
}

/** A run of [verse] blocks inside one column. */
function VerseBlocks({
  keys, map, lang, colour,
}: { keys: string[]; map: Record<string, string>; lang: Lang; colour: string }) {
  const present = keys.filter(k => map[k]);
  if (present.length === 0) return null;
  return (
    <>
      {present.map((k, i) => (
        <div key={k} className={i ? 'mt-3 pt-3' : ''}
          style={i ? { borderTop: '1px solid rgba(13,31,10,0.1)' } : undefined}>
          <span className="font-english text-[10px] font-bold" dir="ltr" style={{ color: colour }}>[{k}]</span>
          <div className="mt-1"><Body text={map[k]} lang={lang} /></div>
        </div>
      ))}
    </>
  );
}

function SourceLegend({ jalalaynUrl, usulUrl }: { jalalaynUrl: string; usulUrl: string }) {
  return (
    <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap mb-2">
      <a href={jalalaynUrl} target="_blank" rel="noopener"
        className="font-english text-[10.5px] hover:underline" style={{ color: 'rgba(13,31,10,0.5)' }}>
        Jalālayn — al-Maḥallī &amp; al-Suyūṭī ↗
      </a>
      <a href={usulUrl} target="_blank" rel="noopener"
        className="font-english text-[10.5px] hover:underline" style={{ color: 'rgba(13,31,10,0.5)' }}>
        Rūḥ al-Bayān — al-Burūsawī (d. 1127/1715) ↗
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ComparativeCommentary({
  jalalaynText, jalalaynEnText, ruhText, niasseByVerse, units, verseRange, jalalaynUrl, usulUrl,
}: ComparativeCommentaryProps) {
  const jalAr = parseByVerse(jalalaynText);
  const jalEn = parseByVerse(jalalaynEnText);
  const ruh = parseByVerse(ruhText);

  // A sūra's Jalālayn / Rūḥ al-Bayān file holds the whole sūra, but a lesson
  // covers only part of it — al-Baqara alone is split across lessons 2-6 and
  // beyond. Without this filter lesson 2 ("Q. 2:6-25") would render all 286
  // verses. If verseRange does not parse we show everything, which is the
  // behaviour that existed before.
  const span = parseVerseSpan(verseRange);
  const verses = orderedKeys(jalAr, ruh).filter(
    v => !span || spanIncludes(span, v.surah, v.verse)
  );

  const [unitIdx, setUnitIdx] = useState(0);
  const [activeVerse, setActiveVerse] = useState<string | null>(null);
  const [active, setActive] = useState<Set<SourceId>>(new Set<SourceId>(['niasse', 'jalalayn', 'ruh']));
  const [lang, setLang] = useState<Lang>('ar');
  const stackRef = useRef<HTMLDivElement>(null);

  // Scroll-spy for the verse rail. Registered unconditionally so hook order
  // never depends on which presentation is active.
  useEffect(() => {
    if (units || !stackRef.current || verses.length === 0) return;
    const root = stackRef.current;
    const cards = Array.from(root.querySelectorAll('[data-verse]')) as HTMLElement[];
    if (cards.length === 0) return;
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveVerse((e.target as HTMLElement).dataset.verse || null);
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );
    cards.forEach(c => io.observe(c));
    return () => io.disconnect();
  }, [units, verses.length]);

  // Neither comparandum transcribed for this sūrah yet.
  if (verses.length === 0) {
    return (
      <div dir="ltr">
        <p className="font-english text-sm italic" style={{ color: 'rgba(13,31,10,0.45)' }}>
          {verseRange} — verse-by-verse Arabic for Jalālayn and Rūḥ al-Bayān is being
          transcribed sūrah by sūrah and has not reached this one.
        </p>
        <div className="flex gap-3 mt-3 flex-wrap">
          <a href={jalalaynUrl} target="_blank" rel="noopener"
            className="font-english text-xs px-3 py-1 rounded-full transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(29,78,216,0.35)', color: BLUE }}>
            Jalālayn on Altafsir.com ↗
          </a>
          <a href={usulUrl} target="_blank" rel="noopener"
            className="font-english text-xs px-3 py-1 rounded-full transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(124,45,18,0.35)', color: RUH }}>
            Rūḥ al-Bayān on Usul.ai ↗
          </a>
        </div>
      </div>
    );
  }

  const jal = lang === 'ar' ? jalAr : jalEn;
  const cols = SOURCES.filter(s => active.has(s.id)).length;
  const gridCls =
    cols === 1 ? 'grid grid-cols-1 gap-3'
      : cols === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
        : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3';

  const sum = (keys: string[], map: Record<string, string>) =>
    keys.reduce((n, k) => n + (map[k]?.length || 0), 0);

  /* ---------------- unit pager ---------------- */
  if (units && units.length > 0) {
    const u = units[Math.min(unitIdx, units.length - 1)];
    const unitVerses = u.verses.filter(k => jalAr[k] || ruh[k]);
    const niasseText = lang === 'ar' ? u.ar : u.en;
    const paraNote = lang === 'ar'
      ? (u.arParas.length ? `¶${u.arParas[0]}–${u.arParas[u.arParas.length - 1]}` : undefined)
      : (u.enParas.length ? `¶${u.enParas[0]}–${u.enParas[u.enParas.length - 1]}` : undefined);

    const counts: Record<SourceId, number> = {
      niasse: niasseText?.length || 0,
      jalalayn: sum(unitVerses, jal),
      ruh: lang === 'ar' ? sum(unitVerses, ruh) : 0,
    };

    return (
      <div dir="ltr">
        <SourceLegend jalalaynUrl={jalalaynUrl} usulUrl={usulUrl} />

        <div className="flex gap-1.5 mb-2 flex-wrap">
          {units.map((unit, i) => (
            <button key={unit.label} onClick={() => setUnitIdx(i)}
              className="font-english text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex-1"
              style={{
                minWidth: 120,
                border: '1px solid ' + (i === unitIdx ? GOLD : 'rgba(138,109,31,0.28)'),
                background: i === unitIdx ? GOLD : 'rgba(255,255,255,0.35)',
                color: i === unitIdx ? '#fdfaf0' : 'rgba(13,31,10,0.62)',
                fontWeight: i === unitIdx ? 600 : 400,
              }}>
              {unit.label}
              <span className="block text-[9.5px] opacity-80 mt-0.5">{unit.gloss.split(' · ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-3 py-2 mb-3 rounded-lg"
          style={{ background: 'rgba(138,109,31,0.07)', border: '1px solid rgba(138,109,31,0.25)' }}>
          <button onClick={() => setUnitIdx(i => Math.max(0, i - 1))} disabled={unitIdx === 0}
            className="font-english text-xs px-3 py-1 rounded-lg transition-all"
            style={{ border: '1px solid rgba(138,109,31,0.35)', color: GOLD, background: 'rgba(255,255,255,0.45)', opacity: unitIdx === 0 ? 0.35 : 1 }}>
            ← Previous
          </button>
          <span className="font-english text-[11px] text-center" style={{ color: 'rgba(13,31,10,0.6)' }}>
            Unit <strong style={{ color: '#0D1F0A' }}>{unitIdx + 1}</strong> of <strong style={{ color: '#0D1F0A' }}>{units.length}</strong> · {u.label}
          </span>
          <button onClick={() => setUnitIdx(i => Math.min(units.length - 1, i + 1))} disabled={unitIdx === units.length - 1}
            className="font-english text-xs px-3 py-1 rounded-lg transition-all"
            style={{ border: '1px solid rgba(138,109,31,0.35)', color: GOLD, background: 'rgba(255,255,255,0.45)', opacity: unitIdx === units.length - 1 ? 0.35 : 1 }}>
            Next →
          </button>
        </div>

        <SourceControls active={active} setActive={setActive} lang={lang} setLang={setLang} counts={counts} />

        <div className={gridCls}>
          {active.has('niasse') && (
            <Column source="niasse" lang={lang} chars={counts.niasse} subtitle={paraNote} scroll>
              {niasseText
                ? <Body text={niasseText} lang={lang} />
                : <Missing what={lang === 'en'
                  ? 'No English translation for this passage yet.'
                  : 'لا يوجد نص عربي لهذا المقطع بعد.'} />}
            </Column>
          )}
          {active.has('jalalayn') && (
            <Column source="jalalayn" lang={lang} chars={counts.jalalayn} subtitle={u.label} scroll>
              {counts.jalalayn > 0
                ? <VerseBlocks keys={unitVerses} map={jal} lang={lang} colour={BLUE} />
                : <Missing what={lang === 'en'
                  ? 'No English Jalālayn for these verses yet.'
                  : 'لا يوجد نص عربي لهذه الآيات بعد.'} />}
            </Column>
          )}
          {active.has('ruh') && (
            <Column source="ruh" lang={lang} chars={counts.ruh} subtitle={u.label} scroll>
              {lang === 'en'
                ? <Missing what="Rūḥ al-Bayān has not been translated into English on this site. Read it in Arabic, or follow the Usul.ai link above." />
                : <VerseBlocks keys={unitVerses} map={ruh} lang={lang} colour={RUH} />}
            </Column>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- verse rail ---------------- */
  const railCounts: Record<SourceId, number> = {
    niasse: verses.reduce((n, v) => n + ((lang === 'ar' ? niasseByVerse?.[v.key]?.ar : niasseByVerse?.[v.key]?.en)?.length || 0), 0),
    jalalayn: sum(verses.map(v => v.key), jal),
    ruh: lang === 'ar' ? sum(verses.map(v => v.key), ruh) : 0,
  };

  return (
    <div dir="ltr">
      <SourceLegend jalalaynUrl={jalalaynUrl} usulUrl={usulUrl} />

      <div className="sticky top-0 z-10 flex items-center gap-1.5 flex-wrap py-2 mb-2"
        style={{ background: 'rgba(245,237,214,0.97)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(138,109,31,0.2)' }}>
        <span className="font-english text-[10px] uppercase tracking-wider font-semibold mr-1" style={{ color: 'rgba(13,31,10,0.4)' }}>
          Verse
        </span>
        {verses.map(v => {
          const on = activeVerse === v.key;
          const hasNiasse = !!(niasseByVerse?.[v.key]?.ar || niasseByVerse?.[v.key]?.en);
          return (
            <button key={v.key}
              onClick={() => {
                const el = stackRef.current?.querySelector(`[data-verse="${v.key}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveVerse(v.key);
              }}
              title={`${v.surah}:${v.verse}`}
              className="font-english text-[11px] rounded-full transition-all"
              style={{
                minWidth: 26, height: 26,
                border: '1px solid ' + (on ? GOLD : 'rgba(138,109,31,0.28)'),
                background: on ? GOLD : 'rgba(255,255,255,0.4)',
                color: on ? '#fdfaf0' : 'rgba(13,31,10,0.65)',
                fontWeight: on ? 600 : 400,
              }}>
              {v.verse}{hasNiasse && <span style={{ color: on ? '#fdfaf0' : GOLD }}>·</span>}
            </button>
          );
        })}
      </div>

      <SourceControls active={active} setActive={setActive} lang={lang} setLang={setLang} counts={railCounts} />

      <div ref={stackRef}>
        {verses.map(v => {
          const excerpt = niasseByVerse?.[v.key];
          const nText = lang === 'ar' ? excerpt?.ar : excerpt?.en;
          return (
            <div key={v.key} data-verse={v.key} className="mb-4">
              <p className="font-english text-[10px] uppercase tracking-wider font-semibold mb-1.5"
                style={{ color: 'rgba(13,31,10,0.42)' }}>Q. {v.key}</p>
              <div className={gridCls}>
                {active.has('niasse') && (
                  <Column source="niasse" lang={lang} chars={nText?.length || 0} scroll={false}>
                    {nText
                      ? <Body text={nText} lang={lang} />
                      : <Missing what={lang === 'en'
                        ? 'No English for this verse yet.'
                        : 'لم تُحرَّر مقاطع الشيخ لهذه الآية بعد.'} />}
                  </Column>
                )}
                {active.has('jalalayn') && (
                  <Column source="jalalayn" lang={lang} chars={jal[v.key]?.length || 0} scroll={false}>
                    {jal[v.key]
                      ? <Body text={jal[v.key]} lang={lang} />
                      : <Missing what={lang === 'en' ? 'No English Jalālayn for this verse yet.' : 'لا يوجد نص لهذه الآية.'} />}
                  </Column>
                )}
                {active.has('ruh') && (
                  <Column source="ruh" lang={lang} chars={ruh[v.key]?.length || 0} scroll={false}>
                    {lang === 'en'
                      ? <Missing what="Not translated into English on this site." />
                      : ruh[v.key]
                        ? <Body text={ruh[v.key]} lang={lang} />
                        : <Missing what="لا يوجد نص لهذه الآية." />}
                  </Column>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
