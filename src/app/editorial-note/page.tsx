import Link from 'next/link';

export default function EditorialNotePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-6" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <div className="text-center py-6 mb-8 border-b border-gold/20">
        <h1 className="font-english text-white text-3xl font-semibold mt-2 mb-1">Editorial Note</h1>
        <p className="font-english text-white/40 text-sm italic">
          Principles and methodology of the digital edition
        </p>
        <p className="font-english text-gold/50 text-xs mt-2">
          Edition 1.0 · April 2025 · Amadu Kunateh
        </p>
      </div>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-6">

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">1. The Arabic Text</h2>
          <p className="leading-7">
            The Arabic text of this edition is drawn from the revised ten-volume compiled edition of 
            Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, which supersedes the earlier 
            six-volume compilation. The revised recension incorporates a more extensive critical apparatus, 
            a larger number of annotated footnotes, and draws on a broader consultation of the original 
            audio recordings to achieve a more accurate transcription of Niasse&apos;s oral delivery.
          </p>
          <p className="leading-7 mt-3">
            The text follows the <strong className="text-white/85">Warsh ʿan Nāfiʿ rasm</strong> — the 
            orthographic standard of North and West Africa in which the tafsīr was delivered. This is the 
            standard of the Quran as recited and taught in the Tijānī tradition, and it differs in certain 
            orthographic details from the Ḥafṣ rasm more familiar to readers outside this tradition.
          </p>
        </div>

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">2. Digitisation and Display</h2>
          <p className="leading-7">
            The Arabic text was digitised from the printed ten-volume edition. The compiled edition 
            presents the commentary as continuous Arabic prose with footnotes interspersed throughout 
            each lesson section. For purposes of scholarly readability, this edition separates the 
            body text (Niasse&apos;s commentary) from the footnote block (the compiler&apos;s 
            documentary apparatus) in the lesson display. The body text is presented in the 
            Sheikh&apos;s Tafsīr panel; the footnotes are accessible via the Critical Apparatus.
          </p>
          <p className="leading-7 mt-3">
            The lesson structure follows the compiler&apos;s ten-volume organisation: each lesson 
            corresponds to a session of oral delivery. The site presents the first cycle of thirty 
            lessons, covering Suras 1–17 (Al-Fātiḥa through Al-Isrāʾ). Further volumes will be 
            added as digitisation proceeds.
          </p>
        </div>

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">3. Footnote Markers</h2>
          <p className="leading-7">
            The compiler&apos;s footnotes are marked inline in the Arabic text using superscript 
            numbers <sup className="text-gold/80 text-xs">[n]</sup>. Each marker is a clickable 
            link that navigates directly to the corresponding entry in the Critical Apparatus, 
            where the full footnote text appears in Arabic alongside an English citation header. 
            The same markers appear in the English translation for Lessons 1–2, where the 
            translation preserves the footnote numbering of the Arabic source.
          </p>
          <p className="leading-7 mt-3">
            The footnote apparatus for this edition has been classified by subject genre — 
            Hadith Sciences, Tafsīr, Theology, Sufism, Fiqh, Linguistics, History — a classification 
            not present in the printed Arabic text and constituting an original editorial contribution 
            of this digital edition.
          </p>
        </div>

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">4. Verse Ranges and Volume References</h2>
          <p className="leading-7">
            The verse ranges for each lesson (e.g. Q. 2:6–25) have been verified against the 
            ten-volume structural document prepared for this edition. Lessons 1–6, 13–19, and 
            26–30 have been verified precisely from the document. Lessons 7–12 (Volume 2) and 
            20–25 (Volumes 4–5) carry approximate verse ranges pending verification against the 
            physical printed volumes; these are clearly indicated in the lesson headers.
          </p>
          <p className="leading-7 mt-3">
            Volume and page references for lessons cite the ten-volume compiled edition. 
            Confirmed page numbers are provided for Volumes 1, 3, and 7; page numbers for 
            Volumes 2, 4, and 5 are pending and will be added in a subsequent version of the edition.
          </p>
        </div>

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">5. The English Translation</h2>
          <p className="leading-7">
            The English translation is by Amadu Kunateh and currently covers Lessons 1–2. 
            The complete bilingual translation is in preparation for academic publication. 
            Three translation choices warrant explicit notice: the Basmala is rendered 
            &ldquo;By Allāh&apos;s Name — The Entirely Merciful, The Especially Merciful&rdquo;; 
            <em>ʿabd</em> is translated &ldquo;slave&rdquo; (following the established convention 
            in the study of Islamic anthropology); and <em>al-ḥamdu lillāh</em> is rendered 
            &ldquo;The Praise is for God&rdquo; (two words, not three). For full methodological 
            statement, see the <Link href="/translators-note" className="text-gold/70 hover:text-gold transition-colors">Translator&apos;s Note</Link>.
          </p>
        </div>

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">6. Citation</h2>
          <p className="leading-7">
            This edition should be cited as:
          </p>
          <div className="mt-3 p-4 border border-gold/20 rounded-xl bg-gold/4">
            <p className="font-english text-white/80 text-sm leading-7">
              Ibrāhīm Niasse, <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>, comp. 
              Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī, rev. 10-vol. ed. 
              (n.p., n.d.). Digital bilingual ed., ed. Amadu Kunateh 
              (ORCID: 0009-0002-7839-6474). niassetafsir.org, 2025. 
              Edition 1.0.
            </p>
          </div>
          <p className="leading-7 mt-3 text-white/50 text-sm">
            A DOI for this edition will be assigned upon publication on Zenodo 
            and will appear here when available.
          </p>
        </div>

        <div>
          <h2 className="font-english text-white text-lg font-semibold mb-3">7. Version History</h2>
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-white/8">
              <span className="font-english text-gold text-sm font-semibold w-16">v 1.0</span>
              <span className="font-english text-white/50 text-xs">April 2025</span>
              <span className="font-english text-white/60 text-sm flex-1">
                Initial release. 30 lessons Arabic text; Lessons 1–2 bilingual; 
                critical apparatus; concordance; scholar index; glossary; thematic index; 
                hadith index; research platform.
              </span>
            </div>
            <div className="flex items-center gap-4 px-4 py-3">
              <span className="font-english text-white/30 text-sm w-16">v 2.0</span>
              <span className="font-english text-white/30 text-xs">Forthcoming</span>
              <span className="font-english text-white/30 text-sm flex-1">
                Complete bilingual translation; lesson summaries; footnote translations; 
                DOI; Vol. 2 & 4 page numbers.
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-10 pt-6 border-t border-gold/15 text-center">
        <Link href="/about" className="font-english text-sm text-white/40 hover:text-gold border border-white/10 hover:border-gold/30 px-5 py-2 rounded-lg transition-all">
          ← Back to About
        </Link>
      </div>
    </main>
  );
}
