// Annotation system — local storage, desktop research tool

export type HighlightColor = 'gold' | 'blue' | 'green';

export interface Annotation {
  id: string;
  lessonId: number;
  lessonTitle: string;
  verseRange: string;
  selectedText: string;
  language: 'ar' | 'en';
  color: HighlightColor;
  note: string;
  flagged: boolean;
  timestamp: number;
  citation: string; // auto-generated Chicago
}

const KEY = 'niassetafsir-annotations';

export function getAnnotations(): Annotation[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function getAnnotationsForLesson(lessonId: number): Annotation[] {
  return getAnnotations().filter(a => a.lessonId === lessonId);
}

export function saveAnnotation(ann: Annotation): void {
  const all = getAnnotations().filter(a => a.id !== ann.id);
  all.unshift(ann);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteAnnotation(id: string): void {
  const all = getAnnotations().filter(a => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function toggleFlag(id: string): void {
  const all = getAnnotations();
  const idx = all.findIndex(a => a.id === id);
  if (idx >= 0) { all[idx].flagged = !all[idx].flagged; }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function exportAnnotationsText(lessonId?: number): string {
  const anns = lessonId ? getAnnotationsForLesson(lessonId) : getAnnotations();
  if (!anns.length) return 'No annotations.';
  
  const byLesson: Record<number, Annotation[]> = {};
  anns.forEach(a => { (byLesson[a.lessonId] = byLesson[a.lessonId] || []).push(a); });
  
  return Object.entries(byLesson).map(([lid, list]) => {
    const header = `LESSON ${lid} — ${list[0].lessonTitle}\n${'─'.repeat(60)}`;
    const entries = list.map(a => {
      const flag = a.flagged ? '⚑ ' : '';
      const color = a.color === 'gold' ? '[KEY]' : a.color === 'blue' ? '[QUESTION]' : '[CONFIRMED]';
      const note = a.note ? `\nNote: ${a.note}` : '';
      return `${flag}${color} ${a.selectedText}\n${a.citation}${note}`;
    }).join('\n\n');
    return `${header}\n\n${entries}`;
  }).join('\n\n\n');
}

// Generate Chicago citation for annotation
export function buildAnnotationCitation(
  lessonId: number, lessonTitle: string, verseRange: string
): string {
  const date = new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});
  return `Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, comp. Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed. (n.p., n.d.), ${verseRange}. Digital ed., ed. Amadu Kunateh, niassetafsir.org/lesson/${lessonId}, accessed ${date}.`;
}
