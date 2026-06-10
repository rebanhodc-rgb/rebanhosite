import { Navbar } from "@/frontend/components/brand/navbar";
import { Footer } from "@/frontend/components/brand/footer";
import { ProductCard } from "@/frontend/components/product/product-card";
import { SectionTitle } from "@/frontend/components/brand/section-title";
import { CircularGallery } from "@/frontend/components/product/circular-gallery";
import { listShopProducts } from "@/backend/services/products";

export const dynamic = "force-dynamic";

export default async function LojaPage() {
  const products = await listShopProducts();
  const galleryItems = products.map((p) => ({
    image: p.images[0],
    title: p.name,
  }));

  return (
    <main>
      <Navbar />
      <section className="container-x py-14 md:py-20">
        <CircularGallery items={galleryItems} className="mb-16" />
        <SectionTitle eyebrow="Loja" title="Coleção REBANHO" copy="Pequenas tiragens, acabamento premium e símbolos discretos: cada peça é um aceno de esperança no cotidiano." />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} soldOut={product.soldOut} />)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
