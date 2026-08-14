import type { MetadataRoute } from 'next';

const BASE_URL = 'https://niassetafsir.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/concordance'], // retired stub, kept 404 rather than deleted
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
