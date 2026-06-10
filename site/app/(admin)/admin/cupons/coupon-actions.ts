"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { isAdmin } from "@/backend/services/permissions";

export type ActionResult = { ok: boolean; message: string };

async function requireAdmin(): Promise<ActionResult | null> {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) {
    return { ok: false, message: "Acesso negado." };
  }
  return null;
}

const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Use apenas letras, números, hífen e underline."),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0.01).max(100000),
  expiresAt: z.string().optional()
});

export async function createCoupon(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = createCouponSchema.safeParse({
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    expiresAt: formData.get("expiresAt") || undefined
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos. Revise os campos." };

  const { code, discountType, discountValue, expiresAt } = parsed.data;
  if (discountType === "PERCENTAGE" && discountValue > 100) {
    return { ok: false, message: "Desconto percentual não pode passar de 100%." };
  }

  try {
    const normalized = code.toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: normalized } });
    if (existing) return { ok: false, message: `Cupom ${normalized} já existe.` };

    await prisma.coupon.create({
      data: {
        code: normalized,
        discountType,
        discountValue: new Prisma.Decimal(discountValue.toFixed(2)),
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`) : null
      }
    });
    revalidatePath("/admin/cupons");
    return { ok: true, message: `Cupom ${normalized} criado.` };
  } catch {
    return { ok: false, message: "Não foi possível criar o cupom." };
  }
}

export async function toggleCouponActive(couponId: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) return { ok: false, message: "Cupom não encontrado." };

    await prisma.coupon.update({ where: { id: couponId }, data: { active: !coupon.active } });
    revalidatePath("/admin/cupons");
    return { ok: true, message: coupon.active ? "Cupom desativado." : "Cupom ativado." };
  } catch {
    return { ok: false, message: "Não foi possível alterar o cupom." };
  }
}

export async function deleteCoupon(couponId: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    revalidatePath("/admin/cupons");
    return { ok: true, message: "Cupom removido." };
  } catch {
    return { ok: false, message: "Não foi possível remover o cupom." };
  }
}
