"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function startPixCheckout() {
    setLoading(true);
    setMessage(null);
    setCheckoutUrl(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }

      const url = data.url ?? data.checkoutUrl ?? data.paymentUrl ?? data.data?.url;
      if (url) {
        setCheckoutUrl(url);
        window.location.href = url;
      } else {
        setMessage("Cobrança criada, mas a resposta não trouxe uma URL de pagamento. Verifique o formato da API do Abacate Pay.");
      }
    } catch (error) {
      setMessage(String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-stone">
          Sua sacola está vazia.{" "}
          <Link href="/loja" className="link-underline text-ink">Explorar a loja</Link>.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="divide-y divide-line border-y border-line">
            {items.map((it) => (
              <div
                key={`${it.productId}-${it.size}-${it.color}`}
                className="flex justify-between py-4 text-sm"
              >
                <span>
                  {it.name} · {it.color} · {it.size} × {it.qty}
                </span>
                <span>{formatPrice(it.priceCents * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-lg">
            <span className="tracking-brand">TOTAL</span>
            <span>{formatPrice(totalCents())}</span>
          </div>

          <button
            onClick={startPixCheckout}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-ink py-4 text-xs tracking-brand text-bone hover:bg-ink/90 disabled:cursor-wait disabled:bg-stone"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            PAGAR COM PIX · ABACATE PAY
          </button>

          {message && (
            <div className="border border-line bg-line/30 p-4 text-sm text-stone">
              {message}
              <p className="mt-2 text-xs">
                Para ativar o Pix real: configure `ABACATEPAY_API_KEY` no `.env.local`.
              </p>
            </div>
          )}

          {checkoutUrl && (
            <Link href={checkoutUrl} className="link-underline text-sm text-ink">
              Abrir pagamento
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
