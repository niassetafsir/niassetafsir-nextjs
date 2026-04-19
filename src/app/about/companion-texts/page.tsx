import Link from 'next/link';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companion Texts",
  description: "Tafsīr al-Jalālayn and Rūḥ al-Bayān as companion texts in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm, their role as exegetical interlocutors in Niasse's commentary.",
};

export default function CompanionTextsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-20 pt-6" dir="ltr">
      <div className="mb-2">
        <Link href="/about" className="font-english text-xs text-white/35 hover:text-gold/60 transition-all">
          ← About
        </Link>
      </div>

      <div className="text-center py-6 mb-8 border-b border-gold/20">
        <h1 className="font-english text-white text-3xl font-semibold mt-2 mb-1">Companion Texts</h1>
        <p className="font-english text-white/40 text-sm italic">
          The exegetical interlocutors of <em>Fī Riyāḍ al-Tafsīr</em>
        </p>
      </div>

      <div className="font-english text-white/70 text-base leading-relaxed space-y-8">

        <p className="leading-7">
          The two companion texts featured in this edition, <em>Tafsīr al-Jalālayn</em> and{' '}
          <em>Rūḥ al-Bayān</em>, are not supplementary additions. They are the primary exegetical
          interlocutors of <em>Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm</em>. Their inclusion here 
          reflects the scholarly consensus established in the academic literature on Niasse&apos;s 
          tafsīr, and their relationship to his commentary defines the intellectual character of the work.
        </p>

        {/* Jalalayn */}
        <div>
          <div className="border-b border-gold/15 pb-2 mb-4">
            <h2 className="font-arabic text-gold text-xl font-bold" dir="rtl">تفسير الجلالين</h2>
            <p className="font-english text-white/60 text-sm mt-1">
              Tafsīr al-Jalālayn · Jalāl al-Dīn al-Maḥallī (d. 864/1459) and Jalāl al-Dīn al-Suyūṭī (d. 911/1505)
            </p>
          </div>

          <p className="leading-7">
            <em>Tafsīr al-Jalālayn</em>, the concise fifteenth-century Egyptian tafsīr completed
            jointly by Jalāl al-Dīn al-Maḥallī (d. 864/1459), a Shāfiʿī jurist and Quranic 
            scholar of Cairo, and his student Jalāl al-Dīn al-Suyūṭī (d. 911/1505), one of the 
            most prolific scholars of the Islamic tradition and a master of the Quranic sciences, 
            hadith, and jurisprudence, forms the
            foundational reference for the development of tafsīr practice in West Africa since the
            sixteenth century. As Ogunnaike has observed, it constitutes &ldquo;the basis of most
            West African tafsīrs, both written works and oral performances.&rdquo;<sup>1</sup>
          </p>

          <p className="leading-7 mt-3">
            The specific recension of the Jalālayn that Niasse consulted was the edition bearing
            the marginal notes of Aḥmad al-Ṣāwī (d. 1241/1825), an Egyptian Mālikī scholar, 
            a student of al-Dardir, and a Sufi of the Khalwatiyya order whose commentary 
            integrated the legal and spiritual dimensions of Quranic interpretation. Ustādh Barham Diop (1932–2014), a prominent
            student of Niasse, confirmed to Ogunnaike that Shaykh Ibrāhīm delivered the 1964
            Ramaḍān sessions with a physical copy of the Jalālayn with al-Ṣāwī&apos;s marginal
            notes in his hand.<sup>2</sup> The compiler&apos;s annotations confirm this: from the
            documentary apparatus of <em>Fī Riyāḍ al-Tafsīr</em>, it is clear that the Jalālayn-Ṣāwī
            text constituted the primary written reference against which Niasse&apos;s oral commentary
            was delivered.
          </p>

          <p className="leading-7 mt-3">
            Ogunnaike characterises the function of this text in Niasse&apos;s method with precision:
            &ldquo;one can almost hear when Shaykh Ibrāhīm puts down the Tafsīr al-Jalālayn and
            began to expound on his own.&rdquo;<sup>3</sup> <em>Fī Riyāḍ al-Tafsīr</em> adheres
            relatively closely to al-Ṣāwī&apos;s commentary before departing into independent
            spiritual instruction. In this sense, the Jalālayn-Ṣāwī serves as a <em>maṭlaʿ</em> —
            a point of departure, from which Niasse launches into metaphysical exposition, practical
            spiritual guidance, and his own distinctive reading of the Qurʾānic text.
          </p>
        </div>

        {/* Ruh al-Bayan */}
        <div>
          <div className="border-b border-gold/15 pb-2 mb-4">
            <h2 className="font-arabic text-gold text-xl font-bold" dir="rtl">رُوحُ الْبَيَانِ</h2>
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
            of Sufi understandings of the Qurʾān.&rdquo;<sup>4</sup>
          </p>

          <p className="leading-7 mt-3">
            Wright&apos;s thesis represents a revision of prior scholarly assumptions. Earlier
            scholarship located the Jalālayn as the dominant influence on West African tafsīr.
            Wright demonstrates, however, that close reading of <em>Fī Riyāḍ al-Tafsīr</em>
            reveals &ldquo;a sustained dialectic, not only with the Tafsīr al-Jalālayn but also
            with a seminal Ottoman Sufi tafsīr, the <em>Rūḥ al-Bayān</em>, in crafting a notable
            contribution to the classical tafsīr genre.&rdquo;<sup>5</sup> Niasse&apos;s preference
            for the <em>Rūḥ al-Bayān</em> distinguishes his work from the broader West African
            tafsīr tradition and situates it within the Ottoman Sufi exegetical inheritance.
          </p>

          <p className="leading-7 mt-3">
            This scholarly preference is corroborated by personal testimony. Ustādh Barham Diop
            reported to Ogunnaike that Niasse &ldquo;insisted that the top shelves of his library
            be stocked with books of tafsīr, and that he had a special fondness for the
            <em>Rūḥ al-Bayān</em>.&rdquo;<sup>6</sup> The <em>Rūḥ al-Bayān</em> is a
            ten-volume work drawing extensively on the metaphysical school of Ibn ʿArabī (d.
            638/1240) and the subsequent Sufi interpretive tradition. Its prominence in
            <em>Fī Riyāḍ al-Tafsīr</em> is a direct expression of Niasse&apos;s engagement
            with the Akbarian tradition and his situating of Qurʾānic exegesis within the
            cosmological and anthropological framework of waḥdat al-wujūd and its West African
            Tijānī reception.
          </p>
        </div>

        {/* Footnotes */}
        <div className="border-t border-gold/15 pt-6 space-y-2 text-white/40 text-xs leading-6">
          <p><sup>1</sup> Oludamini Ogunnaike, &ldquo;In the Gardens with Ibrāhīm: An Evaluation of <em>Fī Riyāḍ al-Tafsīr</em> by Shaykh Ibrāhīm Niasse, a Contemporary, Traditional Tafsīr,&rdquo; <em>Journal of Qurʾānic Studies</em> 20, no. 1 (2018): 29.</p>
          <p><sup>2</sup> Ibid., 29.</p>
          <p><sup>3</sup> Ibid., 29.</p>
          <p><sup>4</sup> Zachary Wright, &ldquo;The Qurʾān and Knowledge of God in West Africa: The Sufi Tafsīr of Shaykh Ibrāhīm Niasse,&rdquo; <em>Islamic Africa</em> 15 (2024): 69.</p>
          <p><sup>5</sup> Ibid., 71.</p>
          <p><sup>6</sup> Ogunnaike, &ldquo;In the Gardens with Ibrāhīm,&rdquo; 30.</p>
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
