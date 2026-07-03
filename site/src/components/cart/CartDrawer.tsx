"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, close, setQty, remove, totalCents } = useCart();
  const total = totalCents();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-bone shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="text-sm tracking-brand">SUA SACOLA ({items.length})</h2>
              <button aria-label="Fechar" onClick={close}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-stone">Sua sacola está vazia.</p>
                <Link
                  href="/loja"
                  onClick={close}
                  className="border border-ink px-6 py-3 text-xs tracking-brand hover:bg-ink hover:text-bone"
                >
                  EXPLORAR A LOJA
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {items.map((it) => (
                    <div
                      key={`${it.productId}-${it.size}-${it.color}`}
                      className="flex gap-4 border-b border-line py-4"
                    >
                      <div className="relative h-28 w-20 shrink-0 bg-line">
                        <Image src={it.image} alt={it.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{it.name}</p>
                          <button
                            aria-label="Remover"
                            onClick={() => remove(it.productId, it.size, it.color)}
                          >
                            <Trash2 className="h-4 w-4 text-stone hover:text-ink" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-stone">
                          {it.color} · {it.size}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-line">
                            <button
                              aria-label="Diminuir"
                              className="px-2 py-1"
                              onClick={() =>
                                setQty(it.productId, it.size, it.color, it.qty - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{it.qty}</span>
                            <button
                              aria-label="Aumentar"
                              className="px-2 py-1"
                              onClick={() =>
                                setQty(it.productId, it.size, it.color, it.qty + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm">{formatPrice(it.priceCents * it.qty)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line px-6 py-5">
                  <div className="flex justify-between text-sm">
                    <span className="tracking-brand">SUBTOTAL</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone">
                    Frete e impostos calculados no checkout.
                  </p>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-4 block bg-ink py-4 text-center text-xs tracking-brand text-bone hover:bg-ink/90"
                  >
                    FINALIZAR COMPRA · PIX
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
