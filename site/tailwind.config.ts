import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./backend/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1A17",
        ivory: "#F7F3EB",
        gold: "#D7C6A3",
        olive: "#6E8D81",
        copper: "#8B3E2F"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        subtitle: ["var(--font-subtitle)"],
        body: ["var(--font-body)"]
      }
    }
  },
  plugins: []
};

export default config;
