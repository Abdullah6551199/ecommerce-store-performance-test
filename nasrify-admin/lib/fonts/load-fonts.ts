/**
 * Loads all 21 curated font families in the admin Theme Editor
 * Ensures live font previews are visually distinct (Stage 47.1)
 */

export const CURATED_FONTS = [
  { family: "Inter", category: "sans" },
  { family: "Poppins", category: "sans" },
  { family: "Roboto", category: "sans" },
  { family: "Open Sans", category: "sans" },
  { family: "Lato", category: "sans" },
  { family: "Montserrat", category: "sans" },
  { family: "Raleway", category: "sans" },
  { family: "DM Sans", category: "sans" },
  { family: "Manrope", category: "sans" },
  { family: "Plus Jakarta Sans", category: "sans" },
  { family: "Outfit", category: "sans" },
  { family: "Playfair Display", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },
  { family: "Bebas Neue", category: "display" },
  { family: "Anton", category: "display" },
  { family: "Caveat", category: "handwriting" },
  { family: "Pacifico", category: "handwriting" },
  { family: "JetBrains Mono", category: "mono" },
];

let fontsLoaded = false;

export function loadCuratedAdminFonts(): void {
  if (typeof window === "undefined" || typeof document === "undefined" || !document.head || fontsLoaded) return;

  const fontFamiliesQuery = [
    "Inter:wght@400;600;700",
    "Poppins:wght@400;600;700",
    "Roboto:wght@400;500;700",
    "Open+Sans:wght@400;600;700",
    "Lato:wght@400;700",
    "Montserrat:wght@400;600;700",
    "Raleway:wght@400;600;700",
    "DM+Sans:wght@400;500;700",
    "Manrope:wght@400;600;700",
    "Plus+Jakarta+Sans:wght@400;600;700",
    "Outfit:wght@400;600;700",
    "Playfair+Display:ital,wght@0,400;0,700;1,400",
    "Merriweather:wght@400;700",
    "Lora:ital,wght@0,400;0,600;1,400",
    "Cormorant+Garamond:wght@400;600;700",
    "Libre+Baskerville:wght@400;700",
    "Bebas+Neue",
    "Anton",
    "Caveat:wght@400;700",
    "Pacifico",
    "JetBrains+Mono:wght@400;600",
  ].join("&family=");

  if (!document.getElementById("nasrify-fonts-preconnect-1")) {
    const pre1 = document.createElement("link");
    pre1.id = "nasrify-fonts-preconnect-1";
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    document.head.appendChild(pre1);

    const pre2 = document.createElement("link");
    pre2.id = "nasrify-fonts-preconnect-2";
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    document.head.appendChild(pre2);
  }

  const linkId = "nasrify-admin-curated-fonts";
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamiliesQuery}&display=swap`;
    document.head.appendChild(link);
  }

  fontsLoaded = true;
}
