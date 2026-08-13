import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VOLUME_META, getVolumesWithLessons, truncateSummary } from '@/lib/volumes';

export async function generateStaticParams() {
  return VOLUME_META.map(v => ({ id: String(v.vol) }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const vol = Number(params.id);
  const meta = VOLUME_META.find(v => v.vol === vol);
  if (!meta) return {};
  return {
    title: `Volume ${meta.roman} · Lessons ${meta.start}–${meta.end}`,
    description: `Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, Volume ${meta.roman} of the revised ten-volume Arabic edition (${meta.rangeLabel}) · Lessons ${meta.start}–${meta.end}.`,
  };
}

// Header accent colours cycle the same way the old manzil pages did,
// just extended to ten volumes instead of seven.
const ACCENTS = ['#6B2424', '#1E5A4A', '#1A3A5C', '#6B2424', '#1E5A4A', '#1A3A5C', '#6B2424', '#1E5A4A', '#1A3A5C', '#6B2424'];

export default async function VolumePage({ params }: { params: { id: string } }) {
  const vol = Number(params.id);
  const volumes = await getVolumesWithLessons();
  const volume = volumes.find(v => v.vol === vol);
  if (!volume) notFound();

  const accent = ACCENTS[(volume.vol - 1) % ACCENTS.length];
  const prev = volumes.find(v => v.vol === volume.vol - 1);
  const next = volumes.find(v => v.vol === volume.vol + 1);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      {/* Header */}
      <div className="mb-6">
        <Link href="/read" className="font-english text-xs flex items-center gap-1 mb-4"
          style={{color:'rgba(107,36,36,0.6)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Reading
        </Link>
        <div className="font-arabic text-2xl font-bold mb-1" dir="rtl" style={{color:accent}}>{volume.arabicOrdinal}</div>
        <h1 className="font-english font-bold text-xl mb-0.5" style={{color:accent}}>
          Volume {volume.roman} <span className="font-normal opacity-60">· Lessons {volume.start}–{volume.end}</span>
        </h1>
        <p className="font-english text-sm" style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
          {volume.rangeLabel}
        </p>
        <p className="font-english text-[10px] mt-1 uppercase tracking-wide" style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          Revised 10-vol. compiled Arabic edition (Majmaʿ al-Yamāma, Tunis 2010)
        </p>
      </div>

      {/* Grid — 3 col desktop, 1 col mobile compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {volume.lessons.map((lesson) => {
          const suraLabel = (lesson.sura || '').split('/')[0].trim();
          const summary = truncateSummary(lesson.lessonSummary);
          return (
            <Link key={lesson.id} href={`/lesson/${lesson.id}?panel=tafsir`}
              className="block px-4 py-3 rounded-xl border transition-all group"
              style={{
                borderColor: `${accent}35`,
                background: `${accent}08`,
              }}>

              {/* Mobile: compact single line */}
              <div className="flex md:hidden items-center justify-between gap-2">
                <span className="font-english text-sm font-bold group-hover:opacity-80" style={{color:accent}}>
                  {suraLabel}
                </span>
                <span className="font-english text-[10px] shrink-0"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                  {lesson.verseRange}
                </span>
              </div>

              {/* Desktop: full card with live summary */}
              <div className="hidden md:block">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-english text-sm font-bold group-hover:opacity-80 leading-tight" style={{color:accent}}>
                    {suraLabel}
                  </span>
                  <span className="font-english text-[9px] shrink-0 mt-0.5"
                    style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
                    (L{lesson.id})
                  </span>
                </div>
                <p className="font-english text-[10px] mb-1.5"
                  style={{color:'var(--body-faint, rgba(255,255,255,0.4))'}}>
                  {lesson.verseRange}
                </p>
                {summary && (
                  <p className="font-english text-xs italic leading-4"
                    style={{color:'var(--body-sub, rgba(255,255,255,0.55))'}}>
                    {summary}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Prev / next volume */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gold/15">
        {prev ? (
          <Link href={`/volume/${prev.vol}`}
            className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
            ← Volume {prev.roman}
          </Link>
        ) : <span />}
        <Link href="/"
          className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
          ↩ Contents
        </Link>
        {next ? (
          <Link href={`/volume/${next.vol}`}
            className="font-english text-sm font-semibold text-gold-deep border border-gold-deep/40 bg-gold/15 hover:bg-gold/25 px-4 py-2 rounded-lg transition-all">
            Volume {next.roman} →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}
