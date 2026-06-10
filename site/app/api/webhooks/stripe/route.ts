import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderEmails } from "@/backend/email/order-emails";
import { cancelUnpaidOrder, markOrderPaid } from "@/backend/services/order-fulfillment";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${(err as Error).message}` }, { status: 400 });
  }

  const obj = event.data.object as { metadata?: Record<string, string> };
  const orderId = obj?.metadata?.orderId;

  switch (event.type) {
    case "payment_intent.succeeded":
      if (orderId) await markOrderPaid(orderId);
      break;

    case "payment_intent.payment_failed":
      if (orderId) await cancelUnpaidOrder(orderId, true);
      break;

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionOrderId = session.metadata?.orderId;
      if (sessionOrderId) await cancelUnpaidOrder(sessionOrderId, false);
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionOrderId = session.metadata?.orderId;
      if (sessionOrderId) {
        // markOrderPaid é idempotente: retorna null se o pedido já foi aprovado,
        // evitando baixa dupla de estoque e e-mails duplicados em reentregas.
        const order = await markOrderPaid(sessionOrderId);
        if (order) {
          await sendOrderEmails({
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            total: Number(order.total),
            donationAmount: Number(order.donationAmount),
            projectName: order.projectName ?? order.parishName ?? "",
            items: order.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
