"use client";

import { useEffect, useState } from "react";
import { brl } from "@/shared/utils";

export type ShippingOption = {
  id: number;
  name: string;
  carrier: string;
  price: number;
  days: number;
  logoUrl: string;
};

type Props = {
  cep: string;
  quantity: number;
  selected: ShippingOption | null;
  onSelect: (option: ShippingOption) => void;
};

export function ShippingSelector({ cep, quantity, selected, onSelect }: Props) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = cep.replace(/\D/g, "");

  useEffect(() => {
    if (digits.length !== 8 || quantity < 1) {
      setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/shipping/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cep: digits, quantity }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.options?.length) {
          setOptions(data.options);
          onSelect(data.options[0]);
        } else {
          setError("Não foi possível calcular o frete para este CEP.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Erro ao calcular frete.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, quantity]);

  if (loading) {
    return (
      <p className="subtitle text-sm text-ink/50">Calculando frete…</p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!options.length) return null;

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const active = selected?.id === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? "border-ink bg-ink text-ivory"
                : "border-ink/15 bg-white/60 text-ink hover:border-ink/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {opt.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opt.logoUrl}
                  alt={opt.carrier}
                  className="h-5 w-5 object-contain"
                />
              )}
              <div>
                <span className="block text-sm font-medium">
                  {opt.carrier} — {opt.name}
                </span>
                <span
                  className={`block text-xs ${
                    active ? "text-ivory/60" : "text-ink/50"
                  }`}
                >
                  Prazo estimado: {opt.days} dia(s) útil(eis)
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold">{brl(opt.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
