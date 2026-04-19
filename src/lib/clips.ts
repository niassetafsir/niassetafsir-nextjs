// Research Clips — scholarly passages saved with auto-citation

export interface Clip {
  id: string;
  text: string;
  language: 'ar' | 'en';
  lessonId: number;
  lessonTitleAr: string;
  lessonTitleEn: string;
  verseRange: string;
  citation: string;
  timestamp: number;
}

const KEY = 'niassetafsir-clips';

export function getClips(): Clip[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveClip(clip: Omit<Clip, 'id' | 'timestamp'>): void {
  const clips = getClips();
  const id = `clip-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  clips.unshift({ ...clip, id, timestamp: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(clips));
}

export function removeClip(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getClips().filter(c => c.id !== id)));
}

export function isClipped(text: string): boolean {
  return getClips().some(c => c.text.trim() === text.trim());
}

// Volume data for citation — keyed by lessonId
const LESSON_VOLUME: Record<number, { vol: number; page: number | null }> = {
  1:{vol:1,page:29},2:{vol:1,page:54},3:{vol:1,page:59},4:{vol:1,page:72},
  5:{vol:1,page:96},6:{vol:1,page:120},7:{vol:2,page:3},8:{vol:2,page:34},
  9:{vol:2,page:46},10:{vol:2,page:79},11:{vol:2,page:124},12:{vol:2,page:161},
  13:{vol:3,page:3},14:{vol:3,page:33},15:{vol:3,page:49},16:{vol:3,page:112},
  17:{vol:3,page:122},18:{vol:3,page:159},19:{vol:3,page:191},20:{vol:4,page:3},
  21:{vol:4,page:44},22:{vol:4,page:86},23:{vol:4,page:129},24:{vol:4,page:165},
  25:{vol:4,page:196},26:{vol:5,page:3},27:{vol:5,page:39},28:{vol:5,page:70},
  29:{vol:5,page:100},30:{vol:5,page:144},
};

function volRef(lessonId: number): string {
  const vd = LESSON_VOLUME[lessonId];
  if (!vd) return '';
  const page = vd.page ? `, p. ${vd.page}` : '';
  return `vol. ${vd.vol}${page}`;
}

export function buildCitation(
  lessonId: number,
  lessonTitleEn: string,
  verseRange: string,
  language: 'ar' | 'en'
): string {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const url = `https://niassetafsir.org/lesson/${lessonId}`;
  const vol = volRef(lessonId);
  const volStr = vol ? `, ${vol}` : '';

  if (language === 'en') {
    return `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, trans. Amadu Kunateh (ORCID: 0009-0002-7839-6474) (niassetafsir.org, 2025)${volStr}, ${lessonTitleEn} (${verseRange}). Accessed ${date}.`;
  }
  return `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, comp. Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed. (n.p., n.d.)${volStr}, ${lessonTitleEn} (${verseRange}). Digital ed., ed. Amadu Kunateh, niassetafsir.org, 2025. Edition 1.0. Accessed ${date}.`;
}

export function buildBibliography(language: 'ar' | 'en'): string {
  if (language === 'en') {
    return 'Niasse, Ibrāhīm. Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm. Translated by Amadu Kunateh. Digital scholarly edition. niassetafsir.org, 2025.';
  }
  return 'Niasse, Ibrāhīm. Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm. Compiled by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. 10 vols. n.p., n.d. Digital scholarly edition, ed. Amadu Kunateh. niassetafsir.org.';
}

export function exportClips(): string {
  return getClips().map(c => [
    `[${c.lessonTitleEn} — ${c.lessonTitleAr}]`,
    `Language: ${c.language === 'ar' ? 'Arabic' : 'English'}`,
    ``,
    c.text,
    ``,
    `Citation: ${c.citation}`,
    `Saved: ${new Date(c.timestamp).toLocaleDateString()}`,
    `${'─'.repeat(60)}`
  ].join('\n')).join('\n\n');
}
