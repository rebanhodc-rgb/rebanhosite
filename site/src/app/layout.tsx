import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "REBANHO | A roupa fala por quem a veste",
  description:
    "Moda cristã premium. Evangelizar pela beleza, pela presença e por gestos que ficam. Provador virtual e peças para ir ao encontro.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
