import { getLesson, getAllLessons } from '@/lib/lessons';
import { getReadingNotes } from '@/lib/readingNotes';
import { notFound } from 'next/navigation';
import Panel from '@/components/Panel';
import AudioPanel from '@/components/AudioPanel';
import InlineCompare from '@/components/InlineCompare';
import Link from 'next/link';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await getLesson(Number(params.id));
  if (!lesson) notFound();

  const readingNotes = getReadingNotes(Number(params.id));
  const arParagraphs = lesson.arabicText.split('\n').filter((p: string) => p.trim());
  const usulBaseUrl = 'https://usul.ai/t/ruh-bayan';

  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6">
      {/* Work title */}
      <div className="text-center pb-5 mb-5 border-b border-gold/20">
        <div className="font-arabic text-gold font-bold text-xl" dir="rtl">
          فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
        </div>
        <div className="font-english text-white/50 text-sm italic mt-1" dir="ltr">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
        </div>
      </div>

      {/* Lesson heading */}
      <div className="text-center mb-6">
        <div className="font-arabic text-gold font-bold text-2xl" dir="rtl">{lesson.arabicTitle}</div>
        <div className="font-english text-white/60 text-sm mt-1" dir="ltr">
          {lesson.englishTitle} · {lesson.verseRange}
        </div>
      </div>

      {/* 1. Audio */}
      <Panel icon="🎧" titleAr="صوت الشيخ" titleEn="Sheikh's Audio">
        <AudioPanel
          wolofPlaylistId={lesson.wolofPlaylistId}
          arabicPlaylistId={lesson.arabicPlaylistId}
          arabicAudioUrl={lesson.arabicAudioUrl}
          sura={lesson.sura}
        />
      </Panel>

      {/* 2. Reading Notes — scholarly comparative commentary */}
      <Panel icon="🖊️" titleAr="ملاحظات القراءة" titleEn="Reading Notes — Comparative Commentary">
        <div className="p-5" dir="ltr">
          <div className="mb-3 pb-3 border-b border-gold/15">
            <div className="font-english text-white/50 text-xs italic">
              Scholarly notes comparing Niasse to Tafsīr al-Jalālayn and Rūḥ al-Bayān ·
              Amadu Kunateh, Harvard University
            </div>
          </div>
          {readingNotes ? (
            <div
              className="font-english text-white/85 text-sm leading-7 space-y-3"
              dangerouslySetInnerHTML={{ __html: readingNotes }}
            />
          ) : (
            <div className="text-center py-6">
              <p className="font-english text-white/20 italic text-sm">
                Reading notes for this lesson are in preparation.
              </p>
              <p className="font-english text-white/15 text-xs mt-2">
                Notes will include: overview · Niasse&apos;s distinctive position ·
                comparative analysis with Jalālayn and Rūḥ al-Bayān · theological significance
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* 3. Sheikh's Tafsir — bilingual */}
      <Panel icon="📜" titleAr="تفسير الشيخ" titleEn="Sheikh's Tafsīr">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Arabic */}
          <div dir="rtl" className="p-5 font-arabic text-[1.05rem] leading-[2.1] text-text-main text-justify border-b md:border-b-0 md:border-l border-gold/15">
            {arParagraphs.map((p: string, i: number) => (
              <p key={i} className="mb-3">{p}</p>
            ))}
          </div>
          {/* English */}
          <div dir="ltr" className="p-5">
            {lesson.hasEnglish && lesson.englishText ? (
              <div
                className="font-english text-[16px] leading-[1.9] text-white"
                dangerouslySetInnerHTML={{ __html: lesson.englishText }}
              />
            ) : (
              <p className="font-english text-white/20 italic text-sm mt-8 text-center">
                English translation forthcoming.
              </p>
            )}
            <InlineCompare
              jalalaynText={lesson.jalalaynText ? lesson.jalalaynText.substring(0, 800) + (lesson.jalalaynText.length > 800 ? '...' : '') : undefined}
              usulaiUrl={usulBaseUrl}
            />
          </div>
        </div>
      </Panel>

      {/* 4. Jalalayn — full text */}
      <Panel icon="📖" titleAr="تفسير الجلالين" titleEn="Tafsīr al-Jalālayn — Full Text">
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-blue-900/30">
            <div>
              <div className="font-arabic text-blue-300 text-sm" dir="rtl">تفسير الجلالين</div>
              <div className="font-english text-white/40 text-xs italic">
                Jalāl al-Dīn al-Maḥallī & Jalāl al-Dīn al-Suyūṭī · English trans. Feras Hamza (2007)
              </div>
            </div>
          </div>
          {lesson.jalalaynText ? (
            <div className="font-english text-sm text-white/85 leading-7 whitespace-pre-wrap">
              {lesson.jalalaynText}
            </div>
          ) : (
            <p className="font-english text-white/20 italic text-sm">Text forthcoming.</p>
          )}
        </div>
      </Panel>

      {/* 5. Ruh al-Bayan */}
      <Panel icon="📗" titleAr="رُوحُ الْبَيَانِ" titleEn="Rūḥ al-Bayān">
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-900/30">
            <div>
              <div className="font-arabic text-green-300 text-sm" dir="rtl">رُوحُ الْبَيَانِ</div>
              <div className="font-english text-white/40 text-xs italic">
                Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715)
              </div>
            </div>
            <a href={usulBaseUrl} target="_blank" rel="noopener"
              className="font-english text-xs text-green-400/70 border border-green-500/30 px-3 py-1 rounded-full hover:border-green-400/50 transition-all">
              Open on Usul.ai ↗
            </a>
          </div>
          <p className="font-english text-white/25 italic text-sm">
            {lesson.verseRange} — full Arabic text available at Usul.ai.
          </p>
        </div>
      </Panel>

      {/* Bottom navigation */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gold/15" dir="ltr">
        {lesson.prevId ? (
          <Link href={"/lesson/" + lesson.prevId}
            className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
            ← Lesson {lesson.prevId}
          </Link>
        ) : <span />}
        <Link href="/"
          className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
          ↩ Contents
        </Link>
        {lesson.nextId ? (
          <Link href={"/lesson/" + lesson.nextId}
            className="font-english text-sm text-white border border-gold/40 bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-lg transition-all">
            Lesson {lesson.nextId} →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}
