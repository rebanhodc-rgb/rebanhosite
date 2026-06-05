"use client";

import { useState } from "react";
import { AddressCard, type AddressData } from "./address-card";
import { CepFields, type AddressValues } from "@/frontend/components/brand/cep-fields";

const EMPTY: AddressValues = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function AddressesClient({ initial }: { initial: AddressData[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("Casa");
  const [recipientName, setRecipientName] = useState("");
  const [addressValues, setAddressValues] = useState<AddressValues>(EMPTY);
  const [saving, setSaving] = useState(false);

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          recipientName,
          ...addressValues,
          isDefault: addresses.length === 0,
        }),
      });
      if (res.ok) {
        const { address } = await res.json();
        setAddresses((prev) => [address, ...prev]);
        setShowForm(false);
        setAddressValues(EMPTY);
        setRecipientName("");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none focus:border-ink/50";
  const labelClass =
    "subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60";

  return (
    <div className="space-y-4">
      {addresses.map((a) => (
        <AddressCard
          key={a.id}
          address={a}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      ))}

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-ink/50">Nenhum endereço salvo ainda.</p>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex h-14 w-full items-center justify-center rounded-2xl border border-dashed border-ink/20 text-sm text-ink/50 transition hover:border-ink/40 hover:text-ink"
        >
          + Adicionar endereço
        </button>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl border border-ink/10 bg-white/65 p-6"
        >
          <h2 className="serif text-xl">Novo endereço</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Rótulo</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Casa, Trabalho…"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Destinatário</label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                placeholder="Nome completo"
                className={inputClass}
              />
            </div>
          </div>

          <CepFields values={addressValues} onChange={setAddressValues} />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="h-11 flex-1 rounded-full bg-ink text-sm font-semibold text-ivory transition hover:bg-ink/85 disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar endereço"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setAddressValues(EMPTY);
              }}
              className="h-11 rounded-full border border-ink/15 px-5 text-sm transition hover:border-ink/40"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
