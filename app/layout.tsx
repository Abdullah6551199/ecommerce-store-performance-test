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
import "./globals.css";

import CartDrawerContainer from "@/components/CartDrawerContainer";
import BroadcastPopup from "@/components/BroadcastPopup";


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
    { media: "(prefers-color-scheme: light)", color: "#18C729" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1410" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, theme] = await Promise.all([getStoreSettings(), getThemeSettings()]);

  // Synchronize dynamic appearance overrides into store settings if provided
  const mergedSettings = {
    ...settings,
    logoUrl: theme.other.storeLogo || settings.logoUrl,
    announcementText: theme.other.announcementBarText || settings.announcementText,
  };

  const themeCss = generateThemeCss(theme);

  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("apex_theme");if(t==="light"){document.documentElement.classList.remove("dark");}else if(t==="dark"){document.documentElement.classList.add("dark");}else if(window.matchMedia&&!window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <style
          id="apex-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-[#FEF500] selection:text-black`}>
        <CartProvider>
          <WishlistProvider>
            {/* Main Background Wrapper applying the dynamic Brand Gradient */}
            <div className="relative flex min-h-screen flex-col bg-brand-gradient">
              {/* Subtle ambient contrast layer ensuring readability while branding shines through */}
              <div className="absolute inset-0 bg-white/60 dark:bg-black/45 pointer-events-none backdrop-blur-[1px] transition-colors duration-300" />

              {/* Foreground content stack */}
              <div className="relative z-10 flex min-h-screen flex-col">
                <Header settings={mergedSettings} />
                <main className="flex-1">{children}</main>
                <Footer settings={mergedSettings} />
              </div>
            </div>
            {/* Global Cart Slide-Over Drawer (Loaded on demand) */}
            <CartDrawerContainer />
            {/* Global Broadcast Popup Modal */}
            <BroadcastPopup />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
