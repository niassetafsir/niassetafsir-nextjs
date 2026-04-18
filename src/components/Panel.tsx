'use client';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
// Inline citation helpers (avoids server-component import issues)
const LESSON_VOLUME: Record<number, {vol:number;page:number|null}> = {
  1:{vol:1,page:29},
  2:{vol:1,page:54},
  3:{vol:1,page:59},
  4:{vol:1,page:72},
  5:{vol:1,page:96},
  6:{vol:1,page:120},
  7:{vol:2,page:3},
  8:{vol:2,page:34},
  9:{vol:2,page:46},
  10:{vol:2,page:79},
  11:{vol:2,page:124},
  12:{vol:2,page:161},
  13:{vol:3,page:3},
  14:{vol:3,page:33},
  15:{vol:3,page:49},
  16:{vol:3,page:112},
  17:{vol:3,page:122},
  18:{vol:3,page:159},
  19:{vol:3,page:191},
  20:{vol:4,page:3},
  21:{vol:4,page:44},
  22:{vol:4,page:86},
  23:{vol:4,page:129},
  24:{vol:4,page:165},
  25:{vol:4,page:196},
  26:{vol:5,page:3},
  27:{vol:5,page:39},
  28:{vol:5,page:70},
  29:{vol:5,page:100},
  30:{vol:5,page:144},
};
function inlineBuildCitation(lessonId:number,titleEn:string,vrange:string):string{
  const vd=LESSON_VOLUME[lessonId];
  const volStr=vd?(', vol. '+vd.vol+(vd.page?', p. '+vd.page:'')):'';
  const date=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  return 'Ibrāhīm Niasse, Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, comp. Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed. (n.p., n.d.)'+volStr+', '+titleEn+' ('+vrange+'). Digital ed., ed. Amadu Kunateh. niassetafsir.org. Accessed '+date+'.';
}
function inlineSaveClip(text:string,lessonId:number,titleAr:string,titleEn:string,vrange:string,citation:string){
  if(typeof window==='undefined')return;
  const KEY='niassetafsir-clips';
  const clips=JSON.parse(localStorage.getItem(KEY)||'[]');
  clips.unshift({id:'clip-'+Date.now(),text,language:'ar',lessonId,lessonTitleAr:titleAr,lessonTitleEn:titleEn,verseRange:vrange,citation,timestamp:Date.now()});
  localStorage.setItem(KEY,JSON.stringify(clips));
}

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
    const citation = inlineBuildCitation(lessonId, lessonTitleEn || '', verseRange || '');
    inlineSaveClip('[Commentary on Q.'+verse+']', lessonId!, titleAr, lessonTitleEn||'', verseRange||'', citation);
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
            {cited ? '✓ Cited' : 'Cite this commentary'}
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
