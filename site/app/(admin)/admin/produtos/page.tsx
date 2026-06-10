import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { ProductsManager, type AdminProduct } from "@/frontend/components/admin/products-manager";
import { authOptions } from "@/backend/lib/auth";
import { isAdmin } from "@/backend/services/permissions";
import { prisma } from "@/backend/db/prisma";

export const dynamic = "force-dynamic";

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XGG"];

function sizeRank(size: string): number {
  const index = SIZE_ORDER.indexOf(size);
  return index === -1 ? 99 : index;
}

export default async function AdminProdutosPage() {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) redirect("/minha-conta");

  let products: AdminProduct[] = [];
  let dbError = false;
  try {
    const dbProducts = await prisma.product.findMany({
      include: { variants: { orderBy: { id: "asc" } } },
      orderBy: { createdAt: "asc" }
    });
    products = dbProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      category: product.category,
      active: product.active,
      variants: product.variants
        .map((variant) => ({
          id: variant.id,
          size: variant.size,
          stock: variant.stock
        }))
        .sort((a, b) => sizeRank(a.size) - sizeRank(b.size))
    }));
  } catch {
    dbError = true;
  }

  return (
    <AdminShell title="Produtos">
      {dbError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Banco de dados indisponível. Verifique a variável DATABASE_URL.
        </p>
      ) : (
        <ProductsManager products={products} />
      )}
    </AdminShell>
  );
}
