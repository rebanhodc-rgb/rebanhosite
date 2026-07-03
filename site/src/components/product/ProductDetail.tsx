"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import type { Product, Size } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { formatPrice, cn } from "@/lib/utils";

export default function ProductDetail({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState(product.colors[0].name);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  function handleAdd() {
    if (!size) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: product.images[0].src,
      size,
      color,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-24 md:px-8">
      <nav className="mb-6 text-xs tracking-brand text-stone">
        <Link href="/loja" className="link-underline">LOJA</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name.toUpperCase()}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Galeria */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "relative h-20 w-16 overflow-hidden border bg-line",
                  activeImg === i ? "border-ink" : "border-transparent"
                )}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-line">
            <Image
              src={product.images[activeImg].src}
              alt={product.images[activeImg].alt}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="md:pt-6">
          <p className="text-xs tracking-brand text-gold">{product.tagline}</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl">{formatPrice(product.priceCents)}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-stone">
            {product.description}
          </p>

          {/* Cor */}
          <div className="mt-8">
            <p className="text-xs tracking-brand">COR · {color.toUpperCase()}</p>
            <div className="mt-3 flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  className={cn(
                    "h-8 w-8 rounded-full border",
                    color === c.name ? "ring-2 ring-ink ring-offset-2 ring-offset-bone" : "border-line"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Tamanho */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-brand">TAMANHO</p>
              <button className="text-xs text-stone underline">Guia de medidas</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-11 min-w-11 border px-3 text-sm transition-colors",
                    size === s ? "border-ink bg-ink text-bone" : "border-line hover:border-ink"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {!size && (
              <p className="mt-2 text-xs text-stone">Selecione um tamanho.</p>
            )}
          </div>

          {/* Ações */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleAdd}
              disabled={!size}
              className={cn(
                "flex items-center justify-center gap-2 py-4 text-xs tracking-brand transition-colors",
                size ? "bg-ink text-bone hover:bg-ink/90" : "cursor-not-allowed bg-stone/30 text-stone"
              )}
            >
              {added ? (
                <><Check className="h-4 w-4" /> ADICIONADO</>
              ) : (
                "ADICIONAR À SACOLA"
              )}
            </button>
            <Link
              href="/provador"
              className="flex items-center justify-center gap-2 border border-ink py-4 text-xs tracking-brand hover:bg-ink hover:text-bone"
            >
              <Sparkles className="h-4 w-4" />
              PROVAR VIRTUALMENTE
            </Link>
          </div>

          {/* Detalhes */}
          <div className="mt-10 space-y-3 border-t border-line pt-6 text-sm text-stone">
            <p>· Algodão premium, fabricado no Brasil.</p>
            <p>· 10% do lucro vai para projetos sociais.</p>
            <p>· Envio para todo o Brasil. Troca grátis em 30 dias.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
