import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#18C729",
          green: "#18C729",
          hover: "#15b124",
          light: "#3de34d",
          dark: "#129d20",
        },
        secondary: {
          DEFAULT: "#FEF500",
          yellow: "#FEF500",
          hover: "#e5dd00",
          light: "#fff833",
          dark: "#c9c200",
        },
        brand: {
          green: "#18C729",
          yellow: "#FEF500",
          dark: "#0b1710",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(180deg, #18C729 0%, #FEF500 100%)",
        "brand-gradient-270": "linear-gradient(180deg, #18C729 0%, #FEF500 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
