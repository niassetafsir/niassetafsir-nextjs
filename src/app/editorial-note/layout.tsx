import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Editorial Note",
  description: "Editorial principles and methodology of the digital bilingual edition of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — transcription, digitisation, verse ranges, footnote apparatus, and citation methodology.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
