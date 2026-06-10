"use client";

import { useState, useTransition } from "react";
import { ActionResult, updateOrder } from "@/app/(admin)/admin/pedidos/order-actions";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "PROCESSING", label: "Em preparação" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELED", label: "Cancelado" }
];

type Props = {
  orderId: string;
  status: string;
  trackingCode: string | null;
};

export function OrderRowActions({ orderId, status, trackingCode }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(async () => {
          setResult(await updateOrder({ ok: true, message: "" }, data));
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={status}
        className="h-8 rounded-full border border-ink/15 bg-white px-3 text-xs outline-none focus:border-ink/50"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        name="trackingCode"
        defaultValue={trackingCode ?? ""}
        placeholder="Rastreio"
        className="h-8 w-32 rounded-full border border-ink/15 bg-white px-3 text-xs outline-none placeholder:text-ink/35 focus:border-ink/50"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded-full bg-ink px-3 text-xs font-semibold text-ivory transition hover:bg-[#1c2925] disabled:opacity-50"
      >
        {pending ? "..." : "Salvar"}
      </button>
      {result ? (
        <span className={`text-xs ${result.ok ? "text-emerald-700" : "text-red-600"}`}>{result.message}</span>
      ) : null}
    </form>
  );
}
