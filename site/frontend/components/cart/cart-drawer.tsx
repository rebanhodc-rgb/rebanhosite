"use client";

import { brl } from "@/shared/utils";

export function CartSummary({ items }: { items: Array<{ price: number; quantity: number }> }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className="rounded-lg border border-ink/10 bg-white/55 p-5">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <strong>{brl(total)}</strong>
      </div>
      <div className="mt-3 flex justify-between text-sm text-copper">
        <span>Doação estimada</span>
        <strong>{brl(total * 0.1)}</strong>
      </div>
    </div>
  );
}
