import { AdminMetricCard } from "@/frontend/components/admin/admin-metric-card";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [orders, leads, donations] = await Promise.all([
    prisma.order.findMany({ select: { total: true } }),
    prisma.lead.count(),
    prisma.donation.findMany({ select: { amount: true } })
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const donationsTotal = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  function brl(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Receita" value={brl(revenue)} hint="Total de pedidos no banco." />
        <AdminMetricCard label="Pedidos" value={String(orders.length)} hint="Pedidos criados pelo checkout." />
        <AdminMetricCard label="Doacoes" value={brl(donationsTotal)} hint="10% acumulado por pedido." />
        <AdminMetricCard label="Leads" value={String(leads)} hint="Cadastros do pre-lancamento." />
      </div>
    </AdminShell>
  );
}
