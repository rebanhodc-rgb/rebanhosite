# AGENTS.md — Instruções para agentes de IA (Codex / Claude Code)

Projeto: **REBANHO** — e-commerce de moda cristã premium, nível Zara/Aramis, com provador virtual.

## Antes de começar
1. Leia `PLANO.md` (mapa do projeto e roadmap).
2. Para pagamento: `docs/ABACATE_PAY.md`. Para provador: `docs/PROVADOR_VIRTUAL.md`.

## Stack
Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Zustand + lucide-react.
Pagamento: Abacate Pay (Pix). Provador: API de try-on (Replicate/FASHN/FAL).

## Princípios de código
- **TypeScript estrito.** Tipos em `src/lib/types.ts`.
- **Componentes pequenos e reutilizáveis** em `src/components/`.
- **Server Components por padrão**; use `"use client"` só quando precisar (estado, eventos, animação).
- **Estética Zara**: minimalismo, muito espaço em branco, tipografia grande, fotos protagonistas,
  transições suaves (Framer Motion), mobile-first.
- **Não quebrar o que funciona.** Rode `npm run build` antes de considerar uma tarefa pronta.
- **Dados mock** ficam em `src/lib/products.ts` até existir CMS/DB. Não hardcode em componentes.
- Use o helper `cn()` (`src/lib/utils.ts`) para classes condicionais.
- Preços sempre em centavos no dado, formatados com `formatPrice()`.

## Identidade da marca
- Tom: fé, missão, acolhimento, sutileza. "A roupa fala por quem a veste."
- Paleta (ver `globals.css`): off-white, preto/grafite, dourado sutil como acento.
- Produtos atuais: Camisetas Cordis, Agnus, Fides, Veritas (R$149).

## Comandos
- `npm run dev` — desenvolvimento
- `npm run build` — valida produção (rode sempre antes de finalizar)
- `npm run lint`

## O que NÃO fazer
- Não adicionar Shopify (decisão: loja própria + Abacate Pay).
- Não commitar `.env.local` nem chaves.
- Não armazenar foto do usuário do provador sem aviso de LGPD.
