'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';

interface SearchEntry {
  id: string;
  lessonId: number;
  lessonTitle: string;
  lessonTitleAr: string;
  verseRange: string;
  text: string;
  language: string;
  type: string;
}

interface SearchResult {
  item: SearchEntry;
  score?: number;
}

function stripDiacritics(text: string) {
  return text.replace(/[\u064B-\u065F\u0670\u0610-\u061A]/g, '');
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const q = stripDiacritics(query.toLowerCase());
  const t = stripDiacritics(text);
  const idx = t.toLowerCase().indexOf(q);
  if (idx < 0) return text;
  return (
    text.substring(0, idx) +
    '<mark class="bg-gold/30 text-inherit rounded px-0.5">' +
    text.substring(idx, idx + query.length) +
    '</mark>' +
    text.substring(idx + query.length)
  );
}

type IndexedEntry = SearchEntry & { textNorm: string };

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fuse, setFuse] = useState<Fuse<IndexedEntry> | null>(null);
  const [entries, setEntries] = useState<IndexedEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'arabic' | 'english' | 'jalalayn'>('all');

  // Load index
  useEffect(() => {
    fetch('/data/search-main.json')
      .then(r => r.json())
      .then(data => {
        const normalizedEntries: IndexedEntry[] = data.entries
          .filter((e: SearchEntry) => typeof e.text === 'string' && e.text.length > 0)
          .map((e: SearchEntry) => ({
            ...e,
            textNorm: stripDiacritics(e.text)
          }));
        setEntries(normalizedEntries);
        // Fuzzy index is a fallback only, for typo tolerance -- kept tight
        // (low threshold, location-aware) so it doesn't drown out real
        // matches with noise the way a loose 0.3/ignoreLocation config did.
        const f = new Fuse<IndexedEntry>(normalizedEntries, {
          keys: ['textNorm'],
          threshold: 0.2,
          ignoreLocation: false,
          includeScore: true,
        });
        setFuse(f);
      });
  }, []);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const qNorm = stripDiacritics(q.trim()).toLowerCase();

    // Literal substring match first -- this is what "search for this word
    // or phrase" actually means, and guarantees real hits (e.g. "mercy",
    // which has 118 genuine occurrences) surface instead of being buried
    // under unrelated fuzzy noise.
    const exact = entries.filter(e => e.textNorm.toLowerCase().includes(qNorm));

    if (exact.length > 0) {
      setResults(exact.slice(0, 50).map(item => ({ item })));
    } else if (fuse) {
      // Fall back to fuzzy only when there's no literal match, so typos
      // and near-misses still return something -- but enforce a real
      // score cutoff (lower = better in Fuse). Without this, Fuse always
      // returns *something* up to the limit even for gibberish queries,
      // because long paragraph fields give it enough surface area to find
      // weak partial overlaps. A query with no genuine textual match
      // should show "no results", not 50 unrelated passages.
      const fuzzy = fuse.search(qNorm, { limit: 50 }).filter(r => (r.score ?? 1) < 0.12);
      setResults(fuzzy);
    } else {
      setResults([]);
    }
    setLoading(false);
  }, [fuse, entries]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const filteredResults = results.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'arabic') return r.item.language === 'ar';
    if (filter === 'english') return r.item.type === 'niasse-en';
    if (filter === 'jalalayn') return r.item.type === 'jalalayn';
    return true;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-8">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1 text-center" dir="rtl">
          البحث في التفسير
        </h1>
        <p className="font-english text-white/50 text-sm text-center mb-6">
          Search across Niasse&apos;s tafsīr text and Tafsīr al-Jalālayn
        </p>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search in Arabic or English... (e.g. الرحمن, mercy, Q.2:255)"
            className="w-full bg-white/5 border border-gold/25 rounded-xl px-4 py-3 font-english text-white placeholder-white/30 focus:outline-none focus:border-gold/60 text-base search-input"
            autoFocus
            dir="auto"
          />
          {loading && (
            <div className="absolute right-4 top-3.5 text-gold/50 text-sm">searching...</div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {(['all', 'arabic', 'english', 'jalalayn'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-english text-xs px-3 py-1 rounded-full border transition-all ${
                filter === f
                  ? 'bg-gold text-bg border-gold font-semibold'
                  : 'border-gold/20 text-white/45 hover:border-gold/40'
              }`}
            >
              {f === 'all' ? 'All' : f === 'arabic' ? 'Arabic Text' : f === 'english' ? 'English Translation' : 'Jalālayn'}
            </button>
          ))}
          {results.length > 0 && (
            <span className="font-english text-xs text-white/30 self-center ml-2">
              {filteredResults.length} results
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {query && filteredResults.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="font-english text-white/30 italic">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredResults.map(({ item }) => (
          <Link
            key={item.id}
            href={`/lesson/${item.lessonId}`}
            className="block border border-gold/15 rounded-xl p-4 hover:border-gold/35 hover:bg-gold/5 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="font-arabic text-gold text-sm font-bold" dir="rtl">
                  {item.lessonTitleAr}
                </span>
                <span className="font-english text-white/40 text-xs mx-2">·</span>
                <span className="font-english text-white/60 text-xs italic">{item.lessonTitle}</span>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <span className={`font-english text-xs px-2 py-0.5 rounded-full border ${
                  item.type === 'jalalayn'
                    ? 'text-blue-300/70 border-blue-500/25'
                    : item.language === 'ar'
                    ? 'text-gold/60 border-gold/20'
                    : 'text-white/40 border-white/15'
                }`}>
                  {item.type === 'jalalayn' ? 'Jalālayn' : item.language === 'ar' ? 'عربي' : 'EN'}
                </span>
              </div>
            </div>
            <p
              className={`text-sm leading-6 line-clamp-3 ${
                item.language === 'ar' ? 'font-arabic text-text-main text-right' : 'font-english text-white/75'
              }`}
              dir={item.language === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: highlight(item.text, query) }}
            />
            <div className="mt-2 font-english text-xs text-white/25 group-hover:text-gold/50 transition-colors">
              {item.verseRange} →
            </div>
          </Link>
        ))}
      </div>

      {!query && (
        <div className="text-center py-12 space-y-3">
          <p className="font-english text-white/25 text-sm">
            Search across 56 lessons · 2,176 indexed passages
          </p>
          <p className="font-english text-white/20 text-xs">
            Try: الرحمن · mercy · Q.1:2 · ayat al-kursi · استعاذة
          </p>
        </div>
      )}
    </main>
  );
}
