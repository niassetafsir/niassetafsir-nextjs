import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thematic Index — الفهرس الموضوعي",
  description: "Browse the tafsīr by subject: Sufism, Fiqh, Quranic Sciences, Prophethood, Spiritual Ethics.",
  openGraph: {
    title: "Thematic Index — الفهرس الموضوعي | niassetafsir.org",
    description: "Browse the tafsīr by subject: Sufism, Fiqh, Quranic Sciences, Prophethood, Spiritual Ethics.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
