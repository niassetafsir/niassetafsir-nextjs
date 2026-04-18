import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full-Text Search — البحث",
  description: "Search across all 30 lessons of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm in Arabic and English.",
  openGraph: {
    title: "Full-Text Search — البحث | niassetafsir.org",
    description: "Search across all 30 lessons of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm in Arabic and English.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
