import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const csv = ["email,name,createdAt", ...leads.map((lead) => `${lead.email},${lead.name ?? ""},${lead.createdAt.toISOString()}`)].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=leads-rebanho.csv"
    }
  });
}
