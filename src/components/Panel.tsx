'use client';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { buildCitation } from '@/lib/clips';
import { saveClip } from '@/lib/clips';

interface PanelProps {
  icon: string;
  titleAr: string;
  titleEn: string;
  children: ReactNode;
  defaultOpen?: boolean;
  iconColor?: string;
  panelId?: string;
  lessonId?: number;
  lessonTitleEn?: string;
  verseRange?: string;
}

export default function Panel({ icon, titleAr, titleEn, children, defaultOpen = false, panelId, lessonId, lessonTitleEn, verseRange }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [verse, setVerse] = useState<string | null>(null);
  const [cited, setCited] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!panelId || scrolled.current) return;
    const params = new URLSearchParams(window.location.search);
    const targetPanel = params.get('panel');
    const targetVerse = params.get('verse');
    if (targetPanel === panelId) {
      scrolled.current = true;
      setOpen(true);
      if (targetVerse) setVerse(decodeURIComponent(targetVerse));
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [panelId]);

  const handleCite = () => {
    if (!lessonId || !lessonTitleEn || !verseRange) return;
    const citation = buildCitation(lessonId, lessonTitleEn, verseRange, 'en');
    saveClip({
      text: `[Commentary on Q.${verse}]`,
      language: 'en',
      lessonId,
      lessonTitleAr: titleAr,
      lessonTitleEn: lessonTitleEn,
      verseRange,
      citation,
    });
    setCited(true);
    setTimeout(() => setCited(false), 2000);
  };

  return (
    <div ref={ref} className="border border-white/10 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="text-lg flex-shrink-0">{icon}</span>
        <span className="flex-1 font-english text-sm text-white/80">
          <span className="font-arabic text-gold" dir="rtl">{titleAr}</span>
          <span className="text-white/40 mx-2">·</span>
          <span>{titleEn}</span>
        </span>
        {verse && open && (
          <span className="font-english text-[10px] text-gold/60 border border-gold/25 px-1.5 py-0.5 rounded mr-1">
            Q.{verse}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-gold/50 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Verse context bar — shown when arriving from concordance */}
      {open && verse && (
        <div className="flex items-center justify-between px-4 py-2 bg-gold/8 border-b border-gold/15">
          <span className="font-english text-xs text-gold/70">
            Arrived from concordance · Q.{verse}
          </span>
          <button
            onPointerDown={handleCite}
            className="font-english text-xs text-white/60 hover:text-gold border border-white/15 hover:border-gold/40 px-2.5 py-1 rounded transition-colors"
          >
            {cited ? '✓ Cited' : '📎 Cite this commentary'}
          </button>
        </div>
      )}

      {open && (
        <div className="border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}
