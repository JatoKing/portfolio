import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: { default: "Izzat Imran — Web & Frontend Developer", template: "%s | Izzat Imran" },
  description: "Muhammad Izzat Imran, a Web & Frontend Developer based in Malaysia. Explore government portals, AI chatbots, and thoughtful digital experiences built with Next.js, React, and TypeScript.",
  authors: [{ name: "Muhammad Izzat Imran" }],
  openGraph: {
    title: "Izzat Imran — Web & Frontend Developer",
    description: "A developer's perspective. Selected projects, experience, and thoughtful digital experiences from Malaysia.",
    type: "website",
    locale: "en_MY",
    siteName: "Izzat Imran Portfolio",
  },
  twitter: { card: "summary", title: "Izzat Imran — Web & Frontend Developer", description: "Selected work, thoughtful code, and useful digital experiences." },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
