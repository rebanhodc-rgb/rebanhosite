import Link from "next/link";

export default function PedidoConcluidoPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 pt-24 text-center md:px-8">
      <p className="text-xs tracking-brand text-gold">PAGAMENTO RECEBIDO</p>
      <h1 className="mt-3 font-display text-5xl">Seu aceno está a caminho.</h1>
      <p className="mt-5 text-sm leading-relaxed text-stone">
        Obrigado por vestir a missão. Você receberá as atualizações do pedido por e-mail.
      </p>
      <Link
        href="/loja"
        className="mt-8 border border-ink px-8 py-4 text-xs tracking-brand hover:bg-ink hover:text-bone"
      >
        VOLTAR À LOJA
      </Link>
    </div>
  );
}
