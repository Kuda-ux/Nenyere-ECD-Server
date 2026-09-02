import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-adult",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-kids",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nenyere ECD Digital Learning Platform",
    template: "%s — Nenyere ECD",
  },
  description:
    "Offline-first, tablet-first Early Childhood Development learning platform aligned to the Zimbabwe Heritage-Based Curriculum 2024–2030.",
  applicationName: "Nenyere ECD",
  authors: [{ name: "KuWeX" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F2A93B",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
