import Link from 'next/link';

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16" dir="ltr">
      <div className="mb-2">
        <Link href="/get-involved" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← Get Involved
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">Hausa Translation Project</h1>
      <p className="font-english text-white/45 text-base mb-8">Building the Hausa-language edition</p>

      <p className="font-english text-white/75 text-base leading-relaxed mb-8">
        The Hausa-speaking tradition of Niasse's teaching is one of the most significant in West Africa. A Hausa-language edition of this tafsīr is a priority for a future phase of this project.
      </p>

      <div className="border border-gold/15 rounded-xl p-5 mb-8 bg-gold/3">
        <p className="font-english text-gold/70 text-xs uppercase tracking-widest mb-3">What we are looking for</p>
        <ul className="space-y-2">
          <li className="font-english text-white/65 text-sm flex items-start gap-2"><span className="text-gold/50 flex-shrink-0 mt-0.5">·</span>Native or fluent Hausa speaker</li>
          <li className="font-english text-white/65 text-sm flex items-start gap-2"><span className="text-gold/50 flex-shrink-0 mt-0.5">·</span>Knowledge of classical Arabic preferred</li>
          <li className="font-english text-white/65 text-sm flex items-start gap-2"><span className="text-gold/50 flex-shrink-0 mt-0.5">·</span>Familiarity with the Tijānī tradition an asset</li>
          <li className="font-english text-white/65 text-sm flex items-start gap-2"><span className="text-gold/50 flex-shrink-0 mt-0.5">·</span>Commitment to a sustained collaborative project</li>
        </ul>
      </div>

      <a
        href="mailto:niassetafsirproject@gmail.com?subject=Hausa Translation Project — niassetafsir.org"
        className="inline-flex items-center gap-2 font-english text-sm text-bg bg-gold hover:bg-gold-light px-6 py-3 rounded-xl font-semibold transition-all"
      >
        Express Interest →
      </a>

      <p className="font-english text-white/20 text-xs mt-4">
        niassetafsirproject@gmail.com
      </p>
    </main>
  );
}
