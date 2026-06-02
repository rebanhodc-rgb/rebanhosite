"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data: unknown = await response.json();
        const message =
          data !== null &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Erro ao criar conta.";
        setError(message);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/minha-conta",
        redirect: false,
      });

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      setError("Conta criada! Mas o login automático falhou — entre manualmente.");
      setLoading(false);
    } catch {
      setError("Erro ao criar conta.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm text-ink/70 mb-1">
          Nome
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-ink/70 mb-1">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-ink/70 mb-1">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm text-ink/70 mb-1">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
