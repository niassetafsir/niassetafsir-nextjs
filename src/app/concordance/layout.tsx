import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verse Concordance — فهرس الآيات",
  description: "1,186 Quranic verse references mapped to lessons where Shaykh Niasse comments on them.",
  openGraph: {
    title: "Verse Concordance — فهرس الآيات | niassetafsir.org",
    description: "1,186 Quranic verse references mapped to lessons where Shaykh Niasse comments on them.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
