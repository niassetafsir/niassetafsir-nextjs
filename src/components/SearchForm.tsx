'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The one search box: the homepage's and the results page's.
 *
 * A well-formed verse reference goes straight to the verse page, which is the
 * answer to it; anything else goes to /search, which lists verses, topics,
 * terms and passages. A reference whose numbers do not exist (sūra 200, or āya
 * 300 of al-Baqara) falls through to search rather than to a 404.
 *
 * Takes the āya counts as a number[] rather than importing SURAH_LIST, which
 * would put the whole verse-range module on the homepage.
 */
export default function SearchForm({
  ayahCounts,
  initial = '',
  autoFocus = false,
}: {
  ayahCounts: number[];
  initial?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    const ref = query.match(/^(?:Q\.?\s*)?(\d{1,3})\s*[:.\/]\s*(\d{1,3})(?:\s*[-–—]\s*\d{1,3})?$/i);
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
    <form onSubmit={submit} role="search" className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto">
      <div className="flex-1 flex items-center gap-2 rounded-lg px-4"
        style={{ background: 'var(--input-bg, rgba(255,255,255,0.06))', border: '1px solid rgba(138,109,31,0.34)' }}>
        <span aria-hidden className="font-english text-sm"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>⌕</span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search for a verse, a topic, or ask a question"
          placeholder="A verse (2:255), a topic, or a question"
          type="text"
          dir="auto"
          inputMode="text"
          enterKeyHint="search"
          autoCapitalize="off"
          autoCorrect="off"
          autoFocus={autoFocus}
          /* 16px: below that, iOS Safari zooms the page on focus. */
          className="site-search-input flex-1 self-stretch min-h-[52px] bg-transparent border-none outline-none font-english text-base"
          style={{ color: 'var(--body-text, rgba(232,232,224,0.90))' }}
        />
      </div>
      <button type="submit"
        className="bg-gold font-english text-base font-semibold px-6 py-3.5 sm:py-3 rounded-lg whitespace-nowrap transition-opacity hover:opacity-90"
        style={{ background: 'var(--gold, #C9A84C)', color: '#0D1F0A', border: '1px solid var(--gold, #C9A84C)' }}>
        Search
      </button>
    </form>
  );
}
