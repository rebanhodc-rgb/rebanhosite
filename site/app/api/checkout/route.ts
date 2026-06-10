import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { getOrCreateStripeCustomer } from "@/backend/services/stripe-customer";
import { CheckoutError, createCheckoutOrder } from "@/backend/services/checkout";
import { checkoutSchema } from "@/shared/validations/checkout";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const checkout = await createCheckoutOrder(parsed.data);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // Get or create Stripe customer for authenticated users
    const session_auth = await getServerSession(authOptions);
    let stripeCustomerId: string | undefined;

    if (session_auth?.user) {
      const user = session_auth.user as { id: string; email: string; name?: string | null };
      stripeCustomerId = await getOrCreateStripeCustomer({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    }

    // Cupom aplicado como desconto único na sessão Stripe
    let stripeDiscounts: { coupon: string }[] | undefined;
    if (checkout.discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(checkout.discount * 100),
        currency: "brl",
        duration: "once",
        name: `Cupom ${checkout.couponCode}`
      });
      stripeDiscounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1h para concluir o pagamento
      ...(stripeDiscounts ? { discounts: stripeDiscounts } : {}),
      line_items: [
        ...checkout.pricedItems.map((item) => ({
          price_data: {
            currency: "brl",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        ...(parsed.data.shippingCost > 0
          ? [
              {
                price_data: {
                  currency: "brl",
                  product_data: {
                    name: `Frete (${parsed.data.shippingCarrier} — ${parsed.data.shippingMethod})`,
                  },
                  unit_amount: Math.round(parsed.data.shippingCost * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      metadata: { orderId: checkout.order.id },
      ...(stripeCustomerId
        ? {
            customer: stripeCustomerId,
            payment_intent_data: {
              setup_future_usage: "on_session" as const,
            },
          }
        : {}),
      success_url: `${origin}/checkout/sucesso?orderId=${checkout.order.id}`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ ok: true, checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Erro no checkout", detail: (error as Error).message }, { status: 500 });
  }
}
