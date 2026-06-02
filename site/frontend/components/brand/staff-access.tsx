"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const STAFF_CODE = "rebanh026";

export function StaffAccess() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim().toLowerCase() !== STAFF_CODE) {
      setError("Codigo invalido.");
      return;
    }
    window.sessionStorage.setItem("rebanho_staff_access", "true");
    window.location.href = "/marca";
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-gold/20 bg-black/25 p-3 backdrop-blur-md sm:p-4">
      <label htmlFor="staff-code" className="subtitle block text-[10px] font-bold uppercase tracking-[0.28em] text-gold/75">
        Acesso staff
      </label>
      <div className="mt-2 flex gap-2 sm:mt-3">
        <input
          id="staff-code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError("");
          }}
          placeholder="Codigo de acesso"
          className="subtitle min-h-11 w-full rounded-full border border-gold/20 bg-white/[0.07] px-4 text-sm text-ivory outline-none placeholder:text-ivory/34 focus:border-gold"
        />
        <button type="submit" aria-label="Entrar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition hover:bg-ivory">
          <ArrowRight size={17} />
        </button>
      </div>
      {error ? <p className="subtitle mt-2 text-xs text-[#e7b8a8]">{error}</p> : null}
    </form>
  );
}
