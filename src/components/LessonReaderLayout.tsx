/**
 * LessonReaderLayout — Full-width reader with horizontal metadata bar
 *
 * Layout structure (desktop):
 *   [Horizontal metadata bar with work, lesson, verses, reference]
 *   [Full-width main content area]
 *
 * Metadata bar contains: work title, lesson title, verse range, volume/page
 * Main content: bilingual text, panels, navigation
 *
 * Mobile: Metadata bar stacks vertically
 *
 * Design inspired by usul.ai reader experience:
 * - Generous font sizing (16-17px body)
 * - Comfortable line-height (1.9-2.0)
 * - Full-width content for maximum reading space
 * - Horizontal metadata bar for reference information
 */

import React from 'react';

interface LessonReaderLayoutProps {
  lesson: {
    arabicTitle: string;
    englishTitle: string;
    verseRange: string;
    volume?: number | null;
    pageInVolume?: number | null;
  };
  children: React.ReactNode; // Main content (panels, etc.)
  topContent?: React.ReactNode; // Content before sidebar split (e.g., breadcrumbs)
  bottomContent?: React.ReactNode; // Content after main section (e.g., navigation)
}

export default function LessonReaderLayout({
  lesson,
  children,
  topContent,
  bottomContent,
}: LessonReaderLayoutProps) {
  return (
    <div className="lesson-reader-layout bg-cream text-ink">
      <style>{`
        .lesson-reader-layout {
          min-height: calc(100vh - 56px);
          display: flex;
          flex-direction: column;
        }

        /* Horizontal metadata bar at top */
        .lesson-reader-meta-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 1.5rem 3rem;
          border-bottom: 1px solid rgba(139, 109, 31, 0.12);
          background: rgba(139, 109, 31, 0.02);
          align-items: center;
        }

        .lesson-reader-meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .lesson-reader-meta-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(13, 31, 10, 0.45);
          font-weight: 600;
          display: block;
        }

        .lesson-reader-meta-value {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(13, 31, 10, 0.8);
        }

        .lesson-reader-meta-value.arabic {
          font-family: 'Amiri', 'IBM Plex Sans Arabic', serif;
          font-size: 15px;
          direction: rtl;
          text-align: right;
          color: #8a6d1f;
          font-weight: 500;
        }

        .lesson-reader-meta-value.english {
          font-size: 13px;
          color: rgba(13, 31, 10, 0.65);
          font-style: italic;
        }

        .lesson-reader-meta-divider {
          width: 1px;
          height: 24px;
          background: rgba(139, 109, 31, 0.15);
        }

        /* Main content area — full width */
        .lesson-reader-main {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 2rem 3rem;
          margin: 0 auto;
        }

        .lesson-reader-header {
          text-align: center;
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(13, 31, 10, 0.12);
        }

        .lesson-reader-header-work-title {
          font-size: 11px;
          color: rgba(13, 31, 10, 0.5);
          margin-bottom: 0.25rem;
          letter-spacing: 0.03em;
        }

        .lesson-reader-header-work-title.arabic {
          font-family: 'Amiri', serif;
          direction: rtl;
        }

        .lesson-reader-body {
          flex: 1;
          font-size: 16px;
          line-height: 1.95;
          color: rgba(13, 31, 10, 0.85);
        }

        /* Typography improvements for body text */
        .lesson-reader-body p {
          margin-bottom: 1.2rem;
          text-align: justify;
        }

        .lesson-reader-body a {
          color: #8a6d1f;
          text-decoration: none;
          border-bottom: 1px dotted rgba(138, 109, 31, 0.3);
          transition: all 0.2s ease;
        }

        .lesson-reader-body a:hover {
          border-bottom-color: #8a6d1f;
          color: #6b5a1a;
        }

        /* Responsive: tablet */
        @media (max-width: 1024px) {
          .lesson-reader-meta-bar {
            gap: 1rem;
            padding: 1rem 2rem;
          }

          .lesson-reader-main {
            padding: 1.5rem 2rem;
          }
        }

        /* Responsive: mobile */
        @media (max-width: 640px) {
          .lesson-reader-meta-bar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            align-items: flex-start;
          }

          .lesson-reader-meta-divider {
            display: none;
          }

          .lesson-reader-main {
            width: 100%;
            padding: 1rem;
          }

          .lesson-reader-body {
            font-size: 15px;
            line-height: 1.8;
          }
        }

        /* Print media */
        @media print {
          .lesson-reader-meta-bar {
            display: none;
          }

          .lesson-reader-main {
            width: 100%;
            padding: 0;
          }
        }
      `}</style>

      {/* Top content section (breadcrumbs, etc.) */}
      {topContent && (
        <div style={{ padding: '0 3rem', paddingBottom: 0 }}>
          {topContent}
        </div>
      )}

      {/* Horizontal metadata bar */}
      <div className="lesson-reader-meta-bar">
        {/* Work title */}
        <div className="lesson-reader-meta-item">
          <span className="lesson-reader-meta-label">Work</span>
          <span className="lesson-reader-meta-value arabic">
            فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
          </span>
          <span className="lesson-reader-meta-value english">
            Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
          </span>
        </div>

        <div className="lesson-reader-meta-divider" />

        {/* Lesson title */}
        <div className="lesson-reader-meta-item">
          <span className="lesson-reader-meta-label">Lesson</span>
          <span className="lesson-reader-meta-value arabic">
            {lesson.arabicTitle}
          </span>
          <span className="lesson-reader-meta-value english">
            {lesson.englishTitle}
          </span>
        </div>

        <div className="lesson-reader-meta-divider" />

        {/* Verse range */}
        <div className="lesson-reader-meta-item">
          <span className="lesson-reader-meta-label">Verses</span>
          <span className="lesson-reader-meta-value english">
            {lesson.verseRange}
          </span>
        </div>

        {/* Volume and page reference */}
        {lesson.volume && (
          <>
            <div className="lesson-reader-meta-divider" />
            <div className="lesson-reader-meta-item">
              <span className="lesson-reader-meta-label">Reference</span>
              <span className="lesson-reader-meta-value english">
                Vol. {lesson.volume}
                {lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ' · page TBC'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Full-width main content area */}
      <main className="lesson-reader-main">
        {/* Header with work/lesson info */}
        <div className="lesson-reader-header">
          <div className="lesson-reader-header-work-title arabic">
            فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
          </div>
          <div className="lesson-reader-header-work-title english">
            Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
          </div>
        </div>

        {/* Body content (panels, etc.) */}
        <div className="lesson-reader-body">
          {children}
        </div>
      </main>

      {/* Bottom content section (navigation, etc.) */}
      {bottomContent && (
        <div style={{ padding: '2rem 3rem', paddingTop: 0 }}>
          {bottomContent}
        </div>
      )}
    </div>
  );
}
