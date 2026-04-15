'use client';
import { useState } from 'react';

interface AudioPanelProps {
  wolofPlaylistId: string;
  arabicPlaylistId: string;
  arabicAudioUrl: string | null;
  sura: string;
}

type Tab = 'wolof' | 'arabic';

export default function AudioPanel({ wolofPlaylistId, arabicPlaylistId, arabicAudioUrl, sura }: AudioPanelProps) {
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
            🔊 {t === 'wolof' ? 'Wolof Tafsīr' : 'Arabic Tafsīr'}
          </button>
        ))}
      </div>

      <div className="p-4" dir="ltr">
        {tab === 'wolof' && (
          <div>
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=${wolofPlaylistId}`}
              width="100%" height="110"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media"
              allowFullScreen
              loading="lazy"
              className="rounded block"
            />
            <p className="font-english text-xs text-yellow-200/30 mt-2">
              {sura} · TAFSÎR DE BAYE NIASS (RTA) ·{' '}
              <a
                href={`https://www.youtube.com/playlist?list=${wolofPlaylistId}`}
                target="_blank" rel="noopener"
                className="text-yellow-400/40 hover:text-yellow-400/60"
              >
                Open full playlist ↗
              </a>
            </p>
          </div>
        )}

        {tab === 'arabic' && (
          <div>
            {arabicAudioUrl ? (
              <audio controls className="w-full rounded" style={{ accentColor: '#C9A84C' }}>
                <source src={arabicAudioUrl} type="audio/mpeg" />
              </audio>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/videoseries?list=${arabicPlaylistId}`}
                width="100%" height="110"
                frameBorder="0"
                allowFullScreen loading="lazy"
                className="rounded block"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
