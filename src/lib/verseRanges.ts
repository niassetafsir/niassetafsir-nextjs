// Surah/āyah → lesson resolution, scoped ONLY to lessons that currently have
// an English translation (hasEnglish: true), so the homepage "jump to āyah"
// widget never sends a reader to an untranslated lesson. Extend
// TRANSLATED_RANGES as more lessons get translated -- nothing else needs to
// change.
//
// This is deliberately separate from /concordance (Verse Concordance), which
// is a distinct, more advanced citation-network research tool held back
// pending AK's Islamic Africa (Brill) article. Do not conflate the two.

export interface AyahRange {
  lessonId: number;
  startAyah: number;
  endAyah: number;
}

// Keyed by surah number. Ranges are drawn from each lesson's own verseRange
// field (see src/data/lessons/0N.json) -- Lesson 1 alone spans two sūrahs
// (all of al-Fātiḥa, then the opening of al-Baqara), hence two entries below
// pointing at the same lessonId.
export const TRANSLATED_RANGES: Record<number, AyahRange[]> = {
  1: [{ lessonId: 1, startAyah: 1, endAyah: 7 }],
  2: [
    { lessonId: 1, startAyah: 1, endAyah: 5 },
    { lessonId: 2, startAyah: 6, endAyah: 25 },
    { lessonId: 3, startAyah: 26, endAyah: 59 },
    { lessonId: 4, startAyah: 60, endAyah: 105 },
    { lessonId: 5, startAyah: 106, endAyah: 202 },
  ],
};

export function resolveVerseToLesson(surah: number, ayah: number): number | null {
  const ranges = TRANSLATED_RANGES[surah];
  if (!ranges) return null;
  const match = ranges.find(r => ayah >= r.startAyah && ayah <= r.endAyah);
  return match ? match.lessonId : null;
}

export function maxTranslatedAyah(surah: number): number | null {
  const ranges = TRANSLATED_RANGES[surah];
  if (!ranges || ranges.length === 0) return null;
  return Math.max(...ranges.map(r => r.endAyah));
}

/** An inclusive (surah, ayah) span, as a lesson actually covers it. */
export interface VerseSpan {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

/**
 * Parse a lesson's own `verseRange` string into a span.
 *
 * The strings come in two shapes, both present in src/data/lessons:
 *   "Q. 2:6–25"                  -- within one sūra
 *   "Al-Istiʿādha · Q. 1:1–2:5"  -- crossing a sūra boundary, with a prefix
 *
 * Needed because a sūra's Jalālayn / Rūḥ al-Bayān file holds the WHOLE sūra
 * while a lesson covers only part of it. Al-Baqara is split across lessons
 * 2-6 and beyond, so without this filter lesson 2 ("Q. 2:6-25") would render
 * all 286 verses. Invisible while only al-Fātiḥa is transcribed -- its file
 * has exactly the 7 verses lesson 1 covers -- and wrong the moment sūra 2
 * arrives.
 *
 * Returns null if the string does not parse, and callers then fall back to
 * showing everything, which is the pre-existing behaviour.
 */
export function parseVerseSpan(verseRange: string | null | undefined): VerseSpan | null {
  if (!verseRange) return null;
  // en dash, em dash and hyphen all occur in the data.
  const m = verseRange.match(/Q\.\s*(\d+):(\d+)\s*[\u2013\u2014-]\s*(?:(\d+):)?(\d+)/);
  if (!m) return null;
  const startSurah = parseInt(m[1], 10);
  const startAyah = parseInt(m[2], 10);
  const endSurah = m[3] ? parseInt(m[3], 10) : startSurah;
  const endAyah = parseInt(m[4], 10);
  if ([startSurah, startAyah, endSurah, endAyah].some(n => !Number.isFinite(n))) return null;
  return { startSurah, startAyah, endSurah, endAyah };
}

/** Is (surah, ayah) inside the span, ordering by sūra then āya? */
export function spanIncludes(span: VerseSpan, surah: number, ayah: number): boolean {
  const key = surah * 10000 + ayah;
  return key >= span.startSurah * 10000 + span.startAyah
      && key <= span.endSurah * 10000 + span.endAyah;
}

export interface SurahMeta {
  id: number;
  ayahCount: number;
  nameAr: string;
  nameEn: string;
}

// Standard 114-sūrah list (name + āyah count), used only to populate the
// picker and to show "more coming" for anything outside TRANSLATED_RANGES.
export const SURAH_LIST: SurahMeta[] = [
  { id: 1, ayahCount: 7, nameAr: 'الفاتحة', nameEn: 'Al-Fātiḥa' },
  { id: 2, ayahCount: 286, nameAr: 'البقرة', nameEn: 'Al-Baqara' },
  { id: 3, ayahCount: 200, nameAr: 'آل عمران', nameEn: 'Āl ʿImrān' },
  { id: 4, ayahCount: 176, nameAr: 'النساء', nameEn: 'Al-Nisāʾ' },
  { id: 5, ayahCount: 120, nameAr: 'المائدة', nameEn: 'Al-Māʾida' },
  { id: 6, ayahCount: 165, nameAr: 'الأنعام', nameEn: 'Al-Anʿām' },
  { id: 7, ayahCount: 206, nameAr: 'الأعراف', nameEn: 'Al-Aʿrāf' },
  { id: 8, ayahCount: 75, nameAr: 'الأنفال', nameEn: 'Al-Anfāl' },
  { id: 9, ayahCount: 129, nameAr: 'التوبة', nameEn: 'Al-Tawba' },
  { id: 10, ayahCount: 109, nameAr: 'يونس', nameEn: 'Yūnus' },
  { id: 11, ayahCount: 123, nameAr: 'هود', nameEn: 'Hūd' },
  { id: 12, ayahCount: 111, nameAr: 'يوسف', nameEn: 'Yūsuf' },
  { id: 13, ayahCount: 43, nameAr: 'الرعد', nameEn: 'Al-Raʿd' },
  { id: 14, ayahCount: 52, nameAr: 'إبراهيم', nameEn: 'Ibrāhīm' },
  { id: 15, ayahCount: 99, nameAr: 'الحجر', nameEn: 'Al-Ḥijr' },
  { id: 16, ayahCount: 128, nameAr: 'النحل', nameEn: 'Al-Naḥl' },
  { id: 17, ayahCount: 111, nameAr: 'الإسراء', nameEn: 'Al-Isrāʾ' },
  { id: 18, ayahCount: 110, nameAr: 'الكهف', nameEn: 'Al-Kahf' },
  { id: 19, ayahCount: 98, nameAr: 'مريم', nameEn: 'Maryam' },
  { id: 20, ayahCount: 135, nameAr: 'طه', nameEn: 'Ṭāhā' },
  { id: 21, ayahCount: 112, nameAr: 'الأنبياء', nameEn: 'Al-Anbiyāʾ' },
  { id: 22, ayahCount: 78, nameAr: 'الحج', nameEn: 'Al-Ḥajj' },
  { id: 23, ayahCount: 118, nameAr: 'المؤمنون', nameEn: 'Al-Muʾminūn' },
  { id: 24, ayahCount: 64, nameAr: 'النور', nameEn: 'Al-Nūr' },
  { id: 25, ayahCount: 77, nameAr: 'الفرقان', nameEn: 'Al-Furqān' },
  { id: 26, ayahCount: 227, nameAr: 'الشعراء', nameEn: 'Al-Shuʿarāʾ' },
  { id: 27, ayahCount: 93, nameAr: 'النمل', nameEn: 'Al-Naml' },
  { id: 28, ayahCount: 88, nameAr: 'القصص', nameEn: 'Al-Qaṣaṣ' },
  { id: 29, ayahCount: 69, nameAr: 'العنكبوت', nameEn: 'Al-ʿAnkabūt' },
  { id: 30, ayahCount: 60, nameAr: 'الروم', nameEn: 'Al-Rūm' },
  { id: 31, ayahCount: 34, nameAr: 'لقمان', nameEn: 'Luqmān' },
  { id: 32, ayahCount: 30, nameAr: 'السجدة', nameEn: 'Al-Sajda' },
  { id: 33, ayahCount: 73, nameAr: 'الأحزاب', nameEn: 'Al-Aḥzāb' },
  { id: 34, ayahCount: 54, nameAr: 'سبأ', nameEn: 'Sabaʾ' },
  { id: 35, ayahCount: 45, nameAr: 'فاطر', nameEn: 'Fāṭir' },
  { id: 36, ayahCount: 83, nameAr: 'يس', nameEn: 'Yā-Sīn' },
  { id: 37, ayahCount: 182, nameAr: 'الصافات', nameEn: 'Al-Ṣāffāt' },
  { id: 38, ayahCount: 88, nameAr: 'ص', nameEn: 'Ṣād' },
  { id: 39, ayahCount: 75, nameAr: 'الزمر', nameEn: 'Al-Zumar' },
  { id: 40, ayahCount: 85, nameAr: 'غافر', nameEn: 'Ghāfir' },
  { id: 41, ayahCount: 54, nameAr: 'فصلت', nameEn: 'Fuṣṣilat' },
  { id: 42, ayahCount: 53, nameAr: 'الشورى', nameEn: 'Al-Shūrā' },
  { id: 43, ayahCount: 89, nameAr: 'الزخرف', nameEn: 'Al-Zukhruf' },
  { id: 44, ayahCount: 59, nameAr: 'الدخان', nameEn: 'Al-Dukhān' },
  { id: 45, ayahCount: 37, nameAr: 'الجاثية', nameEn: 'Al-Jāthiya' },
  { id: 46, ayahCount: 35, nameAr: 'الأحقاف', nameEn: 'Al-Aḥqāf' },
  { id: 47, ayahCount: 38, nameAr: 'محمد', nameEn: 'Muḥammad' },
  { id: 48, ayahCount: 29, nameAr: 'الفتح', nameEn: 'Al-Fatḥ' },
  { id: 49, ayahCount: 18, nameAr: 'الحجرات', nameEn: 'Al-Ḥujurāt' },
  { id: 50, ayahCount: 45, nameAr: 'ق', nameEn: 'Qāf' },
  { id: 51, ayahCount: 60, nameAr: 'الذاريات', nameEn: 'Al-Dhāriyāt' },
  { id: 52, ayahCount: 49, nameAr: 'الطور', nameEn: 'Al-Ṭūr' },
  { id: 53, ayahCount: 62, nameAr: 'النجم', nameEn: 'Al-Najm' },
  { id: 54, ayahCount: 55, nameAr: 'القمر', nameEn: 'Al-Qamar' },
  { id: 55, ayahCount: 78, nameAr: 'الرحمن', nameEn: 'Al-Raḥmān' },
  { id: 56, ayahCount: 96, nameAr: 'الواقعة', nameEn: 'Al-Wāqiʿa' },
  { id: 57, ayahCount: 29, nameAr: 'الحديد', nameEn: 'Al-Ḥadīd' },
  { id: 58, ayahCount: 22, nameAr: 'المجادلة', nameEn: 'Al-Mujādala' },
  { id: 59, ayahCount: 24, nameAr: 'الحشر', nameEn: 'Al-Ḥashr' },
  { id: 60, ayahCount: 13, nameAr: 'الممتحنة', nameEn: 'Al-Mumtaḥana' },
  { id: 61, ayahCount: 14, nameAr: 'الصف', nameEn: 'Al-Ṣaff' },
  { id: 62, ayahCount: 11, nameAr: 'الجمعة', nameEn: 'Al-Jumuʿa' },
  { id: 63, ayahCount: 11, nameAr: 'المنافقون', nameEn: 'Al-Munāfiqūn' },
  { id: 64, ayahCount: 18, nameAr: 'التغابن', nameEn: 'Al-Taghābun' },
  { id: 65, ayahCount: 12, nameAr: 'الطلاق', nameEn: 'Al-Ṭalāq' },
  { id: 66, ayahCount: 12, nameAr: 'التحريم', nameEn: 'Al-Taḥrīm' },
  { id: 67, ayahCount: 30, nameAr: 'الملك', nameEn: 'Al-Mulk' },
  { id: 68, ayahCount: 52, nameAr: 'القلم', nameEn: 'Al-Qalam' },
  { id: 69, ayahCount: 52, nameAr: 'الحاقة', nameEn: 'Al-Ḥāqqa' },
  { id: 70, ayahCount: 44, nameAr: 'المعارج', nameEn: 'Al-Maʿārij' },
  { id: 71, ayahCount: 28, nameAr: 'نوح', nameEn: 'Nūḥ' },
  { id: 72, ayahCount: 28, nameAr: 'الجن', nameEn: 'Al-Jinn' },
  { id: 73, ayahCount: 20, nameAr: 'المزمل', nameEn: 'Al-Muzzammil' },
  { id: 74, ayahCount: 56, nameAr: 'المدثر', nameEn: 'Al-Muddaththir' },
  { id: 75, ayahCount: 40, nameAr: 'القيامة', nameEn: 'Al-Qiyāma' },
  { id: 76, ayahCount: 31, nameAr: 'الإنسان', nameEn: 'Al-Insān' },
  { id: 77, ayahCount: 50, nameAr: 'المرسلات', nameEn: 'Al-Mursalāt' },
  { id: 78, ayahCount: 40, nameAr: 'النبأ', nameEn: 'Al-Nabaʾ' },
  { id: 79, ayahCount: 46, nameAr: 'النازعات', nameEn: 'Al-Nāziʿāt' },
  { id: 80, ayahCount: 42, nameAr: 'عبس', nameEn: 'ʿAbasa' },
  { id: 81, ayahCount: 29, nameAr: 'التكوير', nameEn: 'Al-Takwīr' },
  { id: 82, ayahCount: 19, nameAr: 'الإنفطار', nameEn: 'Al-Infiṭār' },
  { id: 83, ayahCount: 36, nameAr: 'المطففين', nameEn: 'Al-Muṭaffifīn' },
  { id: 84, ayahCount: 25, nameAr: 'الإنشقاق', nameEn: 'Al-Inshiqāq' },
  { id: 85, ayahCount: 22, nameAr: 'البروج', nameEn: 'Al-Burūj' },
  { id: 86, ayahCount: 17, nameAr: 'الطارق', nameEn: 'Al-Ṭāriq' },
  { id: 87, ayahCount: 19, nameAr: 'الأعلى', nameEn: 'Al-Aʿlā' },
  { id: 88, ayahCount: 26, nameAr: 'الغاشية', nameEn: 'Al-Ghāshiya' },
  { id: 89, ayahCount: 30, nameAr: 'الفجر', nameEn: 'Al-Fajr' },
  { id: 90, ayahCount: 20, nameAr: 'البلد', nameEn: 'Al-Balad' },
  { id: 91, ayahCount: 15, nameAr: 'الشمس', nameEn: 'Al-Shams' },
  { id: 92, ayahCount: 21, nameAr: 'الليل', nameEn: 'Al-Layl' },
  { id: 93, ayahCount: 11, nameAr: 'الضحى', nameEn: 'Al-Ḍuḥā' },
  { id: 94, ayahCount: 8, nameAr: 'الشرح', nameEn: 'Al-Sharḥ' },
  { id: 95, ayahCount: 8, nameAr: 'التين', nameEn: 'Al-Tīn' },
  { id: 96, ayahCount: 19, nameAr: 'العلق', nameEn: 'Al-ʿAlaq' },
  { id: 97, ayahCount: 5, nameAr: 'القدر', nameEn: 'Al-Qadr' },
  { id: 98, ayahCount: 8, nameAr: 'البينة', nameEn: 'Al-Bayyina' },
  { id: 99, ayahCount: 8, nameAr: 'الزلزلة', nameEn: 'Al-Zalzala' },
  { id: 100, ayahCount: 11, nameAr: 'العاديات', nameEn: 'Al-ʿĀdiyāt' },
  { id: 101, ayahCount: 11, nameAr: 'القارعة', nameEn: 'Al-Qāriʿa' },
  { id: 102, ayahCount: 8, nameAr: 'التكاثر', nameEn: 'Al-Takāthur' },
  { id: 103, ayahCount: 3, nameAr: 'العصر', nameEn: 'Al-ʿAṣr' },
  { id: 104, ayahCount: 9, nameAr: 'الهمزة', nameEn: 'Al-Humaza' },
  { id: 105, ayahCount: 5, nameAr: 'الفيل', nameEn: 'Al-Fīl' },
  { id: 106, ayahCount: 4, nameAr: 'قريش', nameEn: 'Quraysh' },
  { id: 107, ayahCount: 7, nameAr: 'الماعون', nameEn: 'Al-Māʿūn' },
  { id: 108, ayahCount: 3, nameAr: 'الكوثر', nameEn: 'Al-Kawthar' },
  { id: 109, ayahCount: 6, nameAr: 'الكافرون', nameEn: 'Al-Kāfirūn' },
  { id: 110, ayahCount: 3, nameAr: 'النصر', nameEn: 'Al-Naṣr' },
  { id: 111, ayahCount: 5, nameAr: 'المسد', nameEn: 'Al-Masad' },
  { id: 112, ayahCount: 4, nameAr: 'الإخلاص', nameEn: 'Al-Ikhlāṣ' },
  { id: 113, ayahCount: 5, nameAr: 'الفلق', nameEn: 'Al-Falaq' },
  { id: 114, ayahCount: 6, nameAr: 'الناس', nameEn: 'Al-Nās' },
];
