import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        code: "rgb(var(--color-code) / <alpha-value>)",
      },
      boxShadow: {
        panel: "0 1px 2px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
