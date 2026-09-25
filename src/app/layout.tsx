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
    // No footnote count here. It was "1,994-footnote" while the apparatus held
    // 1,997, and a figure in an Open Graph description is the least visible
    // place a stale number can hide -- it renders in link previews, not on the
    // site, so nobody proofreading a page ever sees it. Pages that want the
    // real total read it from src/data via getEditionFacts().
    description: "A digital edition and research platform for Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm by Shaykh Ibrāhīm Niasse (d. 1975). Arabic text, growing English translation, critical apparatus, and scholarly research tools.",
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
    // translate="no" + .notranslate: the document is lang="ar", so a browser
    // offers to machine-translate the whole edition. It does it badly and the
    // result carries Shaykh Ibrāhīm's name: on a juzʾ-30 page Chrome rendered
    // ʿayn al-yaqīn as "the eyes of the innocent" and then "We remained an
    // eye", and alam uṣiḥḥ laka jismak as "Did I not erase your body".
    // Marking only the dir="rtl" elements was not enough -- the document
    // itself is rtl, so most Arabic carries no dir of its own, and 52,375 of
    // the 83,852 Arabic characters on /lesson/4 were still exposed. The block
    // belongs at the root. The interface opts back in below, so a reader who
    // needs the navigation in another language still gets it; the text of the
    // tafsīr is what must not be guessed at.
    <html lang="ar" dir="rtl" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        {/*
          There used to be a second bootstrap here, reading a `site-lang` key
          and flipping the document to ltr for a reader who had chosen English
          or French. The control that wrote that key was removed from the nav
          long before -- it was never wired to anything, and it advertised two
          interface languages the site does not have -- so by 25 September the
          script could only fire for someone whose browser still held the key
          from months earlier. It went with the rest of that dead code
          (LangSwitcher.tsx, src/lib/i18n.ts). A fresh reader was always served
          the rtl default below and still is; nothing changed for them.
        */}
        {/*
          Same treatment for the theme, and for the same reason. globals.css
          declares the dark palette at :root and light under
          [data-theme="light"], so a document with no attribute paints dark.
          ThemeToggle set the attribute in an effect, i.e. after first paint --
          so every light-mode reader, which is the default, got a dark flash on
          every single page load. This sets it before the first paint instead.
          Keep the default here and in ThemeToggle's useState in agreement.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('site-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
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
