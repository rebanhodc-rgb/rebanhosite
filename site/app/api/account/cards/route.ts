import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { getOrCreateStripeCustomer, listSavedCards } from "@/backend/services/stripe-customer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = session.user as { id: string; email: string; name?: string };

  const stripeCustomerId = await getOrCreateStripeCustomer(user);
  const cards = await listSavedCards(stripeCustomerId);

  return NextResponse.json({ cards });
}
