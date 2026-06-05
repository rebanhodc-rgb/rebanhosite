import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";
import { donationProjects } from "@/shared/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  const [orders, leads, donations] = await Promise.all([
    prisma.order.findMany({ select: { total: true } }),
    prisma.lead.count(),
    prisma.donation.findMany({ select: { amount: true, projectId: true, status: true } })
  ]);

  const donationsTotal = donations.reduce((sum, donation) => sum + Number(donation.amount), 0);
  const toTransfer = donations
    .filter((donation) => donation.status !== "REPASSADO")
    .reduce((sum, donation) => sum + Number(donation.amount), 0);

  const byProject = donationProjects.map((project) => ({
    projectId: project.id,
    name: project.name,
    total: donations
      .filter((donation) => donation.projectId === project.id)
      .reduce((sum, donation) => sum + Number(donation.amount), 0)
  }));

  return NextResponse.json({
    orders: orders.length,
    leads,
    revenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
    donations: donationsTotal,
    toTransfer,
    byProject
  });
}
