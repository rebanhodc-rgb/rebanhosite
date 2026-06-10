import Link from "next/link";

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#eee7db]">
      <div className="container-x grid gap-8 py-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg bg-ink p-5 text-ivory">
          <p className="serif text-2xl tracking-[0.15em]">REBANHO</p>
          <nav className="mt-8 grid gap-3 text-sm text-ivory/75">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/produtos">Produtos</Link>
            <Link href="/admin/pedidos">Pedidos</Link>
            <Link href="/admin/cupons">Cupons</Link>
            <Link href="/admin/leads">Leads</Link>
            <Link href="/admin/doacoes">Doacoes</Link>
            <Link href="/admin/configuracoes">Configuracoes</Link>
          </nav>
        </aside>
        <section>
          <h1 className="serif text-6xl">{title}</h1>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
