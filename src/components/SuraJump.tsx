'use client';

// "Go to sūra" for a page of collapsed sūra sections (<details id="sura-N">):
// opens the chosen sūra and scrolls to it.
export default function SuraJump({ suras }: { suras: { id: number; name: string; count: number }[] }) {
  return (
    <label className="flex items-center gap-2 mb-4 font-english text-[13px]" dir="ltr"
      style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
      Go to
      <select
        defaultValue=""
        onChange={e => {
          const el = document.getElementById(`sura-${e.target.value}`) as HTMLDetailsElement | null;
          if (!el) return;
          el.open = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="font-english text-[13px] rounded-lg border px-2 py-1.5 min-w-0 flex-1 max-w-xs"
        style={{
          borderColor: 'var(--tree-input-border, rgba(201,168,76,0.25))',
          background: 'var(--tree-input-bg, rgba(255,255,255,0.06))',
          color: 'var(--tree-input-text, rgba(232,232,224,0.92))',
        }}>
        <option value="" disabled>Choose a sūra</option>
        {suras.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name} ({s.count})</option>)}
      </select>
    </label>
  );
}
