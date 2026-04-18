'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GraphNode {
  id: string;
  arabic: string;
  tier: number;
  category: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relation: string;
  note: string;
  source: string;
  confirmed: boolean;
}

interface Hierarchy {
  name: string;
  arabic: string;
  levels: string[];
  source: string;
  confirmed: boolean;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hierarchies: Hierarchy[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'doctrine':    'border-amber-500/60 text-amber-200 bg-amber-500/10',
  'state':       'border-purple-500/60 text-purple-200 bg-purple-500/10',
  'practice':    'border-green-500/60 text-green-200 bg-green-500/10',
  'faculty':     'border-blue-500/60 text-blue-200 bg-blue-500/10',
  'metaphysics': 'border-gold/60 text-gold bg-gold/10',
};

const RELATION_LABELS: Record<string, string> = {
  'completed-by':        'completed by',
  'is-superior-to':      'is superior to',
  'is-spirit-of':        'is the spirit of',
  'produces':            'produces',
  'is-method-of':        'is the method of',
  'is-first-instance-of':'is the first instance of',
  'traverses':           'traverses',
  'leads-to':            'leads to',
  'presupposes':         'presupposes',
  'PENDING':             'relation pending',
};

export default function GlossaryMapPage() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    fetch('/data/glossary_graph.json').then(r => r.json()).then(setGraph);
  }, []);

  if (!graph) return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-center">
      <p className="font-english animate-pulse" style={{color:'rgba(255,255,255,0.3)'}}>Loading…</p>
    </main>
  );

  const activeNode = graph.nodes.find(n => n.id === active);
  const relatedEdges = active ? graph.edges.filter(e => 
    (e.from === active || e.to === active) && (showPending || e.confirmed)
  ) : [];

  const visibleEdges = graph.edges.filter(e => showPending || e.confirmed);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-gold text-2xl font-bold mb-1" dir="rtl">خريطة المصطلحات</h1>
        <p className="font-english text-sm mb-1" style={{color:'rgba(255,255,255,0.45)'}}>
          Theological Vocabulary Map
        </p>
        <p className="font-english text-xs mb-4" style={{color:'rgba(255,255,255,0.25)'}}>
          A knowledge graph of how Niasse deploys and connects theological vocabulary in <em>Fī Riyāḍ al-Tafsīr</em>
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
            <span key={cat} className={`font-english text-[11px] px-2 py-0.5 rounded border capitalize ${cls}`}>
              {cat}
            </span>
          ))}
          <label className="font-english text-[11px] text-white/30 flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showPending} onChange={e => setShowPending(e.target.checked)}
              className="w-3 h-3" />
            Show pending relations
          </label>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Node grid */}
        <div className="flex-1">
          {/* Hierarchies */}
          <div className="mb-6">
            <p className="font-english text-xs font-semibold mb-3" style={{color:'rgba(255,255,255,0.4)'}}>
              CONFIRMED HIERARCHIES FROM NIASSE'S TEXT
            </p>
            <div className="space-y-3">
              {graph.hierarchies.filter(h => h.confirmed).map((h, i) => (
                <div key={i} className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-english text-sm font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>{h.name}</span>
                    <span className="font-arabic text-xs" dir="rtl" style={{color:'rgba(255,255,255,0.4)'}}>{h.arabic}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {h.levels.map((level, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <button onClick={() => setActive(active === level ? null : level)}
                          className={`font-english text-xs px-2 py-0.5 rounded border transition-all ${
                            active === level ? 'border-gold/60 text-gold bg-gold/10' : 'border-white/15 text-white/60 hover:border-white/30'
                          }`}>
                          {level}
                        </button>
                        {j < h.levels.length - 1 && (
                          <span style={{color:'rgba(255,255,255,0.2)', fontSize:'10px'}}>›</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="font-english text-[10px] mt-1.5 italic" style={{color:'rgba(255,255,255,0.25)'}}>
                    Source: {h.source}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* All nodes */}
          <p className="font-english text-xs font-semibold mb-3" style={{color:'rgba(255,255,255,0.4)'}}>
            ALL TERMS — click to see connections
          </p>
          <div className="flex flex-wrap gap-2">
            {graph.nodes.map(node => {
              const catColor = CATEGORY_COLORS[node.category] || 'border-white/15 text-white/60';
              const edgeCount = visibleEdges.filter(e => e.from === node.id || e.to === node.id).length;
              return (
                <button key={node.id}
                  onClick={() => setActive(active === node.id ? null : node.id)}
                  className={`border rounded-lg px-3 py-1.5 transition-all text-left ${
                    active === node.id ? catColor + ' border-opacity-100' : 'border-white/10 hover:border-white/25 text-white/65'
                  }`}>
                  <div className="font-english text-xs font-semibold">{node.id}</div>
                  <div className="font-arabic text-[11px]" dir="rtl" style={{color:'rgba(255,255,255,0.4)'}}>{node.arabic}</div>
                  {edgeCount > 0 && (
                    <div className="font-english text-[9px] mt-0.5" style={{color:'rgba(255,255,255,0.25)'}}>
                      {edgeCount} connection{edgeCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* All edges list */}
          <div className="mt-6">
            <p className="font-english text-xs font-semibold mb-3" style={{color:'rgba(255,255,255,0.4)'}}>
              CONNECTIONS ({visibleEdges.filter(e => e.confirmed).length} confirmed · {graph.edges.filter(e => !e.confirmed).length} pending)
            </p>
            <div className="space-y-1.5">
              {visibleEdges.map((edge, i) => (
                <div key={i} className={`border rounded-lg px-3 py-2 ${
                  edge.confirmed ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setActive(edge.from)}
                      className="font-english text-xs text-gold/70 hover:text-gold transition-colors font-semibold">
                      {edge.from}
                    </button>
                    <span className="font-english text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>
                      {RELATION_LABELS[edge.relation] || edge.relation}
                    </span>
                    <button onClick={() => setActive(edge.to)}
                      className="font-english text-xs text-gold/70 hover:text-gold transition-colors font-semibold">
                      {edge.to}
                    </button>
                    {!edge.confirmed && <span className="font-english text-[9px] text-amber-400/50">[pending]</span>}
                  </div>
                  <p className="font-english text-[10px] mt-0.5 italic" style={{color:'rgba(255,255,255,0.25)'}}>
                    {edge.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active node panel */}
        {active && activeNode && (
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className={`rounded-xl border p-4 mb-3 ${CATEGORY_COLORS[activeNode.category]}`}>
                <div className="font-english text-sm font-semibold">{activeNode.id}</div>
                <div className="font-arabic text-base mt-0.5" dir="rtl">{activeNode.arabic}</div>
                <div className="font-english text-[10px] mt-1 capitalize opacity-60">{activeNode.category}</div>
              </div>
              {relatedEdges.length > 0 ? (
                <div className="space-y-2">
                  {relatedEdges.map((e, i) => {
                    const isFrom = e.from === active;
                    const other = isFrom ? e.to : e.from;
                    const relLabel = isFrom
                      ? (RELATION_LABELS[e.relation] || e.relation)
                      : `← ${RELATION_LABELS[e.relation] || e.relation}`;
                    return (
                      <div key={i} className="border border-white/10 rounded-lg p-2.5">
                        <div className="font-english text-[10px] mb-1" style={{color:'rgba(255,255,255,0.35)'}}>
                          {relLabel}
                        </div>
                        <button onClick={() => setActive(other)}
                          className="font-english text-xs text-gold/70 hover:text-gold font-semibold transition-colors">
                          {other}
                        </button>
                        {!e.confirmed && <span className="font-english text-[9px] text-amber-400/50 ml-2">[pending]</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-english text-xs italic" style={{color:'rgba(255,255,255,0.25)'}}>
                  No confirmed connections yet
                </p>
              )}
              <div className="mt-3">
                <Link href={`/glossary#${activeNode.id}`}
                  className="font-english text-xs text-gold/50 hover:text-gold transition-colors">
                  See in Glossary →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 border border-white/8 rounded-xl">
        <p className="font-english text-xs" style={{color:'rgba(255,255,255,0.3)'}}>
          <strong style={{color:'rgba(255,255,255,0.5)'}}>About this map:</strong>{' '}
          Confirmed connections are drawn directly from Niasse&apos;s text in{' '}
          <em>Fī Riyāḍ al-Tafsīr</em>, with source references. Pending connections await 
          editorial review. This map will be expanded as the translation and glossary develop.
        </p>
      </div>
    </main>
  );
}
