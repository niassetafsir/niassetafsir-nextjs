import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research Clips",
  description: "Saved passages with auto-generated Chicago citations. Export for academic writing.",
  openGraph: {
    title: "Research Clips | niassetafsir.org",
    description: "Saved passages with auto-generated Chicago citations. Export for academic writing.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
