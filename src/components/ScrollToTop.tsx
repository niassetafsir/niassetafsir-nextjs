'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Skip the reset when the URL is asking to land on a specific verse
  // (e.g. from AyahJumpBar or a shared /lesson/2?verse=2:12 link).
  // BilingualText/Panel own the scroll in that case; this component
  // stomping it back to y=0 at mount was the root cause of "jumping to
  // verse 12 always lands on verse 1" -- this fired synchronously on
  // mount while the verse-specific scroll is deliberately delayed
  // (setTimeout 500/700ms) to run after Next's own navigation settles,
  // so this reset was winning the race almost every time.
  const hasVerseTarget = searchParams.has('verse');

  useEffect(() => {
    if (hasVerseTarget) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}
