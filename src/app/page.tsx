import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import { SURAH_LIST } from '@/lib/verseRanges';
import { getCoverage } from '@/lib/coverage';
import { showcaseCards, worksByKind, corpusCounts, SHOWCASE_VERSE } from '@/lib/homeShowcase';

const FAINT = 'var(--body-faint, rgba(232,232,224,0.45))';
const SUB = 'var(--body-sub, rgba(232,232,224,0.70))';
const TEXT = 'var(--body-text, rgba(232,232,224,0.90))';
const GOLD = 'var(--gold, #C9A84C)';
const LINE = 'rgba(138,109,31,0.22)';

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
  const cards = await showcaseCards();
  const kinds = worksByKind();
  const counts = corpusCounts();

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
          Search for a verse, a topic or a term to see what he says about it, wherever he says it.
        </p>

        <div className="mt-7">
          <SearchForm ayahCounts={SURAH_LIST.map(s => s.ayahCount)} />
        </div>

        <p className="font-english text-xs mt-3"
          style={{ color: 'var(--body-faint, rgba(232,232,224,0.45))' }}>
          or browse{' '}
          <Link href="/topics" className="tap transition-opacity hover:opacity-75"
            style={{ color: 'var(--gold, #C9A84C)', borderBottom: '1px dotted rgba(138,109,31,0.4)' }}>
            by topic
          </Link>
        </p>
      </section>

      {/* ---- One verse, three works ----
          What a search returns, shown rather than described: Āyat al-Kursī
          as he expounds it, recites it and versifies it. Read from the corpus
          at build time (src/lib/homeShowcase.ts). */}
      {cards.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 pb-12">
          <p className="font-english text-center text-[10.5px] uppercase tracking-[0.13em] font-semibold mb-1"
            style={{ color: FAINT }}>
            One verse, across his works
          </p>
          <p className="font-english text-center text-sm mb-5" style={{ color: SUB }}>
            {SHOWCASE_VERSE.name} · Q. {SHOWCASE_VERSE.surah}:{SHOWCASE_VERSE.ayah}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cards.map(c => (
              <li key={c.title}>
                <Link href={c.href}
                  className="flex flex-col h-full rounded-xl border px-4 py-4 transition-colors hover:border-gold/50"
                  style={{ borderColor: LINE, background: 'rgba(138,109,31,0.04)' }}>
                  <span className="font-english text-[10.5px] uppercase tracking-[0.12em] font-semibold mb-1"
                    style={{ color: GOLD }}>{c.kind}</span>
                  <span className="font-english text-[14px] font-semibold leading-snug" style={{ color: TEXT }}>{c.title}</span>
                  <span className="font-english text-[12px] mb-3" style={{ color: FAINT }}>{c.where}</span>
                  <span className="font-arabic text-[16px] leading-[1.95] mb-2" dir="rtl" lang="ar" style={{ color: TEXT }}>{c.ar}</span>
                  {c.en && (
                    <span className="font-english text-[13px] leading-relaxed mt-auto" style={{ color: SUB }}>{c.en}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-center mt-4">
            <Link href={`/verse/${SHOWCASE_VERSE.surah}/${SHOWCASE_VERSE.ayah}`}
              className="font-english text-sm font-medium py-2 inline-block transition-opacity hover:opacity-75"
              style={{ color: GOLD }}>
              Everything he says on {SHOWCASE_VERSE.name} →
            </Link>
          </p>
        </section>
      )}

      {/* ---- His works ---- */}
      <section className="max-w-3xl mx-auto px-5 pb-10 text-center">
        <p className="font-english text-[10.5px] uppercase tracking-[0.13em] font-semibold mb-3"
          style={{ color: FAINT }}>
          His works
        </p>
        <ul className="flex flex-wrap justify-center gap-2 mb-4">
          {kinds.map(k => (
            <li key={k.kind}>
              <Link href="/works"
                className="inline-block font-english text-sm rounded-full border px-3.5 py-1.5 transition-colors hover:border-gold/60"
                style={{ borderColor: LINE, color: SUB }}>
                {k.kind} <span className="tabular-nums" style={{ color: FAINT }}>{k.works}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="font-english text-sm leading-relaxed" style={{ color: SUB }}>
          {counts.works} works catalogued. The whole Qurʾān in his tafsīr, and so far {counts.verses} verses
          in {counts.passages} passages from {counts.worksWithPassages} of his other works, with more added as they are transcribed.
        </p>
      </section>

      {/* ---- The tafsīr ----
          The largest work and the only one carried whole: one line, not a
          card, an extract and a table. Its edition table is on /read. */}
      <section className="max-w-3xl mx-auto px-5 text-center">
        <Link href="/read"
          className="font-english text-[15px] font-medium py-2 inline-block transition-opacity hover:opacity-75"
          style={{ color: GOLD }}>
          Read Fī Riyāḍ al-Tafsīr, his 1964 tafsīr of the whole Qurʾān →
        </Link>
        <p className="font-english text-xs" style={{ color: FAINT }}>
          {coverage.totalLessons} sessions, all in Arabic, with the English translation in progress
        </p>
      </section>
    </main>
  );
}
