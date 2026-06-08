import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/frontend/components/brand/navbar";
import { Footer } from "@/frontend/components/brand/footer";
import { DonationImpact } from "@/frontend/components/brand/donation-impact";
import { DonationCard } from "@/frontend/components/brand/donation-card";

export const metadata = {
  title: "Propósito | REBANHO",
  description: "Evangelizar com gestos que ficam: 10% do lucro líquido de cada peça vai para os Vicentinos, a ABRACE ou o Crevin Lar dos Idosos — você escolhe."
};

export default function PropositoPage() {
  return (
    <main className="bg-ivory">
      <Navbar />

      <section className="container-x pt-16 pb-10 md:pt-24 md:pb-14">
        <span className="inline-flex items-center rounded-full border border-ink/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
          Propósito
        </span>
        <h1 className="serif mt-5 max-w-4xl text-[clamp(2.6rem,8vw,5rem)] leading-[0.95]">
          Evangelizar também é transformar presença em cuidado.
        </h1>
        <p className="subtitle mt-6 max-w-2xl text-base leading-7 text-ink/65">
          A REBANHO nasce para evangelizar não com palavras vazias, mas com gestos que ficam. Por isso reservamos
          <strong className="text-ink"> 10% do lucro líquido</strong> de cada pedido para três projetos sociais. Você escolhe
          onde esse aceno de esperança vai chegar.
        </p>
      </section>

      <section className="container-x pb-16 md:pb-24">
        <DonationImpact />
      </section>

      <section className="bg-ink py-16 text-ivory md:py-24">
        <div className="container-x">
          <span className="inline-flex items-center rounded-full border border-ivory/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/60">
            Como funciona
          </span>
          <h2 className="serif mt-5 max-w-3xl text-[clamp(2rem,5vw,3.2rem)] leading-tight">
            Do valor ao repasse: um gesto claro, concreto e rastreável.
          </h2>
          <div className="mt-10">
            <div className="rounded-[2rem] bg-ivory/[0.04] p-1.5 ring-1 ring-ivory/10">
              <div className="rounded-[calc(2rem-0.375rem)] bg-ivory p-2 text-ink">
                <DonationCard />
              </div>
            </div>
          </div>

          <Link
            href="/loja"
            className="group mt-12 inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-transform duration-500 active:scale-[0.98]"
            style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
          >
            Escolher um gesto
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-[1px]">
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
