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

export function buildCitation(
  lessonId: number,
  lessonTitleEn: string,
  verseRange: string,
  language: 'ar' | 'en'
): string {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const url = `https://niassetafsir.org/lesson/${lessonId}`;
  if (language === 'en') {
    return `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, ${lessonTitleEn} (${verseRange}), trans. Amadu Kunateh. Digital edition: ${url} (accessed ${date}).`;
  }
  return `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, compiled by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, ${lessonTitleEn} (${verseRange}). Digital edition: ${url} (accessed ${date}).`;
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
