"use client";

import { useState, useTransition } from "react";
import {
  ActionResult,
  createProduct,
  toggleProductActive,
  updateProductPrice,
  updateVariantStock
} from "@/app/(admin)/admin/produtos/product-actions";

export type AdminVariant = { id: string; size: string; stock: number };
export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  active: boolean;
  variants: AdminVariant[];
};

const inputClass =
  "h-10 rounded-full border border-ink/15 bg-white/70 px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/50";
const buttonClass =
  "h-10 rounded-full bg-ink px-5 text-sm font-semibold text-ivory transition hover:bg-[#1c2925] disabled:opacity-50";

function Feedback({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return <p className={`text-xs ${result.ok ? "text-emerald-700" : "text-red-600"}`}>{result.message}</p>;
}

function ProductRow({ product }: { product: AdminProduct }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      setResult(await action());
    });
  }

  return (
    <div className={`rounded-lg border border-ink/10 bg-white/65 p-5 ${product.active ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-base">{product.name}</strong>
          <span className="ml-3 text-xs text-ink/45">/{product.slug}</span>
          <span className={`ml-3 rounded-full px-2 py-0.5 text-xs ${product.active ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/60"}`}>
            {product.active ? "Ativo" : "Inativo"}
          </span>
        </div>
        <button type="button" disabled={pending} onClick={() => run(() => toggleProductActive(product.id))} className="text-xs underline text-ink/60 hover:text-ink">
          {product.active ? "Desativar" : "Ativar"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            run(() => updateProductPrice({ ok: true, message: "" }, data));
          }}
          className="flex items-end gap-2"
        >
          <input type="hidden" name="productId" value={product.id} />
          <label className="grid gap-1 text-xs text-ink/60">
            Preço (R$)
            <input name="price" type="number" step="0.01" min="0.01" defaultValue={product.price.toFixed(2)} className={`${inputClass} w-28`} />
          </label>
          <button type="submit" disabled={pending} className={buttonClass}>Salvar</button>
        </form>

        <div className="flex flex-wrap items-end gap-3">
          {product.variants.map((variant) => (
            <form
              key={variant.id}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                run(() => updateVariantStock({ ok: true, message: "" }, data));
              }}
              className="flex items-end gap-1"
            >
              <input type="hidden" name="variantId" value={variant.id} />
              <label className="grid gap-1 text-xs text-ink/60">
                {variant.size}
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={variant.stock}
                  className={`${inputClass} w-20 ${variant.stock === 0 ? "border-red-300" : ""}`}
                />
              </label>
              <button type="submit" disabled={pending} className="h-10 rounded-full border border-ink/20 px-3 text-xs hover:bg-ink/5">
                ok
              </button>
            </form>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <Feedback result={result} />
      </div>
    </div>
  );
}

export function ProductsManager({ products }: { products: AdminProduct[] }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-ink/10 bg-white/65 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/70">Novo produto</h2>
          <button type="button" onClick={() => setShowForm((current) => !current)} className="text-xs underline text-ink/60 hover:text-ink">
            {showForm ? "fechar" : "adicionar"}
          </button>
        </div>
        {showForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              startTransition(async () => {
                const response = await createProduct({ ok: true, message: "" }, data);
                setResult(response);
                if (response.ok) form.reset();
              });
            }}
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <input name="name" required placeholder="Nome do produto" className={inputClass} />
            <input name="category" required placeholder="Categoria (ex.: Camisetas)" className={inputClass} />
            <input name="price" required type="number" step="0.01" min="0.01" placeholder="Preço (R$)" className={inputClass} />
            <input name="imageUrl" required type="url" placeholder="URL da imagem principal" className={inputClass} />
            <input name="sizes" defaultValue="P, M, G, GG" placeholder="Tamanhos (separados por vírgula)" className={inputClass} />
            <input name="initialStock" required type="number" min="0" defaultValue={20} placeholder="Estoque inicial por tamanho" className={inputClass} />
            <textarea name="description" required placeholder="Descrição" rows={3} className="rounded-2xl border border-ink/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-ink/50 md:col-span-2" />
            <textarea name="symbolicMeaning" required placeholder="Significado simbólico" rows={2} className="rounded-2xl border border-ink/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-ink/50 md:col-span-2" />
            <div className="flex items-center gap-4 md:col-span-2">
              <button type="submit" disabled={pending} className={buttonClass}>
                {pending ? "Criando..." : "Criar produto"}
              </button>
              <Feedback result={result} />
            </div>
          </form>
        )}
      </div>

      {products.length === 0 ? (
        <p className="rounded-lg border border-ink/10 bg-white/65 p-6 text-ink/50">
          Nenhum produto no banco. Rode <code>npm run db:seed</code> ou crie o primeiro produto acima.
        </p>
      ) : (
        products.map((product) => <ProductRow key={product.id} product={product} />)
      )}
    </div>
  );
}
