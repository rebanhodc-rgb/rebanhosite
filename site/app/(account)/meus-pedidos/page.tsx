import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SimplePage } from "@/frontend/components/brand/simple-page";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";

export default async function MeusPedidosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/minha-conta?callbackUrl=/meus-pedidos");

  const orders = await prisma.order.findMany({
    where: { customerEmail: session.user.email },
    include: { items: { include: { product: true } }, donation: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <SimplePage eyebrow="Pedidos" title="Meus pedidos">
      {orders.length === 0 ? (
        <p className="text-center text-ink/50">Nenhum pedido encontrado.</p>
      ) : (
        <div className="w-full max-w-2xl mx-auto space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-ink/10 bg-white/65 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-ink/40">#{order.id.slice(-8)}</span>
                <span className="text-xs text-ink/50">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>R$ {(Number(item.price) * item.quantity).toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{order.status}</span>
                <span className="font-semibold">
                  R$ {Number(order.total).toFixed(2).replace(".", ",")}
                </span>
              </div>
              {order.donation && (
                <p className="mt-2 text-xs text-ink/40">
                  Doação de R$ {Number(order.donation.amount).toFixed(2).replace(".", ",")} para{" "}
                  {order.donation.parishName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </SimplePage>
  );
}
