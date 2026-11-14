import Link from 'next/link';
import HomeSearchBar from '@/components/HomeSearchBar';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getCoverage, getSpecimen } from '@/lib/coverage';

/**
 * Homepage.
 *
 * Leads with the claim, then the text, then the coverage table.
 *
 * It used to lead with two dropdowns -- "Jump to a verse" and "Read a sūrah" --
 * doing nearly the same thing, no text anywhere, and its only statement of what
 * the site is sat in 12px grey beneath a picker: "Covers al-Fātiḥa & al-Baqara
 * 1-202 so far". That sentence describes the *translation's* reach and read as
 * though it described the site's, so a visitor concluded there were two sūras
 * here. The Arabic edition is complete -- all 56 lessons -- and that, the
 * strongest claim available, appeared nowhere.
 *
 * Coverage numbers are counted from the data at build time (src/lib/coverage.ts)
 * rather than written by hand, so this page cannot drift from the files.
 */

export default async function HomePage() {
  const coverage = await getCoverage();
  const specimen = await getSpecimen();
  const arabicLayer = coverage.layers.find(l => l.key === 'arabic');
  const audio = coverage.layers.find(l => l.key === 'audio');

  return (
    <main className="pb-20" dir="ltr">

      {/* ---- Claim ----
          The site is Manṭiq al-Fayḍa: every place Shaykh Ibrāhīm uses a verse,
          across his works. Fī Riyāḍ al-Tafsīr is the largest of those works and
          has its own reader below, but it is one work in the corpus, not the
          corpus. The verse lookup comes first because the āya is the key the
          whole collection is indexed on. No birth year: the documents give
          mid-Rajab 1320 (October 1902) against the 1900 of most secondary
          literature, and the site should not settle that in a subtitle. */}
      <section className="max-w-3xl mx-auto px-5 pt-12 pb-9 text-center">
        <h1 className="font-arabic text-gold text-3xl sm:text-4xl leading-relaxed mb-1" dir="rtl">
          مَنْطِقُ الفَيْضَة
        </h1>
        <p className="font-arabic text-gold/70 text-lg mb-1" dir="rtl">مَجْمُوعُ التَّفْسِيرِ لِصَاحِبِ الفَيْضَة</p>
        <p className="font-english text-sm italic mb-7"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          Manṭiq al-Fayḍa · The Qurʾānic Exegesis of Shaykh Ibrāhīm Niasse
        </p>

        <p className="font-english text-base sm:text-lg leading-relaxed mb-3"
          style={{ color: 'var(--body-text, rgba(232,232,224,0.90))' }}>
          Shaykh Ibrāhīm Niasse (d. 1975) of Kaolack in Senegal used the Qurʾān in everything he
          wrote and said: his tafsīr, and also his treatises, letters, licences, sermons, fatwās,
          poems, and the sayings his disciples kept.
        </p>
        <p className="font-english text-base leading-relaxed mb-4"
          style={{ color: 'var(--body-sub, rgba(232,232,224,0.70))' }}>
          This site gathers them verse by verse. Look up an āya to see every place he uses it, in
          the Arabic of its source, marked for what he does with it and whether the words are
          his own, written on his behalf, or reported of him.
        </p>

        <HomeSearchBar ayahCounts={SURAH_LIST.map(s => s.ayahCount)} />

        <p className="font-english text-xs mt-3"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          or browse{' '}
          <Link href="/works" className="tap transition-opacity hover:opacity-75"
            style={{ color: 'var(--gold, #C9A84C)', borderBottom: '1px dotted rgba(138,109,31,0.4)' }}>
            the works
          </Link>
          {' '}and the verses each one uses
        </p>
      </section>

      {/* ---- Fī Riyāḍ al-Tafsīr ----
          The largest work in the corpus, and the only one the site carries
          whole. Its own reader, its own coverage table. */}
      <section className="max-w-3xl mx-auto px-5 pb-9">
        <Link href="/read"
          className="block rounded-xl border px-5 py-4 transition-colors hover:border-gold/45"
          style={{ borderColor: 'rgba(138,109,31,0.28)', background: 'rgba(138,109,31,0.04)' }}>
          <p className="font-arabic text-gold text-lg mb-1" dir="rtl">فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ</p>
          <p className="font-english text-[15px] font-semibold mb-1.5"
            style={{ color: 'var(--body-text, rgba(232,232,224,0.9))' }}>
            Fī Riyāḍ al-Tafsīr
          </p>
          <p className="font-english text-[13.5px] leading-relaxed"
            style={{ color: 'var(--body-sub, rgba(232,232,224,0.6))' }}>
            His tafsīr of the whole Qurʾān, given in {coverage.totalLessons} sessions in Ramaḍān 1383/1964
            and printed in ten volumes (Majmaʿ al-Yamāma, Tunis). All {arabicLayer?.count ?? coverage.totalLessons} sessions
            are here in Arabic, with the English translation in progress.
          </p>
        </Link>
      </section>

      {/* ---- The text itself ---- */}
      {specimen && (
        <section className="max-w-5xl mx-auto px-5">
          <p className="font-english text-center text-[10.5px] uppercase tracking-[0.13em] font-semibold mb-1"
            style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
            From the opening of the tafsīr
          </p>
          <p className="font-english text-center text-xs mb-5"
            style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
            Lesson 1 · Al-Istiʿādha, Basmala, and Sūrat al-Fātiḥa · Q. 1:1–2:5
          </p>

          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(138,109,31,0.22)', background: 'rgba(138,109,31,0.035)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="px-6 py-6 font-arabic text-lg leading-[2.1]" dir="rtl"
                style={{
                  color: 'var(--body-text, rgba(232,232,224,0.90))',
                  borderBottom: '1px solid rgba(138,109,31,0.15)',
                }}>
                {specimen.arabic.map((p, i) => <p key={i} className="mb-4 last:mb-0">{p}</p>)}
              </div>
              <div className="px-6 py-6 font-english text-[15px] leading-[1.85]"
                style={{ color: 'var(--body-text, rgba(232,232,224,0.82))' }}>
                {specimen.english.map((p, i) => <p key={i} className="mb-4 last:mb-0">{p}</p>)}
              </div>
            </div>
            <div className="text-center py-3"
              style={{ borderTop: '1px solid rgba(138,109,31,0.18)', background: 'rgba(138,109,31,0.05)' }}>
              <Link href="/lesson/1"
                className="tap font-english text-sm font-medium transition-opacity hover:opacity-75"
                style={{ color: 'var(--gold, #C9A84C)' }}>
                Continue reading Lesson 1 →
              </Link>
            </div>
          </div>

          <p className="font-english text-center text-xs mt-3"
            style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
            Lesson 1 also carries <em>Tafsīr al-Jalālayn</em> and <em>Rūḥ al-Bayān</em> verse by verse.
          </p>
        </section>
      )}

      {/* ---- Coverage ---- */}
      <section className="max-w-3xl mx-auto px-5 mt-14">
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
    </main>
  );
}
