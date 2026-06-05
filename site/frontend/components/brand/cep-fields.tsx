"use client";

import { useEffect, useRef, useState } from "react";
import { maskCEP } from "@/shared/utils";

export type AddressValues = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type Props = {
  values: AddressValues;
  onChange: (values: AddressValues) => void;
  errors?: Partial<Record<keyof AddressValues, string>>;
  className?: string;
};

const INPUT_CLASS =
  "h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/50";
const LABEL_CLASS =
  "subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60";

export function CepFields({ values, onChange, errors, className }: Props) {
  const [lookingUp, setLookingUp] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  const digits = values.cep.replace(/\D/g, "");

  useEffect(() => {
    if (digits.length !== 8) return;
    let cancelled = false;

    setLookingUp(true);
    setCepError(null);

    fetch(`/api/cep/${digits}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { street: string; neighborhood: string; city: string; state: string } | null) => {
        if (cancelled) return;
        if (!data) {
          setCepError("CEP não encontrado.");
          return;
        }
        onChange({
          ...values,
          cep: values.cep,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        });
        setTimeout(() => numberRef.current?.focus(), 50);
      })
      .finally(() => {
        if (!cancelled) setLookingUp(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  return (
    <div className={className}>
      {/* CEP */}
      <div className="mb-4">
        <label className={LABEL_CLASS}>
          CEP{" "}
          {lookingUp && (
            <span className="font-normal text-ink/40">(buscando…)</span>
          )}
        </label>
        <input
          value={values.cep}
          onChange={(e) =>
            onChange({ ...values, cep: maskCEP(e.target.value) })
          }
          placeholder="00000-000"
          maxLength={9}
          className={INPUT_CLASS}
        />
        {(cepError ?? errors?.cep) && (
          <p className="mt-1 text-xs text-red-500">
            {cepError ?? errors?.cep}
          </p>
        )}
      </div>

      {/* Logradouro + Número */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className={LABEL_CLASS}>Logradouro</label>
          <input
            value={values.street}
            onChange={(e) => onChange({ ...values, street: e.target.value })}
            placeholder="Rua, Av., etc."
            className={INPUT_CLASS}
          />
          {errors?.street && (
            <p className="mt-1 text-xs text-red-500">{errors.street}</p>
          )}
        </div>
        <div className="w-28">
          <label className={LABEL_CLASS}>Número</label>
          <input
            ref={numberRef}
            value={values.number}
            onChange={(e) => onChange({ ...values, number: e.target.value })}
            placeholder="123"
            className={INPUT_CLASS}
          />
          {errors?.number && (
            <p className="mt-1 text-xs text-red-500">{errors.number}</p>
          )}
        </div>
      </div>

      {/* Complemento + Bairro */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS}>Complemento (opcional)</label>
          <input
            value={values.complement}
            onChange={(e) => onChange({ ...values, complement: e.target.value })}
            placeholder="Apto, Bloco…"
            className={INPUT_CLASS}
          />
          {errors?.complement && (
            <p className="mt-1 text-xs text-red-500">{errors.complement}</p>
          )}
        </div>
        <div>
          <label className={LABEL_CLASS}>Bairro</label>
          <input
            value={values.neighborhood}
            onChange={(e) => onChange({ ...values, neighborhood: e.target.value })}
            className={INPUT_CLASS}
          />
          {errors?.neighborhood && (
            <p className="mt-1 text-xs text-red-500">{errors.neighborhood}</p>
          )}
        </div>
      </div>

      {/* Cidade + UF */}
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className={LABEL_CLASS}>Cidade</label>
          <input
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className={INPUT_CLASS}
          />
          {errors?.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city}</p>
          )}
        </div>
        <div className="w-20">
          <label className={LABEL_CLASS}>UF</label>
          <input
            value={values.state}
            onChange={(e) => onChange({ ...values, state: e.target.value })}
            maxLength={2}
            placeholder="SP"
            className={INPUT_CLASS}
          />
          {errors?.state && (
            <p className="mt-1 text-xs text-red-500">{errors.state}</p>
          )}
        </div>
      </div>
    </div>
  );
}
