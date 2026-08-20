/**
 * One table of what this site contains.
 *
 * There were three, and they disagreed. SiteNav's dropdowns said the top level
 * was About / Contribute / Publications / Research; PersistentNav's tabs said it
 * was Home / Read / Verses / Listen / Research; /research listed a third set.
 * A reader met three incompatible pictures of the same site, and the lists
 * drifted -- PersistentNav went on matching /concordance, /scholars, /themes and
 * /network after all four routes had been deleted, because nothing tied it to
 * anything. Adding a route meant remembering three places. This is the one.
 *
 * The order is a claim about the site. Verse comes first because looking up an
 * āya is what this archive is for: everything else -- the lessons, the
 * recordings, the apparatus -- is an answer to "what did Shaykh Ibrāhīm say
 * about this verse". A table of contents that opened on "About" would be
 * describing a different project.
 */

export interface NavChild {
  href: string;
  label: string;
  hint: string;
}

export interface NavSection {
  id: string;
  href: string;
  label: string;
  labelAr: string;
  /** Shown under the label in the desktop dropdown and the mobile sheet. */
  hint: string;
  /** Bottom-bar glyph. Amiri has no outline for these, so they fall back per
   *  glyph to system-ui -- see the font stacks in globals.css. */
  icon: string;
  /** Path prefixes that light this section up. Every entry must name a route
   *  that resolves; that is the invariant the old lists broke. */
  match: string[];
  children: NavChild[];
}

export const NAV: NavSection[] = [
  {
    id: 'verse',
    href: '/verse',
    label: 'By verse',
    labelAr: 'فهرس الآيات',
    hint: 'Every place he treats an āya, across the whole corpus',
    icon: '✦',
    match: ['/verse'],
    children: [
      { href: '/verse', label: 'Look up an āya', hint: 'Type 2:255, or browse by sūra' },
      { href: '/search', label: 'Search the text', hint: 'Arabic and English, all 56 sessions' },
    ],
  },
  {
    id: 'read',
    href: '/read',
    label: 'Read',
    labelAr: 'القراءة',
    hint: 'The tafsīr itself — 56 sessions, complete in Arabic',
    icon: '◎',
    match: ['/read', '/lesson', '/volume', '/surah'],
    children: [
      { href: '/read', label: 'Contents', hint: 'By volume, or by sūra' },
      { href: '/lesson/1', label: 'Begin at Lesson 1', hint: 'Al-Istiʿādha, Basmala and al-Fātiḥa' },
    ],
  },
  {
    id: 'listen',
    href: '/audio',
    label: 'Listen',
    labelAr: 'الاستماع',
    hint: 'The 1383/1964 recordings',
    icon: '♪',
    match: ['/audio'],
    children: [
      { href: '/audio', label: 'Recordings', hint: 'Arabic, and Wolof where it survives' },
    ],
  },
  {
    id: 'research',
    href: '/research',
    label: 'Research',
    labelAr: 'البحث',
    hint: 'The apparatus: footnotes, ḥadīth, terms, your saved passages',
    icon: '⊞',
    match: ['/research', '/footnotes', '/hadith', '/glossary', '/glossary-map', '/notes', '/saved', '/search'],
    children: [
      { href: '/research', label: 'All tools', hint: 'Everything in one place' },
      { href: '/footnotes', label: 'Footnotes', hint: '1,997 compiler citations, classified' },
      { href: '/hadith', label: 'Ḥadīth index', hint: 'By collection' },
      { href: '/glossary', label: 'Terms', hint: 'In context, and how he connects them' },
      { href: '/notes', label: 'Research notes', hint: 'Working observations on the text' },
      { href: '/saved', label: 'Saved', hint: 'Passages you have kept, with citations' },
    ],
  },
  {
    id: 'about',
    href: '/about',
    label: 'About',
    labelAr: 'عن المشروع',
    hint: 'The tafsīr, this edition, and how to reach us',
    icon: '⌂',
    match: ['/about', '/editorial-note', '/translators-note', '/introduction', '/order', '/preorder', '/get-involved'],
    children: [
      { href: '/about', label: 'This edition', hint: 'What it holds, who made it, how to cite it' },
      { href: '/about/tafsir', label: 'The tafsīr', hint: 'Niasse, the tradition, and his two sources' },
      { href: '/translators-note', label: 'Editorial conventions', hint: 'Transliteration, honorifics, rasm' },
      { href: '/order', label: 'The printed edition', hint: 'Order, and register for the bilingual' },
      { href: '/get-involved', label: 'Get in touch', hint: 'Feedback, corrections, joining' },
    ],
  },
];

/** The section a path belongs to. Longest prefix wins, so /glossary-map lands
 *  on research rather than on whichever section declared /glossary first. */
export function activeSection(pathname: string): NavSection | undefined {
  let best: NavSection | undefined;
  let bestLen = -1;
  for (const s of NAV) {
    for (const m of s.match) {
      if ((pathname === m || pathname.startsWith(m + '/')) && m.length > bestLen) {
        best = s;
        bestLen = m.length;
      }
    }
  }
  return best;
}

/** Every destination the navigation offers, for tests and for the sitemap. */
export function allNavHrefs(): string[] {
  const all = NAV.flatMap(s => [s.href, ...s.children.map(c => c.href)]);
  return all.filter((h, i) => all.indexOf(h) === i);
}
