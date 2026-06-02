import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink py-14 text-ivory">
      <div className="container-x grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="serif text-3xl tracking-[0.18em]">REBANHO</p>
          <p className="subtitle mt-4 max-w-sm text-sm leading-6 text-ivory/65">A roupa fala por quem a veste. Moda com significado, fe sem rotulos e proposito real.</p>
        </div>
        <div className="grid gap-3 text-sm text-ivory/75">
          <Link href="/loja">Colecao</Link>
          <Link href="/proposito">Proposito</Link>
          <Link href="/experiencia">Experiencia</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div className="grid gap-3 text-sm text-ivory/75">
          <Link href="/politica-de-privacidade">Privacidade</Link>
          <Link href="/termos-de-uso">Termos de uso</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
