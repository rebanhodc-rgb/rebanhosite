import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1).max(50),
  recipientName: z.string().min(3),
  cep: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
