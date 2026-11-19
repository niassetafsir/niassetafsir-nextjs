import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import { SURAH_LIST } from '@/lib/verseRanges';
import { showcaseCards, SHOWCASE_VERSE, corpusCounts } from '@/lib/homeShowcase';
import topicsData from '@/data/topics.json';

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
  const cards = await showcaseCards();
  const counts = corpusCounts();
  const topics = (topicsData as { topics: { slug: string; title: string; termAr: string }[] }).topics;
  // Tappable examples under the search box: one of each kind of query it takes.
  const examples = [
    { label: 'Q 2:255', q: '2:255' },
    { label: 'the heart', q: 'heart' },
    { label: 'What is the spirit?', q: 'What is the spirit?' },
    { label: 'المعرفة', q: 'المعرفة', ar: true },
  ];

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
      <section className="max-w-3xl mx-auto px-5 pt-8 sm:pt-12 pb-9 text-center">
        <h1 className="font-arabic text-gold text-3xl sm:text-4xl leading-relaxed mb-1" dir="rtl">
          مَنْطِقُ الفَيْضَة
        </h1>
        <p className="font-arabic text-gold/70 text-lg mb-1" dir="rtl">مَجْمُوعُ التَّفْسِيرِ لِصَاحِبِ الفَيْضَة</p>
        <p className="font-english text-sm italic mb-5" style={{ color: FAINT }}>
          Manṭiq al-Fayḍa · The Collected Tafsīr of Ṣāḥib al-Fayḍa, Shaykh Ibrāhīm Niasse
        </p>

        <p className="font-english text-[15px] sm:text-lg leading-relaxed mb-5" style={{ color: TEXT }}>
          Shaykh Ibrāhīm Niasse (d. 1975) explained the Qurʾān across his whole life. Here it is,
          verse by verse: his 1964 sessions on the whole Qurʾān, his other works, and his students.
        </p>

        {/* Search first: most visitors come with a verse or a question. */}
        <SearchForm ayahCounts={SURAH_LIST.map(s => s.ayahCount)} />

        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {examples.map(e => (
            <Link key={e.q} href={`/search?q=${encodeURIComponent(e.q)}`}
              className={`${e.ar ? 'font-arabic text-[15px]' : 'font-english text-[13px]'} rounded-full border px-3 py-1 transition-colors hover:border-gold/60`}
              style={{ borderColor: LINE, color: SUB }} dir={e.ar ? 'rtl' : undefined}>
              {e.label}
            </Link>
          ))}
          <Link href="/verse"
            className="font-english text-[13px] rounded-full border px-3 py-1 transition-colors hover:border-gold/60"
            style={{ borderColor: LINE, color: GOLD }}>
            Go to a verse →
          </Link>
        </div>

        <p className="font-english text-[12px] mt-6 mb-2" style={{ color: FAINT }}>Topics</p>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {topics.map(t => (
            <Link key={t.slug} href={`/topics/${t.slug}`}
              className="rounded-full border px-3 py-1 transition-colors hover:border-gold/60 inline-flex items-baseline gap-1.5"
              style={{ borderColor: LINE, background: 'rgba(138,109,31,0.05)' }}>
              <span className="font-english text-[13px]" style={{ color: TEXT }}>{t.title}</span>
              <span className="font-arabic text-[14px]" dir="rtl" style={{ color: GOLD }}>{t.termAr}</span>
            </Link>
          ))}
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
          {[
            { href: '/read', ar: 'فِي رِيَاضِ التَّفْسِير', en: 'Fī Riyāḍ al-Tafsīr',
              body: 'His Arabic sessions of 1964 on the whole Qurʾān, read lesson by lesson.', count: '56 lessons' },
            { href: '/beyond', ar: 'تَفْسِيرُهُ فِي سَائِرِ آثَارِه', en: 'Beyond Fī Riyāḍ al-Tafsīr',
              body: 'His explanation of verses in his other sessions, letters, sermons, treatises, poems and journeys, from 1931 on.',
              count: `${counts.verses} verses in ${counts.worksWithPassages} works` },
            { href: '/students', ar: 'تَفَاسِيرُ تَلَامِذَتِه', en: 'Commentaries of his students',
              body: 'How scholars of the Fayḍa who learned from him explain the same verses.', count: '' },
          ].map(p => (
            <li key={p.href}>
              <Link href={p.href}
                className="flex flex-col h-full rounded-xl border px-4 py-3.5 transition-colors hover:border-gold/60"
                style={{ borderColor: LINE, background: 'rgba(138,109,31,0.05)' }}>
                <span className="font-arabic text-gold text-lg leading-relaxed text-right" dir="rtl" lang="ar">{p.ar}</span>
                <span className="font-english text-[15px] font-semibold mb-1" style={{ color: TEXT }}>{p.en}</span>
                <span className="font-english text-[13px] leading-relaxed" style={{ color: SUB }}>{p.body}</span>
                <span className="flex items-baseline justify-between mt-auto pt-3">
                  <span className="font-english text-[12px]" style={{ color: FAINT }}>{p.count}</span>
                  <span className="font-english text-[13px] font-medium" style={{ color: GOLD }}>Enter →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
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

    </main>
  );
}
