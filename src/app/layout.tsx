import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Hanegal | Jant Kapağı Kataloğu 2026",
  description: "Hanegal jant kapakları — 13, 14, 15, 16 inç seçenekleriyle 147 model. Renault, Ford, Volkswagen, Toyota ve daha fazla araçla uyumlu. WhatsApp ile sipariş verin.",
  keywords: ["jant kapağı", "oto jant kapağı", "hanegal", "wheel cover", "13 inç", "14 inç", "15 inç", "16 inç", "jant kapağı fiyat"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hanegal",
  },
  openGraph: {
    title: "Hanegal | Jant Kapağı Kataloğu 2026",
    description: "147 model jant kapağı — 13-16 inç, 4 renk seçeneği. WhatsApp ile hızlı sipariş.",
    type: "website",
    siteName: "Hanegal",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanegal | Jant Kapağı Kataloğu 2026",
    description: "147 model jant kapağı — 13-16 inç, 4 renk seçeneği.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#CC0000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#1a1a1a] text-white">
        <LangProvider><FavoritesProvider>{children}</FavoritesProvider></LangProvider>
        <Analytics />
      </body>
    </html>
  );
}