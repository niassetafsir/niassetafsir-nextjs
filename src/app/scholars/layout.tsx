import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scholar Index — فهرس العلماء",
  description: "Every scholar cited by Niasse, distinguished from the compiler's documentary citations.",
  openGraph: {
    title: "Scholar Index — فهرس العلماء | niassetafsir.org",
    description: "Every scholar cited by Niasse, distinguished from the compiler's documentary citations.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
