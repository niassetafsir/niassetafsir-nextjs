import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search — البحث",
  description: "Search for a verse, topic or term and find what Shaykh Ibrāhīm Niasse says about it, in Fī Riyāḍ al-Tafsīr and his other works.",
  openGraph: {
    title: "Search — البحث | niassetafsir.org",
    description: "Search for a verse, topic or term and find what Shaykh Ibrāhīm Niasse says about it, in Fī Riyāḍ al-Tafsīr and his other works.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
