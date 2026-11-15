import { workSummaries } from '@/lib/corpus';
import Link from 'next/link';
import { VOLUME_META } from '@/lib/volumes';
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
  const others = workSummaries().filter(r => r.work.id !== 'fi-riyad' && r.uses > 0);
  const indexedWorks = others.length;
  const otherUses = others.reduce((n, r) => n + r.uses, 0);

  return (
    <main className="max-w-2xl mx-auto px-6 pb-24 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-arabic text-gold text-2xl" dir="rtl" translate="no">مَنْطِقُ الفَيْضَة</div>
        <div className="font-english text-gold text-xl font-semibold mt-1">Manṭiq al-Fayḍa</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Majmūʿ al-Tafsīr li-Ṣāḥib al-Fayḍa · The Qurʾānic Exegesis of Shaykh Ibrāhīm Niasse
        </div>
      </div>

      {/* Where the other two pages are. Three pages, named for the three
          questions a reader arrives with. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <Link href="/about/tafsir"
          className="rounded-xl border px-4 py-3 transition-colors hover:border-gold/45"
          style={{ borderColor: 'rgba(138,109,31,0.25)' }}>
          <p className="font-english text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>The Tafsīr</p>
          <p className="font-english text-xs mt-1 leading-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Shaykh Ibrāhīm, the West African exegetical tradition, and the two commentaries he read alongside it
          </p>
        </Link>
        <Link href="/translators-note"
          className="rounded-xl border px-4 py-3 transition-colors hover:border-gold/45"
          style={{ borderColor: 'rgba(138,109,31,0.25)' }}>
          <p className="font-english text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Editorial Conventions</p>
          <p className="font-english text-xs mt-1 leading-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Digitisation, footnote markers, verse ranges, transliteration, and the translation choices
          </p>
        </Link>
      </div>

      <div className="space-y-8 font-english text-white/70 leading-relaxed text-sm">

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            What This Site Is
          </h2>
          <p className="leading-6">
            The tafsīr of Shaykh Ibrāhīm Niasse (1900–1975) in one place, by three paths. The first is{' '}
            <em>Fī Riyāḍ al-Tafsīr</em>, the Arabic sessions of 1964 in which he explained the whole
            Qurʾān. The second goes beyond it: his explanation of verses across other registers, of
            language (Arabic, and Wolof as those sessions are found) and of genre (other tafsīr
            sessions, letters, sermons, treatises, poems, journeys). Open a verse and both paths meet:
            every passage where he explains it, quotes it or puts it to work, in his Arabic with an
            English rendering and a page reference. The{' '}
            <Link href="/topics" className="text-gold/70 hover:text-gold transition-colors">topics</Link>{' '}
            gather what he says on one subject across many verses: the self, the heart, the spirit,
            knowing God. So far {indexedWorks} of his works beyond the tafsīr have been read verse by
            verse, giving {otherUses} passages; the{' '}
            <Link href="/works" className="text-gold/70 hover:text-gold transition-colors">Beyond Fī Riyāḍ</Link>{' '}
            page lists them by genre. The third path is the{' '}
            <Link href="/students" className="text-gold/70 hover:text-gold transition-colors">commentaries of his students</Link>:
            how scholars of the Fayḍa who learned from him explain the same verses. Their words appear
            below his on a verse page, marked as theirs.
          </p>
          <p className="leading-6 mt-3">
            <em>Fī Riyāḍ al-Tafsīr</em>, his commentary on the whole Qurʾān in {facts.arabicLessons}{' '}
            sessions, is the largest of these works and the only one the site carries whole, in Arabic
            {facts.translatedCount > 0 && (
              <>, with Lesson{facts.translatedCount > 1 ? 's' : ''} {facts.translatedFirst}
              {facts.translatedCount > 1 ? `–${facts.translatedLast}` : ''} in English</>
            )}.
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
            2026; Kunateh, dissertation in progress).
          </p>
          <ul className="mt-4 space-y-1.5 text-[12.5px] leading-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <li>Brigaglia, Andrea. &ldquo;The Fayda Tijaniyya of Ibrāhīm Nyass: Genesis and Implications of a Sufi Doctrine.&rdquo; <em>Islam et sociétés au sud du Sahara</em> 14–15 (2000–2001): 41–56.</li>
            <li>Brigaglia, Andrea. &ldquo;Learning, Gnosis and Exegesis: Public Tafsīr and Sufi Revival in the City of Kano (Northern Nigeria), 1950–1970.&rdquo; <em>Die Welt des Islams</em> 49, no. 3/4 (2009): 334–66.</li>
            <li>de Diego González, Antonio. <em>Ley y gnosis: Historia intelectual de la ṭarīqa Tijāniyya</em>. Granada: Editorial Universidad de Granada, 2020.</li>
            <li>Hill, Joseph. <em>Wrapping Authority: Women Islamic Leaders in a Sufi Movement in Dakar, Senegal</em>. Toronto: University of Toronto Press, 2018.</li>
            <li>Hill, Joseph. &ldquo;Women Who Are Men: Shaykha Maryam Niasse and the Qurʾān in Dakar.&rdquo; In <em>Approaches to the Qurʾān in Sub-Saharan Africa</em>. Oxford: Oxford University Press, 2019.</li>
            <li>Kunateh, Amadu. &ldquo;Identity without Being: Personhood in the Tafsīr of Shaykh Ibrāhīm Niasse.&rdquo; <em>Sophia</em> 65, no. 3 (2026): 489–510.</li>
            <li>Ogunnaike, Oludamini. &ldquo;In the Gardens with Ibrahim: An Evaluation of <em>Fī riyāḍ al-tafsīr</em> by Shaykh Ibrahim Niasse, a Contemporary, Traditional Tafsīr.&rdquo; <em>Journal of Qur&rsquo;anic Studies</em> 20 (2018). doi:10.3366/jqs.2018.0319.</li>
            <li>Seesemann, Rüdiger. <em>The Divine Flood: Ibrāhīm Niasse and the Roots of a Twentieth-Century Sufi Revival</em>. New York: Oxford University Press, 2011.</li>
            <li>Wright, Zachary Valentine. <em>Living Knowledge in West African Islam: The Sufi Community of Ibrāhīm Niasse</em>. Leiden: Brill, 2015.</li>
            <li>Wright, Zachary Valentine. &ldquo;The Qurʾān and Knowledge of God in West Africa: The Sufi Tafsīr of Shaykh Ibrāhīm Niasse.&rdquo; <em>Islamic Africa</em> 15, no. 1 (2024): 69–97.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Arabic Edition Behind It
          </h2>
          <p className="leading-6">
            The Arabic text is drawn from the <strong className="text-white/85">revised ten-volume compiled
            edition</strong> of Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, who transcribed,
            verified, and annotated the tafsīr from the original cassette recordings of Shaykh Ibrāhīm
            Shaykh Ibrāhīm&apos;s oral delivery in Arabic in 1383 AH (c. 1963–64), with editorial corrections made
            for this digital edition.
          </p>
          <p className="leading-6 mt-3">
            The revised ten-volume edition is a substantially expanded recension of the earlier six-volume
            compilation. It carries a more extensive apparatus with a greater number of annotated footnotes,
            and draws on a broader consultation of the original audio recordings to achieve a more accurate
            transcription of the oral delivery. The compiler acknowledges the difficulty of transcribing
            speech: the density of pronominal reference, the rapid movement of inflection, and the gap
            between spoken expression and written text. He undertook the work out of concern that the
            recordings, scattered among the khalīfas and companions of the Shaykh, might be lost.
          </p>
          <p className="leading-6 mt-3">
            The apparatus is one of the defining achievements of the compiled edition. The hadith citations
            alone number more than six thousand, traced to their canonical sources across the ṣaḥīḥayn, the
            Sunan collections, and the wider hadith literature. Beyond hadith, the footnotes engage the major
            tafsīr works (Ibn Kathīr, al-Qurṭubī, al-Ṭabarī, the Jalālayn, <em>Rūḥ al-Bayān</em>), theological
            and Sufi sources (al-Ghazālī, Ibn ʿArabī), and linguistic and rhetorical literature. This platform
            presents <strong className="text-white/85">{facts.footnoteCount.toLocaleString()}</strong> of
            these footnotes, spanning {facts.footnoteLessons === facts.totalLessons
              ? `all ${facts.totalLessons}`
              : `${facts.footnoteLessons} of ${facts.totalLessons}`} lessons. Each appears on its lesson
            page at the marker it annotates, attributed to the compiler.
          </p>
        </div>

        {/* Volume catalogue -- was its own page. It is a table, not an essay. */}
        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-1 pb-2 border-b border-gold/15">
            Volume Catalogue
          </h2>
          <p className="font-english text-white/40 text-xs mb-4">
            The ten-volume Arabic edition — lessons and sūra coverage
          </p>
          <div className="space-y-1">
            {VOLUME_META.map(v => (
              <Link key={v.vol} href={`/volume/${v.vol}`}
                className="flex items-start gap-4 py-3 border-b border-white/5 hover:bg-gold/5 transition-colors -mx-2 px-2 rounded-lg">
                <div className="w-12 shrink-0 text-right">
                  <span className="font-english text-gold/70 text-sm font-semibold">Vol. {v.roman}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="font-arabic text-white/80 text-base" dir="rtl">{v.arabicOrdinal}</span>
                    <span className="font-english text-white/30 text-xs">Lessons {v.start}–{v.end}</span>
                  </div>
                  <p className="font-english text-white/45 text-xs leading-relaxed">{v.rangeLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Print Edition
          </h2>
          <p className="leading-6">
            The English translation will be published in print. It does not follow the ten-volume
            structure of the Arabic printing. It runs
            to <strong className="text-white/85">seven volumes</strong>, answering to the seven
            manzils of the weekly recitation cycle Shaykh Ibrāhīm practised and enumerated in verse.
          </p>
          <p className="leading-6 mt-3">
            The volumes do not reproduce those seven portions. A manzil divides the muṣḥaf for
            reciting it; Shaykh Ibrāhīm lectured straight through, so five of the seven manzil boundaries fall
            inside a lesson. The lesson is this work&apos;s own unit and is kept whole, and each volume
            closes at the end of a sūra instead — that division belongs to the text being commented
            upon, and the commentary on a given sūra stays in one book. Six of the seven close that
            way; Volume One stops inside Āl ʿImrān, because no lesson in the opening stretch of the
            course ends where a sūra ends.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Qurʾānic Text and Audio
          </h2>
          <p className="leading-6">
            The Qurʾānic text follows the <strong className="text-white/85">Warsh ʿan Nāfiʿ rasm</strong>,
            the orthographic standard of North and West Africa in which the tafsīr was delivered, and
            differs in certain orthographic details from the Ḥafṣ rasm more familiar to readers outside
            this tradition. Qurʾānic audio is the recitation of Maḥmūd Khalīl al-Ḥuṣarī (1917–1980) in the
            Warsh riwāya, given verse by verse{facts.quranAudioSurahs
              ? `, for Sūras ${facts.quranAudioSurahs.first}–${facts.quranAudioSurahs.last} so far`
              : ''}. Recordings of Shaykh Ibrāhīm&apos;s own oral delivery are available for{' '}
            {facts.audioLessons} of the {facts.totalLessons} sessions in Arabic, with further sessions
            forthcoming, and for the complete Wolof tafsīr (122 sessions, via the Internet Archive); see the{' '}
            <Link href="/audio" className="text-gold/70 hover:text-gold transition-colors">Listen</Link> page.
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Who Made It
          </h2>
          <p className="leading-6">
            <strong className="text-white/85">Amadu Kunateh</strong> is a PhD candidate on the Committee
            on the Study of Religion at Harvard University. He conceived, built, and maintains this
            edition, and is its sole translator; the digitisation, proofreading, structural design and
            scholarly annotation are his. The work belongs to doctoral research on Shaykh Ibrāhīm&apos;s tafsīr
            conducted since 2022 across both the six-volume compilation and the revised ten-volume recension.
          </p>
          <p className="leading-6 mt-3">
            Two contributions here are not present in the printed Arabic edition. The apparatus has been
            classified by subject genre — Hadith Sciences, Tafsīr, Theology, Sufism, Fiqh, Linguistics,
            History — which the printed text does not do. And the technical vocabulary is presented as a
            structured set of typed relations between terms — hierarchies, conditions, dyads, spiritual
            progressions — each drawn from a passage in the commentary and cited to it; see{' '}
            <Link href="/glossary" className="text-gold/70 hover:text-gold transition-colors">Technical Terms</Link>.
          </p>
          <p className="leading-6 mt-3">
            A third, the Scholar Index, maps Shaykh Ibrāhīm&apos;s intellectual interlocutors — the figures he names,
            invokes, and positions himself in relation to within his own oral commentary — as distinct from
            the compiler&apos;s documentation of his sources. It answers the question <em>with whom does
            Shaykh Ibrāhīm think?</em> No printed edition of this tafsīr undertakes that mapping. It is withheld from
            the site pending the companion article.
          </p>
          <p className="leading-6 mt-3">
            His dissertation, <em>Leaders of Knowledge: Tafsīr, Philosophical-Theology, and the Remapping of
            Islamic Thought in West Africa</em> (expected 2027), is the first sustained, book-length treatment
            of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>. It investigates the theology (Who is God?),
            anthropology (Who is the human being?), and cosmology (What is the cosmos?) of the tafsīr.
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
            A DOI will be assigned on publication to Zenodo and will appear here when available. Any passage
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

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            Version History
          </h2>
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-start gap-4 px-4 py-3 border-b border-white/8">
              <span className="font-english text-gold text-sm font-semibold w-14 shrink-0">v 1.0</span>
              <span className="font-english text-white/30 text-xs w-20 shrink-0">April 2025</span>
              <span className="font-english text-white/60 text-sm flex-1">
                Initial release. All {facts.totalLessons} lessons in Arabic; {facts.translatedCount}{' '}
                in English; the compiler&apos;s apparatus; technical terms; full-text search; the verse
                index.
              </span>
            </div>
            <div className="flex items-start gap-4 px-4 py-3">
              <span className="font-english text-white/30 text-sm w-14 shrink-0">v 2.0</span>
              <span className="font-english text-white/30 text-xs w-20 shrink-0">Forthcoming</span>
              <span className="font-english text-white/30 text-sm flex-1">
                Complete English translation; lesson summaries; footnote translations; the verse
                concordance and scholar index; DOI.
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-10 pt-6 border-t border-gold/15 text-center">
        <Link href="/"
          className="tap font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 rounded-lg transition-all">
          ← Back to Contents
        </Link>
      </div>
    </main>
  );
}
