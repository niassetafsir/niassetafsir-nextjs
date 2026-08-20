import { redirect } from 'next/navigation';

/**
 * The vocabulary map is now a section of each term's entry in /glossary, where
 * the relation sits next to the passages that attest the term. Kept as a
 * redirect because the route was linked from /research and from the old
 * glossary panel.
 */
export default function Page() {
  redirect('/glossary');
}
