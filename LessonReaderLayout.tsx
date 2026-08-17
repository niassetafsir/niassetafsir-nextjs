/**
 * LessonReaderLayout — Two-column reader optimized for scholarly reading
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

        .lesson-reader-container {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          flex: 1;
          padding: 2rem 3rem;
          margin: 0 auto;
          width: 100%;
        }

        .lesson-reader-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
          background: rgba(139, 109, 31, 0.04);
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 3px solid rgba(139, 109, 31, 0.15);
        }

        .lesson-reader-sidebar-section {
          margin-bottom: 1.5rem;
        }

        .lesson-reader-sidebar-section:last-child {
          margin-bottom: 0;
        }

        .lesson-reader-sidebar-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(13, 31, 10, 0.45);
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
        }

        .lesson-reader-sidebar-content {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(13, 31, 10, 0.8);
        }

        .lesson-reader-sidebar-content.arabic {
          font-family: 'IBM Plex Sans Arabic', 'Amiri', serif;
          font-size: 15px;
          direction: rtl;
          text-align: right;
          color: #8a6d1f;
          font-weight: 500;
        }

        .lesson-reader-sidebar-content.english {
          font-size: 13px;
          color: rgba(13, 31, 10, 0.65);
          font-style: italic;
        }

        .lesson-reader-main {
          flex: 1;
          min-w-0;
          max-width: 700px;
          display: flex;
          flex-direction: column;
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
          font-family: 'IBM Plex Sans Arabic', serif;
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

        @media (max-width: 1024px) {
          .lesson-reader-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem 2rem;
          }

          .lesson-reader-sidebar {
            position: static;
            top: auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 1rem;
          }

          .lesson-reader-sidebar-section {
            margin-bottom: 0;
          }
        }

        @media (max-width: 640px) {
          .lesson-reader-container {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem 1rem;
          }

          .lesson-reader-sidebar {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
            border-left: none;
            border-top: 2px solid rgba(139, 109, 31, 0.15);
          }

          .lesson-reader-main {
            max-width: 100%;
          }

          .lesson-reader-body {
            font-size: 15px;
            line-height: 1.8;
          }
        }

        @media print {
          .lesson-reader-container {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0;
          }

          .lesson-reader-sidebar {
            display: none;
          }

          .lesson-reader-main {
            max-width: 100%;
          }
        }
      `}</style>

      {topContent && (
        <div style={{ padding: '0 3rem', paddingBottom: 0 }}>
          {topContent}
        </div>
      )}

      <div className="lesson-reader-container">
        <aside className="lesson-reader-sidebar">
          <div className="lesson-reader-sidebar-section">
            <span className="lesson-reader-sidebar-label">Work</span>
            <div className="lesson-reader-sidebar-content arabic">
              فِي رِيَاضِ تَفْسِيرِ الْقُرْآنِ الْكَرِيمِ
            </div>
            <div className="lesson-reader-sidebar-content english">
              Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm
            </div>
          </div>

          <div className="lesson-reader-sidebar-section">
            <span className="lesson-reader-sidebar-label">Lesson</span>
            <div className="lesson-reader-sidebar-content arabic">
              {lesson.arabicTitle}
            </div>
            <div className="lesson-reader-sidebar-content english">
              {lesson.englishTitle}
            </div>
          </div>

          <div className="lesson-reader-sidebar-section">
            <span className="lesson-reader-sidebar-label">Verses</span>
            <div className="lesson-reader-sidebar-content english">
              {lesson.verseRange}
            </div>
          </div>

          {lesson.volume && (
            <div className="lesson-reader-sidebar-section">
              <span className="lesson-reader-sidebar-label">Reference</span>
              <div className="lesson-reader-sidebar-content english">
                Vol. {lesson.volume}
                {lesson.pageInVolume ? `, p. ${lesson.pageInVolume}` : ' · page TBC'}
              </div>
            </div>
          )}
        </aside>

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
      </div>

      {bottomContent && (
        <div style={{ padding: '2rem 3rem', paddingTop: 0 }}>
          {bottomContent}
        </div>
      )}
    </div>
  );
}'use client';

import { useEffect } from 'react';

export default function DisablePrintWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
    };

    const originalPrint = window.print;
    window.print = function() {
      console.warn('Print functionality is disabled on this page.');
      return;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.print = originalPrint;
    };
  }, []);

  return <>{children}</>;
}