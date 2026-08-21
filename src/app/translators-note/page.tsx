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
    "Editorial principles for the digital edition of Niasse's tafsīr: digitisation, footnote markers, verse ranges, transliteration, honorifics, the Warsh rasm, and the translation choices.",
  openGraph: {
    title: 'Editorial Conventions | niassetafsir.org',
    description:
      "Editorial principles, digitisation methodology, and translation conventions for the bilingual edition of Niasse's tafsīr.",
  },
};

export default async function EditorialConventionsPage() {
  const { footnoteCount, footnoteLessons, totalLessons } = await getEditionFacts();
  return (
    <main className="max-w-3xl mx-auto px-4 pb-24 pt-6" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="tap font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <h1 className="font-english text-gold text-2xl font-semibold italic">Editorial Conventions</h1>
        <div className="font-english text-white/50 text-sm mt-2">
          How this text was made, and how to read it
        </div>
        <p className="font-english text-white font-semibold text-center mt-4">Amadu Kunateh</p>
        <p className="font-english text-white/45 text-sm text-center">
          PhD Candidate, Philosophy of Religion and African Studies
        </p>
        <p className="font-english text-gold/50 text-xs mt-3">Edition 1.0 · April 2025</p>
      </div>

      <div className="font-english text-white/75 text-base leading-relaxed">

        <h2 className="font-english text-gold text-xl font-semibold mt-4 mb-4 pb-3 border-b border-gold/20">
          Structure and method
        </h2>
        <p className="mb-3 text-justify">
          The present edition presents the Arabic text of <em>Fī Riyāḍ al-Tafsīr</em> in the Warsh ʿan
          Nāfiʼ rasm, the orthographic standard of North and West Africa in which the tafsīr was
          delivered, with an English translation on facing pages. The edition is structured in seven
          volumes, each corresponding to one of the seven manzils, the weekly Qurʾānic recitation cycle
          that Niasse himself practised and celebrated in verse. He enumerated the opening sūra of each
          manzil in verse and invoked two of the Qurʾān&apos;s names, al-Furqān (the Criterion) and
          al-Jamʼ (the Joining):
        </p>
        <blockquote className="my-4 ml-6 pl-4 border-l-2 border-gold/40 font-english text-sm text-white/75 italic leading-8">
          Al-Fātiḥah, al-Māʾida, Yūnus, al-Isrāʾ,<br />
          al-Shuʿarāʾ, al-Ṣāffāt, Qāf, thus it is clarified.<br />
          He who joins the Criterion with the Joining<br />
          completes a full recitation of the Criterion.
        </blockquote>
        <p className="mb-3 text-justify">
          This structure reflects fidelity to the Shaykh&apos;s own relationship to the Qurʾān.
          Qurʾānic audio is presented per verse using the recitation of Maḥmūd Khalīl al-Ḥuṣarī
          (1917–1980) in the Warsh riwāya. The Warsh rasm is the standard of the Qurʾān as recited and
          taught in the Tijānī tradition, and it differs in certain orthographic details from the Ḥafṣ
          rasm more familiar to readers outside it.
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          Digitisation and display
        </h2>
        <p className="mb-3 text-justify">
          The Arabic text was digitised from the printed ten-volume edition. The compiled edition
          presents the commentary as continuous Arabic prose with footnotes interspersed throughout each
          lesson section. For readability, this edition separates the body text — Niasse&apos;s
          commentary — from the footnote block, the compiler&apos;s documentary apparatus. The body text
          appears in the Shaykh&apos;s Tafsīr panel; the footnotes in the Critical Apparatus beside it.
        </p>
        <p className="mb-3 text-justify">
          The lesson structure follows the compiler&apos;s ten-volume organisation: each lesson
          corresponds to a session of oral delivery. The site presents all fifty-six lessons, covering
          the Qurʾān from al-Fātiḥa through al-Nās (Q. 1:1–114:6).
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          Footnote markers
        </h2>
        <p className="mb-3 text-justify">
          The compiler&apos;s footnotes are marked inline in the Arabic text with superscript numbers{' '}
          <sup className="text-gold/80 text-xs">[n]</sup>. Each marker is a link that opens the
          corresponding entry in the Critical Apparatus, where the full footnote appears in Arabic with
          an English citation header. The same markers appear in the translated lessons, where the
          translation preserves the footnote numbering of the Arabic source.
        </p>
        <p className="mb-3 text-justify">
          The apparatus has been classified by subject genre — Hadith Sciences, Tafsīr, Theology,
          Sufism, Fiqh, Linguistics, History — a classification not present in the printed Arabic text
          and an original editorial contribution of this digital edition. It covers{' '}
          {footnoteLessons === totalLessons
            ? `all ${totalLessons} lessons`
            : `${footnoteLessons} of the ${totalLessons} lessons`},{' '}
          {footnoteCount.toLocaleString('en-US')} footnotes in all. The apparatus for the remaining
          lessons is withheld while its inline markers are re-checked against the verified documents.
          Browse what is published at{' '}
          <Link href="/footnotes" className="text-gold/70 hover:text-gold transition-colors">Footnotes</Link>.
        </p>
        <p className="mb-3 text-justify">
          The apparatus throughout preserves all of Niasse&apos;s original scholarly citations — to the
          hadith collections, to al-Suyūṭī&apos;s <em>al-Itqān</em>, to al-Ghazālī, to Ibn ʿArabī —
          traced to their canonical sources.
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          Three voices
        </h2>
        <p className="mb-3 text-justify">
          Three people speak on a lesson page, and the edition keeps them apart. The commentary is
          Niasse&apos;s. The footnotes are Muḥammad ibn al-Shaykh&apos;s, and they are documentary:
          they record where a ḥadīth comes from, in which collection, at which number, on which page.
          The editor&apos;s notes are the present editor&apos;s, and they are interpretive: they place
          a passage in the debate it addresses, name the position Niasse is answering, or identify a
          source he alludes to without naming it.
        </p>
        <p className="mb-3 text-justify">
          The two apparatuses are never merged. The editor&apos;s notes stand above the
          compiler&apos;s in the Critical Apparatus panel, ruled in gold, each carrying its
          author&apos;s name and marked as absent from the printed edition. Where this edition asks
          you to accept a judgement rather than a citation, it tells you whose.
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          Verse ranges and volume references
        </h2>
        <p className="mb-3 text-justify">
          The verse range given for each lesson (Q. 2:6–25, for instance) has been verified against the
          ten-volume structural document prepared for this edition and, for Volumes 1–5 (Lessons 1–30),
          against the physical printed volumes. Volume and page references cite the ten-volume compiled
          edition, and page numbers are given for all ten volumes.
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          The translation
        </h2>
        <p className="mb-3 text-justify">
          The English translation is by Amadu Kunateh and currently covers Lessons 1–5; the complete
          bilingual translation is under review for publication with an academic publisher. It proceeds
          from a commitment to scholarly precision and readability. The register is formal academic prose
          that preserves the oral cadences of the original — its directness, its rhythmic repetitions,
          and its transitions between legal analysis and spiritual address. Technical terms are retained
          in Arabic on first occurrence, with English equivalents in parentheses, and thereafter used in
          transliteration.
        </p>
        <p className="mb-3 text-justify">
          Three translation choices warrant explicit statement. First, the Basmala is rendered
          &ldquo;By Allāh&apos;s Name, The Entirely Merciful, The Especially Merciful,&rdquo; preserving
          the theological distinction between al-Raḥmān and al-Raḥīm that Niasse himself elaborates at
          length. Second, <em>ʿabd</em> is translated &ldquo;slave&rdquo; throughout, as the more precise
          rendering of the term&apos;s theological weight — the relationship of complete ontological
          submission that <em>ʿabd</em> carries in Niasse&apos;s usage. Third, <em>al-ḥamdu lillāh</em>{' '}
          is rendered as two words, &ldquo;al-ḥamdu lillāh (The Praise is for God),&rdquo; preserving
          both the Arabic formula and its syntactic structure.
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          Transliteration and honorifics
        </h2>
        <p className="mb-3 text-justify">
          Arabic transliteration follows IJMES conventions throughout. Following the name of the Prophet,
          the ligature ﷺ (ṣallā Allāhu ʿalayhi wa-sallam, &ldquo;may Allāh&apos;s peace and blessings be
          upon him&rdquo;) stands in the English text for whatever form the Arabic gives; the Arabic
          itself is left exactly as the compiled edition prints it, whether spelled out or contracted,
          and is not emended to match. Following the names of Companions and recognized saints, r.a.
          (raḍiya Allāhu ʿanhu/ʿanhā, &ldquo;may Allāh be pleased with him/her&rdquo;) is retained in
          abbreviated form. <em>ʿAlayhi al-salām</em>, after the names of prophets other than Muḥammad,
          is left as the Arabic has it. Qurʾānic citations are given as Q. followed by chapter and verse.
          Technical Arabic terms are given in transliteration on first occurrence with an English
          equivalent in parentheses; thereafter in transliteration only.
        </p>

        <h2 className="font-english text-gold text-xl font-semibold mt-10 mb-4 pb-3 border-b border-gold/20">
          Citation
        </h2>
        <p className="mb-3 text-justify">
          How to cite this edition, its copyright, and its version history are on the{' '}
          <Link href="/about" className="text-gold/70 hover:text-gold transition-colors">About</Link> page.
          Any passage you save on the site carries its own citation.
        </p>
        {/* Acknowledgements section withheld pending final publication */}
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
