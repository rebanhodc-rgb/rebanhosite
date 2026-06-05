import { AdminMetricCard } from "@/frontend/components/admin/admin-metric-card";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { prisma } from "@/backend/db/prisma";
import { brl } from "@/shared/utils";
import { donationProjects } from "@/shared/projects";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [orders, leads, donations] = await Promise.all([
    prisma.order.findMany({ select: { total: true } }),
    prisma.lead.count(),
    prisma.donation.findMany({ select: { amount: true, projectId: true, projectName: true, status: true } })
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const donationsTotal = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const toTransfer = donations
    .filter((d) => d.status !== "REPASSADO")
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const transferred = donations
    .filter((d) => d.status === "REPASSADO")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const byProject = donationProjects.map((project) => {
    const projectDonations = donations.filter((d) => d.projectId === project.id);
    const total = projectDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    return { ...project, total, count: projectDonations.length };
  });

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Receita" value={brl(revenue)} hint="Total de pedidos no banco." />
        <AdminMetricCard label="Pedidos" value={String(orders.length)} hint="Pedidos criados pelo checkout." />
        <AdminMetricCard label="Doacao total" value={brl(donationsTotal)} hint="10% do lucro liquido acumulado." />
        <AdminMetricCard label="Leads" value={String(leads)} hint="Cadastros do pre-lancamento." />
        <AdminMetricCard label="A repassar" value={brl(toTransfer)} hint="Reservado/pendente, ainda nao enviado." />
        <AdminMetricCard label="Ja repassado" value={brl(transferred)} hint="Doacoes com status repassado." />
      </div>

      <h2 className="serif mt-12 text-3xl">Doacao por projeto</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {byProject.map((project) => (
          <div key={project.id} className="rounded-2xl border border-ink/10 bg-white/65 p-5">
            <span className="block h-1.5 w-12 rounded-full" style={{ backgroundColor: project.accent }} />
            <h3 className="serif mt-3 text-xl leading-tight">{project.name}</h3>
            <p className="text-xs text-ink/50">{project.cause}</p>
            <p className="serif mt-4 text-3xl">{brl(project.total)}</p>
            <p className="text-xs text-ink/50">{project.count} doacao(oes) destinada(s)</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
