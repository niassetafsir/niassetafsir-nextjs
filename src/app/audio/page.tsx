'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

const IA_ITEM = 'Baye-tafsir';
const IA_BASE = `https://archive.org/download/${IA_ITEM}`;

// Arabic recordings from UploadThing
const ARABIC_AUDIO = [
  { num: 1, sura: 'Al-Fātiḥa', suraAr: 'الفاتحة', url: 'https://utfs.io/f/THPX9CeGNWHPACdXBreV93UpyHCMSiXGWm2Re56A7EPDQaYq' },
  { num: 2, sura: 'Al-Baqara', suraAr: 'البقرة', url: 'https://utfs.io/f/THPX9CeGNWHP8XTnZi1DwNtXcWkpMe1QlGT5bv4SIjuLdP0J' },
  { num: 3, sura: 'Āl ʿImrān', suraAr: 'آل عمران', url: 'https://utfs.io/f/THPX9CeGNWHPrXb9dfIQxpZ8KhVH5LnENzy2ObW1lfseMI0J' },
  { num: 4, sura: 'Al-Nisāʾ', suraAr: 'النساء', url: 'https://utfs.io/f/THPX9CeGNWHP9aJxlAfu0eHjkMoaC4hwRrJZEbPq257Im1Fi' },
  { num: 5, sura: 'Al-Māʾida', suraAr: 'المائدة', url: 'https://utfs.io/f/THPX9CeGNWHPKDQy3a7PCISGTWrmXiwpyEQtRnuAPY5lcBdb' },
  { num: 6, sura: 'Al-Anʿām', suraAr: 'الأنعام', url: 'https://utfs.io/f/THPX9CeGNWHPuOttgKN7bwk98PrHLdeUhZXnAvyqof0c63BC' },
  { num: 7, sura: 'Al-Aʿrāf', suraAr: 'الأعراف', url: 'https://utfs.io/f/THPX9CeGNWHPqHd0JyDeBWwAQPZRqHtG2SaJ0XOckK8gbf39' },
  { num: 8, sura: 'Al-Anfāl', suraAr: 'الأنفال', url: 'https://utfs.io/f/THPX9CeGNWHPiOmi9d5ahkVHD4egKRxSC1rQdyFuwfXiYAjN' },
  { num: 9, sura: 'Al-Tawba', suraAr: 'التوبة', url: 'https://utfs.io/f/THPX9CeGNWHPkcCunnvbF3V6zmOWPjqeixGRvKXYpcLS5gf9' },
  { num: 10, sura: 'Yūnus', suraAr: 'يونس', url: 'https://utfs.io/f/THPX9CeGNWHPGnKtoYm36D9dWMzsUBoFtCqSnOp1RTAYbfV0' },
  { num: 11, sura: 'Hūd', suraAr: 'هود', url: 'https://utfs.io/f/THPX9CeGNWHPtbbWoLQZad9F6SCrcz8BnOWVZ4DiU5IMNsvj' },
  { num: 12, sura: 'Yūsuf', suraAr: 'يوسف', url: 'https://utfs.io/f/THPX9CeGNWHPcBeuRHLhTriY8VXNf1OJD2LvmKC0qxHsQ96j' },
  { num: 13, sura: 'Al-Raʿd', suraAr: 'الرعد', url: 'https://utfs.io/f/THPX9CeGNWHPAe4nKbV93UpyHCMSiXGWm2Re56A7EPDQaYql' },
  { num: 14, sura: 'Ibrāhīm', suraAr: 'إبراهيم', url: 'https://utfs.io/f/THPX9CeGNWHPMLjQtT3vMIg7Ta2DO0P8jlkWoxJs4RVQzfeb' },
  { num: 15, sura: 'Al-Ḥijr', suraAr: 'الحجر', url: 'https://utfs.io/f/THPX9CeGNWHPlbVYS9X65sEDXxTQyridmz7KS8p1ONkUVYRv' },
  { num: 16, sura: 'Al-Naḥl', suraAr: 'النحل', url: 'https://utfs.io/f/THPX9CeGNWHPZDZ66oJu6BrCvZKh4UxkqDIlo8nJbfiR2Qaz' },
  { num: 17, sura: 'Al-Isrāʾ', suraAr: 'الإسراء', url: 'https://utfs.io/f/THPX9CeGNWHPqaQUlzDeBWwAQPZRqHtG2SaJ0XOckK8gbf39' },
  { num: 18, sura: 'Al-Kahf', suraAr: 'الكهف', url: 'https://utfs.io/f/THPX9CeGNWHPaU0ngjllkbgIHAdeWKjZNOi1rscqXhGwx6BE' },
];

const KHATM_URL = 'https://utfs.io/f/THPX9CeGNWHP3m1j6FH3ODvN1ErmqXxKoUcMVw0ufZBApQCW';

type Tab = 'arabic' | 'wolof';

export default function ListenPage() {
  const [tab, setTab] = useState<Tab>('arabic');
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});

  const handlePlay = (num: number) => {
    // Pause all others
    Object.entries(audioRefs.current).forEach(([key, el]) => {
      if (el && parseInt(key) !== num) { el.pause(); }
    });
    setPlaying(num);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">
          تسجيلات التفسير
        </div>
        <h1 className="font-english font-semibold text-lg mb-1"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          Listen to the Tafsīr
        </h1>
        <p className="font-english text-xs italic"
          style={{color:'var(--body-sub, rgba(255,255,255,0.45))'}}>
          Shaykh Ibrāhīm Niasse · Original recordings 1383 AH / 1964
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
        <button
          onClick={() => setTab('arabic')}
          className="flex-1 py-3 font-english text-sm font-semibold transition-all"
          style={{
            background: tab === 'arabic' ? '#6B2424' : 'transparent',
            color: tab === 'arabic' ? '#F5EDD6' : 'rgba(255,255,255,0.45)',
          }}>
          Arabic Tafsīr
        </button>
        <button
          onClick={() => setTab('wolof')}
          className="flex-1 py-3 font-english text-sm font-semibold transition-all"
          style={{
            background: tab === 'wolof' ? '#1A3A5C' : 'transparent',
            color: tab === 'wolof' ? '#E8F0F5' : 'rgba(255,255,255,0.45)',
          }}>
          Wolof Tafsīr
        </button>
      </div>

      {/* Arabic Tafsīr */}
      {tab === 'arabic' && (
        <div className="space-y-3">
          {ARABIC_AUDIO.map(item => (
            <div key={item.num}
              className="rounded-xl border px-4 py-3 transition-all"
              style={{
                borderColor: playing === item.num ? '#6B2424' : 'rgba(201,168,76,0.2)',
                background: playing === item.num ? 'rgba(107,36,36,0.08)' : 'transparent',
              }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-english text-sm font-bold"
                    style={{color: playing === item.num ? '#6B2424' : 'var(--body-text, rgba(255,255,255,0.9))'}}>
                    {item.sura}
                  </span>
                  <span className="font-english text-[10px] ml-2"
                    style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                    Sūra {item.num}
                  </span>
                </div>
                <span className="font-arabic text-sm" dir="rtl"
                  style={{color:'var(--body-sub, rgba(255,255,255,0.5))'}}>
                  {item.suraAr}
                </span>
              </div>
              <audio
                controls
                preload="none"
                className="w-full"
                style={{accentColor:'#C9A84C', height:'36px'}}
                onPlay={() => handlePlay(item.num)}
                ref={el => { audioRefs.current[item.num] = el; }}
              >
                <source src={item.url} type="audio/mpeg" />
              </audio>
            </div>
          ))}

          {/* Duʿāʾ Khatm */}
          <div className="rounded-xl border px-4 py-3 mt-4"
            style={{borderColor:'rgba(201,168,76,0.35)', background:'rgba(201,168,76,0.05)'}}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-english text-sm font-bold text-gold">
                Duʿāʾ Khatm al-Qurʾān
              </span>
              <span className="font-arabic text-sm text-gold" dir="rtl">دعاء الختم</span>
            </div>
            <p className="font-english text-xs italic mb-2"
              style={{color:'var(--body-faint, rgba(255,255,255,0.4))'}}>
              Supplication at the Completion of the Qurʾān
            </p>
            <audio controls preload="none" className="w-full" style={{accentColor:'#C9A84C', height:'36px'}}>
              <source src={KHATM_URL} type="audio/mpeg" />
            </audio>
          </div>

          <p className="font-english text-xs text-center italic mt-4"
            style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
            Sūras 19–114 · Recordings forthcoming
          </p>
        </div>
      )}

      {/* Wolof Tafsīr */}
      {tab === 'wolof' && (
        <div className="space-y-3">
          <div className="rounded-xl border px-5 py-5 text-center"
            style={{borderColor:'rgba(26,58,92,0.4)', background:'rgba(26,58,92,0.08)'}}>
            <div className="font-arabic text-xl mb-2" dir="rtl"
              style={{color:'#1A3A5C'}}>
              التفسير الولوفي
            </div>
            <p className="font-english text-sm font-semibold mb-1"
              style={{color:'var(--body-text, rgba(255,255,255,0.85))'}}>
              122 Sessions — Complete Wolof Commentary
            </p>
            <p className="font-english text-xs mb-4"
              style={{color:'var(--body-sub, rgba(255,255,255,0.45))'}}>
              Shaykh Ibrāhīm Niasse · Recorded in Medina Baye, Kaolack
            </p>
            <a
              href={`https://archive.org/details/${IA_ITEM}`}
              target="_blank" rel="noopener"
              className="inline-block font-english text-sm font-semibold px-6 py-2.5 rounded-full transition-all"
              style={{background:'#1A3A5C', color:'#E8F0F5'}}>
              Listen on Internet Archive ↗
            </a>
            <p className="font-english text-[10px] mt-3"
              style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
              Opens in a new tab · Free access · No account required
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
