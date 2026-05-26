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
      },
      colors: {
        barrel: {
          primary: "#0D3320",
          secondary: "#E8D5B0",
          bg: "#0A0A0A",
          surface: "#111111",
          border: "#222222",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
