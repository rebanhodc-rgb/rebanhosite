export function CheckoutStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/55 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm text-ivory">{number}</span>
        <h2 className="serif text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
