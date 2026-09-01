import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Chitral Natural Nuts",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  title: {
    default: "Chitral Natural Nuts — Pure & Organic from the Hindu Kush",
    template: "%s · Chitral Natural Nuts",
  },
  description:
    "Premium Chitrali dry fruits delivered across Pakistan: walnuts, almonds, chalghoza pine nuts, dried apricots, white mulberries and figs. 100% organic, cash on delivery nationwide.",
  keywords: [
    "dry fruits online Pakistan",
    "Chitrali dry fruits",
    "walnuts online Pakistan",
    "akhrot price in Pakistan",
    "chalghoza pine nuts",
    "almonds badam online",
    "dried apricots khumani",
    "white mulberries shahtoot",
    "anjeer figs Pakistan",
    "organic dry fruits",
    "cash on delivery dry fruits",
  ],
  openGraph: {
    siteName: "Chitral Natural Nuts",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chitral Natural Nuts — Pure & Organic from the Hindu Kush",
    description: "Premium Chitrali dry fruits delivered across Pakistan. COD nationwide.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="bg-[#f6f4ef] font-sans text-stone-900 antialiased">{children}</body>
    </html>
  );
}
