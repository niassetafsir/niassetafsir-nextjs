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
        <footer className="border-t border-white/8 mt-8 py-6 text-center">
          <div className="flex justify-center gap-4 mb-3">
            <a href="https://www.instagram.com/niassetafsirproject" target="_blank" rel="noopener"
              className="font-english text-xs text-white/30 hover:text-gold/70 border border-white/10 hover:border-gold/30 px-3 py-1 rounded-full transition-all">
              Instagram
            </a>
            <a href="https://x.com/niassetafsir" target="_blank" rel="noopener"
              className="font-english text-xs text-white/30 hover:text-gold/70 border border-white/10 hover:border-gold/30 px-3 py-1 rounded-full transition-all">
              X
            </a>
            <a href="https://www.facebook.com/niassetafsirproject" target="_blank" rel="noopener"
              className="font-english text-xs text-white/30 hover:text-gold/70 border border-white/10 hover:border-gold/30 px-3 py-1 rounded-full transition-all">
              Facebook
            </a>
            <a href="mailto:niassetafsirproject@gmail.com"
              className="font-english text-xs text-white/30 hover:text-gold/70 border border-white/10 hover:border-gold/30 px-3 py-1 rounded-full transition-all">
              Contact
            </a>
          </div>
          <div className="font-english text-white/20 text-xs">
            niassetafsir.com · © Amadu Kunateh
          </div>
        </footer>
      </body>
    </html>
  );
}
