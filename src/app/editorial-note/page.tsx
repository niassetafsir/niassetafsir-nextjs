import { redirect } from 'next/navigation';

/**
 * The editorial note and the translator's note both stated the three translation
 * choices and cross-linked each other for them. They are one page:
 * /translators-note, 'Editorial Conventions'.
 */
export default function Page() {
  redirect('/translators-note');
}
