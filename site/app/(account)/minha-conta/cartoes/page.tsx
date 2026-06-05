import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/backend/lib/auth";
import {
  getOrCreateStripeCustomer,
  listSavedCards,
} from "@/backend/services/stripe-customer";
import { CardsClient } from "@/frontend/components/account/cards-client";

export const dynamic = "force-dynamic";

export default async function CartoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string; email: string; name?: string | null };

  let cards: Awaited<ReturnType<typeof listSavedCards>> = [];
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    cards = await listSavedCards(stripeCustomerId);
  } catch {
    // Stripe not configured or error — show empty state
  }

  return (
    <main className="container-x py-16">
      <a
        href="/minha-conta"
        className="subtitle mb-6 inline-flex text-xs text-ink/50 transition hover:text-ink"
      >
        ← Minha conta
      </a>
      <h1 className="serif mb-8 text-4xl">Cartões salvos</h1>
      <CardsClient initial={cards} />
    </main>
  );
}
