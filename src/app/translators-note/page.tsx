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
    "How to read the text on niassetafsir.org: the Arabic, whose words are whose, translation and summary, and transliteration.",
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
        <div className="font-english text-white/50 text-sm mt-2">How to read the texts on this site</div>
      </div>

      <div className="font-english text-white/75 text-base leading-relaxed">

        <p className="mb-3">
          This page explains the editions, translations and editorial conventions used in 
          <em>Manṭiq al-Fayḍa</em>. It distinguishes Shaykh Ibrāhīm&apos;s own words from the work of
          compilers, translators and editors.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">The Arabic Text</h2>
        <p className="mb-3">
          The Arabic text of <em>Fī Riyāḍ al-Tafsīr</em> follows the revised ten-volume edition compiled
          by Muḥammad b. al-Shaykh ʿAbd Allāh al-Tijānī from the original 1964 recordings (Tunis: Majmaʿ
          al-Yamāma, 2022). The lessons appear in the order in which Shaykh Ibrāhīm delivered them.
          Volume and page references correspond to this edition.
        </p>
        <p className="mb-3">
          The Qurʾānic text follows the riwāya of Warsh ʿan Nāfiʿ, the reading widely used in North and
          West Africa. The Arabic commentary is reproduced as printed in the edition. Passages from Shaykh
          Ibrāhīm&apos;s other works follow the editions identified in their individual references.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Attribution</h2>
        <p className="mb-3">
          The commentary in <em>Fī Riyāḍ al-Tafsīr</em> belongs to Shaykh Ibrāhīm. Footnotes within the
          lessons belong to the compiler and are identified by their numbered markers 
          <sup className="text-gold/80 text-xs">[n]</sup>.
        </p>
        <p className="mb-3">
          On individual verse pages, commentaries by his students appear separately beneath his own
          commentary and are attributed to their authors. Where a student reports Shaykh Ibrāhīm&apos;s
          teaching, the passage is identified as a report of his words.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Translation and Summary</h2>
        <p className="mb-3">
          The English translation of <em>Fī Riyāḍ al-Tafsīr</em> is by Amadu Kunateh
          {translatedCount > 0 && translatedFirst !== null && translatedLast !== null && (
            <> and currently covers Lessons {translatedFirst}–{translatedLast}</>
          )}.
        </p>
        <p className="mb-3">
          Passages from Shaykh Ibrāhīm&apos;s other works appear in Arabic, with an English translation
          where one has been made. The short account at the head of each topic page is the
          editor&apos;s; the passages beneath it are Shaykh Ibrāhīm&apos;s words.
        </p>
        <p className="mb-3">
          These translation choices recur throughout the edition:
        </p>
        <ul className="mb-3 list-disc pl-6 space-y-1.5">
          <li>Basmala: &ldquo;By Allah&apos;s Name: The Entirely Merciful, The Especially Merciful.&rdquo; This
            keeps the distinction between al-Raḥmān and al-Raḥīm that Shaykh Ibrāhīm develops in his
            commentary.</li>
          <li><em>ʿAbd</em>: &ldquo;slave.&rdquo;</li>
          <li><em>Al-Ḥamdu li-Llāh</em> stays in Arabic, glossed &ldquo;The Praise is for Allah.&rdquo;</li>
          <li>Allah is never rendered &ldquo;God,&rdquo; because Shaykh Ibrāhīm holds that Allah is a
            personal name.</li>
          <li><em>Maʿrifa</em>: &ldquo;recognition&rdquo;; <em>al-ʿārif</em>: &ldquo;the recognizer.&rdquo;</li>
        </ul>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Transliteration</h2>
        <p className="mb-3">
          Transliteration follows the system and word list of the <em>International Journal of Middle East
          Studies</em> (IJMES). The Arabic text keeps the spelling and orthography of the printed edition.
          In the English, the honorific ﷺ follows the Prophet&apos;s name wherever the Arabic gives a
          blessing on him.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Qurʾānic References</h2>
        <p className="mb-3">
          Qurʾānic references appear in the form Q sūra:āya; for example, Q 2:255 is Sūrat al-Baqara,
          verse 255. Within the Arabic commentary, small numbers identify the verses being quoted. On verse
          pages the English of the Qurʾān is M. M. Pickthall&apos;s unless a rendering by Amadu Kunateh is
          given, and each is named where it appears, so the translation of the Qurʾān is never confused
          with the translation of Shaykh Ibrāhīm&apos;s commentary.
        </p>

        <h2 className="font-english text-gold text-lg font-semibold mt-9 mb-3 pb-2 border-b border-gold/20">Bibliographical References</h2>
        <p className="mb-3">
          References to <em>Fī Riyāḍ al-Tafsīr</em> give the date, lesson, volume and page of the revised
          ten-volume edition. References to other works give the title, date, edition and page wherever
          this information is available.
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
