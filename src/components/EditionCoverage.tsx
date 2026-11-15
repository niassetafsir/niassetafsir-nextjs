import Link from 'next/link';
import { getCoverage } from '@/lib/coverage';

/**
 * The state of the Fī Riyāḍ al-Tafsīr edition, counted from the files at
 * build time. It lived on the homepage until 15 Nov 2026; the homepage now
 * speaks for the whole corpus, so the tafsīr's own table sits with the tafsīr.
 */
export default async function EditionCoverage() {
  const coverage = await getCoverage();
  const audio = coverage.layers.find(l => l.key === 'audio');
  return (
      <section className="mt-12">
        <p className="font-english text-center text-[10.5px] uppercase tracking-[0.13em] font-semibold mb-1"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          State of the edition
        </p>
        <p className="font-english text-center text-xs mb-5"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          Counted from the edition files at build time
        </p>

        <table className="w-full font-english text-sm" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {coverage.layers.map(layer => {
              const pct = layer.total ? (layer.count / layer.total) * 100 : 0;
              const complete = layer.total > 0 && layer.count === layer.total;
              return (
                <tr key={layer.key} style={{ borderBottom: '1px solid rgba(138,109,31,0.18)' }}>
                  <td className="py-3 pr-3 align-middle">
                    <div style={{
                      color: 'var(--body-text, rgba(232,232,224,0.90))',
                      fontWeight: complete ? 600 : 400,
                    }}>
                      {layer.label}
                    </div>
                    <div className="text-xs mt-0.5"
                      style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
                      {layer.detail}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle hidden sm:table-cell" style={{ width: 180 }}>
                    <div style={{ height: 7, borderRadius: 99, background: 'rgba(128,128,128,0.22)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 99,
                        background: complete ? 'var(--complete, #7bb661)' : 'var(--gold, #C9A84C)',
                      }} />
                    </div>
                  </td>
                  <td className="py-3 pl-3 text-right align-middle whitespace-nowrap"
                    style={{
                      width: 90,
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                      color: complete ? 'var(--complete, #7bb661)' : 'var(--body-text, rgba(232,232,224,0.85))',
                    }}>
                    {layer.count} / {layer.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="font-english text-xs italic mt-4"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          The Arabic edition is complete and citable. Everything below it is in progress,
          and each lesson page marks which layers are present.
        </p>

        {audio && audio.detail.includes('Wolof') && audio.count > 0 && (
          <p className="font-english text-sm mt-5 text-center">
            <Link href="/audio" className="transition-opacity hover:opacity-75"
              style={{ color: 'var(--gold, #C9A84C)', borderBottom: '1px dotted rgba(138,109,31,0.4)' }}>
              Recorded in Arabic and Wolof for {audio.count} lessons →
            </Link>
          </p>
        )}
      </section>
  );
}
