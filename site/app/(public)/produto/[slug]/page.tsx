import { notFound } from "next/navigation";
import { Truck, HeartHandshake } from "lucide-react";
import { Navbar } from "@/frontend/components/brand/navbar";
import { Footer } from "@/frontend/components/brand/footer";
import { ProductGallery } from "@/frontend/components/product/product-gallery";
import { ProductPurchasePanel } from "@/frontend/components/product/product-purchase-panel";
import { ProductCard } from "@/frontend/components/product/product-card";
import { InteractiveBook } from "@/frontend/components/product/interactive-book";
import { brl } from "@/shared/utils";
import { getProduct, products } from "@/shared/catalog";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const bookPages = [
    {
      title: "O Significado",
      content: product.symbolicMeaning,
    },
    {
      title: "A Peça",
      content: product.description,
    },
  ];

  return (
    <main>
      <Navbar />
      <section className="container-x grid gap-10 py-10 md:grid-cols-[1.08fr_0.92fr]">
        <ProductGallery images={product.images} name={product.name} category={product.line ?? "Camiseta"} />
        <div className="md:sticky md:top-24 md:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">{product.category}</p>
          <h1 className="serif mt-3 text-4xl leading-tight md:text-7xl">{product.name}</h1>
          <p className="mt-4 text-xl font-semibold">{brl(product.price)}</p>
          <p className="mt-6 leading-8 text-ink/70">{product.description}</p>
          <div className="mt-6 rounded-lg border border-ink/10 bg-white/55 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper">Significado</p>
            <p className="serif mt-2 text-2xl leading-8">{product.symbolicMeaning}</p>
          </div>
          <ProductPurchasePanel product={product} />
          <div className="mt-8 grid gap-4 text-sm text-ink/68">
            <p className="flex gap-3"><Truck size={18} className="text-copper" /> Envio calculado no checkout.</p>
            <p className="flex gap-3"><HeartHandshake size={18} className="text-copper" /> 10% do lucro desta compra vai para um dos 3 projetos sociais — voce escolhe no checkout.</p>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-ivory">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-subtitle text-xs uppercase tracking-widest text-gold text-center mb-10">
            O Significado
          </h2>
          <InteractiveBook pages={bookPages} />
        </div>
      </section>
      <section className="container-x border-t border-ink/10 py-14">
        <h2 className="serif mb-8 text-4xl">Relacionados</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {products.filter((item) => item.slug !== product.slug).map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
