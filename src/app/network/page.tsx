'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ScholarNode {
  id: string; name: string; nameAr: string;
  dates: string; tradition: string;
  role: 'body' | 'footnotes' | 'both'; citations: number; bio: string;
}

interface NetworkData {
  center: { id:string; name:string; nameAr:string; dates:string; tradition:string; bio:string };
  nodes: ScholarNode[];
}

const ROLE_COLOUR: Record<string, string> = {
  body: '#6B2424', footnotes: '#1A3A5C', both: '#1E5A4A'
};
const ROLE_LABEL: Record<string, string> = {
  body: 'Cited in body text', footnotes: 'Cited in apparatus', both: 'Cited in both'
};

export default function NetworkPage() {
  const [data, setData] = useState<NetworkData | null>(null);
  const [selected, setSelected] = useState<ScholarNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'body' | 'footnotes' | 'both'>('all');

  useEffect(() => {
    fetch('/data/scholar_network.json').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center font-english" style={{color:'rgba(255,255,255,0.4)'}}>Loading…</div>;

  const filtered = data.nodes.filter(n => filter === 'all' || n.role === filter)
    .sort((a, b) => b.citations - a.citations);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-6">
        <Link href="/research" className="font-english text-xs mb-4 inline-flex items-center gap-1"
          style={{color:'rgba(255,255,255,0.35)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Research
        </Link>
        <h1 className="font-english text-xl font-semibold mb-1"
          style={{color:'rgba(255,255,255,0.9)'}}>
          Scholarly Network
        </h1>
        <p className="font-english text-sm italic"
          style={{color:'rgba(255,255,255,0.45)'}}>
          Scholars cited across Fī Riyāḍ al-Tafsīr — body text and critical apparatus
        </p>
      </div>

      {/* Centre node */}
      <div className="rounded-2xl border mb-6 p-5"
        style={{borderColor:'rgba(201,168,76,0.4)', background:'rgba(201,168,76,0.06)'}}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="font-english text-xs uppercase tracking-widest mb-1"
              style={{color:'rgba(201,168,76,0.6)'}}>Centre of the network</p>
            <h2 className="font-english text-lg font-bold mb-0.5"
              style={{color:'rgba(255,255,255,0.95)'}}>
              {data.center.name}
            </h2>
            <p className="font-english text-xs mb-3" style={{color:'rgba(201,168,76,0.6)'}}>
              {data.center.dates} · {data.center.tradition}
            </p>
            <p className="font-english text-sm leading-6"
              style={{color:'rgba(255,255,255,0.6)'}}>
              {data.center.bio}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-arabic text-xl" dir="rtl" style={{color:'rgba(201,168,76,0.7)'}}>
              {data.center.nameAr}
            </p>
          </div>
        </div>
      </div>

      {/* Legend + filter */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {(['all','body','footnotes','both'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-english text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: filter === f ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.15)',
                background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: filter === f ? 'rgba(201,168,76,0.9)' : 'rgba(255,255,255,0.45)',
              }}>
              {f === 'all' ? `All (${data.nodes.length})` :
               f === 'body' ? 'Body text' :
               f === 'footnotes' ? 'Apparatus' : 'Both'}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-xs font-english">
          {Object.entries(ROLE_COLOUR).map(([role, color]) => (
            <span key={role} className="flex items-center gap-1.5"
              style={{color:'rgba(255,255,255,0.4)'}}>
              <span style={{width:'8px',height:'8px',borderRadius:'50%',background:color,display:'inline-block'}}/>
              {ROLE_LABEL[role].split(' ')[1]}
            </span>
          ))}
        </div>
      </div>

      {/* Scholar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(node => (
          <button key={node.id} onClick={() => setSelected(selected?.id === node.id ? null : node)}
            className="text-left rounded-xl border p-4 transition-all"
            style={{
              borderColor: selected?.id === node.id
                ? ROLE_COLOUR[node.role] + '80'
                : 'rgba(255,255,255,0.08)',
              background: selected?.id === node.id
                ? ROLE_COLOUR[node.role] + '12'
                : 'transparent',
            }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-english text-sm font-semibold"
                style={{color:'rgba(255,255,255,0.9)'}}>
                {node.name}
              </span>
              <span className="font-english text-[10px] px-1.5 py-0.5 rounded shrink-0"
                style={{background: ROLE_COLOUR[node.role] + '25', color: ROLE_COLOUR[node.role]}}>
                {node.citations}×
              </span>
            </div>
            <p className="font-english text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
              {node.dates} · {node.tradition}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span style={{width:'6px',height:'6px',borderRadius:'50%',
                background:ROLE_COLOUR[node.role],display:'inline-block'}}/>
              <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                {ROLE_LABEL[node.role]}
              </span>
            </div>

            {/* Expanded bio */}
            {selected?.id === node.id && (
              <div className="mt-3 pt-3 border-t" style={{borderColor:'rgba(255,255,255,0.08)'}}>
                <p className="font-arabic text-sm mb-2" dir="rtl"
                  style={{color:'rgba(255,255,255,0.6)'}}>
                  {node.nameAr}
                </p>
                <p className="font-english text-xs leading-5"
                  style={{color:'rgba(255,255,255,0.55)'}}>
                  {node.bio}
                </p>
                <Link href={`/scholars?q=${encodeURIComponent(node.name)}`}
                  className="font-english text-[10px] mt-2 inline-block hover:text-gold transition-colors"
                  style={{color:'rgba(201,168,76,0.5)'}}>
                  See all citations in Scholar Index →
                </Link>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t pt-6" style={{borderColor:'rgba(201,168,76,0.12)'}}>
        <p className="font-english text-xs text-center" style={{color:'rgba(255,255,255,0.3)'}}>
          {data.nodes.length} scholars identified · {data.nodes.reduce((a,n) => a + n.citations, 0)} total citations ·
          Lessons 1–30 · Volumes 1–5
        </p>
        <p className="font-english text-xs text-center italic mt-1" style={{color:'rgba(255,255,255,0.2)'}}>
          Network expands as Volumes 6–10 are digitised
        </p>
      </div>
    </main>
  );
}
