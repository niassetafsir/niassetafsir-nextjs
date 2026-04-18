import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Hadith Index — فهرس الأحاديث",
  description: "Every hadith citation in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — indexed by collection, with lesson references and hadith numbers.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
