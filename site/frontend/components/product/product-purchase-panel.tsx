"use client";

import { useState } from "react";
import { Ruler, ShoppingBag } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { addProductToCart } from "@/frontend/lib/cart";
import { Product } from "@/shared/catalog";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [message, setMessage] = useState("");

  function add() {
    addProductToCart(product, selectedSize);
    setMessage(`${product.name} tamanho ${selectedSize} foi adicionado ao carrinho.`);
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`h-11 w-12 rounded-full border text-sm font-semibold transition ${
                selectedSize === size ? "border-ink bg-ink text-ivory" : "border-ink/15 hover:border-ink"
              }`}
              aria-pressed={selectedSize === size}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="mt-3 flex gap-2 text-sm text-ink/58">
          <Ruler size={17} className="text-copper" />
          Guia de medidas disponível por tamanho.
        </p>
      </div>

      <Button onClick={add} className="w-full">
        <ShoppingBag size={17} className="mr-2" />
        Adicionar ao carrinho
      </Button>
      {message ? <p className="text-sm text-copper">{message}</p> : null}
    </div>
  );
}
