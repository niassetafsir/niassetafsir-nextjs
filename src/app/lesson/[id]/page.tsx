import { getLesson, getAllLessons } from '@/lib/lessons';
import { notFound } from 'next/navigation';
import Panel from '@/components/Panel';
import BilingualText from '@/components/BilingualText';
import AudioPanel from '@/components/AudioPanel';
import Link from 'next/link';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map(l => ({ id: String(l.id) }));
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await getLesson(Number(params.id));
  if (!lesson) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6">
      <div className="text-center pb-5 mb-5 border-b border-gold/20">
        <div className="font-arabic text-gold font-bold text-xl" dir="rtl">فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ</div>
        <div className="font-english text-white/50 text-sm italic mt-1" dir="ltr">Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</div>
      </div>

      <div className="text-center mb-6">
        <div className="font-arabic text-gold font-bold text-2xl" dir="rtl">{lesson.arabicTitle}</div>
        <div className="font-english text-white/60 text-sm mt-1" dir="ltr">{lesson.englishTitle} · {lesson.verseRange}</div>
      </div>

      <Panel icon="🎧" titleAr="صوت الشيخ" titleEn="Sheikh's Audio">
        <AudioPanel wolofPlaylistId={lesson.wolofPlaylistId} arabicPlaylistId={lesson.arabicPlaylistId} arabicAudioUrl={lesson.arabicAudioUrl} sura={lesson.sura} />
      </Panel>

      <Panel icon="📜" titleAr="تفسير الشيخ" titleEn="Sheikh's Tafsīr">
        <BilingualText arabicText={lesson.arabicText} englishText={lesson.englishText} hasEnglish={lesson.hasEnglish} />
      </Panel>

      <Panel icon="📖" titleAr="تفسير الجلالين" titleEn="Tafsīr al-Jalālayn">
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-blue-900/30">
            <div>
              <div className="font-arabic text-blue-300 text-sm" dir="rtl">تفسير الجلالين</div>
              <div className="font-english text-white/40 text-xs italic">English trans. Feras Hamza (Royal Aal al-Bayt Institute, 2007)</div>
            </div>
          </div>
          {lesson.jalalaynText ? (
            <div className="font-english text-sm text-white/85 leading-7 whitespace-pre-wrap">{lesson.jalalaynText}</div>
          ) : (
            <p className="font-english text-white/20 italic text-sm">Text forthcoming.</p>
          )}
        </div>
      </Panel>

      <Panel icon="📗" titleAr="رُوحُ الْبَيَانِ" titleEn="Rūḥ al-Bayān">
        <div className="p-5" dir="ltr">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-900/30">
            <div>
              <div className="font-arabic text-green-300 text-sm" dir="rtl">رُوحُ الْبَيَانِ</div>
              <div className="font-english text-white/40 text-xs italic">Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715)</div>
            </div>
            <a href="https://usul.ai/t/ruh-bayan" target="_blank" rel="noopener" className="font-english text-xs text-green-400/70 border border-green-500/30 px-3 py-1 rounded-full hover:border-green-400/50 transition-all">Open on Usul.ai ↗</a>
          </div>
          <p className="font-english text-white/25 italic text-sm">{lesson.verseRange} — full Arabic text available at Usul.ai.</p>
        </div>
      </Panel>

      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gold/15" dir="ltr">
        {lesson.prevId ? (
          <Link href={"/lesson/" + lesson.prevId} className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">← Lesson {lesson.prevId}</Link>
        ) : <span />}
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">↩ Contents</Link>
        {lesson.nextId ? (
          <Link href={"/lesson/" + lesson.nextId} className="font-english text-sm text-white border border-gold/40 bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-lg transition-all">Lesson {lesson.nextId} →</Link>
        ) : <span />}
      </div>
    </main>
  );
}
