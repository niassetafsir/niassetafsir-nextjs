import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Theological Vocabulary Map",
  description: "A knowledge graph of the key terms in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — showing how terms connect, presuppose, and relate within Niasse's theological system.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
