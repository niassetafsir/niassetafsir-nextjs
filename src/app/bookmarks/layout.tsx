import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved passages from Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm.",
  openGraph: {
    title: "Bookmarks | niassetafsir.org",
    description: "Your saved passages from Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
