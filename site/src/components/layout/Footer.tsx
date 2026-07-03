import Link from "next/link";

export default function Footer() {
  return (
    <footer id="sobre" className="border-t border-line bg-bone">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-3xl tracking-[0.2em]">REBANHO</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
              A roupa fala por quem a veste. Um aceno de fé, beleza e missão para
              o cotidiano.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-brand text-ink">NAVEGAR</h4>
            <ul className="mt-4 space-y-2 text-sm text-stone">
              <li><Link href="/loja" className="link-underline">Loja</Link></li>
              <li><Link href="/provador" className="link-underline">Provador virtual</Link></li>
              <li><Link href="/home#proposito" className="link-underline">Propósito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-brand text-ink">ENTRE PARA A ESPERA</h4>
            <form className="mt-4 flex border-b border-ink/30">
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-stone/60"
              />
              <button className="text-xs tracking-brand">ENVIAR</button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-stone md:flex-row">
          <p>© {new Date().getFullYear()} REBANHO. Todos os direitos reservados.</p>
          <p className="tracking-brand">SUTIL · PREMIUM · MISSIONÁRIA</p>
        </div>
      </div>
    </footer>
  );
}
