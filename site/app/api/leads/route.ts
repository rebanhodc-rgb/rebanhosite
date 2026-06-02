import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { leadSchema } from "@/shared/validations/lead";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const lead = await prisma.lead.upsert({
      where: { email: parsed.data.email },
      update: { name: parsed.data.name },
      create: parsed.data
    });

    return NextResponse.json({ ok: true, lead });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
  }
}
