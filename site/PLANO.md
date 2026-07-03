# PLANO — E-commerce REBANHO

> Documento mestre do projeto. **Leia isto primeiro** antes de codar qualquer coisa.
> Marca: REBANHO — "A roupa fala por quem a veste". Moda cristã premium, fé/missão.
> Objetivo: e-commerce nível **Zara / Aramis**, com **provador virtual (virtual try-on)**.

---

## 1. Visão

Construir uma loja online de roupas com:
- Estética minimalista e cinematográfica (referência: Zara).
- Storytelling de produto e lookbooks (referência: Aramis).
- **Provador virtual com IA** (referência: Aramis) — o usuário sobe uma foto e "veste" a peça.
- Pagamento via **Pix (Abacate Pay)**.

## 2. Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Framework | Next.js 14+ (App Router) + React + TypeScript | ✅ instalado |
| Estilo | Tailwind CSS v4 | ✅ instalado |
| Animação | Framer Motion | ✅ instalado |
| Ícones | lucide-react | ✅ instalado |
| Estado (carrinho) | Zustand | ✅ instalado |
| Pagamento | **Abacate Pay** (Pix) — REST API | 🔜 a integrar |
| Provador virtual | API de try-on (IDM-VTON via Replicate/FAL **ou** FASHN AI) | 🔜 a integrar |
| Hospedagem | Vercel (deploy via GitHub `Andrefbom/rebanhoDep`) | 🔜 |
| Imagens | next/image (otimização nativa) | ✅ |

### Decisão de arquitetura: loja própria + Abacate Pay
Não usamos Shopify. Construímos a loja inteira (catálogo, carrinho, checkout) e usamos
o **Abacate Pay** só como gateway de pagamento (Pix). Mais barato e com controle total.
Custo: estoque/pedidos ficam por nossa conta (resolver com DB + painel admin simples).

## 3. Roadmap (fases)

- [x] **Fase 0 — Fundação**: scaffold Next.js, Tailwind, libs, docs, design system.
- [~] **Fase 1 — Vitrine**: home cinematográfica, listagem (PLP), produto (PDP),
  carrinho lateral, header/nav fullscreen, footer. (dados mock por enquanto)
- [ ] **Fase 2 — Conversão**: checkout + Abacate Pay (Pix), conta do cliente, pedidos.
- [ ] **Fase 3 — Provador Virtual**: integrar API de try-on na UI já pronta.
- [ ] **Fase 4 — Refino & Launch**: SEO, performance (Lighthouse 90+), admin, deploy.

## 4. Estrutura de pastas

```
src/
  app/                  # rotas (App Router)
    page.tsx            # Launch gate / página de espera com chave staff
    home/page.tsx       # HOME cinematográfica liberada após acesso
    loja/page.tsx       # PLP (listagem de produtos)
    produto/[slug]/     # PDP (página de produto)
    provador/page.tsx   # Provador virtual
    layout.tsx          # layout raiz (header + footer + cart drawer)
    globals.css         # design tokens REBANHO
  components/           # componentes reutilizáveis
    layout/             # Header, Footer, MobileMenu
    product/            # ProductCard, ProductGallery, SizePicker
    cart/               # CartDrawer
    tryon/              # VirtualTryOn (UI pronta p/ plugar API)
    ui/                 # botões, inputs base
  lib/                  # helpers, store (zustand), tipos
    types.ts            # tipos TS (Product, CartItem, etc)
    products.ts         # DADOS MOCK dos produtos
    cart-store.ts       # estado do carrinho (zustand)
    utils.ts            # cn(), formatPrice(), etc
```

## 5. Próximos passos para o agente de IA

1. **Fase 2 - Pagamento**: ler `docs/ABACATE_PAY.md`, criar rota `app/api/checkout` que
   gera cobrança Pix. Variáveis em `.env.local` (ver `.env.example`).
2. **Fase 3 - Provador**: a UI já existe em `components/tryon/`. Criar rota
   `app/api/tryon` que chama a API escolhida. Ver `docs/PROVADOR_VIRTUAL.md`.
3. **Produtos reais**: trocar `lib/products.ts` (mock) por CMS ou DB.
4. **Imagens**: substituir placeholders em `public/products/` por fotos reais.

## 6. Comandos

```bash
npm run dev     # ambiente de desenvolvimento (http://localhost:3000)
npm run build   # build de produção
npm run lint    # checagem
```
