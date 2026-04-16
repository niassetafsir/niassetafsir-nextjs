export interface Lesson {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  verseRange: string;
  sura: string;
  manzil: number;
  arabicText: string;
  englishText: string | null;
  jalalaynText: string;
  hasEnglish: boolean;
  wolofPlaylistId: string;
  arabicPlaylistId: string;
  arabicAudioUrl: string | null;
  wolofAudioUrl?: string | null;
  prevId: number | null;
  nextId: number | null;
}

export interface Manzil {
  id: number;
  arabicTitle: string;
  englishTitle: string;
  suras: string;
  lessons: number[];
}

export const MANZILS: Manzil[] = [
  { id: 1, arabicTitle: "المنزل الأول", englishTitle: "First Manzil", suras: "Al-Fātiḥa – Al-Māʾida", lessons: [1,2,3,4,5,6,7] },
  { id: 2, arabicTitle: "المنزل الثاني", englishTitle: "Second Manzil", suras: "Āl ʿImrān – Al-Nisāʾ", lessons: [8,9,10,11,12,13] },
  { id: 3, arabicTitle: "المنزل الثالث", englishTitle: "Third Manzil", suras: "Al-Māʾida – Al-Tawba", lessons: [14,15,16,17,18,19,20,21,22,23] },
  { id: 4, arabicTitle: "المنزل الرابع", englishTitle: "Fourth Manzil", suras: "Yūnus – Hūd", lessons: [24,25,26] },
  { id: 5, arabicTitle: "المنزل الخامس", englishTitle: "Fifth Manzil", suras: "Yūsuf – Al-Ḥijr", lessons: [27,28,29] },
  { id: 6, arabicTitle: "المنزل السادس", englishTitle: "Sixth Manzil", suras: "Al-Naḥl", lessons: [30] },
];
