// The page is a client component and cannot export metadata itself; without
// this the tab read as the site's generic title.
export const metadata = {
  title: 'Get in touch',
  description: 'Corrections to the Arabic, comments on the English translation, and suggestions for Manṭiq al-Fayḍa.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
