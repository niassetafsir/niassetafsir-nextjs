/**
 * LessonReaderLayout — single-column reader with a horizontal metadata bar
 *
 * Layout structure:
 *   [Horizontal metadata bar — lesson, verses, volume ref]
 *   [Main content, capped at 1280px and centred]
 *
 * Replaces the earlier 260px sticky sidebar. The metadata that lived in the
 * sidebar now runs horizontally above the text; the work title is rendered
 * once, in .lesson-reader-header, not in the bar.
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
  children: React.ReactNode;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
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

        /* Horizontal metadata bar */
        .lesson-reader-meta-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          background: rgba(139, 109, 31, 0.04);
          border-bottom: 1px solid rgba(139, 109, 31, 0.15);
          padding: 0.75rem 2rem;
        }

        .lesson-reader-meta-item {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .lesson-reader-meta-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(13, 31, 10, 0.4);
          font-weight: 600;
        }

        .lesson-reader-meta-value {
          font-size: 13px;
          line-height: 1.4;
          color: rgba(13, 31, 10, 0.75);
        }

        .lesson-reader-meta-value.arabic {
          font-family: 'Amiri', 'IBM Plex Sans Arabic', serif;
          font-size: 15px;
          direction: rtl;
          color: #8a6d1f;
          font-weight: 500;
        }

        .lesson-reader-meta-value.english {
          font-size: 13px;
          color: rgba(13, 31, 10, 0.6);
          font-style: italic;
        }

        .lesson-reader-meta-divider {
          width: 1px;
          height: 24px;
          background: rgba(139, 109, 31, 0.15);
          flex-shrink: 0;
        }

        /* Main content area.
         *
         * Capped rather than truly full-width. 8df246f widened this from
         * 700px to 960px deliberately; removing the cap entirely gives the
         * English column a measure well past 120 characters on a wide
         * display, which is worse than the sidebar layout it replaces. The
         * cap is raised to 1280px instead, which is what the bilingual
         * Arabic/English grid actually needs now that the 260px sidebar is
         * no longer taking that space. */
        .lesson-reader-main {
          flex: 1;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
        }

        /* Breadcrumbs and lesson navigation share main's cap so they stay
         * flush with the text column on wide displays. */
        .lesson-reader-gutter {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
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

        /* Responsive: tablet.
         *
         * Restored -- the sidebar-era file had a 1024px breakpoint and the
         * meta-bar rewrite dropped it, leaving a jump straight from desktop
         * to 640px. Between those widths the bar still wraps acceptably via
         * flex-wrap, but 2rem of side padding is too tight for the body. */
        @media (max-width: 1024px) {
          .lesson-reader-meta-bar {
            gap: 1.25rem;
            padding: 0.75rem 1.5rem;
          }

          .lesson-reader-main {
            padding: 1.25rem 1.5rem;
          }

          .lesson-reader-gutter {
            padding: 0 1.5rem;
          }
        }

        /* Responsive: mobile */
        @media (max-width: 640px) {
          .lesson-reader-meta-bar {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            align-items: flex-start;
          }

          .lesson-reader-meta-divider {
            display: none;
          }

          .lesson-reader-main {
            padding: 1rem;
          }

          .lesson-reader-gutter {
            padding: 0 1rem;
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

          .lesson-reader-main,
          .lesson-reader-gutter {
            padding: 0;
            max-width: 100%;
          }
        }
      `}</style>

      {/* Top content section (breadcrumbs, etc.) */}
      {topContent && (
        <div className="lesson-reader-gutter">
          {topContent}
        </div>
      )}

      {/* Horizontal metadata bar.
        *
        * Deliberately carries no "Work" item: the work title is rendered
        * once, below, in .lesson-reader-header, in both Arabic and
        * transliteration. The sidebar layout could show it in both places
        * because they sat in separate columns; stacked vertically they are
        * ~40px apart and read as a straight repetition. */}
      <div className="lesson-reader-meta-bar">
        <div className="lesson-reader-meta-item">
          <span className="lesson-reader-meta-label">Lesson</span>
          <span className="lesson-reader-meta-value arabic">{lesson.arabicTitle}</span>
          <span className="lesson-reader-meta-value english">{lesson.englishTitle}</span>
        </div>

        <div className="lesson-reader-meta-divider" />

        <div className="lesson-reader-meta-item">
          <span className="lesson-reader-meta-label">Verses</span>
          <span className="lesson-reader-meta-value english">{lesson.verseRange}</span>
        </div>

        {lesson.volume && (
          <>
            <div className="lesson-reader-meta-divider" />
            <div className="lesson-reader-meta-item">
              <span className="lesson-reader-meta-label">Ref</span>
              <span className="lesson-reader-meta-value english">
                Vol. {lesson.volume}
                {lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ' · page TBC'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main content — capped and centred, see .lesson-reader-main */}
      <main className="lesson-reader-main">
        <div className="lesson-reader-header">
          <div className="lesson-reader-header-work-title arabic">
            فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
          </div>
          <div className="lesson-reader-header-work-title english">
            Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
          </div>
        </div>

        <div className="lesson-reader-body">
          {children}
        </div>
      </main>

      {/* Bottom content section (navigation, etc.) */}
      {bottomContent && (
        <div className="lesson-reader-gutter" style={{ paddingBottom: '2rem' }}>
          {bottomContent}
        </div>
      )}
    </div>
  );
}
