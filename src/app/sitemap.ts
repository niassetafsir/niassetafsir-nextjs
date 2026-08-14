import type { MetadataRoute } from 'next';

const BASE_URL = 'https://niassetafsir.org';

// Static, high-value routes. Kept as a plain list rather than auto-crawling
// the app dir so utility/personal pages (bookmarks, clips, get-involved
// subforms) and the retired /concordance stub stay out of the index.
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
  '/introduction',
  '/editorial-note',
  '/translators-note',
  '/footnotes',
  '/hadith',
  '/glossary',
  '/glossary-map',
  '/themes',
  '/scholars',
  '/network',
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
