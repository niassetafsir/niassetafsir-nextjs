import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Pre-Order: Bilingual Print Edition",
  description: "Register your interest in the forthcoming bilingual print edition of Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm — Arabic text with English translation by Amadu Kunateh.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
