import VersePicker from '@/components/VersePicker';
import { SURAH_LIST } from '@/lib/verseRanges';

export const metadata = {
  title: 'Find a Verse',
  description: 'Choose a sūra and an āya to see what Shaykh Ibrāhīm Niasse says about it, wherever he says it.',
};

// Every āya has a page at /verse/[surah]/[ayah]. This page only gets the
// reader there: choose a sūra, then an āya.
export default function VerseIndexPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-arabic text-gold text-lg mb-0.5" dir="rtl">فهرس الآيات القرآنية</p>
      <h1 className="font-english font-semibold text-base mb-1"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
        Find a Verse
      </h1>
      <p className="font-english text-[13px] leading-relaxed mb-5"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Choose a sūra and verse to find Shaykh Ibrāhīm&rsquo;s explanations wherever they appear in the
        collection, in <em>Fī Riyāḍ al-Tafsīr</em>, in his other writings and in the commentaries of his
        students. A verse with no passage here may still be discussed in works not yet included; the
        absence of an entry is not evidence that he never explained it.
      </p>
      <VersePicker
        surahs={SURAH_LIST.map(s => ({ id: s.id, name: s.nameEn, ayahCount: s.ayahCount }))}
      />
    </main>
  );
}
