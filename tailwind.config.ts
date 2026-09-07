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
          paper:       "var(--c-paper)",
          "paper-2":   "var(--c-paper-2)",
          ink:         "var(--c-ink)",
          "ink-muted": "var(--c-ink-muted)",
          line:        "var(--c-line)",
          green:       "var(--c-green)",
          "green-deep":"var(--c-green-deep)",
          beige:       "var(--c-beige)",
          /* 後方互換（旧コードが barrel-black / barrel-gray-* を参照） */
          black:       "var(--c-ink)",
          white:       "var(--c-paper)",
          gray: {
            100: "var(--c-paper-2)",
            200: "var(--c-line)",
            400: "var(--c-ink-muted)",
            600: "var(--c-ink-muted)",
            800: "var(--c-ink)",
          },
        },
      },
      fontFamily: {
        display: ["var(--f-display)", "serif"],
        body:    ["var(--f-body)", "sans-serif"],
        utility: ["var(--f-utility)", "sans-serif"],
        mono:    ["var(--f-mono)", "monospace"],
        /* 後方互換（旧コードが font-sans / font-serif を参照） */
        sans:    ["var(--f-body)", "ui-sans-serif", "system-ui"],
        serif:   ["var(--f-display)", "ui-serif", "Georgia"],
      },
      fontSize: {
        /* DESIGN.md タイプスケール */
        "t-xs":   ["var(--t-xs)",   { lineHeight: "1.4" }],
        "t-sm":   ["var(--t-sm)",   { lineHeight: "1.5" }],
        "t-base": ["var(--t-base)", { lineHeight: "1.9" }],
        "t-lg":   ["var(--t-lg)",   { lineHeight: "1.5" }],
        "t-xl":   ["var(--t-xl)",   { lineHeight: "1.35" }],
        "t-2xl":  ["var(--t-2xl)",  { lineHeight: "1.25" }],
        "t-hero": ["var(--t-hero)", { lineHeight: "1.15" }],
        /* 後方互換 */
        hero:    ["clamp(32px,4.5vw,56px)", { lineHeight: "1.15" }],
        section: ["clamp(24px,3vw,36px)",   { lineHeight: "1.3"  }],
        card:    ["clamp(16px,2vw,20px)",   { lineHeight: "1.5"  }],
      },
      spacing: {
        "s-1": "var(--s-1)",
        "s-2": "var(--s-2)",
        "s-3": "var(--s-3)",
        "s-4": "var(--s-4)",
        "s-5": "var(--s-5)",
        "s-6": "var(--s-6)",
        "s-7": "var(--s-7)",
        "s-8": "var(--s-8)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
