"use client";

import { useState } from "react";

export type AddressData = {
  id: string;
  label: string;
  recipientName: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault: boolean;
};

type Props = {
  address: AddressData;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

export function AddressCard({ address, onDelete, onSetDefault }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  async function handleDelete() {
    if (!confirm("Remover este endereço?")) return;
    setDeleting(true);
    await fetch(`/api/account/addresses/${address.id}`, { method: "DELETE" });
    onDelete(address.id);
  }

  async function handleSetDefault() {
    setSettingDefault(true);
    await fetch(`/api/account/addresses/${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    onSetDefault(address.id);
    setSettingDefault(false);
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/65 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-ink/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/60">
              {address.label}
            </span>
            {address.isDefault && (
              <span className="inline-flex items-center rounded-full bg-ink/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
                Padrão
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium">{address.recipientName}</p>
          <p className="text-sm text-ink/60">
            {address.street}, {address.number}
            {address.complement ? ` — ${address.complement}` : ""}
          </p>
          <p className="text-sm text-ink/60">
            {address.neighborhood} · {address.city} / {address.state}
          </p>
          <p className="text-sm text-ink/60">CEP {address.cep}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={settingDefault}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium transition hover:border-ink/40 disabled:opacity-50"
          >
            {settingDefault ? "Atualizando…" : "Definir como padrão"}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-400 disabled:opacity-50"
        >
          {deleting ? "Removendo…" : "Remover"}
        </button>
      </div>
    </div>
  );
}
