import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "في رياض التفسير — الشيخ إبراهيم نياس | niassetafsir.com",
  description: "The digital bilingual edition of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-bg min-h-screen">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
