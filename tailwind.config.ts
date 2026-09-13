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
          50: "#EACFFC",
          100: "#D59EFA",
          200: "#C06EF7",
          300: "#AB3DF5",
          400: "#960DF2",
          500: "#780AC2",
          600: "#5A0891",
          700: "#3C0561",
        },
        primary: {
          DEFAULT: "#960DF2",
          hover: "#780AC2",
          light: "#AB3DF5",
          dark: "#5A0891",
        },
        secondary: {
          DEFAULT: "#AB3DF5",
          hover: "#960DF2",
          light: "#C06EF7",
          dark: "#780AC2",
        },
        brand: {
          purple: "#960DF2",
          lavender: "#EACFFC",
          dark: "#3C0561",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(180deg, #D59EFA 0%, #EACFFC 100%)",
        "brand-gradient-270": "linear-gradient(180deg, #960DF2 0%, #3C0561 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
