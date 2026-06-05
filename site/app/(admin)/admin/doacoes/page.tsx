import Link from "next/link";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  RESERVADO: "Reservado",
  REPASSADO: "Repassado"
};

export default async function AdminDoacoesPage() {
  const donations = await prisma.donation.findMany({
    include: { order: { select: { customerName: true, customerEmail: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell title="Doacoes">
      <div className="mb-4 flex justify-end">
        <Link href="/api/admin/doacoes/export" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-ivory">
          Exportar CSV
        </Link>
      </div>
      <div className="rounded-lg border border-ink/10 bg-white/65 overflow-hidden">
        {donations.length === 0 ? (
          <p className="p-6 text-ink/50">Nenhuma doacao registrada ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Projeto</th>
                <th className="px-4 py-3 text-left font-medium">Cidade / UF</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium">{donation.projectName ?? donation.parishName}</td>
                  <td className="px-4 py-3 text-ink/60">{donation.city} / {donation.state}</td>
                  <td className="px-4 py-3">R$ {Number(donation.amount).toFixed(2).replace(".", ",")}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                      {STATUS_LABEL[donation.status] ?? donation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{donation.order.customerName}</div>
                    <div className="text-xs text-ink/50">{donation.order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/60">
                    {new Date(donation.createdAt).toLocaleDateString("pt-BR")}
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
