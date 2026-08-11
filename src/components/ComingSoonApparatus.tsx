import Link from 'next/link';

export default function ComingSoonApparatus({ titleEn, titleAr }: { titleEn: string; titleAr: string }) {
  return (
    <main className="max-w-lg mx-auto px-4 pt-24 pb-20 text-center" dir="ltr">
      <p className="font-arabic text-lg mb-2" dir="rtl" style={{ color: 'rgba(201,168,76,0.55)' }}>
        {titleAr}
      </p>
      <h1
        className="font-english font-semibold text-lg mb-4"
        style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}
      >
        {titleEn}
      </h1>
      <p
        className="font-english text-sm leading-6 mb-6"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}
      >
        This research tool is being prepared alongside a forthcoming article in <em>Islamic Africa</em> (Brill)
        and will return once that work is public.
      </p>
      <Link
        href="/about"
        className="font-english text-xs hover:text-gold transition-colors"
        style={{ color: 'rgba(201,168,76,0.7)' }}
      >
        ← About the project
      </Link>
    </main>
  );
}
