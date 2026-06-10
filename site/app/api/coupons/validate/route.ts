import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/backend/services/coupon";

const validateSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().min(0)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = validateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ valid: false, reason: "Dados inválidos." }, { status: 400 });
    }

    const result = await validateCoupon(parsed.data.code, parsed.data.subtotal);
    return NextResponse.json(result, { status: result.valid ? 200 : 422 });
  } catch {
    return NextResponse.json({ valid: false, reason: "Não foi possível validar o cupom." }, { status: 500 });
  }
}
