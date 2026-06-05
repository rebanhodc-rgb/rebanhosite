import Link from "next/link";
import { ArrowRight, Box, Church, Heart, Leaf, Search, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { ProductCard } from "@/frontend/components/product/product-card";
import { NewsletterForm } from "@/frontend/components/brand/newsletter-form";
import { StoryCarousel } from "@/frontend/components/brand/story-carousel";
import { products } from "@/shared/catalog";

export default function BrandHomePage() {
  return (
    <main className="bg-[#f3eee6] text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-[#f7f3eb]/90 backdrop-blur">
        <div className="mx-auto flex h-20 w-[min(1360px,calc(100%_-_40px))] items-center justify-between">
          <Link href="/marca" className="flex items-center gap-3">
            <Sparkles size={22} className="text-[#ad9169]" />
            <span className="serif text-3xl tracking-[0.18em]">REBANHO</span>
          </Link>
          <nav className="subtitle hidden items-center gap-12 text-xs font-bold uppercase tracking-[0.2em] lg:flex">
            <Link href="/loja">Loja</Link>
            <Link href="/proposito">Proposito</Link>
            <Link href="/experiencia">Experiencia</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Search size={22} />
            <UserRound size={22} />
            <Link href="/carrinho"><ShoppingBag size={22} /></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-[min(1360px,calc(100%_-_40px))] gap-12 py-14 lg:grid-cols-[0.58fr_0.42fr] lg:items-center">
        <div>
          <p className="subtitle text-center text-xs font-bold uppercase tracking-[0.28em] text-ink/60 lg:text-left">Colecao</p>
          <h1 className="serif mt-3 text-center text-6xl leading-tight lg:text-left lg:text-7xl">Pecas que carregam proposito</h1>
          <p className="subtitle mt-4 text-center text-sm font-bold uppercase tracking-[0.26em] text-ink/56 lg:text-left">Cada detalhe fala sobre aquilo que acreditamos.</p>
          <div className="mx-auto mt-6 h-px w-40 bg-[#ad9169] lg:mx-0" />
          <Link href="/loja" className="subtitle mx-auto mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-[0.14em] text-ivory lg:mx-0">
            Conheca a colecao <ArrowRight size={17} />
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg shadow-[0_24px_70px_rgba(15,26,23,0.2)]">
          <img src="/images/rebanho-modelo-feminino.png" alt="Modelo usando camiseta REBANHO" className="aspect-[4/5] w-full object-cover" />
        </div>
      </section>

      <StoryCarousel />

      <section className="mx-auto w-[min(1360px,calc(100%_-_40px))] pb-20">
        <div className="grid gap-8 md:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="border-y border-ink/8 bg-[#eee4d7]">
        <div className="mx-auto grid w-[min(1360px,calc(100%_-_40px))] gap-8 py-10 md:grid-cols-4">
          {[
            [Leaf, "Significado", "Cada detalhe carrega um proposito."],
            [Box, "Experiencia", "Mais que uma compra, um momento."],
            [Church, "Impacto real", "10% do lucro de cada venda para um dos 3 projetos sociais."],
            [Heart, "Para todos", "Design sutil que fala com todos."]
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="flex items-center gap-5 border-ink/10 md:border-l md:pl-8 md:first:border-l-0">
              {typeof Icon !== "string" ? <Icon size={40} strokeWidth={1.25} className="text-[#8f7651]" /> : null}
              <div>
                <h2 className="subtitle text-xs font-bold uppercase tracking-[0.2em]">{title as string}</h2>
                <p className="subtitle mt-2 text-sm leading-6 text-ink/65">{text as string}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-ink py-14 text-ivory">
        <div className="mx-auto grid w-[min(1360px,calc(100%_-_40px))] gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="serif text-4xl tracking-[0.16em] text-gold">REBANHO</p>
            <p className="subtitle mt-3 max-w-md text-sm leading-6 text-ivory/62">A roupa fala por quem a veste. Moda com significado, beleza e missao.</p>
          </div>
          <NewsletterForm dark />
        </div>
      </footer>
    </main>
  );
}
