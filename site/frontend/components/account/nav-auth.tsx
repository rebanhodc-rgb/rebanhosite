"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface NavAuthProps {
  dark?: boolean;
}

export function NavAuth({ dark: _dark }: NavAuthProps) {
  const { status } = useSession();

  if (status === "authenticated") {
    return (
      <button
        type="button"
        aria-label="Sair"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-full p-2 transition hover:bg-current/10 opacity-60 hover:opacity-100"
      >
        <UserRound size={18} />
      </button>
    );
  }

  return (
    <Link
      aria-label="Entrar"
      href="/login"
      className="rounded-full p-2 transition hover:bg-current/10"
    >
      <UserRound size={18} />
    </Link>
  );
}
