import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/shared/catalog";
import { brl } from "@/shared/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produto/${product.slug}`} className="group block overflow-hidden rounded-lg border border-ink/10 bg-[#f5eee3] shadow-[0_18px_45px_rgba(15,26,23,0.14)] transition duration-500 hover:-translate-y-1">
      <div className="aspect-[1/1.18] overflow-hidden bg-[#ded4c5]">
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="px-6 py-6 text-center">
        <h3 className="serif text-2xl uppercase tracking-[0.04em]">{product.name}</h3>
        <p className="subtitle mt-2 text-xs uppercase tracking-[0.2em] text-ink/50">{product.line}</p>
        <p className="subtitle mt-4 text-base font-semibold">{brl(product.price)}</p>
        <div className="mt-4 flex justify-center gap-2">
          {product.colors.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />)}
        </div>
        <span className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#ad9169] text-ivory transition group-hover:bg-ink">
          <Plus size={18} />
        </span>
      </div>
    </Link>
  );
}
