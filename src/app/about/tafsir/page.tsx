import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * The tafsīr: what the work is, where it sits in the history of the genre, and
 * the two commentaries Niasse read alongside it.
 *
 * This was two pages, /about/shaykh and /about/companion-texts. They argued one
 * argument -- that Fī Riyāḍ belongs inside the history of tafsīr rather than
 * beside it -- and the companion texts are the evidence for the last third of
 * it: Wright's thesis about Rūḥ al-Bayān was stated on both pages, in different
 * words, with the same citation. Both are now sections of one essay, and the two
 * footnote lists are one numbered list.
 */

export const metadata: Metadata = {
  title: 'The Tafsīr',
  description:
    'Shaykh Ibrāhīm Niasse (d. 1975), Fī Riyāḍ al-Tafsīr, and the West African tafsīr tradition — with the two commentaries he read alongside it, Tafsīr al-Jalālayn and Rūḥ al-Bayān.',
  openGraph: {
    title: 'The Tafsīr | niassetafsir.org',
    description:
      'Shaykh Ibrāhīm Niasse (d. 1975), Fī Riyāḍ al-Tafsīr, and the West African tafsīr tradition, with its two exegetical interlocutors.',
  },
};

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 pb-24 pt-6" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="tap font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <h1 className="font-english text-white text-3xl font-semibold mt-6 mb-1">
        The Tafsīr
      </h1>
      <p className="font-english text-white/45 text-base mb-10">
        <em>Fī Riyāḍ al-Tafsīr</em>, the West African exegetical tradition, and its sources
      </p>

      <div className="font-english text-white/75 text-base leading-relaxed space-y-6">

        <h2 className="font-english text-gold text-xl font-semibold pt-4 pb-2 border-b border-gold/15">
          The World of Tafsīr: West Africa and Modern Hermeneutics
        </h2>

        <h3 className="font-english text-white/80 text-base font-semibold pt-2">Why <em>Fī Riyāḍ al-Tafsīr</em> Matters</h3>

        <p>If we wish to move from texts to meanings in studying the corpus of West African Islamic intellectual production, if we wish to engage these scholars not merely as transmitters but as theorists and thinkers, then we must ask where their most sustained acts of conceptual reflection occur. To elucidate the intellectual history of Muslim Sub-Saharan Africa not simply as a survey of authors and texts but as a history of ideas in continuity and divergence with the broader Islamic intellectual tradition, we must identify the genres in which reflection was both authorized and elaborated. The tafsīr corpus provides one of the most fertile and yet underexamined sites for such inquiry.</p>

        <p>In the case of Shaykh Ibrāhīm Niasse, this is especially true, since his <em>Fī Riyāḍ al-Tafsīr li-l-Qurʾān al-Karīm</em> not only synthesizes the disciplines of theology, philosophy, and Sufism but also demonstrates how the act of Qurʾānic interpretation itself becomes a mode of metaphysical and theoretical production. Through tafsīr, Niasse and his intellectual milieu articulate ideas about being, knowledge, and divine reality that both extend and transform the parameters of Islamic metaphysical thought.</p>

        <h2 className="font-english text-gold text-xl font-semibold pt-6 pb-2 border-b border-gold/15">
          Tafsīr and Intellectual History
        </h2>

        <p>As Samuel Ross has recently observed, tafsīr offers a powerful lens for reconstructing Islamic intellectual history precisely because of its encyclopedic character and its capacity to integrate every discipline of Muslim thought. The challenge, he notes, is particularly acute for &ldquo;non-canonical topics not typically addressed in a manual of fiqh or a Sufi treatise,&rdquo; since &ldquo;the history of Muslim attitudes toward countless topics can often be traced through the evolving interpretations of verses on a given theme.&rdquo;<sup>1</sup> Citing Jane McAuliffe&apos;s description of tafsīr as &ldquo;a window looking into the Islamic Weltanschauung of any given generation,&rdquo; Ross concludes that because &ldquo;the Qurʾān discusses myriad topics, and because of tafsīr&apos;s encyclopaedic nature, incorporating every Islamic discipline,&rdquo; it enables scholars to follow the conceptual shifts that occur across the tradition.<sup>2</sup></p>

        <p>This insight provides an essential methodological basis for engaging the tafsīr of Shaykh Ibrāhīm Niasse. By treating <em>Fī Riyāḍ al-Tafsīr</em> as a site where theological, philosophical, and metaphysical reflection intersect, Ross&apos;s argument can be extended to demonstrate that West African tafsīr, no less than its classical, Mamlūk, and Ottoman counterparts, constitutes a primary archive for tracing the evolution of Islamic metaphysical imagination.</p>

        <p><em>Fī Riyāḍ al-Tafsīr</em> can be examined through three interrelated axes: theology, metaphysical anthropology, and cosmology. Each corresponds to a fundamental question within Islamic intellectual history, the nature of the divine (God as such), the nature of the human (the human as such), and the relationship between the two. Rather than presupposing a systematic metaphysics, these categories emerge inductively through close engagement with Niasse&apos;s exegesis. The text operates as a living archive of philosophical reflection in which the Qurʾān itself becomes the site through which metaphysical questions are posed, negotiated, and reimagined.</p>

        <h2 className="font-english text-gold text-xl font-semibold pt-6 pb-2 border-b border-gold/15">
          A History of Tafsīr
        </h2>

        <p>Following Ibn ʿĀshūr&apos;s historiographical intervention, the history of Qurʾānic exegesis is most fruitfully approached as an intellectual and pedagogical tradition whose vitality lay less in the continual production of new comprehensive commentaries than in the stabilization of a canonical core around which scholarly creativity unfolded. While early exegetes such as al-Ṭabarī (d. 923) established the formal parameters of the genre, the eleventh and twelfth centuries marked a decisive hermeneutical shift through the rise of philological and rhetorical approaches, theorized most systematically by ʿAbd al-Qāhir al-Jurjānī (d. 1078) and embodied in major commentaries such as al-Zamakhsharī&apos;s <em>al-Kashshāf</em> (d. 1144) and Ibn ʿAṭiyya&apos;s tafsīr (d. 1151).</p>

        <p>The consolidation of tafsīr within the madrasa curriculum occurred with the widespread adoption of al-Bayḍāwī&apos;s <em>Anwār al-Tanzīl</em> (d. ca. 1292), which became the central exegetical textbook across much of the eastern Islamic world. From this point onward, the primary site of exegetical innovation shifted from the production of new stand-alone commentaries to the expansive gloss tradition (<em>ḥāshiya</em>) that developed around <em>al-Kashshāf</em> and <em>Anwār al-Tanzīl</em>. These glosses became central to the seminary system, mediating nearly all advanced engagement with the Qurʾān for several centuries.</p>

        <h2 className="font-english text-gold text-xl font-semibold pt-6 pb-2 border-b border-gold/15">
          Recovering the Missing Archive: West Africa and the Historiography of Tafsīr
        </h2>

        <p>Although the study of tafsīr has expanded dramatically in the last two decades, the field remains heavily shaped by cataloguing biases and a geographically uneven archive. As Samuel J. Ross demonstrates, global reference tools such as <em>al-Fihris al-shāmil</em>, our best existing union catalogue, exclude vast regions of manuscript production, particularly sub-Saharan Africa. The <em>Fihris</em> draws on only a handful of West African libraries and omits hundreds of known commentaries preserved in local collections and documented in the West African Arabic Manuscript Database (WAAMD). Consequently, the history of tafsīr has been reconstructed almost entirely through the textual ecosystems of the Middle East, leaving the genres, pedagogies, and hermeneutical practices of West Africa outside the frame of the discipline&apos;s grand narratives.</p>

        <p>Engaging Niasse&apos;s <em>Fī Riyāḍ al-Tafsīr</em> within the intellectual and manuscript culture of West Africa, drawing on WAAMD, regional catalogues, and the transcribed texts of Niasse&apos;s recorded tafsīr majālis, re-situates Qurʾānic commentary as a living, performative, and multilingual tradition. This approach expands tafsīr studies beyond the geography of print and beyond the assumption that hermeneutical innovation ceased after the so-called classical period. West African exegetes did not merely inherit Middle Eastern models; they re-articulated the Qurʾān&apos;s metaphysical and ethical horizons through local epistemologies of Sufi pedagogy, oral transmission, and bilingual expression.</p>

        <h2 className="font-english text-gold text-xl font-semibold pt-6 pb-2 border-b border-gold/15">
          The State of Tafsīr Studies in West Africa
        </h2>

        <p>By the early twentieth century, Qurʾānic interpretation in West Africa already operated within a layered exegetical ecology. A small number of comprehensive commentaries circulated widely as stable teaching texts, while a far more expansive body of short, locally generated exegetical writings clustered around particular verses and sūras treated as spiritually efficacious and hermeneutically dense. These brief commentaries, often unattributed and typically embedded in teaching cycles and devotional practice, constituted a distributed tradition of tafsīr that functioned through pedagogy rather than through the accumulation of formal treatises.</p>

        <p>As Zachary Wright notes, despite a centuries-old practice of interpreting the Qurʾān through oral performance, memorization, and teaching circles, printed Arabic sources of tafsīr from the region have only recently begun to circulate. West African scholars were often &ldquo;walking Qurʾāns,&rdquo; to borrow Rudolph Ware&apos;s phrase, whose interpretive authority derived from the internalization of revelation rather than from textual citation alone.</p>

        <p>The present work builds on and complements foundational studies of the tafsīr. Andrea Brigaglia&apos;s early analysis marked an important step in recovering its exegetical and historical dimensions. His comparison of Shaykh Ibrāhīm&apos;s tafsīr with that of his contemporary and ideological rival, Shaykh Abū Bakr Gumi, <em>Fī Riyāḍ al-Tafsīr</em> and <em>Radd al-adhhān</em>, respectively, highlights how Qurʾānic exegesis served as a critical arena for competing visions of tajdīd (renewal) in twentieth-century West Africa. Oludamini Ogunnaike explored the commentary through a focus on a particular verse, relating its source texts in earlier Sufi metaphysics to elucidate the meanings of Niasse&apos;s reading. Zachary Wright&apos;s recent work on the exegesis highlighted Shaykh Ibrāhīm&apos;s selective reliance on the Ottoman Sufi Ismāʿīl Ḥaqqī&apos;s <em>Rūḥ al-Bayān</em> to argue that his tafsīr reflects a globally entangled dialectic vision of Islamic knowledge centered on gnosis (maʿrifa) as the telos and focus of Qurʾānic engagement for Niasse&apos;s community.</p>

        <p>Building on these foundational and illuminating contributions, no comprehensive study has yet examined <em>Fī Riyāḍ al-Tafsīr</em> as a unified intellectual project. Kunateh&apos;s dissertation (expected 2027) offers the first sustained treatment of the work&apos;s full metaphysical, linguistic, and pedagogical architecture.</p>

        <p><em>Fī Riyāḍ al-Tafsīr</em> is, among other things, a case study in twentieth-century Islamic erudition in West Africa. The work is not specialized. It draws simultaneously on the full range of classical tafsīr disciplines: legal interpretation, theological reasoning, linguistic analysis, narrative engagement, hadith evidence, and Sufi hermeneutics. Its breadth instantiates the encyclopedic ideal that Islamic scholarly tradition associates with the <em>mufassir kāmil</em>, the complete exegete. That this ideal was sustained, and produced in Kaolack in 1964, is itself a contribution to the historiography of Islam in Africa, and a correction to scholarly assumptions that have too often located Islamic intellectual vitality elsewhere.</p>

        <p>This work builds on a growing body of scholarship that has increasingly challenged peripheral framings of West African Islam, including the foundational contributions of Seesemann, Wright, Brigaglia, Ogunnaike, and others. <em>Fī Riyāḍ al-Tafsīr</em> as a site of analysis extends that scholarship into the specific domain of Qurʾānic exegesis, asking not only who Niasse was but what kind of intellectual work his tafsīr performs, and how.</p>

        <h2 className="font-english text-gold text-xl font-semibold pt-6 pb-2 border-b border-gold/15">
          Contextualizing Niasse Within 20th-Century Hermeneutics
        </h2>

        <p>Modern Qurʾānic hermeneutics in the 19th and 20th centuries unfolded within what Georges Tamer identifies as the defining tension of the period: &ldquo;the tension between preserving traditional methods and interpretations of the Qurʾān on the one hand and introducing new ones on the other.&rdquo; Two concerns were especially prominent: the need to demonstrate the compatibility of the Qurʾānic worldview with modern rationalism and the natural sciences, and the search for an appropriate political and social order that would meet the requirements of modernity without contradicting Qurʾānic principles.</p>

        <p>Shaykh Ibrāhīm Niasse&apos;s <em>Fī Riyāḍ al-Tafsīr</em> emerges within this same historical moment, yet it does not conform to any of the dominant hermeneutical trajectories of the period. His tafsīr neither participates in the rationalizing impulse of scientific exegesis nor adopts the literary formalism of al-Khūlī and his students, nor takes on the historicist program, nor engages in the political-constitutional hermeneutics of figures such as Mawdūdī or Sayyid Quṭb. Instead, Niasse&apos;s project belongs to a largely unacknowledged hermeneutical strand that persisted into the modern period: a metaphysical-experiential mode of tafsīr grounded in unveiling (<em>kashf</em>), gnosis (<em>maʿrifa</em>), and the articulation of the divine attributes as the ontological infrastructure of the cosmos.</p>

        <p>His tafsīr affirms that the twentieth century did not merely produce rationalist or reformist commentary; it also gave rise to a renewed, sophisticated, and distinctly African articulation of the metaphysical tradition within the practice of Qurʾānic exegesis. By centering metaphysics rather than reform, Niasse expands the map of modern hermeneutics, revealing a parallel trajectory in which the Qurʾān continues to function as a site for ontological inquiry and spiritual disclosure.</p>

        {/* ── The two commentaries he read alongside it ──────────────── */}

        <h2 className="font-english text-gold text-xl font-semibold pt-8 pb-2 border-b border-gold/15">
          The Companion Texts
        </h2>

        <p>
          The two companion texts featured in this edition, <em>Tafsīr al-Jalālayn</em> and{' '}
          <em>Rūḥ al-Bayān</em>, are not supplementary additions. They are the primary exegetical
          interlocutors of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>. Their inclusion here
          reflects the scholarly consensus established in the academic literature on Niasse&apos;s
          tafsīr, and their relationship to his commentary defines the intellectual character of the work.
        </p>

        <div className="pt-4">
          <div className="border-b border-gold/15 pb-2 mb-4">
            <h3 className="font-arabic text-gold text-xl font-bold" dir="rtl">تفسير الجلالين</h3>
            <p className="font-english text-white/60 text-sm mt-1">
              Tafsīr al-Jalālayn · Jalāl al-Dīn al-Maḥallī (d. 864/1459) and Jalāl al-Dīn al-Suyūṭī (d. 911/1505)
            </p>
          </div>

          <p className="leading-7">
            <em>Tafsīr al-Jalālayn</em>, the concise fifteenth-century Egyptian tafsīr completed
            jointly by Jalāl al-Dīn al-Maḥallī (d. 864/1459), a Shāfiʿī jurist and Quranic
            scholar of Cairo, and his student Jalāl al-Dīn al-Suyūṭī (d. 911/1505), one of the
            most prolific scholars of the Islamic tradition and a master of the Quranic sciences,
            hadith, and jurisprudence, forms the foundational reference for the development of
            tafsīr practice in West Africa since the sixteenth century. As Ogunnaike has observed,
            it constitutes &ldquo;the basis of most West African tafsīrs, both written works and
            oral performances.&rdquo;<sup>3</sup>
          </p>

          <p className="leading-7 mt-3">
            The specific recension of the Jalālayn that Niasse consulted was the edition bearing
            the marginal notes of Aḥmad al-Ṣāwī (d. 1241/1825), an Egyptian Mālikī scholar,
            a student of al-Dardir, and a Sufi of the Khalwatiyya order whose commentary
            integrated the legal and spiritual dimensions of Quranic interpretation. Ustādh Barham Diop (1932–2014), a prominent
            student of Niasse, confirmed to Ogunnaike that Shaykh Ibrāhīm delivered the 1964
            Ramaḍān sessions with a physical copy of the Jalālayn with al-Ṣāwī&apos;s marginal
            notes in his hand.<sup>4</sup> The compiler&apos;s annotations confirm this: from the
            documentary apparatus of <em>Fī Riyāḍ al-Tafsīr</em>, it is clear that the Jalālayn-Ṣāwī
            text constituted the primary written reference against which Niasse&apos;s oral commentary
            was delivered.
          </p>

          <p className="leading-7 mt-3">
            Ogunnaike characterises the function of this text in Niasse&apos;s method with precision:
            &ldquo;one can almost hear when Shaykh Ibrāhīm puts down the Tafsīr al-Jalālayn and
            began to expound on his own.&rdquo;<sup>5</sup> <em>Fī Riyāḍ al-Tafsīr</em> adheres
            relatively closely to al-Ṣāwī&apos;s commentary before departing into independent
            spiritual instruction. In this sense, the Jalālayn-Ṣāwī serves as a <em>maṭlaʿ</em> —
            a point of departure, from which Niasse launches into metaphysical exposition, practical
            spiritual guidance, and his own distinctive reading of the Qurʾānic text.
          </p>
        </div>

        <div className="pt-4">
          <div className="border-b border-gold/15 pb-2 mb-4">
            <h3 className="font-arabic text-gold text-xl font-bold" dir="rtl">رُوحُ الْبَيَانِ</h3>
            <p className="font-english text-white/60 text-sm mt-1">
              Rūḥ al-Bayān fī Tafsīr al-Qurʾān · Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715)
            </p>
          </div>

          <p className="leading-7">
            The relationship between <em>Fī Riyāḍ al-Tafsīr</em> and the <em>Rūḥ al-Bayān</em> of
            Ismāʿīl Ḥaqqī al-Burūsawī (d. 1127/1715), Ottoman scholar, Sufi shaykh of the
            Khalwatiyya order, and one of the foremost synthesisers of Sufi Quranic hermeneutics
            in the post-Akbarian tradition, marks one of the most significant findings
            of recent scholarship on Niasse&apos;s tafsīr. In his 2024 study, Wright argues that
            Niasse&apos;s commentary &ldquo;exhibits a clear preference for an early
            eighteenth-century Ottoman multivolume work, Ismāʿīl Ḥaqqī&apos;s &lsquo;Spirit of
            Explanation&rsquo; (<em>Rūḥ al-Bayān</em>), one of the most comprehensive summaries
            of Sufi understandings of the Qurʾān.&rdquo;<sup>6</sup>
          </p>

          <p className="leading-7 mt-3">
            Wright&apos;s thesis represents a revision of prior scholarly assumptions. Earlier
            scholarship located the Jalālayn as the dominant influence on West African tafsīr.
            Wright demonstrates, however, that close reading of <em>Fī Riyāḍ al-Tafsīr</em>
            reveals &ldquo;a sustained dialectic, not only with the Tafsīr al-Jalālayn but also
            with a seminal Ottoman Sufi tafsīr, the <em>Rūḥ al-Bayān</em>, in crafting a notable
            contribution to the classical tafsīr genre.&rdquo;<sup>7</sup> Niasse&apos;s preference
            for the <em>Rūḥ al-Bayān</em> distinguishes his work from the broader West African
            tafsīr tradition and situates it within the Ottoman Sufi exegetical inheritance.
          </p>

          <p className="leading-7 mt-3">
            This scholarly preference is corroborated by personal testimony. Ustādh Barham Diop
            reported to Ogunnaike that Niasse &ldquo;insisted that the top shelves of his library
            be stocked with books of tafsīr, and that he had a special fondness for the{' '}
            <em>Rūḥ al-Bayān</em>.&rdquo;<sup>8</sup> The <em>Rūḥ al-Bayān</em> is a
            ten-volume work drawing extensively on the metaphysical school of Ibn ʿArabī (d.
            638/1240) and the subsequent Sufi interpretive tradition. Its prominence in{' '}
            <em>Fī Riyāḍ al-Tafsīr</em> is a direct expression of Niasse&apos;s engagement
            with the Akbarian tradition and his situating of Qurʾānic exegesis within the
            cosmological and anthropological framework of waḥdat al-wujūd and its West African
            Tijānī reception.
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-12 pt-6 border-t border-gold/20">
        <p className="font-english text-gold/60 text-xs uppercase tracking-widest mb-4">Notes</p>
        <ol className="space-y-2 font-english text-white/45 text-xs leading-5 list-decimal list-inside">
          <li>Samuel Ross, &ldquo;What Were the Most Popular Tafsīrs in Islamic History? Part 1: An Assessment of the Manuscript Record and the State of Tafsīr Studies,&rdquo; <em>Journal of Qurʾānic Studies</em> 25, no. 3 (2023): 32.</li>
          <li>Ibid., 32–33, citing Jane Dammen McAuliffe, <em>Qurʾānic Christians: An Analysis of Classical and Modern Exegesis</em> (Cambridge: Cambridge University Press, 1991), 27.</li>
          <li>Oludamini Ogunnaike, &ldquo;In the Gardens with Ibrāhīm: An Evaluation of <em>Fī Riyāḍ al-Tafsīr</em> by Shaykh Ibrāhīm Niasse, a Contemporary, Traditional Tafsīr,&rdquo; <em>Journal of Qurʾānic Studies</em> 20, no. 1 (2018): 29.</li>
          <li>Ibid., 29.</li>
          <li>Ibid., 29.</li>
          <li>Zachary Wright, &ldquo;The Qurʾān and Knowledge of God in West Africa: The Sufi Tafsīr of Shaykh Ibrāhīm Niasse,&rdquo; <em>Islamic Africa</em> 15 (2024): 69.</li>
          <li>Ibid., 71.</li>
          <li>Ogunnaike, &ldquo;In the Gardens with Ibrāhīm,&rdquo; 30.</li>
        </ol>
      </div>

      {/* Further reading */}
      <div className="mt-8 pt-6 border-t border-gold/15">
        <p className="font-english text-gold/60 text-xs uppercase tracking-widest mb-6">For Further Research</p>

        <p className="font-english text-gold/50 text-xs uppercase tracking-widest mb-3">On Shaykh Ibrāhīm Niasse and the Fayḍa</p>
        <ul className="space-y-2 font-english text-white/45 text-xs leading-6 mb-8">
          <li>Ruediger Seesemann, <em>The Divine Flood: Ibrāhīm Niasse and the Roots of a Twentieth-Century Sufi Revival</em> (Oxford: Oxford University Press, 2011).</li>
          <li>Zachary Wright, <em>Living Knowledge in West African Islam: The Sufi Community of Ibrāhīm Niasse</em> (Leiden: Brill, 2015).</li>
          <li>Andrea Brigaglia, &ldquo;The Fayda Tijaniyya of Ibrāhīm Niasse: Television Preachers and Contemporary Ṭarīqa Networks,&rdquo; <em>Africa</em> 78, no. 4 (2008): 537–62.</li>
          <li>Ruediger Seesemann, &ldquo;Tijaniyya,&rdquo; in <em>Oxford Encyclopedia of Islam and Society</em>, ed. Jonathan A. C. Brown (Oxford: Oxford University Press, 2022).</li>
          <li>Oludamini Ogunnaike, <em>Deep Knowledge: Ways of Knowing in Sufism and Ifá, Two West African Intellectual Traditions</em> (University Park: Penn State University Press, 2020).</li>
          <li>Joseph Hill, &ldquo;Divine Knowledge and Islamic Authority: Religious Specialization among Disciples of Baay Ñas,&rdquo; PhD dissertation, Department of Anthropology, Yale University, 2007.</li>
        </ul>

        <p className="font-english text-gold/50 text-xs uppercase tracking-widest mb-3">On Niasse&apos;s Tafsīr</p>
        <ul className="space-y-2 font-english text-white/45 text-xs leading-6 mb-8">
          <li>Andrea Brigaglia, &ldquo;Two Exegetical Works from Twentieth-Century West Africa: Shaykh Abū Bakr Gumi&apos;s <em>Radd al-adhhān</em> and Shaykh Ibrāhīm Niasse&apos;s <em>Fī riyāḍ al-tafsīr</em>,&rdquo; <em>Journal of Qurʾānic Studies</em> 15, no. 3 (2013): 253–266.</li>
          <li>Oludamini Ogunnaike, &ldquo;In the Gardens with Ibrāhīm: An Evaluation of <em>Fī riyāḍ al-tafsīr</em> by Shaykh Ibrāhīm Niasse, a Contemporary, Traditional Tafsīr,&rdquo; <em>Journal of Qurʾānic Studies</em> 20, no. 1 (2018): 28–46.</li>
          <li>Zachary Wright, &ldquo;The Qurʾān and Knowledge of God in West Africa: The Sufi Tafsīr of Shaykh Ibrāhīm Niasse,&rdquo; <em>Islamic Africa</em> 15, no. 1 (2023): 69–97.</li>
          <li>Amadu Kunateh, &ldquo;Identity Without Being: Personhood in the Tafsīr of Shaykh Ibrāhīm Niasse,&rdquo; Special Issue: Presents and Futures of Islamic Philosophy, <em>Sophia</em> (under review).</li>
        </ul>

        <div className="border border-gold/15 rounded-xl p-4 bg-gold/3">
          <p className="font-english text-gold/60 text-xs uppercase tracking-widest mb-2">Forthcoming</p>
          <p className="font-english text-white/50 text-xs leading-5 italic">
            Amadu Kunateh, <em>Leaders of Knowledge: Tafsīr, Philosophical-Theology, and the Remapping of Islamic Thought in West Africa</em> (expected 2027). The first book-length study of <em>Fī Riyāḍ al-Tafsīr</em>.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/lesson/1" className="tap font-english text-sm text-bg bg-gold hover:bg-gold-light px-5 rounded-lg font-semibold transition-all">
          Begin reading → Lesson One
        </Link>
      </div>
    </main>
  );
}
