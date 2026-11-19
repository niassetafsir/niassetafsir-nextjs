import Link from 'next/link';
import { getEditionFacts } from '@/lib/coverage';
import type { Metadata } from 'next';

/**
 * What this edition is, what it rests on, who made it, and how to cite it.
 *
 * This absorbed /about/arabic-edition, /about/translator, and the front matter
 * of /editorial-note. Five pages described the same edition and disagreed with
 * each other: the footnote total was given as 1,994 in three places and 1,997 in
 * the navigation, and the translation was said to cover "Lessons 1–2" in two
 * places while five lessons are translated. Numbers a reader could check against
 * the site were wrong, which is worse than not stating them.
 *
 * Every count on this page is now read from src/data at build time, through
 * getEditionFacts() in src/lib/coverage.ts, so the page cannot drift from the
 * files the way its predecessors did. What stays written by hand is the claims
 * about the *printed* edition -- the compiler's six thousand hadith citations,
 * the ten-volume recension superseding the six-volume. Those are facts about a
 * book; counting files cannot check them.
 */

export const metadata: Metadata = {
  title: 'About Manṭiq al-Fayḍa',
  description:
    'Manṭiq al-Fayḍa collects the Qurʾānic exegesis of Shaykh Ibrāhīm Niasse across his works, verse by verse, with Fī Riyāḍ al-Tafsīr in Arabic and English: what it holds, who makes it, and how to cite it.',
  openGraph: {
    title: 'About Manṭiq al-Fayḍa | niassetafsir.org',
    description:
      'The Qurʾānic exegesis of Shaykh Ibrāhīm Niasse, collected across his works and indexed verse by verse.',
  },
};

export default async function AboutPage() {
  const facts = await getEditionFacts();

  return (
    <main className="max-w-2xl mx-auto px-6 pb-24 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-arabic text-gold text-2xl" dir="rtl" translate="no">مَنْطِقُ الفَيْضَة</div>
        <div className="font-english text-gold text-xl font-semibold mt-1">Manṭiq al-Fayḍa</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Majmūʿ al-Tafsīr li-Ṣāḥib al-Fayḍa · The Collected Tafsīr of Ṣāḥib al-Fayḍa
        </div>
      </div>

      <div className="space-y-8 font-english text-white/70 leading-relaxed text-sm">

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            What This Site Is
          </h2>
          <p className="leading-6">
            The tafsīr of Shaykh Ibrāhīm Niasse (d. 1975) in one place, by three paths.{' '}
            <Link href="/read" className="text-gold/70 hover:text-gold transition-colors"><em>Fī Riyāḍ al-Tafsīr</em></Link>{' '}
            holds the Arabic sessions of 1964 in which he explained the whole Qurʾān.{' '}
            <Link href="/beyond" className="text-gold/70 hover:text-gold transition-colors">Beyond Fī Riyāḍ al-Tafsīr</Link>{' '}
            gathers his explanation of verses in his other sessions, letters, sermons, treatises, poems
            and journeys: in Arabic, and in Wolof as those recordings are found.{' '}
            <Link href="/students" className="text-gold/70 hover:text-gold transition-colors">Commentaries of his students</Link>{' '}
            holds how scholars of the Fayḍa who learned from him explain the same verses, marked as theirs.
          </p>
          <p className="leading-6 mt-3">
            Open a verse and the paths meet: what he says about it, wherever he says it, in his Arabic
            with English and a page reference. The{' '}
            <Link href="/topics" className="text-gold/70 hover:text-gold transition-colors">topics</Link>{' '}
            gather what he says on one subject across many verses.
          </p>
          <p className="leading-6 mt-3">
            The Arabic of <em>Fī Riyāḍ al-Tafsīr</em> follows the revised ten-volume edition that
            Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī compiled from the original recordings
            {facts.translatedCount > 0 && (
              <>; the English covers Lesson{facts.translatedCount > 1 ? 's' : ''} {facts.translatedFirst}
              {facts.translatedCount > 1 ? `–${facts.translatedLast}` : ''}</>
            )}. The{' '}
            <Link href="/translators-note" className="text-gold/70 hover:text-gold transition-colors">editorial conventions</Link>{' '}
            explain how the text is presented.
          </p>
        </div>
        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Why the Qurʾān
          </h2>
          <p className="leading-6">
            In West African Muslim societies, explaining the Qurʾān was the summit of learning, and it
            was public Qurʾān explanation that launched the community of the Fayḍa (Wright 2024). In
            Kano, his disciples remade the study, teaching and public performance of tafsīr in the
            1950s and 1960s (Brigaglia 2009). Shaykh Ibrāhīm, <em>ṣāḥib al-fayḍa</em>, taught the
            whole Qurʾān in public in the annual Ramaḍān sessions, and the last full cycle, recorded in
            1964, is the text of <em>Fī Riyāḍ al-Tafsīr</em> (Ogunnaike 2018).
          </p>
          <p className="leading-6 mt-3">
            The Fayḍa is a flood of the knowledge of God, <em>maʿrifa</em> (Brigaglia 2000–2001;
            Seesemann 2011). His community passed that knowledge on through the disciplines it already
            taught, the Qurʾān first among them, so that Sufi training revived Islamic learning rather
            than displacing it (Wright 2015; de Diego González 2020). The Qurʾān stays at the centre
            of the community&rsquo;s life after him, in the teaching of men and women alike (Hill 2018,
            2019). His tafsīr is where the Fayḍa&rsquo;s teaching on God, the human being and the path
            is worked out verse by verse, and the history of the Fayḍa can be told from it (Kunateh
            2026; Kunateh, forthcoming).
          </p>
          <ul className="mt-4 space-y-1.5 text-[12.5px] leading-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <li>Brigaglia, Andrea. &ldquo;The Fayda Tijaniyya of Ibrāhīm Nyass: Genesis and Implications of a Sufi Doctrine.&rdquo; <em>Islam et sociétés au sud du Sahara</em> 14–15 (2000–2001): 41–56.</li>
            <li>Brigaglia, Andrea. &ldquo;Learning, Gnosis and Exegesis: Public Tafsīr and Sufi Revival in the City of Kano (Northern Nigeria), 1950–1970.&rdquo; <em>Die Welt des Islams</em> 49, no. 3/4 (2009): 334–66.</li>
            <li>de Diego González, Antonio. <em>Ley y gnosis: Historia intelectual de la ṭarīqa Tijāniyya</em>. Granada: Editorial Universidad de Granada, 2020.</li>
            <li>Hill, Joseph. <em>Wrapping Authority: Women Islamic Leaders in a Sufi Movement in Dakar, Senegal</em>. Toronto: University of Toronto Press, 2018.</li>
            <li>Hill, Joseph. &ldquo;Women Who Are Men: Shaykha Maryam Niasse and the Qurʾān in Dakar.&rdquo; In <em>Approaches to the Qurʾān in Sub-Saharan Africa</em>, edited by Zulfikar Hirji, 369–400. Oxford: Oxford University Press, 2019.</li>
            <li>Kunateh, Amadu. &ldquo;Identity without Being: Personhood in the Tafsīr of Shaykh Ibrāhīm Niasse.&rdquo; <em>Sophia</em> 65, no. 3 (2026): 489–510.</li>
            <li>Kunateh, Amadu. &ldquo;Leaders of Knowledge: Rethinking Islamic Erudition in Twentieth-Century West Africa through Shaykh Ibrāhīm Niasse&rsquo;s <em>Fī Riyāḍ al-Tafsīr</em>.&rdquo; PhD diss., Harvard University, forthcoming.</li>
            <li>Ogunnaike, Oludamini. &ldquo;In the Gardens with Ibrahim: An Evaluation of <em>Fī riyāḍ al-tafsīr</em> by Shaykh Ibrahim Niasse, a Contemporary, Traditional Tafsīr.&rdquo; <em>Journal of Qur&rsquo;anic Studies</em> 20, no. 1 (2018). doi:10.3366/jqs.2018.0319.</li>
            <li>Seesemann, Rüdiger. <em>The Divine Flood: Ibrāhīm Niasse and the Roots of a Twentieth-Century Sufi Revival</em>. New York: Oxford University Press, 2011.</li>
            <li>Wright, Zachary Valentine. <em>Living Knowledge in West African Islam: The Sufi Community of Ibrāhīm Niasse</em>. Leiden: Brill, 2015.</li>
            <li>Wright, Zachary Valentine. &ldquo;The Qurʾān and Knowledge of God in West Africa: The Sufi Tafsīr of Shaykh Ibrāhīm Niasse.&rdquo; <em>Islamic Africa</em> 15, no. 1 (2024): 69–97.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Who Made It
          </h2>
          <p className="leading-6">
            <strong className="text-white/85">Amadu Kunateh</strong>, a PhD candidate on the Committee
            on the Study of Religion at Harvard University, built and maintains the site and translates
            the tafsīr.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="https://orcid.org/0009-0002-7839-6474" target="_blank" rel="noopener"
              className="tap inline-flex items-center gap-1.5 font-english text-xs text-white/40 hover:text-gold transition-colors">
              <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" style={{ opacity: 0.7 }}>
                <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm-9.1 57.7c4.6 0 8.3 3.8 8.3 8.5s-3.7 8.5-8.3 8.5-8.3-3.8-8.3-8.5 3.7-8.5 8.3-8.5zm-9 29h18v91.5h-18V86.7zm48.1 0h22.9c21.8 0 36.4 14.9 36.4 45.4s-14.6 46.1-36.4 46.1H158V86.7zm18 18v55.5h4.4c12.1 0 18.6-9.1 18.6-27.8 0-18.7-6.5-27.7-18.6-27.7H176z" />
              </svg>
              ORCID: 0009-0002-7839-6474
            </a>
            <a href="mailto:niassetafsirproject@gmail.com"
              className="tap font-english text-xs text-white/40 hover:text-gold transition-colors">
              niassetafsirproject@gmail.com
            </a>
          </div>
          <p className="leading-6 mt-4 pt-4 border-t border-white/8">
            <strong className="text-white/70">Ally Mahmoud</strong>, web development review.<br />
            <strong className="text-white/70">Dayyib Bashir Sheikh Dahir</strong>, Arabic textual verification and proofreading.<br />
            <strong className="text-white/70">Kabir Aliyu Sheikh Dahir</strong>, Arabic textual verification and proofreading.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            How to Cite
          </h2>
          <div className="p-4 border border-gold/20 rounded-xl bg-gold/4">
            <p className="font-english text-white/80 text-sm leading-7">
              Ibrāhīm Niasse, <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>, comp.
              Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed.
              (n.p., n.d.). Digital bilingual ed., ed. Amadu Kunateh
              (ORCID: 0009-0002-7839-6474). niassetafsir.org, 2025. Edition 1.0.
            </p>
          </div>
          <p className="leading-6 mt-3 text-white/50 text-xs">
            Any passage
            you save on this site carries its own citation; see{' '}
            <Link href="/saved" className="text-gold/70 hover:text-gold transition-colors">Saved</Link>.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Copyright
          </h2>
          <p className="leading-6">
            Arabic edition © Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī.
            English translation © Amadu Kunateh. All rights reserved.
            Scholarly quotation with full citation is permitted.
            Reproduction, redistribution, or commercial use without written permission is prohibited.
          </p>
        </div>

      </div>

      <div className="mt-10 pt-6 border-t border-gold/15 text-center">
        <Link href="/"
          className="tap font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 rounded-lg transition-all">
          ← Home
        </Link>
      </div>
    </main>
  );
}
