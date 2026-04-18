'use client';
import { useState } from 'react';

interface AudioPanelProps {
  wolofPlaylistId: string;
  arabicPlaylistId: string;
  arabicAudioUrl: string | null;
  wolofAudioUrl?: string | null;
  sura: string;
}

type Tab = 'wolof' | 'arabic';

const IA_ITEM = 'Baye-tafsir';
const IA_URL = `https://archive.org/details/${IA_ITEM}`;

export default function AudioPanel({ wolofPlaylistId, arabicPlaylistId, arabicAudioUrl, wolofAudioUrl, sura }: AudioPanelProps) {
  const [tab, setTab] = useState<Tab>('wolof');

  return (
    <div>
      <div className="flex border-b border-white/10" dir="ltr">
        {(['wolof', 'arabic'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 font-english text-sm transition-all ${
              tab === t
                ? 'bg-yellow-900/20 text-yellow-200 border-b-2 border-yellow-400/60'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'wolof' ? 'Wolof Tafsīr' : 'Arabic Tafsīr'}
          </button>
        ))}
      </div>

      <div className="p-4" dir="ltr">
        {tab === 'wolof' && (
          <div>
            {wolofAudioUrl ? (
              /* Direct IA file — plays immediately */
              <div>
                <audio controls className="w-full rounded mb-2" style={{ accentColor: '#C9A84C' }}>
                  <source src={wolofAudioUrl} type="audio/ogg" />
                  <source src={wolofAudioUrl} type="audio/mpeg" />
                </audio>
                <div className="flex items-center justify-between">
                  <p className="font-english text-xs text-yellow-200/50">
                    Shaykh Ibrāhīm Niasse · Wolof Tafsīr · {sura}
                  </p>
                  <a href={IA_URL} target="_blank" rel="noopener"
                    className="font-english text-xs text-yellow-400/40 hover:text-yellow-400/70 transition-all">
                    More sessions ↗
                  </a>
                </div>
              </div>
            ) : (
              /* Full IA embed for sessions not yet individually mapped */
              <div>
                <iframe
                  src={`https://archive.org/embed/${IA_ITEM}`}
                  width="100%" height="150"
                  frameBorder="0" allowFullScreen loading="lazy"
                  className="rounded block"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="font-english text-xs text-yellow-200/50">
                    Shaykh Ibrāhīm Niasse · Wolof Tafsīr · {sura}
                  </p>
                  <a href={IA_URL} target="_blank" rel="noopener"
                    className="font-english text-xs text-yellow-400/50 hover:text-yellow-400/80 border border-yellow-400/20 hover:border-yellow-400/40 px-2 py-0.5 rounded-full transition-all">
                    Internet Archive ↗
                  </a>
                </div>
                <p className="font-english text-xs text-white/20 mt-1">
                  122 sessions available. Navigate to find the session for this lesson.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'arabic' && (
          <div>
            {arabicAudioUrl ? (
              <div>
                <audio controls className="w-full rounded mb-1" style={{ accentColor: '#C9A84C' }}>
                  <source src={arabicAudioUrl} type="audio/mpeg" />
                </audio>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-english text-xs text-white/30">{sura} · Arabic Tafsīr</p>
                  <a
                    href={arabicAudioUrl}
                    download
                    target="_blank"
                    rel="noopener"
                    className="font-english text-xs text-gold/50 hover:text-gold border border-gold/20 hover:border-gold/40 px-2 py-0.5 rounded transition-all"
                  >
                    ⬇ Download
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <iframe
                  src={`https://www.youtube.com/embed/videoseries?list=${arabicPlaylistId}`}
                  width="100%" height="110"
                  frameBorder="0" allowFullScreen loading="lazy"
                  className="rounded block"
                />
                <p className="font-english text-xs text-white/25 mt-2">{sura} · Arabic Tafsīr</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
