import Link from "next/link";
import type { Metadata } from "next";
import { SimplePage } from "@/frontend/components/brand/simple-page";
import { RegisterForm } from "@/frontend/components/account/register-form";

export const metadata: Metadata = {
  title: "Criar conta — REBANHO",
};

export default function CadastroPage() {
  return (
    <SimplePage eyebrow="Conta" title="Criar conta">
      <RegisterForm />
      <p className="text-sm text-ink/50">
        Já tem conta?{" "}
        <Link href="/login" className="hover:text-ink transition-colors">
          Entrar
        </Link>
      </p>
    </SimplePage>
  );
}
