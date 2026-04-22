'use client';
import { useState } from 'react';
import AnnotationToolbar from '@/components/AnnotationToolbar';
import AnnotationSidebar from '@/components/AnnotationSidebar';

interface Props {
  lessonId: number;
  lessonTitle: string;
  verseRange: string;
}

export default function LessonAnnotationLayer({ lessonId, lessonTitle, verseRange }: Props) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      {/* Annotation toolbar — appears on text selection, desktop only */}
      <AnnotationToolbar
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        verseRange={verseRange}
        onAnnotationSaved={() => setRefreshTrigger(t => t + 1)}
      />
      {/* Annotation sidebar — desktop only, right side */}
      <AnnotationSidebar
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        verseRange={verseRange}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
