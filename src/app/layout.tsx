import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import PersistentNav from "@/components/PersistentNav";
import MobileNav from "@/components/MobileNav";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: {
    default: "Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Bilingual Edition | niassetafsir.org",
    template: "%s | niassetafsir.org",
  },
  description: "The digital bilingual edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse. Complete Arabic text, English translation, critical apparatus, and scholarly research tools.",
  keywords: ["Niasse", "tafsir", "tafsīr", "Quran", "West African Islam", "Tijaniyya", "Ibrahim Niasse", "Islamic studies", "Fī Riyāḍ", "bilingual edition"],
  authors: [{ name: "Amadu Kunateh", url: "https://orcid.org/0009-0002-7839-6474" }],
  creator: "Amadu Kunateh",
  metadataBase: new URL("https://niassetafsir.org"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://niassetafsir.org",
    siteName: "niassetafsir.org",
    title: "Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Bilingual Edition & Research Platform",
    description: "The digital bilingual edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse (d. 1975). Complete Arabic text, English translation, 798-footnote critical apparatus, verse concordance, and scholarly research tools.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Fī Riyāḍ Tafsīr — niassetafsir.org" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Bilingual Edition",
    description: "The digital bilingual edition and research platform for Niasse's tafsīr. Arabic text, English translation, critical apparatus, verse concordance.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-bg min-h-screen pb-16">
        <ScrollToTop />
        <SiteNav />
        <PersistentNav />
        {children}
        <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px', paddingBottom:'12px', paddingLeft:'24px', paddingRight:'24px', background:'transparent'}}>
          <div style={{maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
            <p className="font-english" style={{fontSize:'10px', color:'rgba(255,255,255,0.2)', letterSpacing:'0.02em'}}>
              © niassetafsir.org
            </p>
            <p className="font-english" style={{fontSize:'10px', color:'rgba(255,255,255,0.15)'}}>
              niassetafsir.com · niassetafsirproject@gmail.com
            </p>
          </div>
        </footer>
      <MobileNav />
      </body>
    </html>
  );
}
