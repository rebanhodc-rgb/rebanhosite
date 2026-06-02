import { Suspense } from "react";
import Link from "next/link";
import { SimplePage } from "@/frontend/components/brand/simple-page";
import { LoginForm } from "@/frontend/components/account/login-form";

export default function LoginPage() {
  return (
    <SimplePage eyebrow="Conta" title="Entrar">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-ink/50">
        Não tem conta?{" "}
        <Link href="/cadastro" className="hover:text-ink transition-colors">
          Criar conta
        </Link>
      </p>
    </SimplePage>
  );
}
