'use client';
import { useState, useRef } from 'react';

// Sūrah number → audio URL (from audio_index.json)
const AUDIO_MAP: Record<number, { url: string; sura: string }> = {
  1:  { sura: 'Al-Fātiḥa',  url: 'https://utfs.io/f/THPX9CeGNWHPACdXBreV93UpyHCMSiXGWm2Re56A7EPDQaYq' },
  2:  { sura: 'Al-Baqara',  url: 'https://utfs.io/f/THPX9CeGNWHP8XTnZi1DwNtXcWkpMe1QlGT5bv4SIjuLdP0J' },
  3:  { sura: 'Āl ʿImrān',  url: 'https://utfs.io/f/THPX9CeGNWHPrXb9dfIQxpZ8KhVH5LnENzy2ObW1lfseMI0J' },
  4:  { sura: 'Al-Nisāʾ',   url: 'https://utfs.io/f/THPX9CeGNWHP9aJxlAfu0eHjkMoaC4hwRrJZEbPq257Im1Fi' },
  5:  { sura: 'Al-Māʾida',  url: 'https://utfs.io/f/THPX9CeGNWHPKDQy3a7PCISGTWrmXiwpyEQtRnuAPY5lcBdb' },
  6:  { sura: 'Al-Anʿām',   url: 'https://utfs.io/f/THPX9CeGNWHPuOttgKN7bwk98PrHLdeUhZXnAvyqof0c63BC' },
  7:  { sura: 'Al-Aʿrāf',   url: 'https://utfs.io/f/THPX9CeGNWHPqHd0JyDeBWwAQPZRqHtG2SaJ0XOckK8gbf39' },
  8:  { sura: 'Al-Anfāl',   url: 'https://utfs.io/f/THPX9CeGNWHPiOmi9d5ahkVHD4egKRxSC1rQdyFuwfXiYAjN' },
  9:  { sura: 'Al-Tawba',   url: 'https://utfs.io/f/THPX9CeGNWHPkcCunnvbF3V6zmOWPjqeixGRvKXYpcLS5gf9' },
  10: { sura: 'Yūnus',      url: 'https://utfs.io/f/THPX9CeGNWHPGnKtoYm36D9dWMzsUBoFtCqSnOp1RTAYbfV0' },
  11: { sura: 'Hūd',        url: 'https://utfs.io/f/THPX9CeGNWHPtbbWoLQZad9F6SCrcz8BnOWVZ4DiU5IMNsvj' },
  12: { sura: 'Yūsuf',      url: 'https://utfs.io/f/THPX9CeGNWHPcBeuRHLhTriY8VXNf1OJD2LvmKC0qxHsQ96j' },
  13: { sura: 'Al-Raʿd',    url: 'https://utfs.io/f/THPX9CeGNWHPAe4nKbV93UpyHCMSiXGWm2Re56A7EPDQaYql' },
  14: { sura: 'Ibrāhīm',    url: 'https://utfs.io/f/THPX9CeGNWHPMLjQtT3vMIg7Ta2DO0P8jlkWoxJs4RVQzfeb' },
  15: { sura: 'Al-Ḥijr',    url: 'https://utfs.io/f/THPX9CeGNWHPlbVYS9X65sEDXxTQyridmz7KS8p1ONkUVYRv' },
  16: { sura: 'Al-Naḥl',    url: 'https://utfs.io/f/THPX9CeGNWHPZDZ66oJu6BrCvZKh4UxkqDIlo8nJbfiR2Qaz' },
  17: { sura: 'Al-Isrāʾ',   url: 'https://utfs.io/f/THPX9CeGNWHPqaQUlzDeBWwAQPZRqHtG2SaJ0XOckK8gbf39' },
  18: { sura: 'Al-Kahf',    url: 'https://utfs.io/f/THPX9CeGNWHPaU0ngjllkbgIHAdeWKjZNOi1rscqXhGwx6BE' },
};

// Lesson → primary sūrah number
const LESSON_SURA: Record<number, number> = {
  1:1, 2:2, 3:2, 4:2, 5:2, 6:2, 7:2, 8:3, 9:3, 10:3,
  11:4, 12:4, 13:4, 14:5, 15:5, 16:6, 17:6, 18:7, 19:7,
  20:7, 21:8, 22:9, 23:9, 24:10, 25:11, 26:11, 27:12,
  28:13, 29:15, 30:16,
};

interface LessonAudioBarProps {
  lessonId: number;
}

export default function LessonAudioBar({ lessonId }: LessonAudioBarProps) {
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const suraNum = LESSON_SURA[lessonId];
  const audio = suraNum ? AUDIO_MAP[suraNum] : null;

  if (!audio) {
    return (
      <div className="flex items-center justify-between px-4 py-2 text-xs font-english"
        style={{
          borderBottom: '1px solid rgba(201,168,76,0.12)',
          color: 'var(--body-faint, rgba(255,255,255,0.25))',
        }}>
        <span>Audio for this lesson forthcoming</span>
      </div>
    );
  }

  return (
    <div style={{borderBottom: '1px solid rgba(201,168,76,0.12)'}}>
      {/* Toggle row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 transition-all font-english text-xs"
        style={{
          color: expanded ? 'rgba(201,168,76,0.9)' : 'var(--body-faint, rgba(255,255,255,0.35))',
          background: expanded ? 'rgba(201,168,76,0.05)' : 'transparent',
          textAlign: 'left',
        }}
      >
        <span className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          {expanded ? `Listening · Sūrat ${audio.sura}` : 'Listen while reading'}
        </span>
        <span style={{fontSize:'10px'}}>{expanded ? '▲ Close' : '▾ Open'}</span>
      </button>

      {/* Expanded player */}
      {expanded && (
        <div className="px-4 pb-3 pt-1">
          <p className="font-english text-[10px] mb-1.5"
            style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
            Shaykh Ibrāhīm Niasse · Arabic Tafsīr · Sūrat {audio.sura}
          </p>
          <audio
            ref={audioRef}
            controls
            preload="none"
            className="w-full"
            style={{accentColor:'#C9A84C', height:'36px'}}
          >
            <source src={audio.url} type="audio/mpeg" />
          </audio>
        </div>
      )}
    </div>
  );
}
