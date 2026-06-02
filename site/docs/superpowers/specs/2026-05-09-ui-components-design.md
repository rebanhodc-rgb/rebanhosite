# Fase 1 — UI Components: Design Spec

**Data:** 2026-05-09  
**Projeto:** REBANHO Site (Next.js 14)  
**Escopo:** Integração de 8 componentes de UI externos nas páginas existentes

---

## Contexto

O site REBANHO é um e-commerce de moda católica com estética editorial: paleta ink/gold/ivory/copper, tipografia serif + subtitle uppercase, Framer Motion já instalado. Nenhuma nova infraestrutura é necessária — todos os componentes são puramente presentacionais.

---

## Componentes e Posicionamento

### 1. Confetti (magicui)
- **Página:** `/checkout`
- **Posição:** Disparado no momento em que o pedido é confirmado (step 3, após API retornar sucesso)
- **Adaptação:** Cores gold/ivory sobre fundo ink, cobrindo a viewport
- **Arquivo:** `frontend/components/ui/confetti.tsx`

### 2. Staggered Menu (reactbits)
- **Página:** Navbar — menu mobile
- **Posição:** Substitui a entrada estática dos links no overlay mobile
- **Adaptação:** Cada link entra com stagger delay de 60ms, fonte subtitle uppercase tracking largo
- **Arquivo:** `frontend/components/brand/staggered-menu.tsx`

### 3. Images Badge (aceternity)
- **Página:** `/produto/[slug]`
- **Posição:** Overlay nas imagens do `ProductGallery`
- **Adaptação:** Badge com categoria do produto e "Edição Limitada" em copper/ivory
- **Arquivo:** `frontend/components/product/images-badge.tsx`

### 4. 3D Drifting Marquee (satisui)
- **Página:** `/` (pré-lançamento)
- **Posição:** Faixa abaixo do countdown, acima da newsletter, substituindo a divisória de "Sutil · Premium · Missionária"
- **Conteúdo:** "Sutil · Premium · Missionária · Fé · Missão · Comunidade ·"
- **Adaptação:** Paleta gold/ivory sobre fundo ink transparente
- **Arquivo:** `frontend/components/brand/drifting-marquee.tsx`

### 5. Story Carousel (satisui)
- **Página:** `/marca`
- **Posição:** Nova seção entre o hero e a grade de produtos
- **Conteúdo:** "O Sinal", "A Espera", "A Veste", "O Gesto" — os mesmos cards do FlipStack da home
- **Adaptação:** Borda gold, tipografia serif nos títulos, fundo cream
- **Arquivo:** `frontend/components/brand/story-carousel.tsx`

### 6. Circular Gallery (satisui)
- **Página:** `/loja`
- **Posição:** Seção de destaque acima da grade de produtos
- **Conteúdo:** Imagens dos produtos do catálogo estático
- **Adaptação:** Ring em gold, imagens com aspect-ratio de produto
- **Arquivo:** `frontend/components/product/circular-gallery.tsx`

### 7. Card Nav (reactbits)
- **Página:** Navbar desktop — overlay fullscreen
- **Posição:** Ativado por botão no header desktop; Loja, Propósito, Experiência, Sobre aparecem como cards com imagem de fundo
- **Adaptação:** Imagens do catálogo como fundos, overlay ink/60%, texto ivory serif
- **Arquivo:** `frontend/components/brand/card-nav.tsx`

### 8. Interactive Book (vengenceui)
- **Página:** `/produto/[slug]`
- **Posição:** Seção "Significado" abaixo da galeria, apresentando `product.symbolicMeaning` como livro interativo
- **Adaptação:** Capa em ink/gold, páginas em ivory com tipografia serif
- **Arquivo:** `frontend/components/product/interactive-book.tsx`

---

## Arquitetura

- Todos os componentes em `frontend/components/` no subdiretório correto
- Paleta aplicada via tokens Tailwind do projeto: `text-gold`, `bg-ink`, `text-ivory`, `text-copper`
- Framer Motion (já instalado) usado para animações
- Nenhuma nova rota de API, nenhuma alteração de banco de dados
- Componentes externos adaptados — nunca usam sistema de cores próprio

## Ordem de implementação

1. Confetti → `/checkout`
2. Staggered Menu → Navbar mobile
3. Images Badge → `ProductGallery`
4. 3D Drifting Marquee → `/`
5. Story Carousel → `/marca`
6. Circular Gallery → `/loja`
7. Card Nav → Navbar desktop
8. Interactive Book → `/produto/[slug]`

## Rollout

Cada componente é um arquivo isolado. Se um apresentar problema, os demais não são afetados. Novos componentes são importados nas páginas existentes sem refatorar código existente.

## Fora do escopo

- Dados dinâmicos para os componentes (catálogo estático ou conteúdo hardcoded)
- Testes automatizados (verificação visual no browser)
- Animações customizadas além da adaptação de paleta
