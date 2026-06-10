import { prisma } from "@/backend/db/prisma";

/**
 * Marca o pedido como pago e baixa o estoque das variantes.
 * Idempotente: se o pedido já estiver aprovado (webhook reenviado), retorna null.
 */
export async function markOrderPaid(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order || order.paymentStatus === "APPROVED") return null;

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", paymentStatus: "APPROVED" },
      include: { items: { include: { product: true } } }
    });

    for (const item of order.items) {
      await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return updated;
  });
}

/**
 * Cancela um pedido não pago (sessão expirada ou pagamento recusado)
 * e remove a doação reservada associada.
 */
export async function cancelUnpaidOrder(orderId: string, paymentFailed: boolean) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === "APPROVED") return null;

    await tx.donation.deleteMany({ where: { orderId } });
    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELED", paymentStatus: paymentFailed ? "FAILED" : "PENDING" }
    });
  });
}
