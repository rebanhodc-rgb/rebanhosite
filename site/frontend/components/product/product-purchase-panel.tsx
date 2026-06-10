"use client";

import { useState } from "react";
import { Ruler, ShoppingBag } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { addProductToCart } from "@/frontend/lib/cart";
import { Product } from "@/shared/catalog";

type Props = {
  product: Product;
  /** Estoque por tamanho (vazio = estoque não controlado, todos disponíveis). */
  stockBySize?: Record<string, number>;
};

export function ProductPurchasePanel({ product, stockBySize = {} }: Props) {
  const hasStockInfo = Object.keys(stockBySize).length > 0;
  const isAvailable = (size: string) => !hasStockInfo || (stockBySize[size] ?? 0) > 0;
  const firstAvailable = product.sizes.find(isAvailable) ?? null;

  const [selectedSize, setSelectedSize] = useState<string | null>(firstAvailable);
  const [message, setMessage] = useState("");

  const soldOut = firstAvailable === null;

  function add() {
    if (!selectedSize) return;
    addProductToCart(product, selectedSize);
    setMessage(`${product.name} tamanho ${selectedSize} foi adicionado ao carrinho.`);
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const available = isAvailable(size);
            return (
              <button
                key={size}
                type="button"
                disabled={!available}
                onClick={() => setSelectedSize(size)}
                className={`h-11 w-12 rounded-full border text-sm font-semibold transition ${
                  selectedSize === size
                    ? "border-ink bg-ink text-ivory"
                    : available
                      ? "border-ink/15 hover:border-ink"
                      : "cursor-not-allowed border-ink/10 text-ink/30 line-through"
                }`}
                aria-pressed={selectedSize === size}
                title={available ? undefined : "Tamanho esgotado"}
              >
                {size}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex gap-2 text-sm text-ink/58">
          <Ruler size={17} className="text-copper" />
          Guia de medidas disponível por tamanho.
        </p>
      </div>

      <Button onClick={add} disabled={soldOut} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
        <ShoppingBag size={17} className="mr-2" />
        {soldOut ? "Esgotado" : "Adicionar ao carrinho"}
      </Button>
      {message ? <p className="text-sm text-copper">{message}</p> : null}
    </div>
  );
}
