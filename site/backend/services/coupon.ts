import { prisma } from "@/backend/db/prisma";

export type CouponValidation =
  | { valid: true; code: string; discount: number }
  | { valid: false; reason: string };

export async function validateCoupon(rawCode: string, subtotal: number): Promise<CouponValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, reason: "Informe um código de cupom." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return { valid: false, reason: "Cupom inválido ou inativo." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, reason: "Cupom expirado." };
  }

  const value = Number(coupon.discountValue);
  const rawDiscount = coupon.discountType === "PERCENTAGE" ? subtotal * (value / 100) : value;
  const discount = Math.min(parseFloat(rawDiscount.toFixed(2)), subtotal);

  if (discount <= 0) return { valid: false, reason: "Cupom sem desconto aplicável." };

  return { valid: true, code, discount };
}
