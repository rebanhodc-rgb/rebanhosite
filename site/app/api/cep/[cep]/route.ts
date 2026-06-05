import { NextResponse } from "next/server";
import { lookupCep } from "@/backend/services/cep";

export async function GET(
  _req: Request,
  { params }: { params: { cep: string } }
) {
  const data = await lookupCep(params.cep);
  if (!data) {
    return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
  }
  return NextResponse.json(data);
}
