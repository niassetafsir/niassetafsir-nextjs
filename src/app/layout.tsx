import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import PersistentNav from "@/components/PersistentNav";
import ScrollToTop from "@/components/ScrollToTop";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Edition & Research Platform | niassetafsir.org",
    template: "%s | niassetafsir.org",
  },
  description: "A digital edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse. Arabic text, growing English translation, critical apparatus, and scholarly research tools.",
  keywords: ["Niasse", "tafsir", "tafsīr", "Quran", "West African Islam", "Tijaniyya", "Ibrahim Niasse", "Islamic studies", "Fī Riyāḍ"],
  authors: [{ name: "Amadu Kunateh", url: "https://orcid.org/0009-0002-7839-6474" }],
  creator: "Amadu Kunateh",
  metadataBase: new URL("https://niassetafsir.org"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://niassetafsir.org",
    siteName: "niassetafsir.org",
    title: "Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Edition & Research Platform",
    description: "A digital edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse (d. 1975). Arabic text, growing English translation, 1,994-footnote critical apparatus, and scholarly research tools.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Fī Riyāḍ Tafsīr — niassetafsir.org" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Digital Edition & Research Platform",
    description: "A digital edition and research platform for Niasse's tafsīr. Arabic text, growing English translation, critical apparatus.",
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
        <SiteFooter />
      </body>
    </html>
  );
}
