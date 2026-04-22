import Link from 'next/link';

const NOTES = [
  {
    id: 1,
    date: '2025-04-01',
    title: 'On the distinction between tafsīr and taʾwīl in Lesson 1',
    lesson: 1,
    verseRange: 'Al-Fātiḥa · Q. 1:1–2:5',
    body: `Shaykh Ibrāhīm opens the tafsīr with a methodological statement that is immediately significant: he distinguishes tafsīr (what is transmitted from the Prophet and Companions about the Quran's meaning) from taʾwīl (what reason can determine from the possible senses of the text). He privileges tafsīr as requiring naql (transmitted authority) while taʾwīl is the domain of ʿaql (reason). This is a classically Ashʿarī-adjacent position but articulated with distinctive Tijānī inflection — the emphasis on the "light in the heart" (nūr fī al-qalb) that no scholarly formation alone can provide suggests that for Shaykh Ibrāhīm, valid tafsīr requires not only transmitted authority but a spiritual opening (fatḥ) that distinguishes the genuine from the merely learned commentator.`,
    tags: ['methodology', 'tafsir sciences', 'epistemology'],
  },
  {
    id: 2,
    date: '2025-04-15',
    title: 'The Kāmil al-ʿAṣr passage and prophetic analogy',
    lesson: 1,
    verseRange: 'Al-Fātiḥa · Q. 1:1–2:5',
    body: `The most doctrinally significant passage in Lesson 1 is Shaykh Ibrāhīm's statement on the Kāmil al-ʿAṣr (Perfectly Realised One of the Age): "whoever believes in all the awliyāʾ but disbelieves in the Kāmil of his age is cut off from God." The structural parallel with prophethood — one who believes in all prophets but denies the prophet of one's own time is not a believer — is explicit and deliberate. This raises the question of how Shaykh Ibrāhīm is positioning the walī vis-à-vis the anbiyāʾ, and whether this represents a genuinely post-prophetic spiritual authority or an extension of prophetic barakah. The dissertation chapter on anthropology will need to address this directly.`,
    tags: ['walaya', 'kamil al-asr', 'anthropology', 'dissertation'],
  },
];

export default function NotesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-8">
        <Link href="/research" className="font-english text-xs mb-4 inline-flex items-center gap-1"
          style={{color:'rgba(255,255,255,0.35)'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Research
        </Link>
        <h1 className="font-english text-xl font-semibold mb-1"
          style={{color:'rgba(255,255,255,0.9)'}}>
          Research Notes
        </h1>
        <p className="font-english text-sm italic"
          style={{color:'rgba(255,255,255,0.45)'}}>
          Editorial observations on the text — Amadu Kunateh
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-8">
        {NOTES.map(note => (
          <article key={note.id}
            className="border-b pb-8"
            style={{borderColor:'rgba(201,168,76,0.12)'}}>

            {/* Metadata */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h2 className="font-english text-base font-semibold mb-1"
                  style={{color:'rgba(255,255,255,0.9)'}}>
                  {note.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/lesson/${note.lesson}`}
                    className="font-english text-xs hover:text-gold transition-colors"
                    style={{color:'rgba(201,168,76,0.6)'}}>
                    Lesson {note.lesson} · {note.verseRange}
                  </Link>
                  <span style={{color:'rgba(255,255,255,0.15)', fontSize:'10px'}}>·</span>
                  <span className="font-english text-xs"
                    style={{color:'rgba(255,255,255,0.25)'}}>
                    {new Date(note.date).toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'})}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <p className="font-english text-sm leading-7"
              style={{color:'rgba(255,255,255,0.7)'}}>
              {note.body}
            </p>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mt-4">
              {note.tags.map(tag => (
                <span key={tag}
                  className="font-english text-[10px] px-2 py-0.5 rounded"
                  style={{
                    background:'rgba(255,255,255,0.06)',
                    color:'rgba(255,255,255,0.35)',
                    border:'1px solid rgba(255,255,255,0.08)',
                  }}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t text-center"
        style={{borderColor:'rgba(201,168,76,0.12)'}}>
        <p className="font-english text-xs italic"
          style={{color:'rgba(255,255,255,0.2)'}}>
          Notes are added as research progresses. These represent the editors' working observations, not final scholarly positions.
        </p>
      </div>
    </main>
  );
}
