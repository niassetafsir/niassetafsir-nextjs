import Link from 'next/link';
import type { Metadata } from 'next';
import { getEditionFacts } from '@/lib/coverage';

/**
 * How the text was made and how to read it: digitisation, the footnote
 * apparatus, verse ranges, the translation, transliteration and honorifics.
 *
 * This absorbed /editorial-note. The two pages cross-linked each other for the
 * same three translation choices -- the Basmala, ʿabd, al-ḥamdu lillāh -- so a
 * reader following the link found the argument he had just read, in different
 * words. /editorial-note now redirects here.
 *
 * Two figures were corrected against src/data on 20 August 2026: the apparatus
 * holds 1,997 footnotes, not 1,994, and the translation covers Lessons 1-5, not
 * Lessons 1-2.
 */

export const metadata: Metadata = {
  title: 'Editorial Conventions',
  description:
    "How to read the text on niassetafsir.org: the Arabic, whose words are whose, translation and summary, transliteration, and the marks beside a Qurʾānic quotation.",
  openGraph: {
    title: 'Editorial Conventions | niassetafsir.org',
    description:
      "Editorial principles, digitisation methodology, and translation conventions for the digital edition of Shaykh Ibrāhīm's tafsīr.",
  },
};

export default async function EditorialConventionsPage() {
  const { translatedFirst, translatedLast, translatedCount } = await getEditionFacts();
  return (
    <main className="max-w-3xl mx-auto px-4 pb-24 pt-6" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="tap font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <div className="text-center pb-6 mb-6 border-b border-gold/20">
        <h1 className="font-english text-gold text-2xl font-semibold italic">Editorial Conventions</h1>
        <div className="font-english text-white/50 text-sm mt-2">How to read the text on this site</div>
      </div>

      <div className="font-english text-white/75 text-base leading-relaxed">

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">The Arabic</h2>
        <p className="mb-3">
          <em>Fī Riyāḍ al-Tafsīr</em> is given in the revised ten-volume edition that Muḥammad ibn
          Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī compiled from the 1964 recordings, lesson by lesson
          as he delivered it. Volume and page references cite that edition. The Qurʾān is in the
          riwāya of Warsh ʿan Nāfiʿ, the reading of North and West Africa, and the Arabic is left as the
          printing has it.
        </p>
        <p className="mb-3">
          Passages from his other works are read from the page of the edition named beside them.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Whose words</h2>
        <p className="mb-3">
          The commentary is Shaykh Ibrāhīm&apos;s. The footnotes on a lesson are the compiler&apos;s,
          and open from their markers <sup className="text-gold/80 text-xs">[n]</sup> under his name.
          On a verse page, the commentaries of his students stand below his words and are marked as
          theirs; where a student reports what Shaykh Ibrāhīm said, that report stands with his own.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Translation and summary</h2>
        <p className="mb-3">
          The English of <em>Fī Riyāḍ al-Tafsīr</em> is a translation by Amadu Kunateh
          {translatedCount > 0 && translatedFirst !== null && translatedLast !== null && (
            <>, so far for Lessons {translatedFirst}–{translatedLast}</>
          )}. Elsewhere, English marked <span className="text-[12px] uppercase tracking-[0.08em]" style={{ opacity: 0.7 }}>In brief</span>{' '}
          sums up how he uses a verse and is not a translation.
        </p>
        <p className="mb-3">
          Three choices recur. The Basmala reads &ldquo;By Allāh&apos;s Name, The Entirely Merciful,
          The Especially Merciful,&rdquo; keeping the distinction between al-Raḥmān and al-Raḥīm that
          he draws at length. <em>ʿAbd</em> is &ldquo;slave.&rdquo; <em>Al-ḥamdu lillāh</em> is
          &ldquo;The Praise is for God.&rdquo;
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Transliteration and references</h2>
        <p className="mb-3">
          Transliteration follows IJMES. In the English, ﷺ follows the Prophet&apos;s name whatever
          form the Arabic gives, and the Arabic is left as printed. Qurʾānic references read Q. sūra:āya.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">The marks beside a Qurʾānic quotation</h2>
        <p className="mb-3">
          The Arabic was transcribed from a scan, which can confuse letters that differ only by their
          dots. Every quotation in the lessons has been read against a Warsh muṣḥaf, and a small mark
          says what that showed:{' '}
          <span style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>✓</span> the quotation matches the āya
          named;{' '}
          <span style={{ color: '#C9A84C' }}>≠</span> the āya is identified but the printing reads otherwise;{' '}
          <span style={{ color: 'var(--body-faint, rgba(255,255,255,0.45))' }}>?</span> the passage is too damaged to
          identify. Nothing is silently corrected. Click a mark to suggest a reading.
        </p>
      </div>

      <div className="mt-12 pt-6 border-t border-gold/15 text-center">
        <Link href="/lesson/1"
          className="tap font-english text-sm text-bg bg-gold hover:bg-gold-light px-5 rounded-lg font-semibold transition-all">
          Begin Reading → Lesson One
        </Link>
      </div>
    </main>
  );
}
