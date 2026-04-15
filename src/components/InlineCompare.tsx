'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface InlineCompareProps {
  jalalaynText?: string;
  usulaiUrl?: string;
  verseRef?: string;
}

export default function InlineCompare({ jalalaynText, usulaiUrl, verseRef }: InlineCompareProps) {
  const [jalOpen, setJalOpen] = useState(false);
  const [rabOpen, setRabOpen] = useState(false);

  if (!jalalaynText && !usulaiUrl) return null;

  return (
    <div className="my-4 ml-4 space-y-2 border-l-2 border-white/10 pl-4">
      {jalalaynText && (
        <div className="rounded-lg overflow-hidden border border-blue-900/30 bg-blue-950/20">
          <button
            onClick={() => setJalOpen(!jalOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-900/20 transition-colors"
          >
            <span className="text-sm">📖</span>
            <span className="font-english text-xs text-blue-300/80 flex-1" dir="ltr">
              <span className="font-arabic text-blue-300/70" dir="rtl">تفسير الجلالين</span>
              {verseRef && <span className="text-blue-300/40 ml-2">· {verseRef}</span>}
            </span>
            <ChevronDown size={12} className={`text-blue-400/40 transition-transform ${jalOpen ? 'rotate-180' : ''}`} />
          </button>
          {jalOpen && (
            <div className="px-4 py-3 border-t border-blue-900/20 font-english text-xs text-blue-100/70 leading-6 whitespace-pre-wrap" dir="ltr">
              {jalalaynText}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-green-900/30 bg-green-950/20">
        <button
          onClick={() => setRabOpen(!rabOpen)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-green-900/20 transition-colors"
        >
          <span className="text-sm">📗</span>
          <span className="font-english text-xs text-green-300/80 flex-1" dir="ltr">
            <span className="font-arabic text-green-300/70" dir="rtl">رُوحُ الْبَيَانِ</span>
            {verseRef && <span className="text-green-300/40 ml-2">· {verseRef}</span>}
          </span>
          <ChevronDown size={12} className={`text-green-400/40 transition-transform ${rabOpen ? 'rotate-180' : ''}`} />
        </button>
        {rabOpen && (
          <div className="px-4 py-3 border-t border-green-900/20" dir="ltr">
            <a
              href={usulaiUrl || 'https://usul.ai/t/ruh-bayan'}
              target="_blank" rel="noopener"
              className="font-english text-xs text-green-400/70 hover:text-green-400 underline"
            >
              Open on Usul.ai ↗
            </a>
            <p className="font-english text-xs text-green-100/30 mt-1 italic">
              Full Arabic text of Rūḥ al-Bayān available at Usul.ai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
