"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLaunchGate = pathname === "/";

  if (isLaunchGate) return <>{children}</>;

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
