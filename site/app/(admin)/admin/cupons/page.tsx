import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { CouponsManager, type AdminCoupon } from "@/frontend/components/admin/coupons-manager";
import { authOptions } from "@/backend/lib/auth";
import { isAdmin } from "@/backend/services/permissions";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCuponsPage() {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) redirect("/minha-conta");

  let coupons: AdminCoupon[] = [];
  let dbError = false;
  try {
    const dbCoupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
    coupons = dbCoupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      active: coupon.active,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null
    }));
  } catch {
    dbError = true;
  }

  return (
    <AdminShell title="Cupons">
      {dbError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Banco de dados indisponível. Verifique a variável DATABASE_URL.
        </p>
      ) : (
        <CouponsManager coupons={coupons} />
      )}
    </AdminShell>
  );
}
