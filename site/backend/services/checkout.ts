import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/backend/db/prisma";
import { calculateDonation } from "@/backend/services/donation";
import { findParishByCep } from "@/backend/services/parish-matcher";
import { products as fallbackProducts } from "@/shared/catalog";
import { checkoutSchema } from "@/shared/validations/checkout";

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createCheckoutOrder(input: CheckoutInput) {
  const { items, ...customer } = input;
  const productKeys = items.map((item) => item.productId);

  const dbProducts = await prisma.product.findMany({
    where: { OR: [{ id: { in: productKeys } }, { slug: { in: productKeys } }] },
    include: { variants: true }
  });

  const pricedItems = items.map((item) => {
    const product = dbProducts.find((candidate) => candidate.id === item.productId || candidate.slug === item.productId);
    if (product) {
      const variant = product.variants.find((candidate) => candidate.id === item.variantId) ?? product.variants[0];
      if (!variant) throw new Error(`Produto sem variante cadastrada: ${product.name}`);
      return {
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        price: Number(product.price),
        name: product.name
      };
    }

    const fallback = fallbackProducts.find((candidate) => candidate.id === item.productId);
    if (!fallback) throw new Error("Produto nao encontrado");
    return { productId: fallback.id, variantId: item.variantId, quantity: item.quantity, price: fallback.price, name: fallback.name };
  });

  const total = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const donationAmount = calculateDonation(total);
  const parish = await findParishByCep(customer.cep);

  const order = await prisma.order.create({
    data: {
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerCPF: customer.customerCPF,
      cep: customer.cep,
      city: customer.city,
      state: customer.state,
      parishName: parish.name,
      total: new Prisma.Decimal(total.toFixed(2)),
      donationAmount: new Prisma.Decimal(donationAmount.toFixed(2)),
      items: {
        create: pricedItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: new Prisma.Decimal(item.price.toFixed(2))
        }))
      },
      donation: {
        create: {
          amount: new Prisma.Decimal(donationAmount.toFixed(2)),
          parishName: parish.name,
          city: parish.city,
          state: parish.state,
          status: "RESERVADO"
        }
      }
    }
  });

  return {
    order,
    parish,
    pricedItems,
    total,
    donationAmount,
    message:
      parish.id === "fallback"
        ? "Caso nao encontremos uma paroquia proxima, destinaremos o valor a uma comunidade cadastrada pela REBANHO."
        : "Sua compra ajudara uma comunidade proxima de voce."
  };
}
