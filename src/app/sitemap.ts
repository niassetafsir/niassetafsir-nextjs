import type { MetadataRoute } from 'next';

const BASE_URL = 'https://niassetafsir.org';

// Static, high-value routes. Kept as a plain list rather than auto-crawling
// the app dir so utility and personal pages (bookmarks, clips, the
// get-involved subforms) stay out of the index.
//
// /themes, /scholars and /network were listed here while each was a six-line
// ComingSoonApparatus, so Google was being sent to three empty pages; the
// routes are gone. /concordance was listed too and had been a notFound() since
// it was retired. /introduction is a redirect to /translators-note, which is
// already indexed below -- an indexed redirect just splits the signal.
const STATIC_ROUTES = [
  '',
  '/read',
  '/audio',
  '/research',
  '/about',
  '/about/shaykh',
  '/about/translator',
  '/about/arabic-edition',
  '/about/companion-texts',
  '/editorial-note',
  '/translators-note',
  '/footnotes',
  '/hadith',
  '/glossary',
  '/glossary-map',
  '/search',
  '/notes',
  '/get-involved',
  '/order',
  '/preorder',
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

  return [...staticEntries, ...lessonEntries, ...volumeEntries];
}
