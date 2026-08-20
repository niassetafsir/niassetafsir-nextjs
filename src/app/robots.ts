import type { MetadataRoute } from 'next';

const BASE_URL = 'https://niassetafsir.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /concordance was indexed while it existed as a "coming soon" stub, and
      // Google keeps requesting a URL for a long time after it starts 404ing.
      // The route and its notFound() are both deleted now; this line keeps the
      // crawl budget off a dead path and can come out once the URL has aged out
      // of Search Console.
      disallow: ['/concordance'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
