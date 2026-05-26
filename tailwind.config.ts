import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        barrel: {
          green:   "#0D3320",
          beige:   "#E8D5B0",
          black:   "#0A0A0A",
          surface: "#111111",
          white:   "#FAFAF8",
          gray: {
            100: "#F5F5F3",
            200: "#E5E5E5",
            400: "#999999",
            600: "#666666",
            800: "#333333",
          },
        },
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif:   ["var(--font-serif)", "ui-serif", "Georgia"],
        display: ["var(--font-display)", "serif"],
      },
      fontSize: {
        hero:    ["clamp(36px, 5vw, 64px)", { lineHeight: "1.2" }],
        section: ["clamp(24px, 3vw, 36px)", { lineHeight: "1.3" }],
        card:    ["clamp(16px, 2vw, 20px)", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
