import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";

const profileSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  cpf: z.string().min(11).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { name: true, email: true, phone: true, cpf: true },
  });

  return NextResponse.json({ user });
}
