'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookmarks, removeBookmark, exportBookmarks, type Bookmark } from '@/lib/bookmarks';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const remove = (id: string) => {
    removeBookmark(id);
    setBookmarks(getBookmarks());
  };

  const exportTxt = () => {
    const text = exportBookmarks();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'niassetafsir-bookmarks.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    navigator.clipboard?.writeText(exportBookmarks());
  };

  return (
    <main className="max-w-4xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-arabic text-gold text-2xl font-bold" dir="rtl">المحفوظات</h1>
          <p className="font-english text-white/50 text-sm mt-1">Saved passages</p>
        </div>
        {bookmarks.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={copyAll}
              className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1.5 rounded-lg transition-all"
            >
              Copy all
            </button>
            <button
              onClick={exportTxt}
              className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1.5 rounded-lg transition-all"
            >
              Export .txt
            </button>
          </div>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          
          <p className="font-english text-white/30 italic text-sm">No bookmarks yet.</p>
          <p className="font-english text-white/20 text-xs mt-2">
            Tap the bookmark icon on any passage to save it here.
          </p>
          <Link href="/lesson/1" className="inline-block mt-6 font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
            Start Reading →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-english text-white/30 text-xs">{bookmarks.length} saved passage{bookmarks.length !== 1 ? 's' : ''}</p>
          {bookmarks.map(bm => (
            <div key={bm.id} className="border border-gold/15 rounded-xl p-4 group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <Link href={`/lesson/${bm.lessonId}`} className="font-arabic text-gold text-sm font-bold hover:text-gold-light transition-colors" dir="rtl">
                    {bm.lessonTitleAr}
                  </Link>
                  <span className="font-english text-white/40 text-xs mx-2">·</span>
                  <span className="font-english text-white/50 text-xs italic">{bm.lessonTitle}</span>
                </div>
                <button
                  onClick={() => remove(bm.id)}
                  className="text-white/20 hover:text-red-400/60 text-xs transition-colors flex-shrink-0"
                  title="Remove bookmark"
                >
                  ✕
                </button>
              </div>
              <p className="font-arabic text-text-main text-sm leading-7 mb-2" dir="rtl">
                {bm.arabicText}
              </p>
              {bm.englishText && (
                <p className="font-english text-white/60 text-sm leading-6 italic border-l-2 border-gold/20 pl-3">
                  {bm.englishText}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="font-english text-white/20 text-xs">
                  {new Date(bm.timestamp).toLocaleDateString()}
                </span>
                <Link href={`/lesson/${bm.lessonId}`} className="font-english text-xs text-gold/40 hover:text-gold/70 transition-colors">
                  Open lesson →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
