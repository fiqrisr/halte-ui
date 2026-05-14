import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainLayout } from "@/layouts/main-layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://halte.fiqri.dev";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Halte.ui — Transjakarta Transit Map",
    template: "%s | Halte.ui",
  },
  description:
    "An interactive, modern transit map for the Transjakarta BRT network in Jakarta, Indonesia. Explore routes, stops, and schedules.",
  keywords: [
    "Transjakarta",
    "transit map",
    "Jakarta",
    "BRT",
    "bus rapid transit",
    "halte",
    "public transportation",
    "Indonesia",
    "GTFS",
    "route map",
    "bus stop",
  ],
  authors: [{ name: "Halte.ui" }],
  creator: "Halte.ui",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "id_ID",
    url: "/",
    siteName: "Halte.ui",
    title: "Halte.ui — Transjakarta Transit Map",
    description:
      "An interactive, modern transit map for the Transjakarta BRT network in Jakarta, Indonesia. Explore routes, stops, and schedules.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Halte.ui — Interactive Transjakarta BRT Transit Map",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Halte.ui — Transjakarta Transit Map",
    description:
      "An interactive, modern transit map for the Transjakarta BRT network in Jakarta, Indonesia. Explore routes, stops, and schedules.",
    images: ["/opengraph-image"],
  },
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
      </body>
    </html>
  );
}
