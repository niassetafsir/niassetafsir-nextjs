/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // "Beyond Fī Riyāḍ al-Tafsīr" moved from /works to /beyond, and a
      // student's commentary from /works/[id] to /students/[id] (Nov 2026).
      { source: '/works', destination: '/beyond', permanent: true },
      { source: '/works/qanabil-yadawiyya', destination: '/students/qanabil-yadawiyya', permanent: true },
      { source: '/works/:id', destination: '/beyond/:id', permanent: true },
      // Manzil pages (the old 7-part devotional/recitation-cycle browsing
      // scheme) were retired in favour of volume pages that mirror the
      // printed Arabic edition's own 10-volume structure -- the way
      // researchers actually look for content (Q. sura:verse or Volume +
      // Lesson), not the weekly recitation division. Each old manzil URL
      // redirects to the new volume page covering its first lesson, since
      // manzil and volume boundaries don't align 1:1.
      { source: '/manzil/1', destination: '/volume/1', permanent: true },
      { source: '/manzil/2', destination: '/volume/3', permanent: true },
      { source: '/manzil/3', destination: '/volume/4', permanent: true },
      { source: '/manzil/4', destination: '/volume/6', permanent: true },
      { source: '/manzil/5', destination: '/volume/7', permanent: true },
      { source: '/manzil/6', destination: '/volume/8', permanent: true },
      { source: '/manzil/7', destination: '/volume/10', permanent: true },
      { source: '/manzil/:path*', destination: '/', permanent: true },
      { source: '/manzil', destination: '/', permanent: true },

      // The consolidation of eight about-pages into three, and of two
      // glossaries into one. These were `redirect()` calls inside stub page
      // components, which is a CLIENT-side redirect: Next encodes it in the
      // RSC flight payload as NEXT_REDIRECT and it only fires once React
      // hydrates. A direct request got 307 with a 10.7KB HTML body, no
      // Location header and no meta refresh -- so `curl -L` stayed put, and a
      // crawler saw an indexable page carrying the site-wide canonical rather
      // than a pointer to the destination. Every one of these URLs is retired
      // precisely because it is cited somewhere, which is the case that needs
      // a real HTTP redirect. Declared here they emit 308 + Location, the way
      // the manzil routes above already did.
      //
      // /about absorbed the edition description and the team block.
      { source: '/about/arabic-edition', destination: '/about', permanent: true },
      { source: '/about/translator', destination: '/about', permanent: true },
      // The essay that stood at /about/tafsir is off the site; About carries
      // what a reader needs about the tafsīr.
      { source: '/about/tafsir', destination: '/about', permanent: true },
      { source: '/about/shaykh', destination: '/about', permanent: true },
      { source: '/about/companion-texts', destination: '/about', permanent: true },
      // /translators-note absorbed the editorial note; the two cross-linked
      // each other for the same three translation choices.
      { source: '/editorial-note', destination: '/translators-note', permanent: true },
      { source: '/introduction', destination: '/translators-note', permanent: true },
      // The vocabulary map is a section of each term's entry in /glossary now,
      // so the relation sits next to the passages that attest the term.
      { source: '/glossary-map', destination: '/glossary', permanent: true },
      // The compiler's apparatus is served on each lesson page, at the marker
      // it annotates, attributed to him (AK, 13 and 15 Nov 2026). The
      // free-standing apparatus and the ḥadīth index built from it are
      // retired; a link to one lesson's notes lands on that lesson's panel.
      {
        source: '/footnotes',
        has: [{ type: 'query', key: 'lesson', value: '(?<l>\\d+)' }],
        destination: '/lesson/:l?panel=citations',
        permanent: true,
      },
      { source: '/footnotes', destination: '/research', permanent: true },
      { source: '/hadith', destination: '/research', permanent: true },
    ];
  },
};

export default nextConfig;
