import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { variants: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(products);
}
