import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Conceptual Map of Niasse's Theological Vocabulary",
  description: "A knowledge graph of the key terms in Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — showing how terms connect, presuppose, and relate within Niasse's theological system.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
