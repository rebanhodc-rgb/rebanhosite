import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { DonationSettingsForm } from "@/frontend/components/admin/donation-settings-form";
import { authOptions } from "@/backend/lib/auth";
import { isAdmin } from "@/backend/services/permissions";
import { getDonationParams } from "@/backend/services/donation";

export const dynamic = "force-dynamic";

const ENV_GROUPS = [
  {
    group: "Banco de dados",
    vars: [{ key: "DATABASE_URL", label: "Database URL" }]
  },
  {
    group: "Autenticação",
    vars: [
      { key: "NEXTAUTH_SECRET", label: "NextAuth Secret" },
      { key: "NEXTAUTH_URL", label: "NextAuth URL" }
    ]
  },
  {
    group: "Pagamentos (Stripe)",
    vars: [
      { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key" },
      { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe Webhook Secret" }
    ]
  },
  {
    group: "E-mail (Resend)",
    vars: [
      { key: "RESEND_API_KEY", label: "Resend API Key" },
      { key: "EMAIL_FROM", label: "E-mail remetente" },
      { key: "ADMIN_ORDERS_EMAIL", label: "E-mail de pedidos" }
    ]
  }
] as const;

export default async function AdminConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) redirect("/minha-conta");

  const params = await getDonationParams();

  return (
    <AdminShell title="Configurações">
      <div className="space-y-6">
        <DonationSettingsForm
          initial={{
            unitCost: params.unitCost,
            taxPercent: Number((params.taxRate * 100).toFixed(2)),
            feePercent: Number((params.feeRate * 100).toFixed(2)),
            fixedFee: params.fixedFee,
            donationPercent: Number((params.donationRate * 100).toFixed(2))
          }}
        />
        {ENV_GROUPS.map(({ group, vars }) => (
          <div key={group} className="rounded-lg border border-ink/10 bg-white/65 p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/50">{group}</h2>
            <div className="space-y-3">
              {vars.map(({ key, label }) => {
                const configured = Boolean(process.env[key]);
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-ink/80">{label}</span>
                    <span className={configured ? "font-medium text-green-600" : "font-medium text-red-500"}>
                      {configured ? "Configurado" : "Ausente"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
