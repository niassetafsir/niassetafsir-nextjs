import React from 'react';
import Link from 'next/link';
import VolumeLessonTree, { type TreeVolume } from '@/components/VolumeLessonTree';
import { BOOK } from '@/lib/book';
import PanelTools from '@/components/reader/PanelTools';

/**
 * BookLayout: the lesson page as a book with a usul.ai-style contents panel.
 *
 * Right: the contents (as on usul.ai, AK 28 Nov), staying in view while the reader turns pages: (volumes and lessons, the current volume open), the
 * verses of this lesson, and the printed translation. Folded sections
 * throughout, so the reader keeps only what they want open. Below 1024px the
 * panel gives way to the drawer in the top bar.
 *
 * Keeps the `lesson-reading-page` class, which globals.css relies on for the
 * light-mode cream overrides; `book-page` adds the book palette in both
 * themes.
 */
interface Props {
  lesson: { id: number; verseRange: string; sura?: string; volume?: number | null; hasEnglish?: boolean };
  volumes: TreeVolume[];
  jumpVerses: { verse: string; paraIndex: number }[];
  topContent?: React.ReactNode;
  headnote?: React.ReactNode;
  children: React.ReactNode;
  bottomContent?: React.ReactNode;
  hasCompare?: boolean;
  hasCitations?: boolean;
}

export default function BookLayout({ lesson, volumes, jumpVerses, topContent, headnote, children, bottomContent, hasCompare = false, hasCitations = false }: Props) {
  const translated = lesson.id <= BOOK.translatedThrough;
  return (
    <div className="lesson-reading-page book-page">
      {topContent && <div className="lesson-reader-gutter" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem' }}>{topContent}</div>}
      <div className="bp-grid" dir="ltr">
        <div className="bp-main">
          <header className="bp-head">
            <span className="bp-kicker">{lesson.volume ? `Volume ${lesson.volume} · ` : ''}{lesson.sura || ''}</span>
            <h1>LESSON {lesson.id}</h1>
            <p className="bp-sub">{lesson.verseRange}</p>
            <div className="bp-dots" aria-hidden="true"><span /><span /><span /></div>
          </header>
          {headnote}
          {children}
          {translated && BOOK.orderUrl && (
            <div className="bp-book" style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ flex: '1 1 300px' }}>Read this lesson in the printed translation of <i>Fī Riyāḍ al-Tafsīr</i>, with the translator&rsquo;s headnotes and notes.</span>
              <a className="bp-order" href={BOOK.orderUrl}>Order the book</a>
            </div>
          )}
          {bottomContent}
        </div>
        <aside className="bp-aside" aria-label="Contents">
          <PanelTools hasCompare={hasCompare} hasCitations={hasCitations} />
          <p className="bp-label" style={{ margin: '1.1rem 0 .2rem 4px' }}>Contents</p>
          <p style={{ margin: '0 0 .5rem 4px', fontSize: 12.5, lineHeight: 1.35, color: 'var(--bp-sub)' }}>Volumes of the Arabic edition (Tunis, 2022)</p>
          <VolumeLessonTree volumes={volumes} currentLessonId={lesson.id} density="comfortable" />
          {jumpVerses.length > 1 && (
            <details open={jumpVerses.length <= 12} style={{ marginTop: '1rem', borderTop: '1px solid var(--bp-rule)', paddingTop: '.5rem' }}>
              <summary className="bp-label">In this lesson</summary>
              <div className="bp-jump">
                {jumpVerses.map(v => (
                  <Link key={v.verse} href={`/lesson/${lesson.id}?verse=${v.verse}`}>Q. {v.verse}</Link>
                ))}
              </div>
            </details>
          )}
          {BOOK.orderUrl && (
            <div className="bp-book">
              <span className="bp-label" style={{ color: 'var(--bp-accent)' }}>In print</span>
              <span style={{ fontWeight: 600 }}>Fī Riyāḍ al-Tafsīr in English</span>
              <span style={{ fontSize: 14, color: 'var(--bp-sub)' }}>Translated by Amadu Kunateh</span>
              <a className="bp-order" href={BOOK.orderUrl}>Order the book</a>
              {BOOK.seriesUrl && <a href={BOOK.seriesUrl} style={{ fontSize: 14 }}>The Manṭiq al-Fayḍa series →</a>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
