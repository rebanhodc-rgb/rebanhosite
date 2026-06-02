import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const donations = await prisma.donation.findMany({ orderBy: { createdAt: "desc" } });
  const csv = [
    "orderId,amount,parishName,city,state,status,createdAt",
    ...donations.map((donation) => `${donation.orderId},${donation.amount},${donation.parishName},${donation.city},${donation.state},${donation.status},${donation.createdAt.toISOString()}`)
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=doacoes-rebanho.csv"
    }
  });
}
