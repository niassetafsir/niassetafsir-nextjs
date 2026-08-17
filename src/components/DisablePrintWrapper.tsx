'use client';

import { useEffect } from 'react';

export default function DisablePrintWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent Ctrl+P / Cmd+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent window.print() calls
    const originalPrint = window.print;
    window.print = function() {
      console.warn('Print functionality is disabled on this page.');
      return;
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.print = originalPrint;
    };
  }, []);

  return <>{children}</>;
}
