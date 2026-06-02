import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [orders, leads, donations] = await Promise.all([
    prisma.order.findMany({ select: { total: true } }),
    prisma.lead.count(),
    prisma.donation.findMany({ select: { amount: true } })
  ]);

  return NextResponse.json({
    orders: orders.length,
    leads,
    revenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
    donations: donations.reduce((sum, donation) => sum + Number(donation.amount), 0)
  });
}
