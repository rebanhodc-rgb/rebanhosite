import { Navbar } from "@/frontend/components/brand/navbar";
import { Footer } from "@/frontend/components/brand/footer";
import { ProductCard } from "@/frontend/components/product/product-card";
import { SectionTitle } from "@/frontend/components/brand/section-title";
import { CircularGallery } from "@/frontend/components/product/circular-gallery";
import { products } from "@/shared/catalog";

const galleryItems = products.map((p) => ({
  image: p.images[0],
  title: p.name,
}));

export default function LojaPage() {
  return (
    <main>
      <Navbar />
      <section className="container-x py-14 md:py-20">
        <CircularGallery items={galleryItems} className="mb-16" />
        <SectionTitle eyebrow="Loja" title="Coleção REBANHO" copy="Pequenas tiragens, acabamento premium e símbolos desenhados para permanecerem discretos." />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
