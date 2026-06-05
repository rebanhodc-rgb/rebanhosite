import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { getOrCreateStripeCustomer, createSetupIntent } from "@/backend/services/stripe-customer";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = session.user as { id: string; email: string; name?: string };

  const stripeCustomerId = await getOrCreateStripeCustomer(user);
  const clientSecret = await createSetupIntent(stripeCustomerId);

  return NextResponse.json({ clientSecret });
}
