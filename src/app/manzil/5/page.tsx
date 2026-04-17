import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12" dir="ltr">
      <div className="mb-4">
        <Link href="/" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← Contents
        </Link>
      </div>
      <div className="text-center py-6 mb-8 border-b border-gold/20">
        <h1 className="font-arabic text-gold text-3xl font-bold mb-1" dir="rtl">المنزل الخامس</h1>
        <p className="font-english text-white/55 text-base mt-1">Fifth Manzil · Day Five</p>
        <p className="font-english text-white/30 text-sm mt-1">Al-Shuʿarāʾ → Yā Sīn (Suras 26–36)</p>
      </div>
      <div className="text-center py-12"><p className="font-english text-white/30 italic">Coming soon — further volumes in preparation.</p></div>
    </main>
  );
}
