import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getThemeSettings, generateThemeCss } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | Admin Portal",
  },
  description: "E-Commerce Management Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

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
  const theme = await getThemeSettings();
  const themeCss = generateThemeCss(theme);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("apex_theme");if(t==="dark"){document.documentElement.classList.add("dark");}else if(t==="light"){document.documentElement.classList.remove("dark");}else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
        <style
          id="apex-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased bg-zinc-50 dark:bg-[#080e0a] text-zinc-900 dark:text-white`}>
        {children}
      </body>
    </html>
  );
}
