'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AudioFile {
  sura: string;
  url: string;
  surahNum: number;
}

export default function AudioPage() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/audio_index.json').then(r => r.json()).then(d => setFiles(d));
  }, []);

  const tafsirFiles = files.filter(f => f.surahNum > 0).sort((a,b) => a.surahNum - b.surahNum);
  const khatm = files.find(f => f.surahNum === 0);

  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">
          تسجيلات التفسير العربي
        </h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.45)'}}>
          Arabic Tafsīr Audio — Shaykh Ibrāhīm Niasse
        </p>
        <p className="font-english text-xs mb-4" style={{color:'rgba(255,255,255,0.25)'}}>
          Original Arabic oral commentary recorded 1383 AH / 1964 · One file per sura
        </p>
        <Link href="/lesson/1" className="font-english text-xs text-gold/50 hover:text-gold border border-gold/20 hover:border-gold/40 px-3 py-1.5 rounded-lg transition-all">
          ← Return to Reading
        </Link>
      </div>

      {/* Khatm */}
      {khatm && (
        <div className="mb-6 border border-gold/30 rounded-xl p-5 bg-gold/5 text-center">
          <div className="font-arabic text-gold text-base font-bold mb-1" dir="rtl">دعاء ختم القرآن الكريم</div>
          <p className="font-english text-xs mb-3" style={{color:'rgba(255,255,255,0.4)'}}>
            Supplication at the Completion of the Qurʾān
          </p>
          <audio controls className="w-full mb-2" style={{accentColor:'#C9A84C'}} preload="none">
            <source src={khatm.url} type="audio/mpeg" />
          </audio>
          <a href={khatm.url} download target="_blank" rel="noopener"
            className="font-english text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1 rounded transition-all">
            ⬇ Download MP3
          </a>
        </div>
      )}

      {/* Tafsir files */}
      <div className="space-y-2">
        {tafsirFiles.map((f, i) => (
          <div key={i} className={`border rounded-xl p-4 transition-all ${
            playing === f.url ? 'border-gold/40 bg-gold/5' : 'border-white/10 hover:border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-english text-sm font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>{f.sura}</div>
                <div className="font-english text-xs" style={{color:'rgba(255,255,255,0.3)'}}>Arabic Tafsīr · Sura {f.surahNum}</div>
              </div>
              <a href={f.url} download target="_blank" rel="noopener"
                className="font-english text-xs text-gold/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
                ⬇ Download MP3
              </a>
            </div>
            <audio controls className="w-full" style={{accentColor:'#C9A84C'}} preload="none"
              onPlay={() => setPlaying(f.url)} onPause={() => setPlaying(null)}>
              <source src={f.url} type="audio/mpeg" />
            </audio>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-white/8 rounded-xl text-center">
        <p className="font-english text-xs" style={{color:'rgba(255,255,255,0.25)'}}>
          Audio files are hosted on UploadThing. Download for offline use.
          Wolof tafsīr (122 sessions) is available via{' '}
          <a href="https://archive.org/details/Baye-tafsir" target="_blank" rel="noopener"
            className="text-gold/40 hover:text-gold transition-colors">
            Internet Archive ↗
          </a>
        </p>
      </div>
    </main>
  );
}
