import Link from 'next/link';

const ROLES = [
  {
    title: "Wolof Audio Transcription",
    desc: "Assist in transcribing Shaykh Ibrāhīm Niasse's Wolof tafsīr sessions from the audio recordings. Native or advanced Wolof speaker required.",
    contact: "niassetafsirproject@gmail.com"
  },
  {
    title: "French Translation",
    desc: "Collaborate on the French translation of the tafsīr. Strong command of classical Islamic terminology in French required.",
    contact: "niassetafsirproject@gmail.com"
  },
  {
    title: "Hausa Translation",
    desc: "Lead or contribute to the Hausa-language edition, drawing on the rich tradition of Niasse's teaching in Hausa-speaking communities.",
    contact: "niassetafsirproject@gmail.com"
  }
];

export default function GetInvolvedPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">
      <div className="text-center pb-8 mb-8 border-b border-gold/20">
        <div className="font-english text-gold text-2xl font-semibold">Get Involved</div>
        <div className="font-english text-white/50 text-sm mt-2 italic">
          Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Collaborative Scholarly Project
        </div>
      </div>

      <div className="font-english text-white leading-relaxed mb-8">
        <p className="mb-4">
          This edition is an ongoing scholarly project encompassing translation into multiple languages,
          digitization of ten volumes of Arabic text, audio transcription, and comparative annotation.
          It is a work that will take years to complete and benefits from a community of collaborators.
        </p>
        <p>
          If you have relevant skills and a genuine interest in contributing to the preservation and
          dissemination of Shaykh Ibrāhīm Niasse&apos;s intellectual legacy, we welcome your involvement.
          Please reach out via email describing your background and the role you are interested in.
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {ROLES.map((role, i) => (
          <div key={i} className="border border-gold/15 rounded-xl p-5">
            <h3 className="font-english text-gold font-semibold text-base mb-2">{role.title}</h3>
            <p className="font-english text-white/80 text-sm leading-6 mb-3">{role.desc}</p>
            <a
              href={`mailto:${role.contact}?subject=Get Involved: ${role.title}`}
              className="font-english text-xs text-gold/70 border border-gold/25 px-3 py-1.5 rounded-full hover:border-gold/50 hover:text-gold transition-all inline-block"
            >
              Express interest ↗
            </a>
          </div>
        ))}
      </div>

      <div className="border border-gold/15 rounded-xl p-5 bg-gold/3 text-center">
        <div className="font-english text-gold font-semibold mb-2">General Enquiries</div>
        <a href="mailto:niassetafsirproject@gmail.com"
          className="font-english text-white/70 text-sm hover:text-gold transition-colors">
          niassetafsirproject@gmail.com
        </a>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="font-english text-sm text-white/50 hover:text-gold border border-gold/20 hover:border-gold/50 px-5 py-2 rounded-lg transition-all">
          ← Back to Contents
        </Link>
      </div>
    </main>
  );
}
