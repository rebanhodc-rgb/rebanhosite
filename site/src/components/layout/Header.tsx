"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "LOJA", href: "/loja" },
  { label: "PROVADOR", href: "/provador" },
  { label: "PROPÓSITO", href: "/home#proposito" },
  { label: "SOBRE", href: "/home#sobre" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-bone/90 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* esquerda: menu mobile */}
        <button
          aria-label="Abrir menu"
          className="flex items-center md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* nav desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="link-underline text-xs tracking-brand text-ink/80 hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* logo central */}
        <Link
          href="/home"
          className="font-display text-xl tracking-[0.3em] md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          REBANHO
        </Link>

        {/* direita: provador + carrinho */}
        <div className="flex items-center gap-4">
          <Link
            href="/provador"
            aria-label="Provador virtual"
            className="hidden items-center gap-1.5 text-xs tracking-brand text-ink/80 hover:text-ink md:flex"
          >
            <Sparkles className="h-4 w-4" />
            PROVAR
          </Link>
          <button
            aria-label="Abrir carrinho"
            onClick={openCart}
            className="relative flex items-center"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-bone">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* menu fullscreen mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-bone transition-transform duration-500 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-display text-xl tracking-[0.3em]">REBANHO</span>
          <button aria-label="Fechar menu" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-5 pt-10">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="font-display text-4xl tracking-wide text-ink"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
