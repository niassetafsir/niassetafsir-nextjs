export interface Lesson {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  verseRange: string;
  sura: string;
  manzil: number;
  arabicText: string;
  arabicBody?: string;
  arabicFootnotes?: string;
  englishText: string | null;
  /** REMOVED from the data 2026-08-20. Held the Royal Aal al-Bayt English
   *  Jalālayn (Feras Hamza, © 2007) across 30 lessons, 903,600 characters,
   *  rendered nowhere but published in a public repo. Our own translation
   *  lives in src/data/jalalaynEnglish/. Left optional so any stale reader
   *  fails at the type level rather than silently reading undefined. */
  jalalaynText?: never;
  hasEnglish: boolean;
  volume?: number;
  pageInVolume?: number | null;
  lessonSummary?: string;
  openingInvocation?: string;
  wolofPlaylistId: string;
  arabicPlaylistId: string;
  arabicAudioUrl: string | null;
  wolofAudioUrl?: string | null;
  prevId: number | null;
  nextId: number | null;
  footnoteOrder?: string[];
}

