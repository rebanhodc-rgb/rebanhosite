"use client";

import { useState } from "react";
import { maskPhone, maskCPF } from "@/shared/utils";

type Initial = {
  name: string | null;
  email: string;
  phone: string | null;
  cpf: string | null;
};

type State = { ok: boolean; message: string } | null;

export function ProfileForm({ initial }: { initial: Initial }) {
  const [name, setName] = useState(initial.name ?? "");
  const [phone, setPhone] = useState(maskPhone(initial.phone ?? ""));
  const [cpf, setCpf] = useState(maskCPF(initial.cpf ?? ""));
  const [state, setState] = useState<State>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setState(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
        }),
      });
      if (!res.ok) {
        setState({ ok: false, message: "Erro ao salvar. Tente novamente." });
      } else {
        setState({ ok: true, message: "Perfil atualizado com sucesso." });
      }
    } catch {
      setState({ ok: false, message: "Erro de conexão." });
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/50 read-only:opacity-50";
  const labelClass =
    "subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-ink/10 bg-white/65 p-6"
    >
      <h2 className="serif text-2xl">Dados pessoais</h2>

      <div>
        <label className={labelClass}>Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <label className={labelClass}>E-mail</label>
        <input value={initial.email} readOnly className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Telefone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(maskPhone(e.target.value))}
          placeholder="(00) 00000-0000"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>CPF</label>
        <input
          value={cpf}
          onChange={(e) => setCpf(maskCPF(e.target.value))}
          placeholder="000.000.000-00"
          className={inputClass}
        />
      </div>

      {state && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-500"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-ink text-sm font-semibold text-ivory transition hover:bg-ink/85 disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
