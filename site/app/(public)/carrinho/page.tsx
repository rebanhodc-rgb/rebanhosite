"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/frontend/components/brand/navbar";
import { CartSummary } from "@/frontend/components/cart/cart-drawer";
import { Button } from "@/frontend/components/ui/button";
import { CartItem, readCart, saveCart } from "@/frontend/lib/cart";
import { brl } from "@/shared/utils";

export default function CarrinhoPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function update(variantId: string, quantity: number) {
    const next = quantity <= 0 ? items.filter((item) => item.variantId !== variantId) : items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item));
    setItems(next);
    saveCart(next);
  }

  return (
    <main>
      <Navbar />
      <section className="container-x py-12">
        <h1 className="serif text-6xl">Carrinho</h1>
        {items.length === 0 ? (
          <div className="mt-10 rounded-lg border border-ink/10 bg-white/55 p-8">
            <p>Seu carrinho esta vazio.</p>
            <Link href="/loja" className="mt-6 inline-block rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory">Ver colecao</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.variantId} className="grid grid-cols-[96px_1fr] gap-4 rounded-lg border border-ink/10 bg-white/55 p-4">
                  <img src={item.image} alt={item.name} className="h-28 w-24 rounded-md object-cover" />
                  <div>
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="serif text-2xl">{item.name}</h2>
                        <p className="text-sm text-ink/55">Tamanho {item.size}</p>
                      </div>
                      <p className="font-semibold">{brl(item.price)}</p>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <button onClick={() => update(item.variantId, item.quantity - 1)} className="h-9 w-9 rounded-full border border-ink/15">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => update(item.variantId, item.quantity + 1)} className="h-9 w-9 rounded-full border border-ink/15">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="space-y-4">
              <CartSummary items={items} />
              <Button onClick={() => (window.location.href = "/checkout")} className="w-full">Ir para checkout</Button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
