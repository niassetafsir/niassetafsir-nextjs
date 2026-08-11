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
      fontFamily: {
        arabic: ["Amiri", "Traditional Arabic", "serif"],
        english: ["EB Garamond", "Georgia", "serif"],
        "arabic-sans": ["IBM Plex Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
