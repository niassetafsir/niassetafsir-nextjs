import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Concordance of Terms",
  description: "Textual concordance of key theological and Sufi terms as they appear in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse.",
  openGraph: {
    title: "Concordance of Terms | niassetafsir.org",
    description: "A textual index of key terms in Niasse's tafsīr — where each term appears, in context, across all thirty lessons.",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
