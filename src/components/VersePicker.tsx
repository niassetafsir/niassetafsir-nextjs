'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Every āya in the muṣḥaf has a verse page. Until this existed, 105 of them
// were reachable -- the cross-corpus list -- and the other six thousand could
// only be got at by typing the URL or by stepping one verse at a time. A page
// that promises "look up any āya" has to let you look up any āya.
//
// PAYLOAD: takes the sūra list as a prop rather than importing SURAH_LIST, so
// only {id, name, ayahCount} crosses into the client bundle -- not the whole
// verse-range module and everything it pulls with it.

export interface PickerSurah {
  id: number;
  name: string;
  ayahCount: number;
}

export default function VersePicker({
  surahs,
  initialSurah,
  initialAyah,
}: {
  surahs: PickerSurah[];
  initialSurah?: number;
  initialAyah?: number;
}) {
  const router = useRouter();
  const [surah, setSurah] = useState(initialSurah ?? 1);
  const [ayah, setAyah] = useState(String(initialAyah ?? 1));

  const current = surahs.find(s => s.id === surah);
  const max = current?.ayahCount ?? 286;
  const n = Number(ayah);
  const valid = Number.isInteger(n) && n >= 1 && n <= max;

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (valid) router.push(`/verse/${surah}/${n}`);
  }

  return (
    <form
      onSubmit={go}
      className="rounded-xl border px-3.5 py-3 mb-6 flex flex-wrap items-center gap-2"
      style={{ borderColor: 'rgba(201,168,76,0.28)', background: 'rgba(138,109,31,0.04)' }}
      dir="ltr"
    >
      <label className="font-english text-[12px] shrink-0"
        style={{ color: 'var(--body-sub, rgba(255,255,255,0.7))' }}>
        Go to
      </label>

      <select
        value={surah}
        onChange={e => {
          const next = Number(e.target.value);
          setSurah(next);
          const cap = surahs.find(s => s.id === next)?.ayahCount ?? 1;
          if (Number(ayah) > cap) setAyah('1');
        }}
        aria-label="Sūrah"
        className="font-english text-[13px] rounded-lg border px-2 py-1.5 min-w-0 flex-1"
        style={{
          borderColor: 'var(--tree-input-border, rgba(201,168,76,0.25))',
          background: 'var(--tree-input-bg, rgba(255,255,255,0.06))',
          color: 'var(--tree-input-text, rgba(232,232,224,0.92))',
        }}
      >
        {surahs.map(s => (
          <option key={s.id} value={s.id}>
            {s.id}. {s.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        max={max}
        value={ayah}
        onChange={e => setAyah(e.target.value)}
        aria-label={`Āya (1–${max})`}
        className="font-english text-[13px] rounded-lg border px-2 py-1.5 w-20"
        style={{
          borderColor: valid
            ? 'var(--tree-input-border, rgba(201,168,76,0.25))'
            : 'rgba(220,80,80,0.6)',
          background: 'var(--tree-input-bg, rgba(255,255,255,0.06))',
          color: 'var(--tree-input-text, rgba(232,232,224,0.92))',
        }}
      />

      <button
        type="submit"
        disabled={!valid}
        className="font-english text-[13px] font-semibold rounded-lg px-3.5 py-1.5 transition-opacity disabled:opacity-40"
        style={{ background: 'var(--gold, #C9A84C)', color: '#0D1F0A' }}
      >
        Go
      </button>

      <span className="font-english text-[11px] w-full sm:w-auto"
        style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>
        {valid ? `1–${max}` : `enter 1–${max}`}
      </span>
    </form>
  );
}
