import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { ProfileForm } from "@/frontend/components/account/profile-form";

export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true, cpf: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="container-x py-16">
      <h1 className="serif mb-8 text-4xl">Minha conta</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm initial={user} />
        <nav className="space-y-3">
          <a
            href="/minha-conta/enderecos"
            className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4 text-sm font-medium hover:border-ink/30 transition"
          >
            Endereços salvos <span className="text-ink/40">→</span>
          </a>
          <a
            href="/minha-conta/cartoes"
            className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4 text-sm font-medium hover:border-ink/30 transition"
          >
            Cartões salvos <span className="text-ink/40">→</span>
          </a>
          <a
            href="/meus-pedidos"
            className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4 text-sm font-medium hover:border-ink/30 transition"
          >
            Meus pedidos <span className="text-ink/40">→</span>
          </a>
        </nav>
      </div>
    </main>
  );
}
