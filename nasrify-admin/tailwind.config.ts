import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: "#F4F4F5",
          100: "#DCFCE7",
          200: "#86EFAC",
          300: "#4ADE80",
          400: "#25D366",
          500: "#22C55E",
          600: "#1EA855",
          700: "#18181B",
        },
        primary: {
          DEFAULT: "#25D366",
          hover: "#1EA855",
          light: "#DCFCE7",
          dark: "#15803D",
        },
        secondary: {
          DEFAULT: "#18181B",
          hover: "#27272A",
          light: "#F4F4F5",
          dark: "#09090B",
        },
        brand: {
          green: "#25D366",
          light: "#DCFCE7",
          dark: "#18181B",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(180deg, #F4F4F5 0%, #FFFFFF 100%)",
        "brand-gradient-270": "linear-gradient(180deg, #25D366 0%, #18181B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
