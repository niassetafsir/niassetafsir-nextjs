'use client';
import { useState, useEffect } from 'react';
import { addBookmark, removeBookmark, isBookmarked, type Bookmark } from '@/lib/bookmarks';

interface BookmarkButtonProps {
  id: string;
  lessonId: number;
  lessonTitle: string;
  lessonTitleAr: string;
  arabicText: string;
  englishText?: string;
}

export default function BookmarkButton({ id, lessonId, lessonTitle, lessonTitleAr, arabicText, englishText }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(id));
  }, [id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeBookmark(id);
      setSaved(false);
    } else {
      addBookmark({ id, lessonId, lessonTitle, lessonTitleAr, arabicText, englishText });
      setSaved(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    }
  };

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove bookmark' : 'Bookmark this passage'}
      className={`ml-2 text-sm transition-all flex-shrink-0 ${
        flash ? 'scale-125' : 'scale-100'
      } ${
        saved ? 'text-gold' : 'text-white/20 hover:text-gold/60'
      }`}
    >
      saved ? 'Saved' : 'Bookmark'
    </button>
  );
}
