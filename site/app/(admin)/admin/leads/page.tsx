import Link from "next/link";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell title="Leads">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/50">{leads.length} lead{leads.length !== 1 ? "s" : ""} captado{leads.length !== 1 ? "s" : ""}</p>
        <Link href="/api/admin/leads/export" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-ivory">
          Exportar CSV
        </Link>
      </div>
      <div className="rounded-lg border border-ink/10 bg-white/65 overflow-hidden">
        {leads.length === 0 ? (
          <p className="p-6 text-ink/50">Nenhum lead captado ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">E-mail</th>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium">{lead.email}</td>
                  <td className="px-4 py-3 text-ink/60">{lead.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-ink/60">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
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
