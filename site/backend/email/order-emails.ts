import { Resend } from "resend";
import { adminOrderNotificationHtml, orderConfirmationHtml, OrderEmailData } from "@/backend/email/templates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "REBANHO <pedidos@rebanho.com>";
const adminEmail = process.env.ADMIN_ORDERS_EMAIL;

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) return { skipped: true, reason: "RESEND_API_KEY ausente" };

  return resend.emails.send({
    from,
    to,
    subject,
    html
  });
}

export async function sendOrderEmails(order: OrderEmailData) {
  const customerEmail = sendEmail(order.customerEmail, `Pedido REBANHO ${order.orderId}`, orderConfirmationHtml(order));
  const adminEmailTask = adminEmail
    ? sendEmail(adminEmail, `Novo pedido REBANHO ${order.orderId}`, adminOrderNotificationHtml(order))
    : Promise.resolve({ skipped: true, reason: "ADMIN_ORDERS_EMAIL ausente" });

  const [customer, admin] = await Promise.allSettled([customerEmail, adminEmailTask]);

  return { customer, admin };
}
