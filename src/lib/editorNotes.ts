import editorNotes from '@/data/editorNotes.json';

/**
 * The edition's third voice.
 *
 * Three people speak on a lesson page and they were, until now, indistinguish-
 * able in the data:
 *
 *   Niasse                     the commentary itself -- arabicBody
 *   Muḥammad ibn al-Shaykh     the printed apparatus -- footnotesData.json
 *   Amadu Kunateh              this file
 *
 * All 2,034 rows of footnotesData.json carry voice: 'compiler', added when this
 * layer was introduced. They had no such field before, so every note was
 * silently the compiler's -- and the Editorial Conventions page has been
 * promising for some time that "translator's notes are added only where
 * necessary and are marked as distinct from the Arabic compiler's footnotes"
 * with nothing behind the sentence. This is what makes it true.
 *
 * WHY A SEPARATE FILE AND NOT A FLAG ON THE SAME ARRAY
 *
 * The two apparatuses do different work and want different fields.
 *
 * The compiler's is DOCUMENTARY. It answers where a ḥadīth comes from, in which
 * collection, at which number, on which page -- so it is organised around
 * scholar, work, sourceType, volRef, and is keyed to the inline [N] markers the
 * printing carries.
 *
 * The editor's is INTERPRETIVE. It answers what debate Niasse is entering, whom
 * he is answering, and what turns on it -- so it wants an intervention type and
 * references outward, and it has no [N] marker in any printing because it is not
 * in any printing.
 *
 * Forcing both through one schema would mean either starving the second of the
 * fields it needs or filling the first with nulls. It would also invite exactly
 * the confusion this edition exists to avoid: an interpretive claim of AK's
 * sitting in a row that looks like the compiler's documentation.
 *
 * ANCHORING, AND WHY NOT TO CHARACTER OFFSETS
 *
 * A note is anchored to a paragraph index, plus a snippet of the words it
 * attaches to. Not to a character offset: 3,146 characters of arabicBody were
 * corrected in a single day of OCR repair, and an offset-anchored apparatus
 * would have silently drifted across all of it. Paragraph indices survive
 * substitution, and the snippet lets relocate() find the anchor again if
 * paragraphs are ever added or removed.
 *
 * The paragraph index is the one match-verses.js and arabicCommentary.ts use --
 * after isPoem() filtering. Keep those three in step.
 */

export type Voice = 'compiler' | 'editor';

/**
 * What kind of contextualisation a note performs. Not the compiler's genre
 * taxonomy (Hadith Sciences, Tafsīr, Theology...), which classifies his
 * SOURCES. This classifies Niasse's INTERVENTIONS, which is a different
 * question and deserves a different vocabulary.
 */
export type Intervention =
  | 'debate'        // Niasse is entering a live dispute in the tradition
  | 'response'      // he is answering a named position or school
  | 'doctrine'      // a doctrinal commitment worth making explicit
  | 'source'        // an unattributed borrowing or allusion identified
  | 'divergence'    // he departs from a position usually taken here
  | 'context'       // occasion, audience, or setting of the session
  | 'terminology';  // a term used in a sense a reader would otherwise miss

export interface EditorNote {
  id: string;
  lessonId: number;
  voice: 'editor';
  /** Paragraph index after isPoem() filtering -- see the note above. */
  paraIndex: number;
  /** A few words of the Arabic this attaches to, for display and relocation. */
  anchorText: string;
  intervention: Intervention;
  /** The note. English; Niasse's Arabic is the thing being commented on. */
  en: string;
  /** Optional Arabic, where the point turns on Arabic wording. */
  ar?: string | null;
  /** Works and passages this note points the reader to. */
  refs?: { work: string; cite?: string; note?: string }[];
}

const NOTES = editorNotes as unknown as EditorNote[];

export function editorNotesFor(lessonId: number): EditorNote[] {
  return NOTES
    .filter(n => n.lessonId === lessonId)
    .sort((a, b) => a.paraIndex - b.paraIndex);
}

export function editorNoteCount(): number {
  return NOTES.length;
}

export function lessonsWithEditorNotes(): number[] {
  const seen: number[] = [];
  for (const n of NOTES) if (!seen.includes(n.lessonId)) seen.push(n.lessonId);
  return seen.sort((a, b) => a - b);
}

/**
 * Find the paragraph a note belongs to when paraIndex may have drifted --
 * paragraphs added or removed, not merely corrected. Returns the stored index
 * when the snippet is still there, the paragraph that holds the snippet when it
 * has moved, and null when the anchor is gone and a human has to look.
 *
 * Compare on a stripped form so that OCR corrections to the anchor text itself
 * do not lose it.
 */
export function relocate(note: EditorNote, paragraphs: string[]): number | null {
  // The diacritic range is written out rather than as \p{Mn}: this file is
  // compiled under a target that rejects the Unicode property flag.
  const strip = (s: string) =>
    s.normalize('NFC')
      .replace(/[ً-ٰٟۖ-ۭ]/g, '')
      .replace(/[آأإٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/[ےۓ]/g, 'ي').replace(/\s+/g, ' ').trim();

  const needle = strip(note.anchorText);
  if (!needle) return null;
  if (paragraphs[note.paraIndex] && strip(paragraphs[note.paraIndex]).includes(needle)) {
    return note.paraIndex;
  }
  const at = paragraphs.findIndex(p => strip(p).includes(needle));
  return at >= 0 ? at : null;
}
