import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainLayout } from "@/modules/layout/components/main-layout";
import { SearchPalette } from "@/modules/ui-core/components/search-palette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Halte.ui — Transjakarta Transit Map",
  description:
    "An interactive, modern transit map for the Transjakarta BRT network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-neutral-100 text-foreground dark:bg-neutral-900">
        <MainLayout>{children}</MainLayout>
        <SearchPalette />
      </body>
    </html>
  );
}
