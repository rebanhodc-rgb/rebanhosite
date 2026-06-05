import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { CartCount } from "@/frontend/components/cart/cart-count";
import { MobileMenu } from "@/frontend/components/brand/mobile-menu";
import { NavAuth } from "@/frontend/components/account/nav-auth";

export function Navbar({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur ${dark ? "border-white/10 bg-ink/82 text-ivory" : "border-ink/10 bg-ivory/88 text-ink"}`}>
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="serif text-2xl font-semibold tracking-[0.18em]">
          REBANHO
        </Link>
        <nav className="subtitle hidden items-center gap-7 text-sm font-semibold md:flex">
          <Link href="/loja">Loja</Link>
          <Link href="/proposito">Proposito</Link>
          <Link href="/experiencia">Experiencia</Link>
          <Link href="/sobre">Sobre</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link aria-label="Buscar" href="/loja" className="rounded-full p-2 transition hover:bg-current/10">
            <Search size={18} />
          </Link>
          <NavAuth dark={dark} />
          <Link aria-label="Carrinho" href="/carrinho" className="relative rounded-full p-2 transition hover:bg-current/10">
            <ShoppingBag size={18} />
            <CartCount />
          </Link>
          <MobileMenu dark={dark} />
        </div>
      </div>
    </header>
  );
}
