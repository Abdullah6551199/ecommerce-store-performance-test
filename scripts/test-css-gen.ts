import { generateAdvancedCSS } from "../nasrify-store/lib/themes/section-css-generator";

const theme = {
  sections: [
    {
      id: "sec-hero",
      settings: {
        _advanced: {
          style: {
            typography: { color: "#ff0000", fontSize: "32px" },
            background: { type: "color", color: "#123456" },
            shadows: [{ id: "1", x: 0, y: 4, blur: 10, spread: 0, color: "rgba(0,0,0,0.5)", inset: false }],
          },
        },
      },
    },
  ],
};

console.log("Generated CSS:\n" + generateAdvancedCSS(theme as any));
