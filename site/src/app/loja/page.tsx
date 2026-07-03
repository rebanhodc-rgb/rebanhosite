import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Loja | REBANHO",
  description: "Coleção Manifesto — peças para ir ao encontro.",
};

export default function LojaPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8">
      <header className="mb-12 text-center">
        <p className="text-xs tracking-brand text-gold">COLEÇÃO MANIFESTO</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">A Loja</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-stone">
          {products.length} peças que falam por quem as veste.
        </p>
      </header>

      {/* Barra de filtros (visual — lógica a implementar) */}
      <div className="mb-8 flex items-center justify-between border-y border-line py-3 text-xs tracking-brand text-stone">
        <div className="flex gap-6">
          <button className="text-ink">TODAS</button>
          <button className="hover:text-ink">CAMISETAS</button>
          <button className="hover:text-ink">MOLETONS</button>
        </div>
        <button className="hover:text-ink">ORDENAR ↓</button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
