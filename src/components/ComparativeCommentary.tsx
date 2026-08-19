'use client';
import { useState, useEffect, useRef } from 'react';
import type { CommentaryUnit } from '@/lib/niasseVerseExcerpt';

/**
 * ComparativeCommentary — Niasse, Jalālayn and Rūḥ al-Bayān in one view.
 *
 * Replaces the two separate <Panel> blocks that each rendered
 * JalalaynVerseView with the SAME niasseByVerse prop
 * (src/app/lesson/[id]/page.tsx, formerly lines 189 and 220). That arrangement
 * printed Shaykh Ibrāhīm's excerpt twice on every lesson page -- once beneath
 * each comparandum -- which is the bug this component exists to remove.
 *
 * TWO PRESENTATIONS, chosen by whether a hand-curated partition exists:
 *
 *   units != null  -> UNIT PAGER. Niasse's prose leads each page and appears
 *                     exactly once; the Jalālayn and Rūḥ al-Bayān glosses for
 *                     the verses in that unit stack beneath it. Lesson 1 only
 *                     today (see lesson1FatihaVerseMap.ts).
 *   units == null  -> VERSE RAIL. A sticky chip row over a continuous stack.
 *                     Asserts no segmentation, needs nothing but the [s:v]
 *                     markers already in the text files, and therefore works
 *                     on any lesson whose Arabic has been transcribed.
 *
 * WHY NOT A PER-VERSE PAGER: the per-verse map is many-to-many by design --
 * 1:2, 1:3 and 1:4 all resolve to paragraphs [58, 65, 66, 67] -- so stepping
 * through verses would show the same Niasse text three times running. See the
 * UNITS comment block in lesson1FatihaVerseMap.ts.
 *
 * WHY RŪḤ AL-BAYĀN IS CLAMPED AND JALĀLAYN IS NOT: measured over al-Fātiḥa,
 * Jalālayn runs 1,531 characters and Rūḥ al-Bayān 54,038 -- 35x, and 176x on
 * 1:1 alone (39 chars against 6,875). That is what the two works are: a
 * tafsīr wajīz written for the margin of a muṣḥaf, and a discursive Sufi
 * commentary. Giving them equal room would misrepresent both. Jalālayn shows
 * in full because terseness is its point; Rūḥ al-Bayān clamps to a fixed
 * number of lines with the true character count on the card, so nothing is
 * concealed -- the reader can see the size of what is behind the fold.
 */

interface NiasseVerseExcerpt {
  ar: string | null;
  en: string | null;
}

interface ComparativeCommentaryProps {
  jalalaynText: string | null;
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

const GOLD = '#8a6d1f';
const BLUE = '#1d4ed8';
const RUH = '#7c2d12';

/** Split "[1:1]\ntext\n[1:2]\ntext" into a key -> body map. */
function parseByVerse(text: string | null): Record<string, string> {
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
/* Shared blocks                                                       */
/* ------------------------------------------------------------------ */

function NiasseBlock({
  ar, en, heading, paraNote,
}: { ar: string | null; en: string | null; heading: string; paraNote?: string }) {
  if (!ar && !en) return null;
  return (
    <div className="rounded-xl overflow-hidden mb-3" style={{ border: '2px solid rgba(138,109,31,0.5)', background: 'rgba(138,109,31,0.06)' }}>
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(138,109,31,0.22)' }}>
        <div style={{ width: 3, height: 30, background: GOLD, borderRadius: 2, flexShrink: 0 }} />
        <div className="min-w-0">
          <div className="font-arabic-sans text-base font-bold" dir="rtl" style={{ color: GOLD, lineHeight: 1.4 }}>
            الشيخ إبراهيم نياس
          </div>
          <div className="font-english text-[11px] mt-0.5" style={{ color: 'rgba(138,109,31,0.85)' }}>
            Shaykh Ibrāhīm Niasse · <em>Fī Riyāḍ al-Tafsīr</em> — {heading}
          </div>
        </div>
        {paraNote && (
          <span className="font-english text-[10px] ml-auto flex-shrink-0" style={{ color: 'rgba(138,109,31,0.6)' }}>
            {paraNote}
          </span>
        )}
      </div>

      {ar && en ? (
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="px-4 py-3 font-arabic-sans text-sm leading-8 whitespace-pre-line" dir="rtl"
            style={{ color: '#0D1F0A', borderBottom: '1px solid rgba(138,109,31,0.15)' }}>
            {ar}
          </div>
          <div className="px-4 py-3 font-english text-sm leading-7 whitespace-pre-line" dir="ltr"
            style={{ color: 'rgba(13,31,10,0.8)', borderTop: '1px solid rgba(138,109,31,0.15)' }}>
            {en}
          </div>
        </div>
      ) : ar ? (
        <div className="px-4 py-3 font-arabic-sans text-sm leading-8 whitespace-pre-line" dir="rtl" style={{ color: '#0D1F0A' }}>
          {ar}
          <div className="font-english text-[10px] italic mt-2" dir="ltr" style={{ color: 'rgba(13,31,10,0.4)' }}>
            English translation not yet available for this passage — see the full bilingual Tafsīr panel above.
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 font-english text-sm leading-7 whitespace-pre-line" dir="ltr" style={{ color: 'rgba(13,31,10,0.8)' }}>
          {en}
        </div>
      )}
    </div>
  );
}

function JalalaynCard({ vkey, body }: { vkey: string; body: string }) {
  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: '2px solid rgba(30,58,138,0.3)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(29,78,216,0.08)' }}>
        <span className="font-english text-[11px] font-bold" style={{ color: BLUE }}>[{vkey}]</span>
        <span className="font-arabic-sans text-[10px]" dir="rtl" style={{ color: 'rgba(29,78,216,0.55)' }}>تَفْسِيرُ الْجَلَالَيْنِ</span>
      </div>
      <div className="px-4 py-3 font-arabic-sans text-sm leading-8" dir="rtl"
        style={{ color: 'rgba(13,31,10,0.82)', background: 'rgba(29,78,216,0.06)' }}>
        {body}
      </div>
    </div>
  );
}

/** Rūḥ al-Bayān: clamped by line count, never by pixels -- see file header. */
function RuhCard({ vkey, body }: { vkey: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: '2px solid rgba(124,45,18,0.28)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(124,45,18,0.08)' }}>
        <span className="font-english text-[11px] font-bold" style={{ color: RUH }}>[{vkey}]</span>
        <span className="font-arabic-sans text-[10px]" dir="rtl" style={{ color: 'rgba(124,45,18,0.6)' }}>رُوحُ الْبَيَانِ</span>
        <span className="font-english text-[9.5px] ml-auto" style={{ color: 'rgba(124,45,18,0.55)' }}>
          {body.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} characters
        </span>
      </div>
      <div
        className="px-4 py-3 font-arabic-sans text-sm leading-8"
        dir="rtl"
        style={{
          color: 'rgba(13,31,10,0.82)',
          background: 'rgba(124,45,18,0.05)',
          display: open ? 'block' : '-webkit-box',
          WebkitLineClamp: open ? 'unset' : 6,
          WebkitBoxOrient: 'vertical',
          overflow: open ? 'visible' : 'hidden',
        }}
      >
        {body}
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full font-english text-[11.5px] py-1.5 transition-colors"
        style={{ borderTop: '1px solid rgba(124,45,18,0.18)', background: 'rgba(124,45,18,0.09)', color: RUH }}
      >
        {open ? 'Collapse ▲' : 'Expand — full commentary ▼'}
      </button>
    </div>
  );
}

function SourceLegend({ jalalaynUrl, usulUrl }: { jalalaynUrl: string; usulUrl: string }) {
  return (
    <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap mb-3 pb-3" style={{ borderBottom: '1px solid rgba(13,31,10,0.1)' }}>
      <span className="font-english text-[11px] flex items-center gap-1.5" style={{ color: 'rgba(13,31,10,0.55)' }}>
        <i style={{ width: 9, height: 9, borderRadius: 2, background: GOLD, display: 'inline-block' }} />
        Niasse
      </span>
      <a href={jalalaynUrl} target="_blank" rel="noopener"
        className="font-english text-[11px] flex items-center gap-1.5 hover:underline" style={{ color: 'rgba(13,31,10,0.55)' }}>
        <i style={{ width: 9, height: 9, borderRadius: 2, background: BLUE, display: 'inline-block' }} />
        Jalālayn — al-Maḥallī &amp; al-Suyūṭī ↗
      </a>
      <a href={usulUrl} target="_blank" rel="noopener"
        className="font-english text-[11px] flex items-center gap-1.5 hover:underline" style={{ color: 'rgba(13,31,10,0.55)' }}>
        <i style={{ width: 9, height: 9, borderRadius: 2, background: RUH, display: 'inline-block' }} />
        Rūḥ al-Bayān — al-Burūsawī (d. 1127/1715) ↗
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ComparativeCommentary({
  jalalaynText, ruhText, niasseByVerse, units, verseRange, jalalaynUrl, usulUrl,
}: ComparativeCommentaryProps) {
  const jal = parseByVerse(jalalaynText);
  const ruh = parseByVerse(ruhText);
  const verses = orderedKeys(jal, ruh);

  const [unitIdx, setUnitIdx] = useState(0);
  const [activeVerse, setActiveVerse] = useState<string | null>(null);
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

  /* ---------------- E: unit pager ---------------- */
  if (units && units.length > 0) {
    const u = units[Math.min(unitIdx, units.length - 1)];
    const enRange = u.enParas.length ? `EN ¶${u.enParas[0]}–${u.enParas[u.enParas.length - 1]}` : 'EN —';
    const arRange = u.arParas.length ? `AR ¶${u.arParas[0]}–${u.arParas[u.arParas.length - 1]}` : '';
    const unitVerses = u.verses.filter(k => jal[k] || ruh[k]);

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

        <NiasseBlock ar={u.ar} en={u.en} heading={u.label} paraNote={`${arRange} · ${enRange}`} />

        {unitVerses.some(k => jal[k]) && (
          <p className="font-english text-[10px] uppercase tracking-wider font-semibold mt-4 mb-1.5" style={{ color: 'rgba(29,78,216,0.7)' }}>
            Tafsīr al-Jalālayn — verse by verse
          </p>
        )}
        {unitVerses.map(k => jal[k] ? <JalalaynCard key={'j' + k} vkey={k} body={jal[k]} /> : null)}

        {unitVerses.some(k => ruh[k]) && (
          <p className="font-english text-[10px] uppercase tracking-wider font-semibold mt-4 mb-1.5" style={{ color: 'rgba(124,45,18,0.75)' }}>
            Rūḥ al-Bayān — verse by verse
          </p>
        )}
        {unitVerses.map(k => ruh[k] ? <RuhCard key={'r' + k} vkey={k} body={ruh[k]} /> : null)}
      </div>
    );
  }

  /* ---------------- B: verse rail ---------------- */
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

      <div ref={stackRef}>
        {verses.map(v => {
          const excerpt = niasseByVerse?.[v.key];
          return (
            <div key={v.key} data-verse={v.key} className="mb-5">
              {excerpt && (excerpt.ar || excerpt.en) && (
                <NiasseBlock ar={excerpt.ar} en={excerpt.en} heading={`Q. ${v.key}`} />
              )}
              {jal[v.key] && <JalalaynCard vkey={v.key} body={jal[v.key]} />}
              {ruh[v.key] && <RuhCard vkey={v.key} body={ruh[v.key]} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
