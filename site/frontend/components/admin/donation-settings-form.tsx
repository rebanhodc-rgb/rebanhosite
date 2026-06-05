"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { brl } from "@/shared/utils";
import { calculateDonationBreakdown } from "@/shared/donation";
import { updateDonationSettings, type DonationSettingsState } from "@/app/(admin)/admin/configuracoes/donation-actions";

type Props = {
  initial: {
    unitCost: number;
    taxPercent: number;
    feePercent: number;
    fixedFee: number;
    donationPercent: number;
  };
};

const PREVIEW_PRICE = 149;
const PREVIEW_QTY = 2;
const initialState: DonationSettingsState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition-transform duration-300 active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar parametros"}
    </button>
  );
}

const FIELDS = [
  { name: "unitCost", label: "Custo por camiseta", suffix: "R$", step: "0.01" },
  { name: "taxPercent", label: "Impostos", suffix: "%", step: "0.01" },
  { name: "feePercent", label: "Taxa do gateway", suffix: "%", step: "0.01" },
  { name: "fixedFee", label: "Taxa fixa por venda", suffix: "R$", step: "0.01" },
  { name: "donationPercent", label: "Doação do lucro", suffix: "%", step: "0.01" }
] as const;

export function DonationSettingsForm({ initial }: Props) {
  const [state, formAction] = useFormState(updateDonationSettings, initialState);
  const [values, setValues] = useState(initial);

  const preview = useMemo(
    () =>
      calculateDonationBreakdown(PREVIEW_PRICE * PREVIEW_QTY, PREVIEW_QTY, {
        unitCost: values.unitCost,
        taxRate: values.taxPercent / 100,
        feeRate: values.feePercent / 100,
        fixedFee: values.fixedFee,
        donationRate: values.donationPercent / 100
      }),
    [values]
  );

  function setField(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: Number(value) }));
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/65 p-6">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink/50">Doação — lucro líquido</h2>
      <p className="mb-5 text-sm text-ink/60">
        Define como calculamos a doação: lucro líquido = receita − custo − impostos − taxas, e a doação é uma fração desse lucro.
      </p>

      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.name} className="text-sm">
            <span className="mb-1 block text-ink/70">{field.label}</span>
            <div className="flex items-center rounded-xl border border-ink/15 bg-ivory px-3 focus-within:border-ink">
              <span className="text-xs text-ink/45">{field.suffix}</span>
              <input
                name={field.name}
                type="number"
                step={field.step}
                min={0}
                required
                value={values[field.name as keyof Props["initial"]]}
                onChange={(e) => setField(field.name, e.target.value)}
                className="w-full bg-transparent px-2 py-2.5 text-right tabular-nums outline-none"
              />
            </div>
          </label>
        ))}

        <div className="md:col-span-2">
          <div className="rounded-xl border border-ink/10 bg-ink/[0.03] p-4 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/45">
              Previa — {PREVIEW_QTY} camisetas ({brl(PREVIEW_PRICE * PREVIEW_QTY)})
            </p>
            <div className="grid grid-cols-2 gap-1 text-ink/65 sm:grid-cols-4">
              <span>Custo: <strong className="text-ink">{brl(preview.cogs)}</strong></span>
              <span>Impostos: <strong className="text-ink">{brl(preview.taxes)}</strong></span>
              <span>Taxas: <strong className="text-ink">{brl(preview.fees)}</strong></span>
              <span>Lucro: <strong className="text-ink">{brl(preview.netProfit)}</strong></span>
            </div>
            <p className="mt-3 text-base">
              Doação gerada: <strong className="text-copper">{brl(preview.donation)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:col-span-2">
          <SubmitButton />
          {state.message ? (
            <span className={`text-sm ${state.ok ? "text-green-600" : "text-red-500"}`}>{state.message}</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
