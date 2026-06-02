import { Navbar } from "@/frontend/components/brand/navbar";
import { Footer } from "@/frontend/components/brand/footer";

export function SimplePage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <main>
      <Navbar />
      <section className="container-x min-h-[60vh] py-16">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-copper">{eyebrow}</p>
        <h1 className="serif mt-4 max-w-3xl text-6xl leading-tight">{title}</h1>
        <div className="mt-8 max-w-3xl space-y-5 leading-8 text-ink/70">{children}</div>
      </section>
      <Footer />
    </main>
  );
}
