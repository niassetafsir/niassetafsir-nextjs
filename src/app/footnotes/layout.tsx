import type { Metadata } from "next";
import { getEditionFacts } from "@/lib/coverage";

/**
 * The footnote total is read from src/data/footnotesData.json at build time,
 * the same source the page itself counts. It was hardcoded as "1,994" in both
 * the description and the Open Graph description while the file held 1,997 --
 * the page and its own metadata disagreed about the page's subject.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { footnoteCount } = await getEditionFacts();
  const n = footnoteCount.toLocaleString('en-US');
  const description = `${n} footnotes compiled by Muḥammad ibn al-Shaykh, classified by scholar, genre, and lesson.`;
  return {
    title: "Footnotes & Citations — فهرس الحواشي",
    description,
    openGraph: {
      title: "Footnotes & Citations — فهرس الحواشي | niassetafsir.org",
      description,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
