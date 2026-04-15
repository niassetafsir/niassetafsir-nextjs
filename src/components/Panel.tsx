'use client';
import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface PanelProps {
  icon: string;
  titleAr: string;
  titleEn: string;
  children: ReactNode;
  defaultOpen?: boolean;
  iconColor?: string;
}

export default function Panel({ icon, titleAr, titleEn, children, defaultOpen = false, iconColor = 'text-blue-300' }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-lg mb-3 overflow-hidden">
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
        <ChevronDown
          size={16}
          className={`text-gold/50 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}
