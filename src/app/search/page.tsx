import Link from 'next/link';
import { redirect } from 'next/navigation';
import SearchForm from '@/components/SearchForm';
import { SURAH_LIST } from '@/lib/verseRanges';
import { siteSearch, MARK_OPEN, MARK_CLOSE, type Section, type PassageHit } from '@/lib/siteSearch';
import { meaningSearch, type MeaningResults } from '@/lib/meaningSearch';
import AskPanel from '@/components/AskPanel';

/**
 * One results page for the whole site.
 *
 * Four kinds of result, always in the same order and each under its own
 * heading: verses, topics, terms, and what he says (Fī Riyāḍ al-Tafsīr first,
 * then his other works). A section with nothing in it is not shown. Each
 * section shows its first eight and links to the rest, so one common word
 * cannot bury the others.
 *
 * Rendered on the server: no index to download, and it works without script.
 * A verse reference never reaches this page from the search box, but a typed
 * URL can, so it redirects to the verse.
 */

export const dynamic = 'force-dynamic';

const FAINT = 'var(--body-faint, rgba(232,232,224,0.45))';
const SUB = 'var(--body-sub, rgba(232,232,224,0.70))';
const TEXT = 'var(--body-text, rgba(232,232,224,0.90))';
const GOLD = 'var(--gold, #C9A84C)';
const LINE = 'rgba(138,109,31,0.22)';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function marked(s: string) {
  return escapeHtml(s)
    .split(MARK_OPEN).join('<mark class="search-mark">')
    .split(MARK_CLOSE).join('</mark>');
}

function SectionHead({ id, label, count }: { id: string; label: string; count: number }) {
  return (
    <div id={id} className="scroll-mt-24 flex items-baseline gap-3 mb-1 pt-2">
      <h2 className="font-english text-lg font-semibold" style={{ color: TEXT }}>{label}</h2>
      <span className="font-english text-sm tabular-nums" style={{ color: FAINT }}>{count}</span>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="font-english text-[13px] mb-4" style={{ color: FAINT }}>{children}</p>;
}

function More({ q, section, shown, total, noun }: { q: string; section: Section; shown: number; total: number; noun: string }) {
  if (total <= shown) return null;
  return (
    <Link href={`/search?q=${encodeURIComponent(q)}&show=${section}#${section}`}
      className="inline-block font-english text-sm font-medium mt-1 py-2 transition-opacity hover:opacity-75"
      style={{ color: GOLD }}>
      Show all {total} {noun} →
    </Link>
  );
}

function Passage({ p }: { p: PassageHit }) {
  return (
    <li>
      <Link href={p.href}
        className="block rounded-lg border px-4 py-3 transition-colors hover:border-gold/50"
        style={{ borderColor: LINE }}>
        <p className="font-english text-[13px] mb-1.5 line-clamp-1" style={{ color: FAINT }}>
          <span className="font-semibold" style={{ color: SUB }}>{p.source}</span>
          {p.where && <> · {p.where}</>}
        </p>
        <p className={p.arabic ? 'font-arabic text-[17px] leading-[2]' : 'font-english text-[15px] leading-relaxed'}
          dir={p.arabic ? 'rtl' : 'ltr'}
          style={{ color: TEXT }}
          dangerouslySetInnerHTML={{ __html: marked(p.snippet) }} />
      </Link>
    </li>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; show?: string; mode?: string };
}) {
  const q = (searchParams.q ?? '').trim();
  const show = (['verses', 'tafsir', 'works', 'students'] as const).find(s => s === searchParams.show);
  const r = await siteSearch(q, show);
  if (r.verseRef) redirect(`/verse/${r.verseRef.surah}/${r.verseRef.ayah}`);

  // Search by meaning runs when the reader asks for it, or when the query reads
  // like a question or a description (four words or more), which keyword
  // matching rarely answers. A sūra name or a single term never triggers it.
  const wordCount = q.split(/\s+/).filter(Boolean).length;
  const byMeaning = !!q && !r.surah && (searchParams.mode === 'meaning' || wordCount >= 4);
  const m: MeaningResults | null = byMeaning ? await meaningSearch(q) : null;
  const meaningCount = m ? m.verses.length + m.tafsir.length + m.works.length + m.students.length : 0;

  const ayahCounts = SURAH_LIST.map(s => s.ayahCount);
  const verseCount = r.versesTotal + (r.surah ? 1 : 0);
  const saysCount = r.tafsirTotal + r.worksTotal;
  // An English word that names a topic or term has an Arabic form, and the
  // Arabic reaches all 56 lessons where the English reaches the translated ones.
  const arabicForm = r.topics[0]?.termAr ?? r.terms[0]?.ar ?? '';
  const nothing = q && verseCount + r.topics.length + r.terms.length + saysCount + r.studentsTotal + meaningCount === 0;

  const jump = [
    { id: 'meaning', label: 'On your question', n: meaningCount },
    { id: 'verses', label: 'Verses', n: verseCount },
    { id: 'topics', label: 'Topics', n: r.topics.length },
    { id: 'terms', label: 'Terms', n: r.terms.length },
    { id: 'says', label: 'What he says', n: saysCount },
    { id: 'students', label: 'His students', n: r.studentsTotal },
  ].filter(j => j.n > 0);

  return (
    <main className="max-w-3xl mx-auto px-5 pb-24 pt-8" dir="ltr">
      <h1 className="font-english text-2xl font-semibold text-center mb-1" style={{ color: TEXT }}>Search</h1>
      <p className="font-english text-sm text-center mb-6" style={{ color: FAINT }}>
        A verse, a topic, or a question in your own words
      </p>

      <SearchForm ayahCounts={ayahCounts} initial={q} autoFocus={!q} key={q} />

      {!q && (
        <p className="font-english text-sm text-center mt-6" style={{ color: SUB }}>
          Try{' '}
          {[['2:255', '2:255'], ['al-Kahf', 'al-Kahf'], ['nafs', 'nafs'], ['التوحيد', 'التوحيد'], ['mercy', 'mercy'], ['What does he say about polygamy?', 'What does he say about polygamy?']].map(([label, term], i) => (
            <span key={term}>
              {i > 0 && ' · '}
              <Link href={term === '2:255' ? '/verse/2/255' : `/search?q=${encodeURIComponent(term)}`}
                style={{ color: GOLD }} className="py-1 inline-block">{label}</Link>
            </span>
          ))}
        </p>
      )}

      {nothing && (
        <div className="text-center mt-10">
          <p className="font-english text-base mb-2" style={{ color: TEXT }}>
            Nothing found for “{q}”.
          </p>
          <p className="font-english text-sm" style={{ color: SUB }}>
            For a verse, type its number, like 2:255. For a word, try its Arabic (التوحيد) or a
            shorter form (tawhid).
          </p>
        </div>
      )}

      {jump.length > 0 && (
        <nav aria-label="Results" className="flex flex-wrap justify-center gap-2 mt-6 mb-2">
          {jump.map(j => (
            <a key={j.id} href={`#${j.id}`}
              className="font-english text-sm rounded-full border px-3.5 py-1.5 transition-colors hover:border-gold/60"
              style={{ borderColor: LINE, color: SUB }}>
              {j.label} <span className="tabular-nums" style={{ color: FAINT }}>{j.n}</span>
            </a>
          ))}
        </nav>
      )}

      {/* ---- Ask the Tafsīr: the answer in his words, fetched after load ---- */}
      {m && m.available && !m.error && <AskPanel q={q} key={q} />}

      {/* ---- By meaning ---- */}
      {m && (
        <section className="mt-8">
          <SectionHead id="meaning" label="Passages on your question" count={meaningCount} />
          {!m.available && (
            <Hint>Questions in your own words are not switched on yet. The results below match your words.</Hint>
          )}
          {m.available && m.error && (
            <Hint>Your question could not be searched just now. The results below match your words.</Hint>
          )}
          {m.available && !m.error && m.expansion && (
            <>
              <Hint>
                Passages that speak to your question, though they may not use your words, from his
                tafsīr, his other works and his students’ commentaries. Each is the text itself; open it
                to read it in place.
              </Hint>
              <p className="font-english text-[12.5px] -mt-2 mb-4 leading-relaxed" style={{ color: FAINT }}>
                Looked for:{' '}
                <span className="font-arabic text-[15px]" dir="rtl">{m.expansion.arabic.join(' · ')}</span>
                {m.expansion.english.length > 0 && <> · {m.expansion.english.join(' · ')}</>}
              </p>
            </>
          )}

          {m.verses.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-4">
              {m.verses.map(v => (
                <li key={`${v.surah}:${v.ayah}`}>
                  <Link href={`/verse/${v.surah}/${v.ayah}`}
                    className="inline-block font-english text-sm rounded-full border px-3.5 py-1.5 transition-colors hover:border-gold/60"
                    style={{ borderColor: LINE, color: GOLD }}>
                    Q. {v.surah}:{v.ayah} <span style={{ color: FAINT }}>· {v.surahName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {m.tafsir.length > 0 && (
            <div className="mb-6">
              <h3 className="font-english text-[13px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: SUB }}>
                In Fī Riyāḍ al-Tafsīr
              </h3>
              <ul className="space-y-2">{m.tafsir.map((p, i) => <Passage key={i} p={p} />)}</ul>
            </div>
          )}

          {m.works.length > 0 && (
            <div className="mb-6">
              <h3 className="font-english text-[13px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: SUB }}>
                Beyond Fī Riyāḍ al-Tafsīr
              </h3>
              <ul className="space-y-2">{m.works.map((p, i) => <Passage key={i} p={p} />)}</ul>
            </div>
          )}

          {m.students.length > 0 && (
            <div className="mb-6">
              <h3 className="font-english text-[13px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: SUB }}>
                Commentaries of his students
              </h3>
              <ul className="space-y-2">{m.students.map((p, i) => <Passage key={i} p={p} />)}</ul>
            </div>
          )}

          {m.available && !m.error && meaningCount === 0 && (
            <Hint>Nothing in his text answers to this question.</Hint>
          )}
        </section>
      )}

      {q && !m && !r.surah && (
        <p className="font-english text-sm text-center mt-6" style={{ color: SUB }}>
          Not finding it?{' '}
          <Link href={`/search?q=${encodeURIComponent(q)}&mode=meaning`} style={{ color: GOLD }} className="py-1 inline-block">
            Ask in your own words →
          </Link>
        </p>
      )}

      {/* ---- Verses ---- */}
      {verseCount > 0 && (
        <section className="mt-8">
          <SectionHead id="verses" label="Verses" count={verseCount} />
          <Hint>Open a verse to see everything he says about it, across his works.</Hint>
          <ul className="space-y-2">
            {r.surah && (
              <li>
                <Link href={`/surah/${r.surah.surah}`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-gold/50"
                  style={{ borderColor: LINE, background: 'rgba(138,109,31,0.05)' }}>
                  <span className="font-english text-[15px]" style={{ color: TEXT }}>
                    Sūrat {r.surah.nameEn} <span style={{ color: FAINT }}>· sūra {r.surah.surah}, {r.surah.ayahCount} āyāt</span>
                  </span>
                  <span className="font-arabic text-lg" dir="rtl" style={{ color: GOLD }}>{r.surah.nameAr}</span>
                </Link>
              </li>
            )}
            {r.verses.map(v => (
              <li key={`${v.surah}:${v.ayah}`}>
                <Link href={`/verse/${v.surah}/${v.ayah}`}
                  className="block rounded-lg border px-4 py-3 transition-colors hover:border-gold/50"
                  style={{ borderColor: LINE }}>
                  <p className="font-english text-[13px] mb-1" style={{ color: FAINT }}>
                    <span className="font-semibold" style={{ color: GOLD }}>Q. {v.surah}:{v.ayah}</span> · {v.surahName}
                  </p>
                  <p className="font-arabic text-[17px] leading-[2] line-clamp-2" dir="rtl" style={{ color: TEXT }}>{v.ar}</p>
                  <p className="font-english text-[13.5px] leading-relaxed line-clamp-2 mt-0.5" style={{ color: SUB }}>{v.en}</p>
                </Link>
              </li>
            ))}
          </ul>
          <More q={q} section="verses" shown={r.verses.length} total={r.versesTotal} noun="verses" />
        </section>
      )}

      {/* ---- Topics ---- */}
      {r.topics.length > 0 && (
        <section className="mt-10">
          <SectionHead id="topics" label="Topics" count={r.topics.length} />
          <Hint>What he teaches on a subject, in a short answer with his own words.</Hint>
          <ul className="space-y-2">
            {r.topics.map(t => (
              <li key={t.slug}>
                <Link href={`/topics/${t.slug}`}
                  className="block rounded-lg border px-4 py-3 transition-colors hover:border-gold/50"
                  style={{ borderColor: LINE, background: 'rgba(138,109,31,0.05)' }}>
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-english text-[16px] font-semibold" style={{ color: TEXT }}>{t.title}</span>
                    <span className="font-arabic text-lg" dir="rtl" style={{ color: GOLD }}>{t.termAr}</span>
                  </p>
                  <p className="font-english text-[14px] mt-0.5" style={{ color: SUB }}>{t.question}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- Terms ---- */}
      {r.terms.length > 0 && (
        <section className="mt-10">
          <SectionHead id="terms" label="Terms" count={r.terms.length} />
          <Hint>His technical vocabulary: what he means by the word, and where he uses it.</Hint>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {r.terms.map(t => (
              <li key={t.href}>
                <Link href={t.href}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 h-full transition-colors hover:border-gold/50"
                  style={{ borderColor: LINE }}>
                  <span className="font-english">
                    <span className="text-[15px] font-semibold" style={{ color: TEXT }}>{t.label}</span>
                    {(t.gloss || t.count) && (
                      <span className="block text-[13px]" style={{ color: FAINT }}>
                        {t.gloss}{t.gloss && t.count ? ' · ' : ''}{t.count ? `${t.count} passages` : ''}
                      </span>
                    )}
                  </span>
                  <span className="font-arabic text-lg" dir="rtl" style={{ color: GOLD }}>{t.ar}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- What he says ---- */}
      {saysCount > 0 && (
        <section className="mt-10">
          <SectionHead id="says" label="What he says" count={saysCount} />
          <Hint>Passages where these words occur in Shaykh Ibrāhīm’s own text: his tafsīr, then his other works.</Hint>
          {arabicForm && !/[\u0600-\u06FF]/.test(q) && (
            <Link href={`/search?q=${encodeURIComponent(arabicForm)}`}
              className="inline-block font-english text-sm font-medium -mt-2 mb-4 py-1 transition-opacity hover:opacity-75"
              style={{ color: GOLD }}>
              Search the Arabic, <span className="font-arabic" dir="rtl">{arabicForm}</span>, for every passage in the tafsīr →
            </Link>
          )}

          {r.tafsirTotal > 0 && (
            <div id="tafsir" className="scroll-mt-24 mb-8">
              <h3 className="font-english text-[13px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: SUB }}>
                In Fī Riyāḍ al-Tafsīr <span className="normal-case tracking-normal font-normal tabular-nums" style={{ color: FAINT }}>· {r.tafsirTotal}</span>
              </h3>
              <ul className="space-y-2">{r.tafsir.map((p, i) => <Passage key={i} p={p} />)}</ul>
              <More q={q} section="tafsir" shown={r.tafsir.length} total={r.tafsirTotal} noun="passages in the tafsīr" />
            </div>
          )}

          {r.worksTotal > 0 && (
            <div id="works" className="scroll-mt-24">
              <h3 className="font-english text-[13px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: SUB }}>
                Beyond Fī Riyāḍ al-Tafsīr <span className="normal-case tracking-normal font-normal tabular-nums" style={{ color: FAINT }}>· {r.worksTotal}</span>
              </h3>
              <ul className="space-y-2">{r.works.map((p, i) => <Passage key={i} p={p} />)}</ul>
              <More q={q} section="works" shown={r.works.length} total={r.worksTotal} noun="passages beyond Fī Riyāḍ al-Tafsīr" />
            </div>
          )}

        </section>
      )}

      {/* ---- His students ---- */}
      {r.studentsTotal > 0 && (
        <section className="mt-10">
          <SectionHead id="students" label="Commentaries of his students" count={r.studentsTotal} />
          <Hint>How scholars of the Fayḍa who learned from him explain the same verses. These are their words, not his.</Hint>
          <ul className="space-y-2">{r.students.map((p, i) => <Passage key={i} p={p} />)}</ul>
          <More q={q} section="students" shown={r.students.length} total={r.studentsTotal} noun="passages by his students" />
        </section>
      )}

      {q && !nothing && !/[\u0600-\u06FF]/.test(q) && !(arabicForm && saysCount > 0) && (
        <p className="font-english text-[13px] mt-8 text-center" style={{ color: FAINT }}>
          English reaches the translated lessons and translated passages only.{' '}
          {arabicForm ? (
            <Link href={`/search?q=${encodeURIComponent(arabicForm)}`} style={{ color: GOLD }} className="py-1 inline-block">
              Search the Arabic, <span className="font-arabic" dir="rtl">{arabicForm}</span>, to reach every lesson →
            </Link>
          ) : 'Search in Arabic to reach every lesson.'}
        </p>
      )}
    </main>
  );
}
