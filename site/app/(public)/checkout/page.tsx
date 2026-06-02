"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/frontend/components/brand/navbar";
import { CheckoutStep } from "@/frontend/components/checkout/checkout-step";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { CartItem, readCart } from "@/frontend/lib/cart";
import { maskCEP, maskCPF, maskPhone } from "@/frontend/lib/masks";
import { brl } from "@/shared/utils";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerCPF: "", phone: "", address: "", cep: "", city: "", state: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((item) => ({ productId: item.id, variantId: item.variantId, quantity: item.quantity }))
      })
    });
    const json = await response.json();
    if (response.ok && json.checkoutUrl) {
      window.localStorage.removeItem("rebanho-cart");
      window.location.href = json.checkoutUrl;
      return;
    }
    setLoading(false);
    setError("Nao foi possivel finalizar: confira os dados e tente novamente.");
  }

  return (
    <main>
      <Navbar />
      <form onSubmit={submit} className="container-x grid gap-8 py-12 md:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <h1 className="serif text-6xl">Checkout</h1>
          <CheckoutStep number="1" title="Dados pessoais">
            <div className="grid gap-3 md:grid-cols-2">
              <Input required placeholder="Nome completo" value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} />
              <Input required placeholder="E-mail" type="email" value={form.customerEmail} onChange={(e) => setField("customerEmail", e.target.value)} />
              <Input required placeholder="CPF" value={form.customerCPF} onChange={(e) => setField("customerCPF", maskCPF(e.target.value))} />
              <Input required placeholder="Telefone" value={form.phone} onChange={(e) => setField("phone", maskPhone(e.target.value))} />
            </div>
          </CheckoutStep>
          <CheckoutStep number="2" title="Entrega e comunidade">
            <div className="grid gap-3 md:grid-cols-2">
              <Input required placeholder="CEP" value={form.cep} onChange={(e) => setField("cep", maskCEP(e.target.value))} />
              <Input required placeholder="Endereco" value={form.address} onChange={(e) => setField("address", e.target.value)} />
              <Input required placeholder="Cidade" value={form.city} onChange={(e) => setField("city", e.target.value)} />
              <Input required placeholder="UF" maxLength={2} value={form.state} onChange={(e) => setField("state", e.target.value.toUpperCase())} />
            </div>
            <p className="mt-4 text-sm text-copper">Sua compra ajudara uma comunidade proxima de voce.</p>
          </CheckoutStep>
          <CheckoutStep number="3" title="Pagamento">
            <div className="rounded-lg border border-ink/10 p-4 text-sm text-ink/65">Pedido registrado com reserva de doacao e emails transacionais. O gateway de pagamento pode ser conectado nesta etapa.</div>
          </CheckoutStep>
        </div>
        <aside className="order-first rounded-lg border border-ink/10 bg-white/65 p-6 md:order-none md:h-fit md:sticky md:top-24">
          <h2 className="serif text-3xl">Resumo</h2>
          <div className="mt-5 space-y-3 text-sm">
            {items.map((item) => <div key={item.variantId} className="flex justify-between gap-3"><span>{item.quantity}x {item.name} ({item.size})</span><strong>{brl(item.price * item.quantity)}</strong></div>)}
          </div>
          <div className="mt-6 border-t border-ink/10 pt-5">
            <div className="flex justify-between"><span>Total</span><strong>{brl(total)}</strong></div>
            <div className="mt-2 flex justify-between text-copper"><span>Doacao 10%</span><strong>{brl(total * 0.1)}</strong></div>
          </div>
          <Button type="submit" disabled={loading} className="mt-6 w-full">
            {loading ? "Redirecionando..." : "Finalizar pedido"}
          </Button>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </aside>
      </form>
    </main>
  );
}
