import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(3),
  customerEmail: z.string().email(),
  customerCPF: z.string().min(11),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  cep: z.string().min(8),
  city: z.string().min(2),
  state: z.string().length(2),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});
