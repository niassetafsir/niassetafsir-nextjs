import { notFound } from 'next/navigation';

// Route retired -- was never linked from nav or /research (only appeared in
// PersistentNav's active-tab matching, which doesn't require the route to
// resolve). The underlying data, src/data/concordance.json (1,186 verse
// citations), is untouched and stays reserved for the Islamic Africa (Brill)
// piece -- only this dead "coming soon" stub is gone. My sandbox's shell is
// down so I couldn't delete the file outright; if you want it fully removed
// from the repo, delete src/app/concordance/ (page.tsx + layout.tsx) in
// GitHub Desktop -- this notFound() already takes it off the live site.
export default function ConcordancePage() {
  notFound();
}
