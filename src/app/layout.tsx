import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import OfflineReady from "@/components/OfflineReady";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Brinset — Run your business from your phone",
  description:
    "Inventory, sales, receipts, customers, debt tracking, and WhatsApp checkout for small businesses.",
  applicationName: "Brinset",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Brinset",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className={`${jakarta.className} min-h-full overflow-x-hidden bg-zinc-50 text-zinc-950`}>
        <OfflineReady />
        {children}
      </body>
    </html>
  );
}
