import { AdminShell } from "@/frontend/components/admin/admin-shell";
import { products } from "@/shared/catalog";
import { brl } from "@/shared/utils";

export default function AdminProdutosPage() {
  return (
    <AdminShell title="Produtos">
      <div className="grid gap-3">
        {products.map((product) => <div key={product.id} className="rounded-lg border border-ink/10 bg-white/65 p-4"><strong>{product.name}</strong><span className="ml-4 text-sm text-ink/60">{brl(product.price)}</span></div>)}
      </div>
    </AdminShell>
  );
}
