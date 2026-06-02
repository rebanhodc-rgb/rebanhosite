import { z } from "zod";

export const leadSchema = z.object({
  email: z.string().email("E-mail invalido"),
  name: z.string().min(2).max(100).optional()
});
