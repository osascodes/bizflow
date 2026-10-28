import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import OfflineReady from "@/components/OfflineReady";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BizFlow — Run your business from your phone",
  description:
    "Inventory, sales, receipts, customers, debt tracking, and WhatsApp checkout for small businesses.",
  applicationName: "BizFlow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BizFlow",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className={`${jakarta.className} min-h-full bg-zinc-950 text-white`}>
        <OfflineReady />
        {children}
      </body>
    </html>
  );
}
