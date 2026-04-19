import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Order the Arabic Edition",
  description: "Inquire about obtaining the 10-volume revised Arabic compiled edition of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
