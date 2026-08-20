// Research notes — AK's working observations on individual lessons.
//
// One source, two views. /notes renders all of them; the Overview panel on
// /lesson/[id] renders the ones attached to that lesson. Before the notes lived
// here, those two views had no source in common and disagreed:
//
//   - READING_NOTES was a map of 30 lesson ids to `string | null` with every
//     value null, and the lesson page tried it FIRST, falling back to
//     lesson.lessonSummary. So the first branch had never once executed: the
//     Overview panel had always been showing the summary.
//   - The notes themselves -- two, both on Lesson 1 -- sat in a NOTES array
//     literal inside src/app/notes/page.tsx, on a page Lesson 1 does not link
//     to. The slot built for them, READING_NOTES[1], was null.
//
// A note is not a summary and does not replace one. lesson.lessonSummary
// describes what a lesson covers and exists for all 56; a note argues about
// what it says and exists for two. The Overview panel shows the summary first
// and any notes beneath it, rather than substituting one for the other.
//
// `body` is HTML, rendered with dangerouslySetInnerHTML. It is authored in this
// file and never comes from input.

export interface ReadingNote {
  id: number;
  /** Lesson this note is about. */
  lesson: number;
  /** ISO date written, for ordering. */
  date: string;
  title: string;
  /** HTML. Authored here only. */
  body: string;
  tags: string[];
}

export const READING_NOTES: ReadingNote[] = [
  {
    id: 1,
    lesson: 1,
    date: '2025-04-01',
    title: 'On the distinction between tafsīr and taʾwīl in Lesson 1',
    body: `<p>Shaykh Ibrāhīm opens the tafsīr with a methodological statement that is immediately significant: he distinguishes <i>tafsīr</i> (what is transmitted from the Prophet and Companions about the Qurʾān's meaning) from <i>taʾwīl</i> (what reason can determine from the possible senses of the text). He privileges <i>tafsīr</i> as requiring <i>naql</i> (transmitted authority) while <i>taʾwīl</i> is the domain of <i>ʿaql</i> (reason). This is a classically Ashʿarī-adjacent position but articulated with distinctive Tijānī inflection — the emphasis on the "light in the heart" (<i>nūr fī al-qalb</i>) that no scholarly formation alone can provide suggests that for Shaykh Ibrāhīm, valid <i>tafsīr</i> requires not only transmitted authority but a spiritual opening (<i>fatḥ</i>) that distinguishes the genuine from the merely learned commentator.</p>`,
    tags: ['methodology', 'tafsir sciences', 'epistemology'],
  },
  {
    id: 2,
    lesson: 1,
    date: '2025-04-15',
    title: 'The Kāmil al-ʿAṣr passage and prophetic analogy',
    body: `<p>The most doctrinally significant passage in Lesson 1 is Shaykh Ibrāhīm's statement on the <i>Kāmil al-ʿAṣr</i> (Perfectly Realised One of the Age): "whoever believes in all the <i>awliyāʾ</i> but disbelieves in the <i>Kāmil</i> of his age is cut off from God." The structural parallel with prophethood — one who believes in all prophets but denies the prophet of one's own time is not a believer — is explicit and deliberate. This raises the question of how Shaykh Ibrāhīm is positioning the <i>walī</i> vis-à-vis the <i>anbiyāʾ</i>, and whether this represents a genuinely post-prophetic spiritual authority or an extension of prophetic <i>barakah</i>. The dissertation chapter on anthropology will need to address this directly.</p>`,
    tags: ['walaya', 'kamil al-asr', 'anthropology', 'dissertation'],
  },
];

/** Notes on one lesson, oldest first. Returns an empty array rather than null,
 *  so callers map instead of branching. */
export function getReadingNotes(lessonId: number): ReadingNote[] {
  return READING_NOTES
    .filter(n => n.lesson === lessonId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** All notes, newest first — the order /notes reads in. */
export function allReadingNotes(): ReadingNote[] {
  return [...READING_NOTES].sort((a, b) => b.date.localeCompare(a.date));
}
