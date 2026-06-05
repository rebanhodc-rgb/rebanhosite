import Link from "next/link";
import { Sparkles } from "lucide-react";
import { NewsletterForm } from "@/frontend/components/brand/newsletter-form";
import { LaunchCountdown } from "@/frontend/components/brand/launch-countdown";
import { StaffAccess } from "@/frontend/components/brand/staff-access";
import { FlipStack } from "@/frontend/components/ui/flip-stack";
import { LustreText } from "@/frontend/components/ui/lustre-text";
import { DriftingMarquee } from "@/frontend/components/brand/drifting-marquee";

const cards = [
  {
    id: 1,
    title: "O sinal",
    caption: "um detalhe reconhece outro",
    image: "/images/rebanho-logo-ouro.png"
  },
  {
    id: 2,
    title: "A espera",
    caption: "nem tudo precisa ser dito",
    image: "/images/rebanho-frase-misterio.png"
  },
  {
    id: 3,
    title: "A veste",
    caption: "fé sem rótulos",
    image: "/images/rebanho-campo-camiseta.png"
  },
  {
    id: 4,
    title: "O gesto",
    caption: "10% do lucro para 3 projetos sociais",
    image: "/images/rebanho-tipografia-etiqueta.png"
  }
];

export default function LaunchPage() {
  return (
    <main className="relative h-dvh overflow-hidden bg-ink text-ivory">
      <img src="/images/rebanho-campo-camiseta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_10%,rgba(215,198,163,0.22),transparent_30%),linear-gradient(105deg,#0f1a17_0%,rgba(15,26,23,0.96)_48%,rgba(15,26,23,0.72)_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#d7c6a3_0.8px,transparent_0.8px)] [background-size:10px_10px]" />

      <header className="relative z-10 mx-auto flex h-14 w-[min(1240px,calc(100%_-_32px))] items-center justify-between sm:h-16">
        <Link href="/" className="flex items-center gap-3">
          <Sparkles size={19} className="text-gold" />
          <span className="serif text-xl tracking-[0.18em] text-gold sm:text-2xl lg:text-3xl">REBANHO</span>
        </Link>
        <span className="subtitle hidden text-xs font-bold uppercase tracking-[0.24em] text-gold/60 md:block">Lançamento em breve</span>
      </header>

      <section className="relative z-10 mx-auto grid h-[calc(100dvh-56px)] w-[min(1240px,calc(100%_-_32px))] items-center gap-5 pb-3 sm:h-[calc(100dvh-64px)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)] lg:gap-14 lg:pb-5">
        <div className="min-w-0">
          <p className="subtitle text-[10px] font-bold uppercase leading-4 tracking-[0.28em] text-gold/78 sm:text-xs sm:tracking-[0.32em]">Lançamento oficial em 1 de agosto de 2026</p>
          <h1 className="serif mt-3 max-w-5xl text-[clamp(2.35rem,12vw,4.2rem)] leading-[0.9] tracking-[0.02em] sm:mt-4 sm:text-[clamp(3.2rem,7vw,4.5rem)] lg:mt-4">
            <LustreText text="Elas ouvirão a minha voz, e haverá um só rebanho e um só pastor." />
          </h1>
          <p className="subtitle mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-gold/62 sm:text-xs">João 10:16</p>

          <div className="mt-5 max-w-3xl sm:mt-6 lg:mt-6">
            <LaunchCountdown />
          </div>

          <div className="mt-4 grid max-w-3xl gap-3 sm:mt-5 md:grid-cols-[minmax(0,1fr)_300px] md:items-start lg:mt-5 lg:gap-4">
            <NewsletterForm dark />
            <StaffAccess />
          </div>

          <DriftingMarquee className="border-y border-gold/20 bg-ink" />
        </div>

        <div className="hidden pb-8 lg:block lg:pb-0">
          <FlipStack cards={cards} />
        </div>
      </section>
    </main>
  );
}
