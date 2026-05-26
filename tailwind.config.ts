import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        barrel: {
          bg: "#FAFAF8",
          surface: "#FFFFFF",
          primary: "#0D3320",
          secondary: "#E8D5B0",
          text: "#1A1A1A",
          muted: "#666666",
          border: "#E5E5E5",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
