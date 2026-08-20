import Link from 'next/link';
import type { Metadata } from 'next';
import { allReadingNotes } from '@/lib/readingNotes';
import { getAllLessons } from '@/lib/lessons';

export const metadata: Metadata = {
  title: 'Research Notes',
  description: 'Working observations on Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Amadu Kunateh',
};

// The notes used to be a NOTES array literal in this file, and the lesson page
// read a different, empty structure in src/lib/readingNotes.ts. Same genre of
// writing, two stores, no shared source: the two real notes lived here, on a
// page Lesson 1 does not link to, while the slot the lesson page consulted for
// Lesson 1 was null. They come from readingNotes.ts now, and Lesson 1's
// Overview panel shows them where a reader of Lesson 1 will meet them.
//
// The verse range was also hardcoded per note ("Al-Fātiḥa · Q. 1:1–2:5", twice).
// It is read from the lesson itself now, so it cannot drift from the edition.

export default async function NotesPage() {
  const notes = allReadingNotes();
  const lessons = await getAllLessons();
  const byId = new Map(lessons.map(l => [l.id, l]));

  return (
    <main className="max-w-3xl mx-auto px-4 pb-20 pt-6" dir="ltr">

      {/* Header */}
      <div className="mb-8">
        <Link href="/research" className="tap font-english text-xs mb-4 inline-flex items-center gap-1"
          style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Research
        </Link>
        <h1 className="font-english text-xl font-semibold mb-1"
          style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
          Research Notes
        </h1>
        <p className="font-english text-sm italic"
          style={{color:'var(--body-sub, rgba(255,255,255,0.45))'}}>
          Editorial observations on the text — Amadu Kunateh
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="font-english text-sm italic py-10 text-center"
          style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
          No notes yet.
        </p>
      ) : (
        <div className="space-y-8">
          {notes.map(note => {
            const lesson = byId.get(note.lesson);
            return (
              <article key={note.id} className="border-b pb-8"
                style={{borderColor:'rgba(201,168,76,0.12)'}}>

                <div className="mb-3">
                  <h2 className="font-english text-base font-semibold mb-1"
                    style={{color:'var(--body-text, rgba(255,255,255,0.9))'}}>
                    {note.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/lesson/${note.lesson}?panel=overview`}
                      className="tap font-english text-xs hover:text-gold transition-colors"
                      style={{color:'rgba(201,168,76,0.7)'}}>
                      Lesson {note.lesson}
                      {lesson?.verseRange ? ` · ${lesson.verseRange}` : ''}
                    </Link>
                    <span style={{color:'var(--body-faint, rgba(255,255,255,0.15))', fontSize:'10px'}}>·</span>
                    <span className="font-english text-xs"
                      style={{color:'var(--body-faint, rgba(255,255,255,0.35))'}}>
                      {new Date(note.date).toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'})}
                    </span>
                  </div>
                </div>

                <div className="font-english text-sm leading-7"
                  style={{color:'var(--body-sub, rgba(255,255,255,0.7))'}}
                  dangerouslySetInnerHTML={{ __html: note.body }} />

                <div className="flex gap-2 flex-wrap mt-4">
                  {note.tags.map(tag => (
                    <span key={tag}
                      className="font-english text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background:'rgba(201,168,76,0.10)',
                        color:'rgba(138,109,31,0.85)',
                        border:'1px solid rgba(201,168,76,0.20)',
                      }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 pt-4 border-t text-center"
        style={{borderColor:'rgba(201,168,76,0.12)'}}>
        <p className="font-english text-xs italic"
          style={{color:'var(--body-faint, rgba(255,255,255,0.3))'}}>
          Notes are added as research progresses. These are working observations, not final scholarly positions.
        </p>
      </div>
    </main>
  );
}
