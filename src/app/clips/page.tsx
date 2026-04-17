'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClips, removeClip, exportClips, type Clip } from '@/lib/clips';

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { setClips(getClips()); }, []);

  const remove = (id: string) => { removeClip(id); setClips(getClips()); };

  const copy = (text: string, citation: string, id: string) => {
    navigator.clipboard?.writeText(`${text}\n\n${citation}`).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const exportAll = () => {
    const text = exportClips();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'niassetafsir-research-clips.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-arabic text-gold text-2xl font-bold" dir="rtl">مقاطع البحث</h1>
          <p className="font-english text-white/50 text-sm mt-1">Research Clips — saved passages with citations</p>
        </div>
        {clips.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard?.writeText(exportClips()); }}
              className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1.5 rounded-lg transition-all">
              Copy all
            </button>
            <button onClick={exportAll}
              className="font-english text-xs text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-1.5 rounded-lg transition-all">
              Export .txt
            </button>
          </div>
        )}
      </div>

      {clips.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-3xl mb-4 opacity-30">📎</div>
          <p className="font-english text-white/30 italic text-sm">No research clips saved yet.</p>
          <p className="font-english text-white/20 text-xs mt-2 max-w-sm mx-auto">
            Select any Arabic or English text in a lesson to save it here with an auto-generated  citation.
          </p>
          <Link href="/lesson/1" className="inline-block mt-6 font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 rounded-lg transition-all">
            Start Reading →
          </Link>
        </div>
      ) : (
        <>
          <p className="font-english text-white/30 text-xs mb-4">{clips.length} saved passage{clips.length !== 1 ? 's' : ''}</p>
          <div className="space-y-4">
            {clips.map(clip => (
              <div key={clip.id} className="border border-gold/15 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Link href={`/lesson/${clip.lessonId}`} className="font-arabic text-gold text-sm font-bold hover:text-gold-light" dir="rtl">
                      {clip.lessonTitleAr}
                    </Link>
                    <span className="font-english text-white/30 text-xs mx-2">·</span>
                    <span className="font-english text-white/45 text-xs italic">{clip.lessonTitleEn}</span>
                    <span className="ml-2 font-english text-xs border px-1.5 py-0.5 rounded border-white/15 text-white/30">
                      {clip.language === 'ar' ? 'عربي' : 'EN'}
                    </span>
                  </div>
                  <button onClick={() => remove(clip.id)} className="text-white/20 hover:text-red-400/60 text-xs flex-shrink-0" title="Remove">✕</button>
                </div>

                <p className={`text-sm leading-7 mb-3 ${clip.language === 'ar' ? 'font-arabic text-text-main text-right' : 'font-english text-white/75 italic'}`}
                  dir={clip.language === 'ar' ? 'rtl' : 'ltr'}>
                  {clip.text}
                </p>

                <div className="bg-white/3 rounded-lg p-3 mb-3">
                  <p className="font-english text-xs text-white/40 uppercase tracking-widest mb-1"> Citation</p>
                  <p className="font-english text-xs text-white/65 leading-5">{clip.citation}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-english text-white/20 text-xs">{new Date(clip.timestamp).toLocaleDateString()}</span>
                  <button
                    onClick={() => copy(clip.text, clip.citation, clip.id)}
                    className={`font-english text-xs border px-3 py-1 rounded-full transition-all ${
                      copied === clip.id
                        ? 'border-gold/50 text-gold bg-gold/10'
                        : 'border-gold/20 text-white/50 hover:border-gold/50 hover:text-gold'
                    }`}
                  >
                    {copied === clip.id ? '✓ Copied' : 'Copy with citation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
