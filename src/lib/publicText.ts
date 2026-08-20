/**
 * Keep the project's working state off the public page.
 *
 * A verse page was rendering this, verbatim, to any reader:
 *
 *   "Working transcription — not yet proofread against the printing. … The
 *    English is an unsigned DRAFT awaiting AK's pass … the draft was checked
 *    against Pickthall with no matches … Translator flagged 12 passage(s) as
 *    uncertain."
 *
 * This is a scholarly edition published under an author's name. Notes like that
 * read as a lack of confidence in the edition, and naming the editor as someone
 * who still has to review it tells the reader that what they are looking at is
 * unfinished.
 *
 * The distinction to hold on to is *whose state is being described*. A fact
 * about coverage is publishable and useful -- "English translation: Lessons
 * 1-5", "not yet translated", "the apparatus covers 7 of 56 lessons". A fact
 * about the workflow is not -- "awaiting review", "transcribed in a single pass
 * and not yet proofread", "flagged as uncertain".
 *
 * This filter works at sentence granularity rather than dropping whole notes,
 * because the two are mixed inside single strings: "§1 of the tafsīr chapter of
 * al-Fatāwā wa-l-ajwiba. The edition prints this reference itself. Read from a
 * photograph of the printing in a single pass; the Arabic body is not yet
 * transcribed." The first two sentences are a citation and should stay; the
 * third is workflow and should not.
 *
 * The underlying fields stay in src/data -- they are worth having in the
 * repository. They simply must not reach a page. Route every note, editorial
 * note or provenance string through this before rendering it.
 */

const WORKING_STATE: RegExp[] = [
  /\bworking (transcription|draft|copy)\b/i,
  /\bunsigned\b/i,
  /\bnot yet (proofread|transcribed|checked|verified|reviewed)\b/i,
  /\bproofread against\b/i,
  /\bsingle pass\b/i,
  /\bphotographs? of the (printing|page)\b/i,
  /\bawaiting\b.*\b(pass|review|check|sign)/i,
  /\bpending\b.*\b(review|pass|check)\b/i,
  /\bflagged\b.*\buncertain\b/i,
  /\bchecked against\b.*\b(no matches|with no)\b/i,
  /\bcompiler'?s footnotes are (not included|deliberately excluded)\b/i,
  /\bdraft\b.*\bawait/i,
];

/** Sentence-ish split that keeps the terminator, and does not break on the
 *  Arabic comma or on abbreviations like "vol." that appear in citations. */
function sentences(s: string): string[] {
  return s.split(/(?<=[.!?؟])\s+/).filter(Boolean);
}

/**
 * Remove any sentence that describes the project's own working state.
 * Returns '' when nothing publishable is left, so callers can skip rendering.
 */
export function stripWorkingProvenance(note: string | null | undefined): string {
  if (!note) return '';
  const kept = sentences(note).filter(s => !WORKING_STATE.some(rx => rx.test(s)));
  return kept.join(' ').replace(/\s+/g, ' ').trim();
}

/** True when a string is nothing but working state. */
export function isWorkingProvenance(note: string | null | undefined): boolean {
  return !!note && !stripWorkingProvenance(note);
}
