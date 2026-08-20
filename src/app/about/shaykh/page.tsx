import { redirect } from 'next/navigation';

/**
 * The essay on Niasse and the tafsīr tradition is now /about/tafsir, which
 * also carries the companion texts that were on their own page. Redirect kept
 * because the old URL is cited.
 */
export default function Page() {
  redirect('/about/tafsir');
}
