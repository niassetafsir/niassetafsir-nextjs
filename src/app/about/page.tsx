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
  title: 'About This Edition',
  description:
    'The digital edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse: the Arabic edition it rests on, the people who made it, and how to cite it.',
  openGraph: {
    title: 'About This Edition | niassetafsir.org',
    description:
      'The digital edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse.',
  },
};

export default async function AboutPage() {
  const facts = await getEditionFacts();

  return (
    <main className="max-w-2xl mx-auto px-6 pb-24 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">About This Edition</div>
        <div className="font-english text-white/30 text-xs mt-1">Edition 1.0 · April 2025</div>
        <div className="font-english text-white/40 text-sm mt-2 italic">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
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
            Niasse, the West African exegetical tradition, and the two commentaries he read alongside it
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
            Digital Edition &amp; Research Platform
          </h2>
          <p className="leading-6">
            This site presents two interconnected resources in one: a digital edition and a research
            platform for <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em> by Shaykh Ibrāhīm Niasse (d. 1975),
            designed to make this tafsīr accessible, searchable, and analytically usable for academic
            research. It presents the Arabic text of all {facts.arabicLessons} sessions
            {facts.translatedCount > 0 && (
              <> alongside an English translation of Lesson{facts.translatedCount > 1 ? 's' : ''}{' '}
              {facts.translatedFirst}{facts.translatedCount > 1 ? `–${facts.translatedLast}` : ''}, with more in
              progress</>
            )}, and comparative passages from <em>Tafsīr al-Jalālayn</em> and <em>Rūḥ al-Bayān</em>.
          </p>
          <p className="leading-6 mt-3">
            What the research tools are, and what each is for, is listed on the{' '}
            <Link href="/research" className="text-gold/70 hover:text-gold transition-colors">Research</Link>{' '}
            page rather than duplicated here. A verse concordance and a scholar/source index are being held
            back while a companion article is under preparation for <em>Islamic Africa</em> (Brill).
          </p>
        </div>

        <div>
          <h2 className="font-english text-gold text-base font-semibold mb-3 pb-2 border-b border-gold/15">
            The Arabic Edition Behind It
          </h2>
          <p className="leading-6">
            The Arabic text is drawn from the <strong className="text-white/85">revised ten-volume compiled
            edition</strong> of Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, who transcribed,
            verified, and annotated the tafsīr from the original cassette recordings of Shaykh Ibrāhīm
            Niasse&apos;s oral delivery in Arabic in 1383 AH (c. 1963–64), with editorial corrections made
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
              : `${facts.footnoteLessons} of ${facts.totalLessons}`} lessons, in a searchable index
            classified by scholar, genre and lesson —{' '}
            <Link href="/footnotes" className="text-gold/70 hover:text-gold transition-colors">browse it here</Link>.
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
            The Print Bilingual Edition
          </h2>
          <p className="leading-6">
            The complete bilingual print edition (Arabic facing English) is currently under review
            for publication with an academic publisher. It differs from the Arabic compiled
            edition in its organisation: rather than following the ten-volume structure of the
            Arabic edition, the print bilingual edition is organised around the{' '}
            <strong className="text-white/85">seven manzils</strong>, the daily recitation portions
            that Shaykh Ibrāhīm himself enumerated in verse and practised as a weekly cycle of
            Qurʾānic recitation.
          </p>
          <p className="leading-6 mt-3">
            This seven-volume structure, each volume corresponding to one manzil, reflects the
            Shaykh&apos;s own relationship to the Qurʾān and provides a framework for the translation
            that is rooted in his practice rather than in the conventions of the printed Arabic edition.
            Registration for the bilingual edition is on the{' '}
            <Link href="/order" className="text-gold/70 hover:text-gold transition-colors">printed edition</Link> page.
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
            <strong className="text-white/85">Amadu Kunateh</strong> is a PhD candidate in Philosophy of
            Religion and African Studies at Harvard University. He conceived, built, and maintains this
            edition, and is its sole translator; the digitisation, proofreading, structural design and
            scholarly annotation are his. The work belongs to doctoral research on Niasse&apos;s tafsīr
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
            A third, the Scholar Index, maps Niasse&apos;s intellectual interlocutors — the figures he names,
            invokes, and positions himself in relation to within his own oral commentary — as distinct from
            the compiler&apos;s documentation of his sources. It answers the question <em>with whom does
            Niasse think?</em> No printed edition of this tafsīr undertakes that mapping. It is withheld from
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
                bilingual; the classified apparatus; ḥadīth index; technical terms; full-text search;
                the verse index.
              </span>
            </div>
            <div className="flex items-start gap-4 px-4 py-3">
              <span className="font-english text-white/30 text-sm w-14 shrink-0">v 2.0</span>
              <span className="font-english text-white/30 text-xs w-20 shrink-0">Forthcoming</span>
              <span className="font-english text-white/30 text-sm flex-1">
                Complete bilingual translation; lesson summaries; footnote translations; the verse
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
