import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOPICS, getTopic } from '@/lib/topics';

export function generateStaticParams() {
  return TOPICS.map(t => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const t = getTopic(params.slug);
  if (!t) return {};
  return { title: `${t.title} (${t.term})`, description: t.question };
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const t = getTopic(params.slug);
  if (!t) notFound();
  return (
    <main className="max-w-3xl mx-auto px-4 pb-32 pt-6" dir="ltr">
      <p className="font-english text-[12px] mb-3"><Link href="/topics" className="text-gold/70 hover:text-gold">← Topics</Link></p>
      <p className="font-arabic text-gold text-xl mb-1" dir="rtl" translate="no">{t.termAr}</p>
      <h1 className="font-english text-[20px] font-semibold leading-snug mb-4" style={{ color: 'var(--body-text, rgba(255,255,255,0.92))' }}>
        {t.question}
      </h1>
      <p className="font-english text-[15.5px] leading-relaxed pl-4 border-l-2 mb-8"
        style={{ borderColor: 'rgba(201,168,76,0.6)', color: 'var(--body-text, rgba(255,255,255,0.85))' }}>
        {t.answer}
      </p>

      <ul className="space-y-2 mb-10">
        {t.points.map(([head, body]) => (
          <li key={head} className="rounded-lg px-4 py-2.5 font-english text-[14px] leading-relaxed"
            style={{ background: 'rgba(201,168,76,0.07)', color: 'var(--body-sub, rgba(255,255,255,0.8))' }}>
            <strong className="text-gold font-semibold">{head}</strong> {body}
          </li>
        ))}
      </ul>

      <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-4">In his words</h2>
      <ol className="space-y-8">
        {t.passages.map((p, i) => (
          <li key={i} className="pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <h3 className="font-english text-[15.5px] font-semibold" style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
                <span className="text-gold">{i + 1}.</span> {p.title}
              </h3>
              <span className="font-english text-[12px]" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
                Vol. {p.volume}, p. {p.page} ·{' '}
                <Link href={`/lesson/${p.lesson}`} className="hover:text-gold underline-offset-2 hover:underline">Lesson {p.lesson}</Link> ·{' '}
                <Link href={`/verse/${p.verse[0]}/${p.verse[1]}`} className="hover:text-gold underline-offset-2 hover:underline">Q {p.verse[0]}:{p.verse[1]}</Link>
              </span>
            </div>
            <p className="font-arabic text-[19px] leading-[2] text-right mb-2" dir="rtl" lang="ar" translate="no"
              style={{ color: 'var(--body-text, rgba(255,255,255,0.9))' }}>
              {p.ar}
            </p>
            <p className="font-english text-[15px] leading-relaxed" style={{ color: 'var(--body-sub, rgba(255,255,255,0.78))' }}>{p.en}</p>
            {p.note && (
              <p className="font-english text-[13px] italic leading-relaxed mt-2" style={{ color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>{p.note}</p>
            )}
          </li>
        ))}
      </ol>

      {t.related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-english text-[11px] tracking-[0.12em] uppercase text-gold/60 mb-2">Related</h2>
          <ul className="font-english text-[14px] space-y-1">
            {t.related.map(slug => {
              const r = getTopic(slug);
              return r ? <li key={slug}><Link href={`/topics/${slug}`} className="text-gold/80 hover:text-gold underline">{r.question}</Link></li> : null;
            })}
          </ul>
        </div>
      )}

      <p className="font-english text-[12.5px] mt-12 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'var(--body-faint, rgba(255,255,255,0.5))' }}>
        Source: Shaykh Ibrāhīm Niasse, <em>Fī Riyāḍ al-Tafsīr li-l-Qurʾān al-Karīm</em>, ed. Muḥammad b. al-Shaykh ʿAbd Allāh al-Tijānī,
        2nd ed., 10 vols. (Tunis: Majmaʿ al-Yamāma, 2022).{' '}
        {t.draft ? 'English drafted; not yet reviewed by the translator, Amadu Kunateh.' : 'Translations by Amadu Kunateh.'}
      </p>
    </main>
  );
}
