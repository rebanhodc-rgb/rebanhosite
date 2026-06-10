"use client";

import { useState, useTransition } from "react";
import {
  ActionResult,
  createCoupon,
  deleteCoupon,
  toggleCouponActive
} from "@/app/(admin)/admin/cupons/coupon-actions";

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  active: boolean;
  expiresAt: string | null;
};

const inputClass =
  "h-10 rounded-full border border-ink/15 bg-white/70 px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/50";

function formatDiscount(coupon: AdminCoupon): string {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue.toLocaleString("pt-BR")}%`
    : coupon.discountValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CouponsManager({ coupons }: { coupons: AdminCoupon[] }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      setResult(await action());
    });
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          startTransition(async () => {
            const response = await createCoupon({ ok: true, message: "" }, data);
            setResult(response);
            if (response.ok) form.reset();
          });
        }}
        className="rounded-lg border border-ink/10 bg-white/65 p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/70">Novo cupom</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs text-ink/60">
            Código
            <input name="code" required placeholder="REBANHO10" className={`${inputClass} w-40 uppercase`} />
          </label>
          <label className="grid gap-1 text-xs text-ink/60">
            Tipo
            <select name="discountType" className={`${inputClass} w-36`}>
              <option value="PERCENTAGE">Percentual (%)</option>
              <option value="FIXED">Valor fixo (R$)</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs text-ink/60">
            Valor
            <input name="discountValue" required type="number" step="0.01" min="0.01" placeholder="10" className={`${inputClass} w-28`} />
          </label>
          <label className="grid gap-1 text-xs text-ink/60">
            Expira em (opcional)
            <input name="expiresAt" type="date" className={`${inputClass} w-40`} />
          </label>
          <button type="submit" disabled={pending} className="h-10 rounded-full bg-ink px-5 text-sm font-semibold text-ivory transition hover:bg-[#1c2925] disabled:opacity-50">
            {pending ? "Criando..." : "Criar cupom"}
          </button>
        </div>
        {result ? (
          <p className={`mt-3 text-xs ${result.ok ? "text-emerald-700" : "text-red-600"}`}>{result.message}</p>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white/65">
        {coupons.length === 0 ? (
          <p className="p-6 text-ink/50">Nenhum cupom cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">Desconto</th>
                <th className="px-4 py-3 text-left font-medium">Validade</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
                return (
                  <tr key={coupon.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3 font-mono font-semibold">{coupon.code}</td>
                    <td className="px-4 py-3">{formatDiscount(coupon)}</td>
                    <td className="px-4 py-3 text-ink/60">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR") : "Sem validade"}
                      {expired ? <span className="ml-2 text-xs text-red-600">expirado</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${coupon.active ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/60"}`}>
                        {coupon.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" disabled={pending} onClick={() => run(() => toggleCouponActive(coupon.id))} className="text-xs underline text-ink/60 hover:text-ink">
                        {coupon.active ? "desativar" : "ativar"}
                      </button>
                      <button type="button" disabled={pending} onClick={() => run(() => deleteCoupon(coupon.id))} className="ml-4 text-xs underline text-red-600/70 hover:text-red-600">
                        remover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
