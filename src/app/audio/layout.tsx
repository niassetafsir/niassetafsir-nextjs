import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Arabic Tafsīr Audio",
  description: "Arabic oral tafsīr recordings by Shaykh Ibrāhīm Niasse — one file per sura, recorded 1964. Download or stream.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
