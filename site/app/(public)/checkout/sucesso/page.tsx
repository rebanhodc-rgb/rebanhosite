"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/frontend/components/brand/navbar";
import { Confetti, type ConfettiRef } from "@/frontend/components/ui/confetti";
import { Button } from "@/frontend/components/ui/button";

function SucessoContent() {
  const confettiRef = useRef<ConfettiRef>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    confettiRef.current?.fire();
  }, []);

  return (
    <main>
      <Navbar />
      <div className="container-x flex flex-col items-center gap-6 py-24 text-center">
        <h1 className="serif text-6xl">Pedido confirmado!</h1>
        <p className="max-w-md text-ink/70">
          Sua compra foi realizada com sucesso. Você receberá um e-mail de confirmação em breve.
        </p>
        {orderId ? <p className="text-sm text-ink/50">Pedido <strong>{orderId}</strong></p> : null}
        <Button asChild>
          <Link href="/loja">Continuar comprando</Link>
        </Button>
      </div>
      <Confetti
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />
    </main>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={null}>
      <SucessoContent />
    </Suspense>
  );
}
