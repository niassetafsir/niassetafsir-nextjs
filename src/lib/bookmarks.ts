// Bookmark storage using localStorage

export interface Bookmark {
  id: string;
  lessonId: number;
  lessonTitle: string;
  lessonTitleAr: string;
  arabicText: string;
  englishText?: string;
  timestamp: number;
}

const STORAGE_KEY = 'niassetafsir-bookmarks';

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addBookmark(bm: Omit<Bookmark, 'timestamp'>): void {
  const bookmarks = getBookmarks();
  if (bookmarks.find(b => b.id === bm.id)) return; // already bookmarked
  bookmarks.unshift({ ...bm, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().some(b => b.id === id);
}

export function exportBookmarks(): string {
  const bookmarks = getBookmarks();
  if (!bookmarks.length) return 'No bookmarks saved.';
  return bookmarks.map(b => {
    const date = new Date(b.timestamp).toLocaleDateString();
    return [
      `[${b.lessonTitle} — ${b.lessonTitleAr}]`,
      `Saved: ${date}`,
      ``,
      b.arabicText,
      b.englishText ? `\n${b.englishText}` : '',
      `\nhttps://niassetafsir.com/lesson/${b.lessonId}`,
      `\n${'─'.repeat(60)}`
    ].join('\n');
  }).join('\n\n');
}
