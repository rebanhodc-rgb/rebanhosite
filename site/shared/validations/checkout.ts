import { z } from "zod";
import { donationProjects } from "@/shared/projects";

const projectIds = donationProjects.map((project) => project.id) as [string, ...string[]];

export const checkoutSchema = z.object({
  customerName: z.string().min(3),
  customerEmail: z.string().email(),
  customerCPF: z.string().min(11),
  phone: z.string().min(10).optional(),
  // Address fields
  cep: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  // Shipping
  shippingMethod: z.string().min(1),
  shippingCarrier: z.string().min(1),
  shippingCost: z.number().min(0),
  shippingDays: z.number().int().min(0),
  projectId: z.enum(projectIds),
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
