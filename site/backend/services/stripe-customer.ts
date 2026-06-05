import Stripe from "stripe";
import { prisma } from "@/backend/db/prisma";

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export async function getOrCreateStripeCustomer(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (dbUser?.stripeCustomerId) return dbUser.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function listSavedCards(stripeCustomerId: string): Promise<SavedCard[]> {
  const stripe = getStripe();
  const methods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });

  return methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card!.brand,
    last4: pm.card!.last4,
    expMonth: pm.card!.exp_month,
    expYear: pm.card!.exp_year,
  }));
}

export async function createSetupIntent(stripeCustomerId: string): Promise<string> {
  const stripe = getStripe();
  const intent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
  });
  return intent.client_secret!;
}

export async function detachCard(paymentMethodId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.paymentMethods.detach(paymentMethodId);
}
