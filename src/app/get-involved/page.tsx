import Link from 'next/link';

const ITEMS = [
  { title: 'Feedback', href: '/get-involved/feedback', desc: 'Share your experience with this edition.' },
  { title: 'Suggestions', href: '/get-involved/suggestions', desc: 'Ideas for the project.' },
  { title: 'Report an Error', href: '/get-involved/report-error', desc: 'Flag a textual or technical issue.' },
  { title: 'Join the Team', href: '/get-involved/join', desc: 'Wolof transcription and Hausa translation.' },
];

export default function Page() {
  return (
    <main className="max-w-xl mx-auto px-6 py-16" dir="ltr">
      <h1 className="font-english text-white text-3xl font-semibold mb-2">Get Involved</h1>
      <p className="font-english text-white/45 text-base mb-10">
        This edition is a developing scholarly resource. Your participation is welcome.
      </p>
      <div className="space-y-3">
        {ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center justify-between border border-gold/15 rounded-xl px-5 py-4 hover:border-gold/35 hover:bg-gold/5 transition-all group">
            <div>
              <div className="font-english text-white/85 text-base font-medium group-hover:text-white">{item.title}</div>
              <div className="font-english text-white/35 text-sm mt-0.5">{item.desc}</div>
            </div>
            <span className="text-gold/30 group-hover:text-gold/70 transition-colors text-lg">→</span>
          </Link>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/" className="font-english text-xs text-white/35 hover:text-gold/60 border border-white/10 hover:border-gold/30 px-4 py-2 rounded-lg transition-all">
          ← Return to Contents
        </Link>
      </div>
    </main>
  );
}
