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
  jalalaynText: string;
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

