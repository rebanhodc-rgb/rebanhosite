"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

const STAFF_KEY = "rebanh026";

export default function LaunchGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const next = searchParams.get("next") || "/home";

  function handleStaffAccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (accessKey.trim() !== STAFF_KEY) {
      setMessage("Chave de acesso inválida.");
      return;
    }

    localStorage.setItem("rebanho_staff_access", "granted");
    document.cookie = "rebanho_staff_access=granted; path=/; max-age=2592000; SameSite=Lax";
    router.push(next);
  }

  function handleWaitlist(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    localStorage.setItem("rebanho_waitlist_email", email);
    setEmail("");
    setMessage("Você entrou para a espera. Em breve, o primeiro aceno chega.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-bone">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(176,141,79,0.22),transparent_34%),linear-gradient(180deg,rgba(26,26,24,0.2),rgba(26,26,24,0.95))]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[18vw] tracking-[0.12em] text-bone/[0.04]">
        REBANHO
      </div>

      <section className="relative z-10 flex min-h-screen flex-col px-5 py-8 md:px-10">
        <header className="flex items-center justify-between">
          <p className="font-display text-xl tracking-[0.32em]">REBANHO</p>
          <p className="hidden text-xs tracking-brand text-bone/60 md:block">UM ACENO EM BREVE</p>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-16 text-center">
          <p className="text-xs tracking-brand text-gold">COLEÇÃO MANIFESTO</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
            Elas ouvirão a minha voz, e haverá um só rebanho e um só pastor.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-bone/70 md:text-base">
            Evangelizar não com palavras vazias, mas com gestos que ficam. Cada
            camiseta é um aceno: você não está sozinho.
          </p>

          <div className="mx-auto mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-2">
            <form onSubmit={handleWaitlist} className="flex border border-bone/30 bg-bone/5 backdrop-blur">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="ENTRE PARA A ESPERA"
                className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-bone/50"
              />
              <button className="px-4 text-xs tracking-brand hover:bg-bone hover:text-ink" aria-label="Receber o primeiro aceno">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <form onSubmit={handleStaffAccess} className="flex border border-gold/70 bg-gold/10 backdrop-blur">
              <input
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  setMessage(null);
                }}
                type="password"
                placeholder="ACESSO STAFF"
                className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-bone/50"
              />
              <button className="px-5 text-xs tracking-brand hover:bg-gold hover:text-ink">
                ENTRAR
              </button>
            </form>
          </div>

          {message && <p className="mt-4 text-sm text-bone/70">{message}</p>}
        </div>

        <div className="relative -mx-5 overflow-hidden border-y border-bone/10 py-3 md:-mx-10">
          <div className="animate-marquee whitespace-nowrap text-xs tracking-brand text-bone/45">
            {"SUTIL · PREMIUM · MISSIONÁRIA · FÉ · MISSÃO · COMUNIDADE · ".repeat(10)}
          </div>
        </div>
      </section>
    </main>
  );
}
