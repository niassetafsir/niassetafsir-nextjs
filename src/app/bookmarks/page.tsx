import { redirect } from 'next/navigation';

// /bookmarks and /clips were two pages for one action -- keeping a passage.
// They are one page now; the two localStorage keys are untouched, so anything
// already saved still appears. See src/app/saved/page.tsx.
export default function Page() {
  redirect('/saved');
}
