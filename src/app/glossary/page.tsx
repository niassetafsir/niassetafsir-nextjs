'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * One page for the technical vocabulary.
 *
 * There were two. /glossary listed where each term occurs in the text;
 * /glossary-map listed how the terms relate to one another. They covered the
 * same twenty concepts under two incompatible spellings -- "al-Tawḥīd" here,
 * "tawḥīd" there -- so a reader who wanted both had to visit two routes and
 * match the lists by eye. The map also presented itself as a grid of thirty-odd
 * chips, none of which said anything until clicked, which on a phone was a wall
 * of unreadable targets.
 *
 * A relation is a claim about the text, so it belongs beside the text that
 * supports it. Both files now feed one list, joined on a normalised key, and a
 * term's relations sit above its attestations rather than on another page.
 */

interface Occurrence {
  lessonId: number;
  volume: number;
  page: number;
  paraIndex: number;
  arabicTitle: string;
  englishTitle: string;
  context: string;
  matchedForm: string;
  englishExcerpt?: string;
}

interface TermEntry {
  term: string;
  arabic: string;
  plural: string;
  related: string[];
  occurrences: Occurrence[];
  occurrenceCount: number;
}

interface GraphNode { id: string; arabic: string; tier: number; category: string }
interface GraphEdge { from: string; to: string; relation: string; note: string; source: string; confirmed: boolean }
interface Hierarchy { name: string; arabic: string; levels: string[]; source: string; confirmed: boolean }
interface Graph { nodes: GraphNode[]; edges: GraphEdge[]; hierarchies: Hierarchy[] }

/** The two files spell the same term differently: "al-Tawḥīd" against "tawḥīd",
 *  "Ḥaqīqa Muḥammadiyya" against "ḥaqīqa-muḥammadiyya". Sixteen of the twenty
 *  graph nodes join to a concordance entry under this key; the four that do not
 *  are listed too, marked as unattested. */
function key(s: string): string {
  return s.normalize('NFC').toLowerCase()
    .replace(/^al-/, '')
    .replace(/[ʾʿ'’‘]/g, '')
    .replace(/[\s-]+/g, '-');
}

const CATEGORY_COLORS: Record<string, string> = {
  doctrine:    'border-amber-500/50 text-amber-200/90 bg-amber-500/8',
  state:       'border-purple-500/50 text-purple-200/90 bg-purple-500/8',
  practice:    'border-green-500/50 text-green-200/90 bg-green-500/8',
  faculty:     'border-blue-500/50 text-blue-200/90 bg-blue-500/8',
  metaphysics: 'border-gold/50 text-gold bg-gold/8',
};

const RELATION_LABELS: Record<string, string> = {
  'completed-by': 'is completed by',
  'is-superior-to': 'stands above',
  'is-spirit-of': 'is the spirit of',
  'produces': 'produces',
  'is-method-of': 'is the method of',
  'is-first-instance-of': 'is the first instance of',
  'traverses': 'traverses',
  'leads-to': 'leads to',
  'presupposes': 'presupposes',
  'PENDING': 'relation pending',
};

/** A term as the page treats it: attestations from the concordance, relations
 *  from the graph, either of which may be absent. */
interface Term {
  k: string;
  label: string;
  arabic: string;
  plural: string;
  related: string[];
  occurrences: Occurrence[];
  count: number;
  category?: string;
  inGraph: boolean;
}

export default function TermsPage() {
  const [concordance, setConcordance] = useState<TermEntry[] | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    fetch('/data/term_concordance.json').then(r => r.json()).then(setConcordance).catch(() => setConcordance([]));
    fetch('/data/glossary_graph.json').then(r => r.json()).then(setGraph).catch(() => setGraph(null));
  }, []);

  if (!concordance) return (
    <main className="max-w-5xl mx-auto px-4 py-12 text-center">
      <p className="font-english animate-pulse" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
    </main>
  );

  const nodeByKey = new Map((graph?.nodes ?? []).map(n => [key(n.id), n]));

  const terms: Term[] = concordance.map(t => {
    const k = key(t.term);
    const n = nodeByKey.get(k);
    return {
      k, label: t.term, arabic: t.arabic, plural: t.plural,
      related: t.related ?? [], occurrences: t.occurrences ?? [],
      count: t.occurrenceCount, category: n?.category, inGraph: !!n,
    };
  });

  // Terms the graph asserts relations about but the concordance has not indexed.
  // They are shown rather than dropped: the relation is a claim, and hiding the
  // claim because its subject is unindexed would misreport what the edition holds.
  const seen = new Set(terms.map(t => t.k));
  for (const n of graph?.nodes ?? []) {
    if (seen.has(key(n.id))) continue;
    seen.add(key(n.id));
    terms.push({
      k: key(n.id), label: n.id, arabic: n.arabic, plural: '',
      related: [], occurrences: [], count: 0, category: n.category, inGraph: true,
    });
  }
  terms.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const q = search.trim().toLowerCase();
  const filtered = terms.filter(t => !q || t.label.toLowerCase().includes(q) || t.arabic.includes(search.trim()));
  const term = terms.find(t => t.k === selected);

  const edges = (graph?.edges ?? []).filter(e => showPending || e.confirmed);
  const termEdges = term ? edges.filter(e => key(e.from) === term.k || key(e.to) === term.k) : [];
  const termHierarchies = term
    ? (graph?.hierarchies ?? []).filter(h => h.confirmed && h.levels.some(l => key(l) === term.k))
    : [];
  const pendingCount = (graph?.edges ?? []).filter(e => !e.confirmed).length;

  const select = (labelOrKey: string) => {
    const k = key(labelOrKey);
    setSelected(prev => (prev === k ? null : k));
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6" dir="ltr">
      <div className="mb-7">
        <div className="font-arabic text-gold text-xl mb-1" dir="rtl">فهرس المصطلحات</div>
        <h1 className="font-english text-2xl font-semibold"
          style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
          Technical Terms
        </h1>
        <p className="font-english text-sm mt-2 leading-6" style={{ color: 'var(--body-sub, rgba(255,255,255,0.5))' }}>
          Where each term occurs in Niasse&apos;s text, in context and linked to the passage, and
          how he connects the terms to one another. Interpretive definitions are reserved for the
          forthcoming scholarly edition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── the terms ─────────────────────────────────────── */}
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Search terms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-white/15 rounded-lg px-3 py-3 font-english text-sm bg-white/5 outline-none focus:border-gold/40 mb-3"
            style={{ color: 'inherit', minHeight: 44 }}
          />
          <div className="space-y-1">
            {filtered.map(t => (
              <button
                key={t.k}
                onClick={() => select(t.k)}
                className={`w-full text-left px-3 py-3 rounded-lg border transition-all ${
                  selected === t.k ? 'border-gold/50 bg-gold/8' : 'border-white/8 hover:border-white/20 bg-white/3'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-english text-sm font-semibold"
                      style={{ color: selected === t.k ? '#C9A84C' : 'rgba(255,255,255,0.82)' }}>
                      {t.label}
                    </span>
                    <span className="font-arabic text-xs ml-2" dir="rtl" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {t.arabic}
                    </span>
                  </div>
                  <span className="font-english text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{
                      color: t.count ? 'rgba(201,168,76,0.65)' : 'rgba(255,255,255,0.25)',
                      borderColor: t.count ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.12)',
                    }}>
                    {t.count || '—'}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="font-english text-[10px] mt-3 italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {terms.reduce((a, t) => a + t.count, 0).toLocaleString()} occurrences indexed.
            The number beside each term is its count; — means the term carries a relation but has
            not been indexed yet.
          </p>
        </div>

        {/* ── the term ──────────────────────────────────────── */}
        <div className="md:col-span-2">
          {!term ? (
            <div className="border border-white/8 rounded-xl p-8 text-center">
              <div className="font-arabic text-gold/30 text-3xl mb-3" dir="rtl">المصطلحات</div>
              <p className="font-english text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Select a term to see how Niasse uses it
              </p>
            </div>
          ) : (
            <div>
              <div className="border border-gold/25 rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-english font-semibold text-lg"
                      style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>{term.label}</h2>
                    <div className="font-arabic text-gold text-base mt-0.5" dir="rtl">{term.arabic}</div>
                    {term.plural && (
                      <div className="font-english text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Plural: <span className="font-arabic" dir="rtl">{term.plural}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="font-english text-sm font-bold text-gold border border-gold/30 px-3 py-1 rounded-lg">
                      {term.count} occ.
                    </span>
                    {term.category && (
                      <span className={`font-english text-[10px] px-2 py-0.5 rounded border capitalize ${
                        CATEGORY_COLORS[term.category] ?? 'border-white/15 text-white/50'}`}>
                        {term.category}
                      </span>
                    )}
                  </div>
                </div>
                {term.related.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/8 flex flex-wrap gap-1 items-center">
                    <span className="font-english text-[10px] text-white/30 mr-1">See also:</span>
                    {term.related.map(r => (
                      <button key={r} onClick={() => select(r)}
                        className="tap font-english text-[10px] border border-white/15 hover:border-gold/40 px-2 rounded transition-colors"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Relations — the claims, above the evidence */}
              {(termEdges.length > 0 || termHierarchies.length > 0 || pendingCount > 0) && (
                <div className="border border-white/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="font-english text-[11px] font-semibold tracking-wide uppercase"
                      style={{ color: 'rgba(255,255,255,0.45)' }}>
                      How Niasse connects it
                    </p>
                    {pendingCount > 0 && (
                      <label className="tap font-english text-[11px] flex items-center gap-1.5 cursor-pointer"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <input type="checkbox" checked={showPending}
                          onChange={e => setShowPending(e.target.checked)} className="w-5 h-5" />
                        Show pending
                      </label>
                    )}
                  </div>

                  {termHierarchies.map((h, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-english text-xs font-semibold"
                          style={{ color: 'rgba(255,255,255,0.75)' }}>{h.name}</span>
                        <span className="font-arabic text-[11px]" dir="rtl" style={{ color: 'rgba(255,255,255,0.4)' }}>{h.arabic}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {h.levels.map((level, j) => (
                          <span key={j} className="flex items-center gap-1.5">
                            <button onClick={() => select(level)}
                              className={`tap font-english text-xs px-2 rounded border transition-all ${
                                key(level) === term.k
                                  ? 'border-gold/60 text-gold bg-gold/10'
                                  : 'border-white/15 text-white/60 hover:border-white/35'
                              }`}>
                              {level}
                            </button>
                            {j < h.levels.length - 1 && (
                              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>›</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="font-english text-[10px] mt-1.5 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Source: {h.source}
                      </p>
                    </div>
                  ))}

                  {termEdges.length > 0 && (
                    <div className={`space-y-2 ${termHierarchies.length ? 'mt-4 pt-3 border-t border-white/8' : ''}`}>
                      {termEdges.map((e, i) => {
                        const isFrom = key(e.from) === term.k;
                        const other = isFrom ? e.to : e.from;
                        const label = RELATION_LABELS[e.relation] ?? e.relation;
                        return (
                          <div key={i} className={`border rounded-lg px-3 py-2 ${
                            e.confirmed ? 'border-white/10' : 'border-white/5 opacity-70'}`}>
                            <div className="flex items-center gap-2 flex-wrap font-english text-xs">
                              <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {isFrom ? term.label : other}
                              </span>
                              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                              <button onClick={() => select(isFrom ? other : term.label)}
                                className="tap text-gold/70 hover:text-gold font-semibold transition-colors">
                                {isFrom ? other : term.label}
                              </button>
                              {!e.confirmed && (
                                <span className="text-[9px] text-amber-400/60">pending review</span>
                              )}
                            </div>
                            {e.note && (
                              <p className="font-english text-[10px] mt-1 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {e.note}{e.source ? ` · ${e.source}` : ''}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {termEdges.length === 0 && termHierarchies.length === 0 && (
                    <p className="font-english text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      No connection recorded for this term yet.
                    </p>
                  )}
                </div>
              )}

              {/* Occurrences — the evidence */}
              {term.occurrences.length === 0 ? (
                <div className="text-center py-8 border border-white/8 rounded-xl">
                  <p className="font-english text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Not yet indexed in the concordance.
                  </p>
                  <p className="font-english text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Try <Link href={`/search?q=${encodeURIComponent(term.arabic)}`} className="text-gold/60 hover:text-gold">
                      searching the text for {term.arabic}
                    </Link>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-english text-[11px] font-semibold tracking-wide uppercase"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Where it occurs
                  </p>
                  {term.occurrences.map((occ, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <Link
                          href={`/lesson/${occ.lessonId}?panel=tafsir&q=${encodeURIComponent(occ.context.slice(0, 30))}`}
                          className="tap font-english text-[11px] text-gold/60 hover:text-gold border border-gold/20 px-2 rounded transition-colors"
                        >
                          Lesson {occ.lessonId} · Vol. {occ.volume}{occ.page ? `, p. ${occ.page}` : ''}
                        </Link>
                        <span className="font-arabic text-xs text-white/30" dir="rtl">{occ.arabicTitle}</span>
                      </div>
                      <p className="font-arabic text-sm leading-7 text-right" dir="rtl"
                        style={{ color: 'rgba(255,255,255,0.78)' }}
                        dangerouslySetInnerHTML={{
                          __html: occ.context.replace(
                            new RegExp(occ.matchedForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                            `<mark style="background:rgba(201,168,76,0.25);color:#C9A84C;border-radius:2px;padding:0 1px">${occ.matchedForm}</mark>`
                          ),
                        }}
                      />
                      {occ.englishExcerpt ? (
                        <p className="font-english text-xs leading-5 mt-1.5 italic border-t border-white/8 pt-1.5"
                          style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {occ.englishExcerpt}
                        </p>
                      ) : (
                        <p className="font-english text-[10px] mt-1.5 border-t border-white/5 pt-1"
                          style={{ color: 'rgba(255,255,255,0.25)' }}>
                          English translation forthcoming
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="font-english text-[11px] mt-10 pt-4 border-t border-white/8 leading-5"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        Connections marked confirmed are drawn from a passage in <em>Fī Riyāḍ al-Tafsīr</em> and cite it.
        Pending connections await editorial review and are hidden by default.
      </p>
    </main>
  );
}
