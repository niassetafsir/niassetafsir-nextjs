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
    // suppressHydrationWarning: the script below rewrites lang and dir on the
    // client before React hydrates, so the attributes legitimately differ from
    // what was server-rendered. Without this React reports a mismatch.
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/*
          Document direction used to be hardcoded rtl and never changed, so the
          site stayed Arabic-direction even for a reader who picked English or
          French -- English labels rendered right-to-left, and any horizontal
          bar read backwards. LangSwitcher stores the choice in localStorage,
          which the server cannot see, so the default stays Arabic and this
          runs before first paint to correct it.

          Deliberately a blocking inline script rather than an effect: an
          effect would flip the direction after the page had already painted,
          which is a visible reflow of the entire document.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('site-lang');if(l&&l!=='ar'){var d=document.documentElement;d.setAttribute('lang',l);d.setAttribute('dir','ltr');}}catch(e){}})();`,
          }}
        />
      </head>
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
