import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0D1F0A",
        ink: "#0D1F0A",
        gold: "#C9A84C",
        "gold-light": "#E8D4A0",
        "gold-deep": "#8a6d1f",
        cream: "#F5EDD6",
        "text-main": "#E8E8E0",
      },
      // These mirror the two stacks defined at :root in globals.css. Amiri
      // leads all three; the tails differ only for the glyphs Amiri has no
      // outline for (arrows, the nav icons, check marks), which CSS resolves
      // per glyph. "arabic-sans" is kept as an alias because twelve call sites
      // use it and several carry running Arabic rather than UI chrome.
      fontFamily: {
        arabic: ["Amiri", "Noto Naskh Arabic", "Traditional Arabic", "serif"],
        english: ["Amiri", "system-ui", "-apple-system", "sans-serif"],
        "arabic-sans": ["Amiri", "Noto Naskh Arabic", "Traditional Arabic", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
