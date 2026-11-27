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
  /** The bottom bar's label, when the full one is too wide for a fifth of a
   *  phone. Five tabs at 320px leave 64px each; "By verse" and "Research"
   *  do not fit, and the published guidance is explicit that a tab label
   *  must not wrap to a second line and must not be truncated -- so the
   *  label gets shorter rather than the type. Omitted means `label` fits. */
  labelShort?: string;
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
    id: 'read',
    href: '/read',
    label: 'Fī Riyāḍ al-Tafsīr',
    labelShort: 'Tafsīr',
    labelAr: 'في رياض التفسير',
    hint: '56 lessons',
    icon: '◎',
    match: ['/read', '/lesson', '/volume', '/surah'],
    children: [
      { href: '/read', label: 'The 56 Lessons', hint: 'By volume, or by sūra' },
      { href: '/lesson/1', label: 'Begin at Lesson 1', hint: 'Al-Istiʿādha, Basmala and al-Fātiḥa' },
    ],
  },
  {
    id: 'works',
    href: '/beyond',
    label: 'Beyond',
    labelAr: 'تفسيره في سائر آثاره',
    hint: 'Other writings',
    icon: '✦',
    match: ['/beyond'],
    children: [],
  },
  {
    id: 'verse',
    href: '/verse',
    label: 'Find a Verse',
    labelShort: 'Verse',
    labelAr: 'فهرس الآيات',
    hint: 'Qurʾānic index',
    icon: '⌖',
    match: ['/verse'],
    children: [],
  },
  {
    id: 'topics',
    href: '/topics',
    label: 'Topics',
    labelAr: 'موضوعات',
    hint: 'Thematic index',
    icon: '⊞',
    match: ['/topics'],
    children: [],
  },
  {
    id: 'students',
    href: '/students',
    label: 'Students',
    labelAr: 'تفاسير تلامذته',
    hint: 'Other commentaries',
    icon: '❖',
    match: ['/students'],
    children: [],
  },
  {
    id: 'audio',
    href: '/audio',
    label: 'Audio',
    labelAr: 'التسجيلات',
    hint: 'Original recordings',
    icon: '♪',
    match: ['/audio'],
    children: [],
  },
  {
    id: 'about',
    href: '/about',
    label: 'About',
    labelAr: 'عن المشروع',
    hint: 'About, Editorial Conventions, Get in Touch',
    icon: '⌂',
    match: ['/about', '/editorial-note', '/translators-note', '/get-involved'],
    children: [
      { href: '/about', label: 'About', hint: 'What it gathers, who makes it, how to cite it' },
      { href: '/translators-note', label: 'Editorial Conventions', hint: 'Sources, translation and summary, transliteration' },
      { href: '/get-involved', label: 'Get in Touch', hint: 'Feedback, corrections, contributing' },
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

/* ── The phone's bottom bar ────────────────────────────────────────
 * A separate table from NAV, and deliberately so.
 *
 * NAV is the site's five sections. A phone bar is not a table of
 * contents: it is the four or five things a reader does, and those
 * are not the same list. Search was the clearest case -- the one
 * destination a reader falls back on when they do not know where a
 * thing lives, and it sat two taps down inside two different
 * sections, because it is a tool rather than a section. Here it is a
 * tab. About, which a reader visits once, is not.
 *
 * `more` has no href. It opens the full menu, which holds everything
 * including the sections this bar leaves out, so nothing becomes
 * unreachable by being left off. The guidance is 3-5 tabs; this is
 * five, each with a one-word label that fits a fifth of a 320px
 * screen without wrapping or truncating.
 */
export interface MobileTab {
  id: string;
  /** Absent on `more`, which opens the menu instead of navigating. */
  href?: string;
  label: string;
  icon: string;
  match: string[];
}

export const MOBILE_BAR: MobileTab[] = [
  { id: 'read',   href: '/read',   label: 'Tafsīr', icon: '◎', match: ['/read', '/lesson', '/volume', '/surah'] },
  { id: 'works',  href: '/beyond',  label: 'Beyond', icon: '✦', match: ['/beyond'] },
  { id: 'verse',  href: '/verse',  label: 'Verse',  icon: '۝', match: ['/verse'] },
  { id: 'search', href: '/search', label: 'Search', icon: '⌕', match: ['/search'] },
  { id: 'more',                    label: 'More',   icon: '⋯', match: ['/topics', '/term', '/glossary', '/students', '/audio', '/about', '/translators-note', '/get-involved', '/saved'] },
];

/** The event PersistentNav fires to open SiteNav's menu. They are
 *  siblings in the layout with no state between them, and a context
 *  provider for one boolean would be more machinery than the job. */
export const OPEN_MENU_EVENT = 'niassetafsir:open-menu';

/** Which bottom tab a path lights. Longest prefix wins, as above. */
export function activeTab(pathname: string): MobileTab | undefined {
  let best: MobileTab | undefined;
  let bestLen = -1;
  for (const t of MOBILE_BAR) {
    for (const m of t.match) {
      if ((pathname === m || pathname.startsWith(m + '/')) && m.length > bestLen) {
        best = t;
        bestLen = m.length;
      }
    }
  }
  return best;
}
