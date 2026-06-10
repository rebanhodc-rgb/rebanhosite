import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { OrderRowActions } from "@/frontend/components/admin/order-row-actions";
import { authOptions } from "@/backend/lib/auth";
import { isAdmin } from "@/backend/services/permissions";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

const PAYMENT_BADGE: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-ink/10 text-ink/60"
};

export default async function AdminPedidosPage() {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) redirect("/minha-conta");

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true, variant: true } }, donation: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell title="Pedidos">
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p className="rounded-lg border border-ink/10 bg-white/65 p-6 text-ink/50">Nenhum pedido registrado ainda.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-ink/10 bg-white/65 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink/50">#{order.id.slice(-8)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${PAYMENT_BADGE[order.paymentStatus] ?? "bg-ink/10"}`}>
                      {order.paymentStatus}
                    </span>
                    <span className="text-xs text-ink/50">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}{" "}
                      {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-1 font-medium">{order.customerName}</p>
                  <p className="text-xs text-ink/55">
                    {order.customerEmail}
                    {order.phone ? ` · ${order.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    {order.street}, {order.number}
                    {order.complement ? ` — ${order.complement}` : ""} · {order.neighborhood} · {order.city}/{order.state} · CEP {order.cep}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {Number(order.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  {order.discountAmount && Number(order.discountAmount) > 0 ? (
                    <p className="text-xs text-copper">
                      cupom {order.couponCode} (−
                      {Number(order.discountAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                    </p>
                  ) : null}
                  <p className="text-xs text-ink/55">
                    doação {Number(order.donationAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    {order.projectName ? ` · ${order.projectName}` : ""}
                  </p>
                  {order.shippingCarrier ? (
                    <p className="text-xs text-ink/55">
                      {order.shippingCarrier} — {order.shippingMethod}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/70">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.quantity}x {item.product.name} ({item.variant?.size ?? "—"}) ·{" "}
                    {Number(item.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                ))}
              </div>

              <div className="mt-3 border-t border-ink/10 pt-3">
                <OrderRowActions orderId={order.id} status={order.status} trackingCode={order.trackingCode} />
              </div>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
