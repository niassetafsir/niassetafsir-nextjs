import corpus from '@/data/corpus.json';

/**
 * Which genres outside Fī Riyāḍ the verse index actually reaches.
 *
 * Written because three pages named "letters" among the places a reader can
 * look up an āya, and no letter in the corpus carries a single locus: neither
 * Jawāhir al-rasāʾil nor either Mawsūʿa rasāʾil volume has one, so the verse
 * index has nothing from them to show. The homepage also promised "the
 * recordings", which have no loci either. A hand-written list of genres drifts
 * the moment a work gains or loses loci, which is the same failure the
 * hardcoded "1,994" footnote figure caused on /research, so this counts.
 *
 * Counted from verse *links* rather than loci: a locus with no verse link is
 * invisible to the reader who arrives by āya, and it is that reader the
 * sentences are addressed to.
 */

interface Work { id: string; genre?: string }
interface Witness { id: string; workId?: string }
interface Locus { id: string; witnessId?: string }
interface VerseLink { locusId?: string }

const LABELS: Record<string, string> = {
  tafsir: 'his other tafsīr works',
  fatawa: 'fatwās',
  fatwa: 'fatwās',
  'sufi-doctrine': 'the doctrinal treatises',
  poetry: 'poetry',
  letters: 'letters',
  rasail: 'letters',
  khutab: 'sermons',
  nawadir: 'the reported sayings',
  rihla: 'the travel accounts',
  polemic: 'the polemics',
  fiqh: 'the fiqh works',
  esoteric: 'the esoteric works',
  awrad: 'the awrād',
  asanid: 'the asānīd',
  muallafat: 'the collected writings',
};

export interface GenreReach {
  genre: string;
  label: string;
  verseLinks: number;
  loci: number;
}

/**
 * Genres with at least one verse link, richest first, excluding Fī Riyāḍ
 * itself — the sentences using this all begin "beyond the tafsīr".
 */
export function getCorpusReach(): GenreReach[] {
  const works = (corpus as { works: Work[] }).works;
  const witnesses = (corpus as { witnesses: Witness[] }).witnesses;
  const loci = (corpus as { loci: Locus[] }).loci;
  const links = (corpus as { verseLinks: VerseLink[] }).verseLinks;

  const genreOf = new Map<string, string>();
  const workOfWitness = new Map<string, string>();
  for (const w of works) genreOf.set(w.id, w.genre || 'unknown');
  for (const w of witnesses) if (w.workId) workOfWitness.set(w.id, w.workId);

  const genreOfLocus = new Map<string, string>();
  const lociByGenre: Record<string, number> = {};
  for (const l of loci) {
    const workId = l.witnessId ? workOfWitness.get(l.witnessId) : undefined;
    if (!workId || workId === 'fi-riyad') continue;
    const g = genreOf.get(workId) || 'unknown';
    genreOfLocus.set(l.id, g);
    lociByGenre[g] = (lociByGenre[g] || 0) + 1;
  }

  const linksByGenre: Record<string, number> = {};
  for (const v of links) {
    const g = v.locusId ? genreOfLocus.get(v.locusId) : undefined;
    if (!g) continue;
    linksByGenre[g] = (linksByGenre[g] || 0) + 1;
  }

  return Object.entries(linksByGenre)
    .map(([genre, verseLinks]) => ({
      genre,
      label: LABELS[genre] || genre,
      verseLinks,
      loci: lociByGenre[genre] || 0,
    }))
    .sort((a, b) => b.verseLinks - a.verseLinks);
}

/** "his other tafsīr works, fatwās, the doctrinal treatises and poetry" */
export function corpusReachPhrase(): string {
  const labels = Array.from(new Set(getCorpusReach().map(g => g.label)));
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  return labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
}
