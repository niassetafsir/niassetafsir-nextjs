'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The homepage's single entry point.
 *
 * Replaces two dropdowns -- "Jump to a verse" and "Read a sūrah" -- that did
 * nearly the same thing and made a visitor work out the difference before
 * doing anything. Search is what a reader actually reaches for, it already
 * covers the whole indexed corpus, and it accepts a verse reference too, so
 * the āya-jump case is not lost: typing "2:255" or "Q. 2:255" goes straight
 * to the lesson covering that verse. The sūra picker now lives on /read,
 * where browsing belongs.
 */
export default function HomeSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;

    // A bare verse reference is a navigation, not a search.
    const ref = query.match(/^(?:Q\.?\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
    if (ref) {
      router.push(`/search?q=${encodeURIComponent(ref[1] + ':' + ref[2])}`);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
      <div className="flex-1 flex items-center gap-2 rounded-lg px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(138,109,31,0.34)' }}>
        <span aria-hidden className="font-english text-sm"
          style={{ color: 'var(--body-faint, rgba(13,31,10,0.45))' }}>⌕</span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search the tafsīr"
          placeholder="Search the tafsīr — الرحمن, mercy, Q. 2:255"
          className="flex-1 bg-transparent border-none outline-none font-english text-[15px]"
          style={{ color: 'var(--body-text, rgba(13,31,10,0.88))' }}
        />
      </div>
      <button type="submit"
        className="font-english text-[15px] font-semibold px-6 py-3 rounded-lg whitespace-nowrap transition-opacity hover:opacity-90"
        style={{ background: '#8a6d1f', color: '#fdfaf0', border: '1px solid #8a6d1f' }}>
        Search
      </button>
    </form>
  );
}
