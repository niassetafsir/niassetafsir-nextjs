import { redirect } from 'next/navigation';

/**
 * Tafsīr al-Jalālayn and Rūḥ al-Bayān are a section of /about/tafsir now. They
 * are the sources of the tafsīr, and the argument about Rūḥ al-Bayān was being
 * made twice, on two pages, from the same Wright citation.
 */
export default function Page() {
  redirect('/about/tafsir');
}
