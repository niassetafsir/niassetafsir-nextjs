import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary — المصطلحات",
  description: "Key theological and Sufi terms in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm as Niasse employs them.",
  openGraph: {
    title: "Glossary — المصطلحات | niassetafsir.org",
    description: "Key theological and Sufi terms in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm as Niasse employs them.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
