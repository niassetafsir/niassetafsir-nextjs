import type { Metadata } from 'next';

// Off the public site for now (AK, 15 Nov 2026): reachable by its address,
// linked from nowhere, and kept out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function HiddenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
