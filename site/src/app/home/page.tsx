import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import ProductCard from "@/components/product/ProductCard";
import { getFeatured } from "@/lib/products";

export default function HomePage() {
  const featured = getFeatured();

  return (
    <>
      <Hero />
      <Marquee />

      {/* O Sinal */}
      <section id="proposito" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-xs tracking-brand text-gold">O SINAL</p>
        <h2 className="mt-4 font-display text-3xl leading-snug md:text-4xl">
          Nascemos de uma inquietação: evangelizar não com palavras vazias, mas
          com gestos que ficam.
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-stone">
          Cada peça é um sinal discreto — uma conversa silenciosa entre quem veste
          e quem vê. Você não está sozinho.
        </p>
      </section>

      {/* Vitrine */}
      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">A Coleção</h2>
          <Link
            href="/loja"
            className="link-underline text-xs tracking-brand text-stone hover:text-ink"
          >
            VER TUDO
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="grid md:grid-cols-2">
        <div className="relative aspect-[4/5] md:aspect-auto">
          <Image src="/editorial.svg" alt="Editorial REBANHO" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-5 bg-ink px-8 py-20 text-bone md:px-16">
          <p className="text-xs tracking-brand text-gold">PROVADOR VIRTUAL</p>
          <h2 className="font-display text-4xl leading-tight">
            Veja a peça em você antes de vestir.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-bone/70">
            Suba uma foto e experimente nossas peças com inteligência artificial.
            Uma forma nova de encontrar o seu aceno.
          </p>
          <Link
            href="/provador"
            className="mt-2 inline-block w-fit border border-bone/50 px-8 py-4 text-xs tracking-brand hover:bg-bone hover:text-ink"
          >
            EXPERIMENTAR AGORA
          </Link>
        </div>
      </section>

      {/* Valores */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {[
            { t: "SIGNIFICADO", d: "Cada detalhe carrega um convite: você não está sozinho." },
            { t: "EXPERIÊNCIA", d: "Da embalagem ao pós-compra, um gesto de acolhimento." },
            { t: "IMPACTO REAL", d: "10% do lucro de cada venda vira cuidado em projetos sociais." },
            { t: "PARA TODOS", d: "Design sutil para esperar de braços abertos e ir ao encontro." },
          ].map((v) => (
            <div key={v.t} className="border-t border-ink pt-5">
              <h3 className="text-xs tracking-brand">{v.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{v.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
