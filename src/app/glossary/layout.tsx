import type { Metadata } from "next";
// Off the public site for now (AK, 15 Nov 2026): linked from nowhere, not indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Concordance of Terms",
  description: "Textual concordance of key theological and Sufi terms as they appear in Fī Riyāḍ al-Tafsīr li-l-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse.",
  openGraph: {
    title: "Concordance of Terms | niassetafsir.org",
    description: "A textual index of key terms in Shaykh Ibrāhīm's tafsīr — where each term appears, in context, across all thirty lessons.",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
