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
        arabic: ["IBM Plex Sans Arabic", "Amiri", "Traditional Arabic", "sans-serif"],
        english: ["IBM Plex Sans Arabic", "system-ui", "sans-serif"],
        "arabic-sans": ["IBM Plex Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
