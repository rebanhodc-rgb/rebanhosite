import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createCheckoutOrder } from "@/backend/services/checkout";
import { checkoutSchema } from "@/shared/validations/checkout";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const checkout = await createCheckoutOrder(parsed.data);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
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
      success_url: `${origin}/checkout/sucesso?orderId=${checkout.order.id}`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ ok: true, checkoutUrl: session.url });
  } catch (error) {
    return NextResponse.json({ error: "Erro no checkout", detail: (error as Error).message }, { status: 500 });
  }
}
