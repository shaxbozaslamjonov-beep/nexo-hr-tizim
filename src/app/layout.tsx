import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Nexo HR — Zamonaviy Sun'iy Intellektual HR Platformasi",
  description: "Nexo HR — korxonalar va kompaniyalar uchun AI bilan jihozlangan kadrlar boshqaruvi, vakansiyalar va nomzodlar recruitment platformasi.",
  keywords: ["HR tizim", "Nexo HR", "kadrlar boshqaruvi", "vakansiya", "tashkilot", "SaaS HR", "Uzbekistan HR"],
  authors: [{ name: "Nexo HR Team" }],
  openGraph: {
    title: "Nexo HR — Sun'iy Intellektual Kadrlar Boshqaruvi Platformasi",
    description: "Vakansiyalar voronkasi, AI screening, Telegram xabarnomalar va davomat boshqaruvi bitta joyda.",
    url: "https://nexo-hr-tizim.vercel.app",
    siteName: "Nexo HR Platform",
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexo HR Platformasi",
    description: "Sun'iy intellektual HR platformasi va avtomatlashtirish tizimi",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
