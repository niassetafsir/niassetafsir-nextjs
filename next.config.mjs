/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Manzil pages (the old 7-part devotional/recitation-cycle browsing
    // scheme) were retired in favour of volume pages that mirror the
    // printed Arabic edition's own 10-volume structure -- the way
    // researchers actually look for content (Q. sura:verse or Volume +
    // Lesson), not the weekly recitation division. Each old manzil URL
    // redirects to the new volume page covering its first lesson, since
    // manzil and volume boundaries don't align 1:1.
    return [
      { source: '/manzil/1', destination: '/volume/1', permanent: true },
      { source: '/manzil/2', destination: '/volume/3', permanent: true },
      { source: '/manzil/3', destination: '/volume/4', permanent: true },
      { source: '/manzil/4', destination: '/volume/6', permanent: true },
      { source: '/manzil/5', destination: '/volume/7', permanent: true },
      { source: '/manzil/6', destination: '/volume/8', permanent: true },
      { source: '/manzil/7', destination: '/volume/10', permanent: true },
      { source: '/manzil/:path*', destination: '/', permanent: true },
      { source: '/manzil', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
