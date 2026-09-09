import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site";
import { getStoreSettings } from "@/lib/settings";
import { getThemeSettings, generateThemeCss } from "@/lib/theme";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, theme] = await Promise.all([getStoreSettings(), getThemeSettings()]);
  const icons: Metadata["icons"] = theme.other.favicon
    ? [{ rel: "icon", url: theme.other.favicon }]
    : undefined;

  return {
    title: {
      default: settings.storeName || siteConfig.name,
      template: `%s | ${settings.storeName || siteConfig.name}`,
    },
    description: settings.description || siteConfig.description,
    metadataBase: new URL(siteConfig.url),
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
    <html lang="en" className="dark">
      <head>
        <style
          id="apex-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#FEF500] selection:text-black">
        <CartProvider>
          {/* Main Background Wrapper applying the dynamic Brand Gradient */}
          <div className="relative flex min-h-screen flex-col bg-brand-gradient">
            {/* Subtle ambient contrast layer ensuring readability while branding shines through */}
            <div className="absolute inset-0 bg-black/45 pointer-events-none backdrop-blur-[1px]" />

            {/* Foreground content stack */}
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header settings={mergedSettings} />
              <main className="flex-1">{children}</main>
              <Footer settings={mergedSettings} />
            </div>
          </div>
          {/* Global Cart Slide-Over Drawer */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
