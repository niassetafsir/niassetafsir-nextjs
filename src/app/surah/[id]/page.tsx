import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/lessons';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getAdjacentSurahIds } from '@/lib/surahLessons';
import lessonRanges from '@/data/lessonRanges.json';

// One sūra, as a short page that points into the lessons. It used to print
// every lesson on the sūra in full on one page -- Sūrat al-Baqara ran to
// 2.4 MB and some 117,000 words -- which is a long read on any screen and a
// heavy download on a phone plan. A reader now opens one lesson at a time.

const RANGES = lessonRanges as unknown as Record<string, { start: [number, number]; end: [number, number] }>;

export async function generateStaticParams() {
  return SURAH_LIST.map(s => ({ id: String(s.id) }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const meta = SURAH_LIST.find(s => s.id === Number(params.id));
  if (!meta) return {};
  return {
    title: `Sūrat ${meta.nameEn} — Fī Riyāḍ al-Tafsīr`,
    description: `The lessons in which Shaykh Ibrāhīm Niasse explains Sūrat ${meta.nameEn} (${meta.nameAr}).`,
  };
}

export default async function SurahPage({ params }: { params: { id: string } }) {
  const surahId = Number(params.id);
  const meta = SURAH_LIST.find(s => s.id === surahId);
  if (!meta) notFound();
  // Every lesson whose range touches this sūra, read from the ranges table, so
  // a lesson that opens in the sūra before (Lesson 1 runs to Q 2:5) is listed.
  const lessonIds = Object.entries(RANGES)
    .filter(([, r]) => r.start[0] <= surahId && r.end[0] >= surahId)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);
  if (lessonIds.length === 0) notFound();

  const rows = (await Promise.all(lessonIds.map(async id => {
    const lesson = await getLesson(id);
    const r = RANGES[String(id)];
    if (!lesson || !r) return null;
    // The part of this sūra the lesson covers.
    const from = r.start[0] < surahId ? 1 : r.start[1];
    const to = r.end[0] > surahId ? meta.ayahCount : r.end[1];
    return { id, title: lesson.englishTitle, from, to };
  }))).filter((r): r is NonNullable<typeof r> => r !== null);

  const { prev, next } = getAdjacentSurahIds(surahId);
  const prevMeta = prev ? SURAH_LIST.find(s => s.id === prev) : null;
  const nextMeta = next ? SURAH_LIST.find(s => s.id === next) : null;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <Link href="/read" className="tap font-english text-xs text-gold/70 hover:text-gold">← Contents</Link>

      <div className="text-center my-6">
        <div className="font-arabic text-gold text-3xl font-bold mb-1" dir="rtl" translate="no">{meta.nameAr}</div>
        <h1 className="font-english text-xl font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
          Sūrat {meta.nameEn}
        </h1>
        <p className="font-english text-[13px] mt-1" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
          {meta.ayahCount} verses · explained in {rows.length === 1 ? 'one lesson' : `${rows.length} lessons`}
        </p>
      </div>

      <ul className="space-y-2.5">
        {rows.map(r => (
          <li key={r.id}>
            <Link href={r.from > 1 ? `/lesson/${r.id}?verse=${surahId}:${r.from}` : `/lesson/${r.id}`}
              className="block rounded-xl border px-4 py-3 hover:border-gold/50 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.22)' }}>
              <span className="font-english text-[15px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                Lesson {r.id}
              </span>
              <span className="font-english text-[13px] ml-2" style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
                Q {surahId}:{r.from === r.to ? r.from : `${r.from}–${r.to}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-10 pt-6 border-t" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        {prevMeta ? (
          <Link href={`/surah/${prevMeta.id}`} className="font-english text-xs text-gold/70 hover:text-gold">← {prevMeta.nameEn}</Link>
        ) : <span />}
        {nextMeta ? (
          <Link href={`/surah/${nextMeta.id}`} className="font-english text-xs text-gold/70 hover:text-gold">{nextMeta.nameEn} →</Link>
        ) : <span />}
      </div>
    </main>
  );
}
