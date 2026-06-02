"use client";

import { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setMessage(response.ok ? "Voce esta na lista." : "Nao foi possivel salvar agora.");
  }

  return (
    <form onSubmit={submit} className="w-full rounded-lg border border-gold/20 bg-black/25 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-4">
      <label htmlFor="launch-email" className={`subtitle mb-2 block text-[10px] font-bold uppercase tracking-[0.28em] ${dark ? "text-gold/75" : "text-copper"}`}>
        Melhor e-mail
      </label>
      <div className="grid gap-2 sm:gap-3">
        <Input
          id="launch-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Seu melhor e-mail"
          type="email"
          required
          className={dark ? "min-h-11 border-gold/20 bg-white/[0.08] px-5 text-ivory placeholder:text-ivory/42 focus:border-gold sm:min-h-12" : "min-h-11 sm:min-h-12"}
        />
        <Button variant={dark ? "gold" : "dark"} type="submit" className="min-h-11 w-full px-4 text-xs sm:min-h-12 sm:text-sm md:min-h-11">
          Quero fazer parte
        </Button>
      </div>
      {message ? <p className={`mt-3 text-sm ${dark ? "text-gold" : "text-copper"}`}>{message}</p> : null}
    </form>
  );
}
