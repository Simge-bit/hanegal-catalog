import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

export const metadata: Metadata = {
  title: "Hanegal Katalog 2026",
  description: "Hanegal Jant Kapağı Ürün Kataloğu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hanegal",
  },
  openGraph: {
    title: "Hanegal Katalog 2026",
    description: "Hanegal Jant Kapağı Ürün Kataloğu",
    type: "website",
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
      </body>
    </html>
  );
}