"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Navbar } from "@/frontend/components/brand/navbar";
import { CepFields, type AddressValues } from "@/frontend/components/brand/cep-fields";
import { ShippingSelector, type ShippingOption } from "@/frontend/components/brand/shipping-selector";
import { CheckoutStep } from "@/frontend/components/checkout/checkout-step";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { CartItem, readCart } from "@/frontend/lib/cart";
import { maskCPF, maskPhone } from "@/frontend/lib/masks";
import { brl } from "@/shared/utils";
import { calculateDonationBreakdown } from "@/shared/donation";
import { DEFAULT_PROJECT_ID, donationProjects } from "@/shared/projects";

const EASE = "cubic-bezier(0.32,0.72,0,1)";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerCPF: "", phone: "" });
  const [address, setAddress] = useState<AddressValues>({
    cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });
  const [shipping, setShipping] = useState<ShippingOption | null>(null);
  const [projectId, setProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = shipping?.price ?? 0;
  const discount = coupon?.discount ?? 0;
  const displayTotal = Math.max(0, cartTotal - discount) + shippingCost;
  const donation = useMemo(
    () => calculateDonationBreakdown(Math.max(0, cartTotal - discount), quantity).donation,
    [cartTotal, discount, quantity]
  );
  const selectedProject = donationProjects.find((project) => project.id === projectId);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cartTotal })
      });
      const json = await response.json();
      if (json.valid) {
        setCoupon({ code: json.code, discount: json.discount });
        setCouponInput("");
      } else {
        setCouponError(json.reason ?? "Cupom inválido.");
      }
    } catch {
      setCouponError("Não foi possível validar o cupom.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!shipping) {
      setError("Selecione um método de envio para continuar.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ...address,
        shippingMethod: shipping.name,
        shippingCarrier: shipping.carrier,
        shippingCost: shipping.price,
        shippingDays: shipping.days,
        couponCode: coupon?.code,
        projectId,
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
    setError(
      typeof json.error === "string" ? json.error : "Não foi possível finalizar: confira os dados e tente novamente."
    );
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
          <CheckoutStep number="2" title="Entrega">
            <CepFields values={address} onChange={setAddress} />

            {address.cep.replace(/\D/g, "").length === 8 && (
              <div className="mt-6">
                <p className="subtitle mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                  Método de envio
                </p>
                <ShippingSelector
                  cep={address.cep}
                  quantity={items.reduce((s, i) => s + i.quantity, 0)}
                  selected={shipping}
                  onSelect={setShipping}
                />
              </div>
            )}
          </CheckoutStep>
          <CheckoutStep number="3" title="Projeto apoiado">
            <p className="mb-4 text-sm text-ink/60">
              {brl(donation)} desta compra (10% do lucro líquido) serão destinados ao projeto que você escolher.
            </p>
            <div className="grid gap-3">
              {donationProjects.map((project) => {
                const active = project.id === projectId;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setProjectId(project.id)}
                    aria-pressed={active}
                    className={`flex items-start justify-between gap-4 rounded-2xl border p-4 text-left transition-all duration-500 ${
                      active ? "border-ink bg-ink/[0.04]" : "border-ink/12 hover:border-ink/40"
                    }`}
                    style={{ transitionTimingFunction: EASE }}
                  >
                    <span className="flex items-start gap-3">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.accent }} />
                      <span>
                        <span className="serif block text-lg leading-tight">{project.name}</span>
                        <span className="block text-xs text-ink/55">{project.cause} · {project.city} — {project.state}</span>
                      </span>
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                        active ? "border-ink bg-ink text-ivory" : "border-ink/25 text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={2} />
                    </span>
                  </button>
                );
              })}
            </div>
          </CheckoutStep>
          <CheckoutStep number="4" title="Pagamento">
            <div className="rounded-lg border border-ink/10 p-4 text-sm text-ink/65">Pedido registrado com reserva de doação e e-mails transacionais. O pagamento seguro é concluído no gateway.</div>
          </CheckoutStep>
        </div>
        <aside className="order-first rounded-[1.6rem] border border-ink/10 bg-white/65 p-6 md:order-none md:h-fit md:sticky md:top-24">
          <h2 className="serif text-3xl">Resumo</h2>
          <div className="mt-5 space-y-3 text-sm">
            {items.map((item) => <div key={item.variantId} className="flex justify-between gap-3"><span>{item.quantity}x {item.name} ({item.size})</span><strong>{brl(item.price * item.quantity)}</strong></div>)}
          </div>
          <div className="mt-6 border-t border-ink/10 pt-4">
            {coupon ? (
              <div className="flex items-center justify-between rounded-full border border-copper/30 bg-copper/[0.06] px-4 py-2 text-sm">
                <span className="font-semibold uppercase tracking-[0.08em] text-copper">{coupon.code}</span>
                <button type="button" onClick={removeCoupon} className="text-xs text-ink/55 underline hover:text-ink">
                  remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Cupom de desconto"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
                <Button type="button" variant="outline" disabled={couponLoading || !couponInput.trim()} onClick={applyCoupon}>
                  {couponLoading ? "..." : "Aplicar"}
                </Button>
              </div>
            )}
            {couponError ? <p className="mt-2 text-xs text-red-600">{couponError}</p> : null}
          </div>
          <div className="mt-4 border-t border-ink/10 pt-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <strong>{brl(cartTotal)}</strong>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-copper">
                <span>Desconto ({coupon?.code})</span>
                <span>−{brl(discount)}</span>
              </div>
            )}
            {shippingCost > 0 && (
              <div className="flex justify-between text-sm text-ink/60">
                <span>Frete ({shipping?.carrier})</span>
                <span>{brl(shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1 border-t border-ink/10">
              <span>Total</span>
              <strong>{brl(displayTotal)}</strong>
            </div>
            <div className="flex justify-between text-copper text-sm">
              <span>Doação (10% do lucro)</span>
              <strong>{brl(donation)}</strong>
            </div>
            {selectedProject ? (
              <p className="text-xs text-ink/55">para {selectedProject.name}</p>
            ) : null}
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
