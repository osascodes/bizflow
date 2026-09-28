import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BizFlow — Run your business from your phone",
  description:
    "Inventory, sales, receipts, customers, debt tracking, and WhatsApp checkout for small businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className={`${jakarta.className} min-h-full bg-zinc-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
