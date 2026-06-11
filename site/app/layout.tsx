import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { Providers } from "@/frontend/components/brand/providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const subtitle = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-subtitle"
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "REBANHO | A roupa fala por quem a veste",
  description: "Moda católica premium com significado sutil, experiência como missão e 10% destinado a comunidades locais.",
  openGraph: {
    title: "REBANHO",
    description: "Fé sem rótulos. Propósito sem exagero. Moda com significado.",
    type: "website",
    locale: "pt_BR"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${subtitle.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
