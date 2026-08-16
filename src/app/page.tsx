import Link from 'next/link';
import AyahJumpBar from '@/components/AyahJumpBar';
import SurahPickerBar from '@/components/SurahPickerBar';

export default async function HomePage() {
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

      {/* Full table of contents lives at /read (volume -> lesson tree,
          searchable, plus jump-by-sūrah) -- kept as one link here rather
          than duplicating that tree on the homepage too. */}
      <Link
        href="/read"
        className="flex items-center justify-center gap-2 border rounded-xl px-4 py-3 font-english text-sm transition-colors hover:bg-gold/5"
        style={{ borderColor: 'rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.9)' }}
      >
        Browse the full table of contents →
      </Link>

    </main>
  );
}
