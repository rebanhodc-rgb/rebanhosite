import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/backend/db/prisma";
import { calculateOrderDonation } from "@/backend/services/donation";
import { products as fallbackProducts } from "@/shared/catalog";
import { DEFAULT_PROJECT_ID, getProject } from "@/shared/projects";
import { checkoutSchema } from "@/shared/validations/checkout";

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createCheckoutOrder(input: CheckoutInput) {
  const { items, projectId, ...customer } = input;
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

  const itemsTotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = parseFloat((itemsTotal + input.shippingCost).toFixed(2));
  const totalQuantity = pricedItems.reduce((sum, item) => sum + item.quantity, 0);

  const project = getProject(projectId) ?? getProject(DEFAULT_PROJECT_ID)!;
  const breakdown = await calculateOrderDonation(total, totalQuantity);
  const donationAmount = breakdown.donation;

  const order = await prisma.order.create({
    data: {
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerCPF: customer.customerCPF,
      phone: customer.phone,
      cep: customer.cep,
      street: customer.street,
      number: customer.number,
      complement: customer.complement,
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state,
      shippingMethod: input.shippingMethod,
      shippingCarrier: input.shippingCarrier,
      shippingCost: new Prisma.Decimal(input.shippingCost.toFixed(2)),
      shippingDays: input.shippingDays,
      projectId: project.id,
      projectName: project.name,
      parishName: project.name,
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
          projectId: project.id,
          projectName: project.name,
          parishName: project.name,
          city: project.city,
          state: project.state,
          status: "RESERVADO"
        }
      }
    }
  });

  return {
    order,
    project,
    pricedItems,
    total,
    breakdown,
    donationAmount,
    message: `Sua compra reserva ${donationAmount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })} para ${project.name}.`
  };
}
