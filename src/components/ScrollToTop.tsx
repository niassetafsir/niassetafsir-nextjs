'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip the reset when the URL is asking to land on a specific verse
    // (e.g. from AyahJumpBar or a shared /lesson/2?verse=2:12 link).
    // BilingualText/Panel own the scroll in that case; this component
    // stomping it back to y=0 at mount was the root cause of "jumping to
    // verse 12 always lands on verse 1" -- this fired synchronously on
    // mount while the verse-specific scroll is deliberately delayed
    // (setTimeout 500/700ms) to run after Next's own navigation settles,
    // so this reset was winning the race almost every time.
    //
    // Read location.search directly instead of useSearchParams() -- this
    // component is rendered unconditionally in the root layout, and
    // useSearchParams() there requires a <Suspense> boundary or the
    // production build fails outright. BilingualText/Panel already use
    // this same window.location.search approach for the same reason.
    if (window.location.search.includes('verse=')) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
