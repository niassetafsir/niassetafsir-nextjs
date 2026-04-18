import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Critical Apparatus — فهرس الحواشي",
  description: "798 footnotes compiled by Muḥammad ibn al-Shaykh, classified by scholar, genre, and lesson.",
  openGraph: {
    title: "Critical Apparatus — فهرس الحواشي | niassetafsir.org",
    description: "798 footnotes compiled by Muḥammad ibn al-Shaykh, classified by scholar, genre, and lesson.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
