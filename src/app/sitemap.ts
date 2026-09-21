import type { MetadataRoute } from 'next';
import { indexedVerses } from '@/lib/corpus';

const BASE_URL = 'https://niassetafsir.org';

// Static, high-value routes. Kept as a plain list rather than auto-crawling
// the app dir so utility and personal pages (bookmarks, clips, the
// get-involved subforms) stay out of the index.
//
// /themes, /scholars and /network were listed here while each was a six-line
// ComingSoonApparatus, so Google was being sent to three empty pages; the
// routes are gone. /concordance was listed too and had been a notFound() since
// it was retired. /introduction is a redirect to /translators-note, which is
// already indexed below -- an indexed redirect just splits the signal. For the
// same reason /about/shaykh, /about/translator, /about/arabic-edition,
// /about/companion-texts, /editorial-note and /glossary-map are absent: each is
// now a redirect into /about, /about/tafsir, /translators-note or /glossary.
const STATIC_ROUTES = [
  '',
  '/read',
  '/audio',
  '/research',
  '/about',
  '/about/tafsir',
  '/translators-note',
  '/footnotes',
  '/hadith',
  '/glossary',
  '/search',
  '/notes',
  '/get-involved',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }));

  const lessonEntries: MetadataRoute.Sitemap = Array.from({ length: 56 }, (_, i) => ({
    url: `${BASE_URL}/lesson/${i + 1}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const volumeEntries: MetadataRoute.Sitemap = Array.from({ length: 10 }, (_, i) => ({
    url: `${BASE_URL}/volume/${i + 1}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Every āya the corpus actually locates: 3,509 of the 6,236, being the ones
  // with a Fī Riyāḍ paragraph or a locus in one of the other works. The rest
  // resolve to a session-coverage card and nothing more, so they are left out
  // until there is something on them to read. /verse/[surah]/[ayah] is where a
  // reader who searched for a verse arrives, and nothing offered these URLs
  // before this list did.
  const verseEntries: MetadataRoute.Sitemap = indexedVerses()
    .map(key => key.split(':').map(Number) as [number, number])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(([surah, ayah]) => ({
      url: `${BASE_URL}/verse/${surah}/${ayah}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticEntries, ...lessonEntries, ...volumeEntries, ...verseEntries];
}
