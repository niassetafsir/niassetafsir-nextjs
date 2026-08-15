import { getAllLessons } from '@/lib/lessons';
import { VOLUME_META } from '@/lib/volumes';
import VolumeAccordion, { VolumeAccordionVolume } from '@/components/VolumeAccordion';
import AyahJumpBar from '@/components/AyahJumpBar';
import SurahPickerBar from '@/components/SurahPickerBar';

export default async function HomePage() {
  const allLessons = await getAllLessons();
  const volumes: VolumeAccordionVolume[] = VOLUME_META.map(v => ({
    vol: v.vol,
    roman: v.roman,
    arabicOrdinal: v.arabicOrdinal,
    start: v.start,
    end: v.end,
    rangeLabel: v.rangeLabel,
    lessons: allLessons
      .filter(l => l.id >= v.start && l.id <= v.end)
      .map(l => ({
        id: l.id,
        arabicTitle: l.arabicTitle,
        englishTitle: l.englishTitle,
        sura: l.sura,
        hasEnglish: !!l.hasEnglish,
      })),
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20">

      {/* Header */}
      <div className="text-center py-8 mb-6">
        {/* English title — primary */}
        <div className="mb-2">
          <div className="font-english text-white/90 text-3xl font-semibold italic mb-1">
            Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
          </div>
          <div className="font-english text-white/45 text-sm">
            Shaykh Ibrāhīm Niasse (d. 1975)
          </div>
        </div>
        {/* Arabic subtitle — smaller, contextual */}
        <div className="mb-5">
          <div className="font-arabic text-gold/60 text-lg leading-snug" dir="rtl">
            فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
          </div>
        </div>
        {/* Read/Listen/Research buttons removed -- redundant with the persistent
            bottom nav (Home/Read/Listen/Research), which is visible on every page
            including this one without scrolling. */}
        <AyahJumpBar />
        <SurahPickerBar />
      </div>

      {/* Direct lesson access, grouped by volume (the revised ten-volume
          compiled Arabic edition, Majmaʿ al-Yamāma, Tunis 2010) -- kept as-is,
          the āyah-jump widget above only replaces the old search-link pill. */}
      <VolumeAccordion volumes={volumes} />

    </main>
  );
}
