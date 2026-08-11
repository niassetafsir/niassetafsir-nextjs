import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Footnotes & Citations — فهرس الحواشي",
  description: "1,994 footnotes compiled by Muḥammad ibn al-Shaykh, classified by scholar, genre, and lesson.",
  openGraph: {
    title: "Footnotes & Citations — فهرس الحواشي | niassetafsir.org",
    description: "1,994 footnotes compiled by Muḥammad ibn al-Shaykh, classified by scholar, genre, and lesson.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
