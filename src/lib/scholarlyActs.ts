// Which uses of a verse the site shows.
//
// AK, 15 Nov 2026: "i want quranic commentary not litanies ... where he
// explains a verse or comments on it. it's a scholarly site, not devotional
// practice." The corpus records every use of a verse; the site shows the ones
// that say something about the verse or argue from it, and leaves out the
// verse recited, set into a formula or a poem's structure, or brought to bear
// on a rite. The data keeps them all: this is a display rule, not a deletion.

import type { ExegeticalAct } from '@/lib/corpus';

// AK, 27 Nov 2026: "i dont simply want quotes without it being a real
// quranic commentary". A verse quoted to warrant a claim (prooftext) or a
// ruling (juristic) is a quotation, not commentary, and comes off with the
// rest. The site shows where he says what a verse means.
export const SHOWN_ACTS: ReadonlySet<ExegeticalAct> = new Set<ExegeticalAct>([
  'tafsir',     // what he says about it
  'gloss',      // an interpretive equivalence
]);

// "Application" and "allusion" each cover two different things. Most are rites: a verse recited
// for travel, a cure, a wird. Those stay off. These are the rest: places where
// he (or, in al-Qanābil, his student) argues from the verse or reads it, which
// is commentary in AK's sense even though the act recorded is application.
// Keyed by locus and verse; the corpus data is unchanged.
const ARGUED_APPLICATIONS: ReadonlySet<string> = new Set([
  'rihlat-077:9:91', 'kashif-237:62:3',
  'qanabil-p05-07:13:39', 'qanabil-p42-39:99:2',
  // Allusions read one by one (AK, 27 Nov 2026: "do them"). An allusion
  // shows only where the verse is read or argued from: the nearness verses
  // and the caliphate argument in al-Qanābil, the two "names" of 89:3, the
  // women among "the chosen" in the Tadhyīl. Travel narrative, greetings,
  // closing prayers and borrowed phrasing stay off.
  'kashif-246:38:47',
  'qanabil-p04-01:3:54', 'qanabil-p05-02:50:16', 'qanabil-p05-03:8:24', 'qanabil-p05-04:7:56',
  'qanabil-p05-05:53:9', 'qanabil-p05-06:21:87', 'qanabil-p06-08:98:6', 'qanabil-p07-09:98:7',
  'qanabil-p07-10:89:28', 'qanabil-p10-12:25:70', 'qanabil-p18-18:2:30', 'qanabil-p18-18:38:26',
  'qanabil-p18-19:9:30', 'qanabil-p23-23:4:150', 'qanabil-p29-27:89:3', 'qanabil-p31-29:56:30',
  'qanabil-p40-34:89:3', 'qanabil-p42-37:48:4', 'qanabil-p42-38:57:20',
]);

// Passages in verse. AK, 27 Nov 2026: "i want only prose." The three
// versified journeys (Nafaḥāt al-Malik al-Ghanī, al-Riḥla al-Gannāriyya,
// Nayl al-mafāz) and the poems quoted in Rijāl wa-adwār come off the site
// whatever act they carry. Verse the Shaykh quotes inside his own prose stays,
// and so does the opening chant of the lessons. Display rule only.
export const VERSE_LOCI: ReadonlySet<string> = new Set([
  'rihlat-067', 'rihlat-077', 'rihlat-087', 'rihlat-108',
  'rijal-011', 'rijal-047', 'rijal-049', 'rijal-055', 'rijal-065', 'rijal-068', 'rijal-070',
]);

// Read line by line (AK, 27 Nov 2026: "comprehensive sweep... line by
// line"). Labelled tafsīr or gloss in the read-through, but on reading they
// quote rather than explain: a verse as a heading or a closing formula, a
// chain of verses urging obedience, an interlocutor's words, a sermon
// formula, a verse number that does not match the words quoted. Off the
// site; the corpus keeps them.
const NOT_COMMENTARY: ReadonlySet<string> = new Set([
  'qanabil-q19-31:74:31', 'qanabil-q19-32:10:10', 'mawsua8-budur-028:62:3',
  'mawsua8-budur-033:3:133', 'mawsua8-wajh-022:62:11', 'mawsua8-hujja-020:15:21',
  'mawsua8-iman-qada-039:7:182', 'mawsua9-warid-009:9:103', 'mawsua7-ghassam-019:10:25',
  'mawsua8-budur-img-015:2:256', 'mawsua8-budur-img-017:12:53', 'mawsua8-budur-img-022:7:117',
  'mawsua8-budur-img-056:10:62', 'mawsua8-hujja-004:16:8', 'mawsua8-sabil-014:55:46',
  'mawsua8-sabil-015:79:40', 'mawsua8-sabil-017:19:73', 'mawsua8-sabil-018:33:13',
  'mawsua8-sabil-019:25:76', 'mawsua8-sabil-020:26:58', 'mawsua8-sabil-021:44:51',
  'mawsua8-sabil-022:37:164', 'mawsua4-mawlid-jumua1381-001:22:47', 'mawsua4-yawm-akhir-003:22:47',
  'mawsua4-ramadan1391-008:21:8', 'mawsua4-ramadan1392-010:28:38', 'mawsua4-ramadan1392-011:79:24',
  'mawsua4-bayadin1370-002:28:35', 'mawsua4-bayadin1370-003:12:8', 'mawsua4-bayadin1370-004:2:215',
  'mawsua4-kano-tawsia-C036:43:36', 'mawsua7-haqiba-015:4:59', 'mawsua4-jumua-thaniya-002:33:56',
]);

/** A link is shown when any of its acts is one the site shows. */
export function isShownLink(link: { acts: string[]; locusId?: string; surah?: number; ayahStart?: number }): boolean {
  if (link.locusId && VERSE_LOCI.has(link.locusId)) return false;
  if (NOT_COMMENTARY.has(`${link.locusId}:${link.surah}:${link.ayahStart}`)) return false;
  if (link.acts.some(a => SHOWN_ACTS.has(a as ExegeticalAct))) return true;
  return ARGUED_APPLICATIONS.has(`${link.locusId}:${link.surah}:${link.ayahStart}`);
}
