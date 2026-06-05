import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { addressSchema } from "@/shared/validations/address";

async function ownedAddress(userId: string, id: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  if (!(await ownedAddress(userId, params.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const parsed = addressSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json({ address });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  if (!(await ownedAddress(userId, params.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
