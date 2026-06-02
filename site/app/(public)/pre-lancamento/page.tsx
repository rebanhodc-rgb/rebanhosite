import { NewsletterForm } from "@/frontend/components/brand/newsletter-form";

export default function PreLancamentoPage() {
  return (
    <main className="editorial-noise brand-panel min-h-screen bg-ink text-ivory">
      <section className="container-x grid min-h-screen items-center gap-12 py-16 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="serif text-3xl tracking-[0.2em] text-gold">REBANHO</p>
          <h1 className="serif mt-10 text-6xl leading-[0.95] text-gold md:text-8xl">Nem tudo precisa ser dito para ser entendido.</h1>
          <p className="subtitle mt-7 max-w-xl text-lg leading-8 text-ivory/70">Uma marca para vestir aquilo que voce acredita, sem precisar explicar.</p>
          <div className="mt-9">
            <NewsletterForm dark />
          </div>
          <p className="subtitle mt-6 text-xs uppercase tracking-[0.25em] text-gold">Em breve</p>
        </div>
        <div className="min-h-[560px] overflow-hidden rounded-md border border-white/10">
          <img src="/images/rebanho-frase-misterio.png" alt="Frase manifesto REBANHO" className="h-full min-h-[560px] w-full object-cover opacity-90" />
        </div>
      </section>
    </main>
  );
}
