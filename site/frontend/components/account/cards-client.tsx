"use client";

import { useState } from "react";

export type SavedCardDisplay = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  elo: "Elo",
  hipercard: "Hipercard",
};

export function CardsClient({ initial }: { initial: SavedCardDisplay[] }) {
  const [cards, setCards] = useState(initial);

  async function handleRemove(id: string) {
    if (!confirm("Remover este cartão?")) return;
    await fetch(`/api/account/cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      {cards.length === 0 && (
        <p className="rounded-2xl border border-ink/10 bg-white/65 px-5 py-6 text-sm text-ink/50">
          Nenhum cartão salvo. Cartões são salvos automaticamente após a primeira
          compra enquanto estiver logado.
        </p>
      )}

      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4"
        >
          <div>
            <p className="text-sm font-medium">
              {BRAND_LABEL[card.brand] ?? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)}{" "}
              •••• {card.last4}
            </p>
            <p className="text-xs text-ink/50">
              Válido até {String(card.expMonth).padStart(2, "0")}/{card.expYear}
            </p>
          </div>
          <button
            onClick={() => handleRemove(card.id)}
            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-400"
          >
            Remover
          </button>
        </div>
      ))}

      <p className="text-xs text-ink/40">
        Para adicionar um cartão sem comprar, realize uma compra logado e o
        cartão será salvo automaticamente para as próximas compras.
      </p>
    </div>
  );
}
