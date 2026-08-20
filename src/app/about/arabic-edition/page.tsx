import { redirect } from 'next/navigation';

/**
 * The ten-volume compiled edition and its volume catalogue are on /about, which
 * described the same edition in its own words two paragraphs earlier.
 */
export default function Page() {
  redirect('/about');
}
