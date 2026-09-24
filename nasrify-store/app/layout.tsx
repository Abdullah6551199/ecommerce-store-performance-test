import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site";
import { getStoreSettings } from "@/lib/settings";
import { getThemeSettings, generateThemeCss } from "@/lib/theme";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { CompareProvider } from "@/components/CompareContext";
import "./globals.css";
import StorefrontOverlays from "@/components/StorefrontOverlays";
import StorefrontFloating from "@/components/apps/StorefrontFloating";
import { getActiveTheme } from "@/lib/themes/loader";
import { generateThemeVarsCss } from "@/lib/themes/css";
import { getFontsInUse, getFontFaceCSS, getFontPreloadLinks } from "@/lib/themes/fonts";
import StorefrontLayoutWrapper from "@/components/StorefrontLayoutWrapper";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-inter",
});

import { getBaseUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, theme] = await Promise.all([getStoreSettings(), getThemeSettings()]);
  const baseUrl = getBaseUrl();
  const storeName = settings.storeName || siteConfig.name;
  const storeDescription = settings.description || siteConfig.description;

  const icons: Metadata["icons"] = theme.other.favicon
    ? [{ rel: "icon", url: theme.other.favicon }]
    : undefined;

  const ogImage = theme.other.storeLogo || "/og.png";

  return {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: storeDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: baseUrl,
      siteName: storeName,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: storeDescription,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
    },
    icons,
  };
}


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#960DF2" },
    { media: "(prefers-color-scheme: dark)", color: "#3C0561" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, theme, activeThemeConfig] = await Promise.all([
    getStoreSettings(),
    getThemeSettings(),
    getActiveTheme(),
  ]);

  // Synchronize dynamic appearance overrides into store settings if provided
  const mergedSettings = {
    ...settings,
    logoUrl: theme.other.storeLogo || settings.logoUrl,
    announcementText: theme.other.announcementBarText || settings.announcementText,
  };

  const themeCss = generateThemeCss(theme);
  const activeThemeCss = generateThemeVarsCss(activeThemeConfig);
  const fontsInUse = getFontsInUse(activeThemeConfig);
  const fontFaceCss = getFontFaceCSS(fontsInUse);
  const preloadLinks = getFontPreloadLinks(fontsInUse);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("apex_theme");if(t==="dark"){document.documentElement.classList.add("dark");}else if(t==="light"){document.documentElement.classList.remove("dark");}else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {preloadLinks.map((p) => (
          <link
            key={p.href}
            rel="preload"
            href={p.href}
            as={p.as}
            type={p.type}
            crossOrigin="anonymous"
          />
        ))}
        <style
          id="apex-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
        <style
          id="nasrify-theme-vars"
          dangerouslySetInnerHTML={{ __html: activeThemeCss }}
        />
        <style
          id="nasrify-fonts-css"
          dangerouslySetInnerHTML={{ __html: fontFaceCss }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-[#960DF2] selection:text-white bg-[var(--bg-primary)] text-[var(--text-body)]`}>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              {/* Main Background Wrapper */}
              <div className="relative flex min-h-screen flex-col bg-[var(--bg-primary)] transition-colors duration-300">
                {/* Foreground content stack */}
                <div className="relative z-10 flex min-h-screen flex-col">
                  <StorefrontLayoutWrapper
                    legacyHeader={<Header settings={mergedSettings} />}
                    legacyFooter={<Footer settings={mergedSettings} />}
                  >
                    {children}
                  </StorefrontLayoutWrapper>
                </div>
              </div>
              {/* Global Overlays & Modals (Lazy Loaded on Demand) */}
              <StorefrontOverlays />
              {/* App Extension Point: storefront.floating */}
              <StorefrontFloating />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
