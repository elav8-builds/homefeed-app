import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFeed — Scroll Homes Like Your Feed",
  description: "The social network for real estate. Like, comment, and save homes in Austin, TX. Find your dream home with AI-powered matching.",
  keywords: ["real estate", "homes for sale", "Austin TX", "property listings", "home search", "real estate app"],
  authors: [{ name: "HomeFeed" }],
  openGraph: {
    title: "HomeFeed — Scroll Homes Like Your Feed",
    description: "The social network for real estate. Like, comment, and save homes.",
    type: "website",
    siteName: "HomeFeed",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeFeed — Scroll Homes Like Your Feed",
    description: "The social network for real estate.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-slate-950">{children}</body>
    </html>
  );
}
