import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tafsīr Sciences Index — فهرس علوم التفسير",
  description: "Tafsīr Sciences Index — semantic classification of Niasse's commentary by the 12 disciplines of classical ʿulūm al-tafsīr: Sufism, Fiqh, Quranic Sciences, Prophethood, Spiritual Ethics.",
  openGraph: {
    title: "Tafsīr Sciences Index — فهرس علوم التفسير | niassetafsir.org",
    description: "Tafsīr Sciences Index — semantic classification of Niasse's commentary by the 12 disciplines of classical ʿulūm al-tafsīr: Sufism, Fiqh, Quranic Sciences, Prophethood, Spiritual Ethics.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
