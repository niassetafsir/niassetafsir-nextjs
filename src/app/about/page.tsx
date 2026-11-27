import Link from 'next/link';
import { getEditionFacts } from '@/lib/coverage';
import type { Metadata } from 'next';
import VerseMarker from '@/components/VerseMarker';

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
      <div className="text-center pb-6 mb-2">
        <div className="font-wordmark text-gold text-4xl" dir="rtl" translate="no">منطق الفيضة</div>
        <h1 className="font-english text-gold text-xl font-semibold mt-1">Manṭiq al-Fayḍa</h1>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Shaykh Ibrāhīm Niasse and His School on the Qurʾān
        </div>
      </div>
      <VerseMarker className="mb-8" />

      <div className="space-y-8 font-english text-white/70 leading-relaxed text-sm">

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            What This Site Is
          </h2>
          <p className="leading-6">
            <em>Manṭiq al-Fayḍa</em> brings together the Qurʾānic explanations of Shaykh Ibrāhīm Niasse
            (d. 1975) and scholars of the Fayḍa in one searchable collection. It is a collection of
            Qurʾānic commentary: a passage is included when it explains a verse, saying what the verse
            means or how it is to be read, and not when a verse is only quoted in support of a point.
            The collection follows three paths.
          </p>
          <p className="leading-6 mt-3">
            <Link href="/read" className="text-gold/70 hover:text-gold transition-colors"><em>Fī Riyāḍ al-Tafsīr</em></Link>{' '}
            presents Shaykh Ibrāhīm&rsquo;s 56 recorded lessons on the whole Qurʾān, delivered during
            Ramaḍān 1964.
          </p>
          <p className="leading-6 mt-3">
            <Link href="/beyond" className="text-gold/70 hover:text-gold transition-colors"><em>Beyond Fī Riyāḍ al-Tafsīr</em></Link>{' '}
            gathers his explanations of individual verses across other writings and activities, including
            sessions, letters, sermons, treatises and travel accounts.
          </p>
          <p className="leading-6 mt-3">
            <Link href="/students" className="text-gold/70 hover:text-gold transition-colors">Commentaries of His Students</Link>{' '}
            brings together Qurʾānic interpretations by scholars who learned from Shaykh Ibrāhīm, placing
            their explanations alongside his wherever they address the same verses.
          </p>
          <p className="leading-6 mt-3">
            The three collections meet on the page of each verse. Readers can follow Shaykh Ibrāhīm&rsquo;s
            explanations across different works and contexts, compare passages, and explore recurring
            subjects through the <Link href="/topics" className="text-gold/70 hover:text-gold transition-colors">Topics</Link>.
          </p>
          <p className="leading-6 mt-3">
            The Arabic text of <em>Fī Riyāḍ al-Tafsīr</em> follows the revised ten-volume edition compiled
            by Muḥammad b. al-Shaykh ʿAbd Allāh al-Tijānī from the original recordings.
            {facts.translatedCount > 0 && (
              <> The English translation currently covers Lesson{facts.translatedCount > 1 ? 's' : ''} {facts.translatedFirst}
              {facts.translatedCount > 1 ? `–${facts.translatedLast}` : ''}.</>
            )}{' '}The <Link href="/translators-note" className="text-gold/70 hover:text-gold transition-colors">Editorial Conventions</Link> explain the sources,
            translation choices and editorial distinctions used throughout the site.
          </p>
        </div>
        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Why the Qurʾān?
          </h2>
          <p className="leading-6">
            In West African Muslim societies, explaining the Qurʾān occupied the highest level of scholarly
            learning. Public explanation of the Qurʾān also played a central role in the emergence of the
            Fayḍa of Shaykh Ibrāhīm Niasse (Wright 2024).
          </p>
          <p className="leading-6 mt-3">
            In Kano, his disciples transformed the study, teaching and public performance of tafsīr during
            the 1950s and 1960s (Brigaglia 2009). Shaykh Ibrāhīm himself taught the whole Qurʾān in public
            during the annual Ramaḍān sessions. The last complete cycle, recorded in 1964, forms the basis
            of <em>Fī Riyāḍ al-Tafsīr</em> (Ogunnaike 2018).
          </p>
          <p className="leading-6 mt-3">
            The Fayḍa, understood as a flood of the recognition of Allah (<em>maʿrifa</em>), brought renewed
            attention to the Qurʾān and the disciplines of Islamic learning (Brigaglia 2000–2001; Seesemann
            2011; Wright 2015; de Diego González 2020). Its scholars carried this recognition through
            teaching, writing, spiritual formation and public instruction. The Qurʾān remained central to
            this intellectual and spiritual life, including in the teaching of women scholars (Hill 2018,
            2019).
          </p>
        </div>
        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Questions and the Qurʾān
          </h2>
          <p className="leading-6">
            Shaykh Ibrāhīm&rsquo;s engagement with the Qurʾān extended throughout his life and across many
            kinds of writing. He returned to individual verses in response to questions, criticisms,
            disputes and new circumstances.
          </p>
          <p className="leading-6 mt-3">
            His writings answer challenges to the Fayḍa (<em>Kāshif al-ilbās</em>, 1931), the
            permissibility of broadcasting the Qurʾān by radio (<em>al-Ḥujja al-bāligha</em>, 1956),
            disputes over sighting the new moon (<em>Kashf al-ghumma</em>) and the significance of space
            flight (<em>Risālat al-īmān bi-l-qaḍāʾ fī masʾalat ghazw al-faḍāʾ</em>, 1969, on Q 55:33). In
            each case, Qurʾānic verses provide the basis for his explanation and response. The sources are
            listed under <Link href="/beyond" className="text-gold/70 hover:text-gold transition-colors">Questions and occasions</Link>.
          </p>
          <p className="leading-6 mt-3">
            Reading these works together shows the range of contexts in which Shaykh Ibrāhīm interpreted
            the Qurʾān. It also makes it possible to follow how particular verses recur across his writings
            and how his explanations develop across different occasions.
          </p>
          <p className="leading-6 mt-3">
            His tafsīr is an important source for the Fayḍa&rsquo;s teaching on Allah, the human being and the
            spiritual path, and a way into the intellectual history of the community through its engagement
            with the Qurʾān (Kunateh 2026; Kunateh, forthcoming).
          </p>
          <h3 className="font-english text-white/80 text-[13px] font-semibold mt-5">References</h3>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
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
            <em>Manṭiq al-Fayḍa</em> was established by <strong className="text-white/85">Amadu Kunateh</strong>,
            a PhD candidate in the Committee on the Study of Religion at Harvard University. He oversees the
            digital collection, translates <em>Fī Riyāḍ al-Tafsīr</em> and develops the scholarly materials
            accompanying the texts.
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
          <h3 className="font-english text-white/80 text-[13px] font-semibold mt-5 pt-4 border-t border-white/8">Contributors</h3>
          <p className="leading-6 mt-1">
            <strong className="text-white/70">Ally Mahmoud</strong>: web development review.<br />
            <strong className="text-white/70">Dayyib Bashir Sheikh Dahir</strong>: Arabic textual verification and proofreading.<br />
            <strong className="text-white/70">Kabir Aliyu Sheikh Dahir</strong>: Arabic textual verification and proofreading.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            How to Cite
          </h2>
          <div className="p-4 border border-gold/20 rounded-xl bg-gold/4">
            <p className="font-english text-white/80 text-sm leading-7">
              Ibrāhīm Niasse, <em>Fī Riyāḍ al-Tafsīr li-l-Qurʾān al-Karīm</em>, comp. Muḥammad b.
              al-Shaykh ʿAbd Allāh al-Tijānī, 10 vols. (Tunis: Majmaʿ al-Yamāma, 2022). Digital bilingual
              edition and English translation by Amadu Kunateh, <em>Manṭiq al-Fayḍa</em>
              (niassetafsir.org, 2025–), doi:10.5281/zenodo.22983107. Accessed [date].
            </p>
          </div>
          <p className="leading-6 mt-3 text-white/50 text-xs">
            The Arabic text is the compiler&rsquo;s edition; the digital edition, its presentation and the
            English translation are Amadu Kunateh&rsquo;s. Give the date you consulted the site, since the
            edition is updated as lessons are added. For individual passages, give the lesson, volume and
            page of the printed edition; for passages from other works, the original work, its edition and
            page. Any passage you save on this site carries its own citation; see{' '}
            <Link href="/saved" className="text-gold/70 hover:text-gold transition-colors">Saved</Link>.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Copyright
          </h2>
          <p className="leading-6">
            Arabic edition © Muḥammad b. al-Shaykh ʿAbd Allāh al-Tijānī. English translation and digital
            edition © Amadu Kunateh. All rights reserved. Short passages may be quoted for scholarly
            purposes with full citation. Reproducing substantial portions of the translation, or any
            redistribution or commercial use, requires written permission.
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
