import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateShipping } from "@/backend/services/shipping";

const schema = z.object({
  cep: z.string().min(8),
  quantity: z.number().int().positive(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const fromCep = process.env.STORE_CEP;
  if (!fromCep) {
    return NextResponse.json(
      { error: "CEP da loja não configurado" },
      { status: 500 }
    );
  }

  const options = await calculateShipping({
    fromCep,
    toCep: parsed.data.cep,
    quantity: parsed.data.quantity,
  });

  return NextResponse.json({ options });
}
