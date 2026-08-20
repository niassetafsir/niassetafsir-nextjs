import { redirect } from 'next/navigation';

/**
 * 'Who made it' is a section of /about rather than a page of its own; the About
 * page already carried a Team block saying the same thing.
 */
export default function Page() {
  redirect('/about');
}
