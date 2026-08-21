import { NextRequest, NextResponse } from 'next/server';
import footnotes from '@/data/footnotesData.json';
import { hasApparatus } from '@/lib/apparatus';
import { editorNotesFor } from '@/lib/editorNotes';

// Serves the compiler-footnote corpus that used to sit at the public,
// unauthenticated, directly-linkable public/data/footnotes.json -- see
// scripts/secure-footnotes.js for the full reasoning. This route doesn't
// make the content un-scrapable (nothing short of a login wall does, for
// content that's meant to be publicly readable), but it removes the
// "one clean bulk download, no server involved" trivial case, and lets
// the per-lesson citation panel ask for only what it needs instead of the
// whole ~2000-entry corpus every time it opens.
//
// ?lessonId=<n> -- return only that lesson's footnotes (used by
// src/components/LessonCitations.tsx). Omit it to get everything (used by
// the full /footnotes Critical Apparatus page).

interface Footnote {
  id: string;
  lessonId: number;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.searchParams.get('lessonId');
  // Only the lessons whose apparatus has been verified are served. The rows for
  // the rest are still in src/data -- they are simply not published while their
  // markers are unreliable. See src/lib/apparatus.ts.
  const all = (footnotes as Footnote[]).filter(f => hasApparatus(f.lessonId));

  if (lessonId !== null) {
    const id = Number(lessonId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'lessonId must be a number' }, { status: 400 });
    }
    // The editor's notes ride alongside the compiler's, each carrying its own
    // voice, and are NOT gated on hasApparatus(): that gate exists because the
    // compiler's inline [N] markers are unverified outside Lessons 1-7, and an
    // editor's note has no [N] marker to be wrong about. It anchors to a
    // paragraph. See src/lib/editorNotes.ts.
    return NextResponse.json({
      compiler: all.filter(f => f.lessonId === id),
      editor: editorNotesFor(id),
    });
  }

  return NextResponse.json(all);
}
