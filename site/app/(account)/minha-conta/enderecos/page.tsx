import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { AddressesClient } from "@/frontend/components/account/addresses-client";

export const dynamic = "force-dynamic";

export default async function EnderecosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      label: true,
      recipientName: true,
      street: true,
      number: true,
      complement: true,
      neighborhood: true,
      city: true,
      state: true,
      cep: true,
      isDefault: true,
    },
  });

  return (
    <main className="container-x py-16">
      <a
        href="/minha-conta"
        className="subtitle mb-6 inline-flex text-xs text-ink/50 transition hover:text-ink"
      >
        ← Minha conta
      </a>
      <h1 className="serif mb-8 text-4xl">Endereços</h1>
      <AddressesClient initial={addresses} />
    </main>
  );
}
