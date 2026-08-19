'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The homepage's single entry point.
 *
 * Replaces two dropdowns -- "Jump to a verse" and "Read a sūrah" -- that did
 * nearly the same thing and made a visitor work out the difference before
 * doing anything. Search is what a reader actually reaches for, and it accepts
 * a verse reference too, so the āya-jump case is not lost.
 *
 * That last part used to be a claim rather than a behaviour. The code sent
 * "2:255" to /search?q=2:255, and /search is a full-text search over the
 * transcription -- so a reader asking for Āyat al-Kursī got a literal string
 * search for "2:255", which finds nothing. Now a well-formed reference goes to
 * /verse/2/255, which is the page that answers the question. A reference whose
 * numbers do not exist (sūra 200, or āya 300 of a sūra with 286) falls through
 * to search rather than routing to a 404 -- better to show a reader nothing
 * than to show them an error.
 *
 * PAYLOAD: takes the āya counts as a plain number[] rather than importing
 * SURAH_LIST, which would drag the whole verse-range module onto the homepage.
 */
export default function HomeSearchBar({ ayahCounts }: { ayahCounts: number[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;

    // A bare verse reference is a navigation, not a search.
    const ref = query.match(/^(?:Q\.?\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
    if (ref) {
      const surah = Number(ref[1]);
      const ayah = Number(ref[2]);
      const max = ayahCounts[surah - 1];
      if (max && ayah >= 1 && ayah <= max) {
        router.push(`/verse/${surah}/${ayah}`);
        return;
      }
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
      <div className="flex-1 flex items-center gap-2 rounded-lg px-4 py-3"
        style={{ background: 'var(--input-bg, rgba(255,255,255,0.06))', border: '1px solid rgba(138,109,31,0.34)' }}>
        <span aria-hidden className="font-english text-sm"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>⌕</span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search the tafsīr"
          placeholder="Search the tafsīr — الرحمن, mercy, Q. 2:255"
          className="flex-1 bg-transparent border-none outline-none font-english text-[15px]"
          style={{ color: 'var(--body-text, rgba(232,232,224,0.90))' }}
        />
      </div>
      <button type="submit"
        className="font-english text-[15px] font-semibold px-6 py-3 rounded-lg whitespace-nowrap transition-opacity hover:opacity-90"
        style={{ background: 'var(--gold, #C9A84C)', color: '#0D1F0A', border: '1px solid var(--gold, #C9A84C)' }}>
        Search
      </button>
    </form>
  );
}
