import { getAllLessons } from '@/lib/lessons';
import { VOLUME_META } from '@/lib/volumes';
import VolumeAccordion, { VolumeAccordionVolume } from '@/components/VolumeAccordion';

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
        <div className="mt-2 max-w-xl mx-auto" dir="ltr">
          <a href="/search" className="flex items-center gap-3 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-gold/25 rounded-full px-4 py-2 transition-all group">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/25 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="font-english text-sm text-white/25 group-hover:text-white/45 transition-colors flex-1 text-left">
              Search Arabic or English...
            </span>
          </a>
        </div>
      </div>

      {/* Direct lesson access, grouped by volume (the revised ten-volume
          compiled Arabic edition, Majmaʿ al-Yamāma, Tunis 2010) */}
      <VolumeAccordion volumes={volumes} />

    </main>
  );
}
