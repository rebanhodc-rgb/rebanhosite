"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { isAdmin } from "@/backend/services/permissions";

export type ActionResult = { ok: boolean; message: string };

const updateOrderSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"]),
  trackingCode: z.string().trim().max(60).optional()
});

export async function updateOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) {
    return { ok: false, message: "Acesso negado." };
  }

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingCode: formData.get("trackingCode") || undefined
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  try {
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        trackingCode: parsed.data.trackingCode ?? null
      }
    });
    revalidatePath("/admin/pedidos");
    return { ok: true, message: "Pedido atualizado." };
  } catch {
    return { ok: false, message: "Não foi possível atualizar o pedido." };
  }
}
