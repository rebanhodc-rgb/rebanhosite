import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { authOptions } from "@/backend/lib/auth";
import { isAdmin } from "@/backend/services/permissions";
import { prisma } from "@/backend/db/prisma";

export default async function AdminPedidosPage() {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as any)?.role)) redirect("/minha-conta");

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, donation: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell title="Pedidos">
      <div className="rounded-lg border border-ink/10 bg-white/65 overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-6 text-ink/50">Nenhum pedido registrado ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Pagamento</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-mono text-xs text-ink/50">{order.id.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-ink/50 text-xs">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3">R$ {Number(order.total).toFixed(2).replace(".", ",")}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{order.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{order.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/60 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
