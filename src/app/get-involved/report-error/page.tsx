import { redirect } from 'next/navigation';

// The four contribution forms were one form with four headings. They are now a
// single page with a topic selector; this keeps the old URL working and opens
// it on the right topic. See src/app/get-involved/page.tsx.
export default function Page() {
  redirect('/get-involved?about=error');
}
