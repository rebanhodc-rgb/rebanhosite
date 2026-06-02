"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/minha-conta" })}
      className="rounded border border-ink/20 px-4 py-2 text-sm text-ink/70 hover:bg-ink/5 transition-colors"
    >
      Sair
    </button>
  );
}
