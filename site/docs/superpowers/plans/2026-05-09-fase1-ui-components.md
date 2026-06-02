# Fase 1 — UI Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar 8 componentes de UI externos nas páginas existentes do site REBANHO, seguindo a paleta ink/gold/ivory/copper e usando Framer Motion.

**Architecture:** Cada componente é um arquivo isolado em `frontend/components/`. Nenhuma nova rota de API ou banco de dados. Componentes puramente presentacionais adaptados para a paleta do projeto.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v3, Framer Motion v11, motion (pacote separado), embla-carousel-react, gsap/@gsap/react, canvas-confetti

---

## Task 0: Setup — Instalar dependências e criar utilitário `cn`

**Files:**
- Modify: `package.json` (via npm install)
- Create: `shared/cn.ts`

- [ ] **Step 1: Instalar dependências faltantes**

```bash
cd site && npm install canvas-confetti motion embla-carousel-react gsap @gsap/react && npm install -D @types/canvas-confetti
```

Saída esperada: `added N packages` sem erros.

- [ ] **Step 2: Verificar que `shared/cn.ts` não existe**

```bash
ls site/shared/cn.ts 2>/dev/null || echo "não existe"
```

Esperado: `não existe`

- [ ] **Step 3: Criar `shared/cn.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | tail -20
```

Esperado: `Route (app)` listando as rotas, sem erros TypeScript.

- [ ] **Step 5: Commit**

```bash
cd site && git add package.json package-lock.json shared/cn.ts && git commit -m "chore: add ui deps (canvas-confetti, motion, embla-carousel, gsap) and cn util"
```

---

## Task 1: Confetti — `/checkout` após pedido confirmado

**Files:**
- Create: `frontend/components/ui/confetti.tsx`
- Modify: `app/(public)/checkout/page.tsx`

- [ ] **Step 1: Criar `frontend/components/ui/confetti.tsx`**

```typescript
"use client";

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiCreateTypes,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

interface ConfettiRef {
  fire: (options?: ConfettiOptions) => void;
}

const ConfettiContext = createContext<ConfettiCreateTypes | null>(null);

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithoutRef<"canvas"> & { options?: ConfettiGlobalOptions }>(
  ({ options, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const confettiRef = useRef<ConfettiCreateTypes | null>(null);

    useEffect(() => {
      if (canvasRef.current) {
        confettiRef.current = confetti.create(canvasRef.current, {
          resize: true,
          useWorker: true,
          ...options,
        });
      }
      return () => {
        confettiRef.current?.reset();
      };
    }, [options]);

    const fire = useCallback((opts?: ConfettiOptions) => {
      confettiRef.current?.({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#D7C6A3", "#F7F3EB", "#8B3E2F", "#6E8D81"],
        ...opts,
      });
    }, []);

    useImperativeHandle(ref, () => ({ fire }), [fire]);

    return (
      <ConfettiContext.Provider value={confettiRef.current}>
        <canvas ref={canvasRef} {...props} />
      </ConfettiContext.Provider>
    );
  }
);

Confetti.displayName = "Confetti";

export { Confetti, type ConfettiRef };
export function useConfetti() {
  return useContext(ConfettiContext);
}
```

- [ ] **Step 2: Ler `app/(public)/checkout/page.tsx` para ver o estado atual**

Localizar: onde `setMessage(...)` é chamado com resposta de sucesso e onde o JSX é renderizado.

- [ ] **Step 3: Adicionar Confetti ao checkout**

No topo do arquivo, adicionar import:
```typescript
import { useRef } from "react";
import { Confetti, type ConfettiRef } from "@/frontend/components/ui/confetti";
```

Dentro do componente, antes do return:
```typescript
const confettiRef = useRef<ConfettiRef>(null);
```

No bloco onde `response.ok` é `true` (após `setMessage`), adicionar:
```typescript
confettiRef.current?.fire();
```

No JSX, antes do fechamento da tag raiz:
```tsx
<Confetti
  ref={confettiRef}
  className="pointer-events-none fixed inset-0 z-50 h-full w-full"
/>
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

Esperado: sem erros TypeScript.

- [ ] **Step 5: Commit**

```bash
cd site && git add frontend/components/ui/confetti.tsx app/\(public\)/checkout/page.tsx && git commit -m "feat: add confetti on order confirmation"
```

---

## Task 2: Staggered Menu — Navbar mobile

**Files:**
- Create: `frontend/components/brand/mobile-menu.tsx`
- Modify: `frontend/components/brand/navbar.tsx`

- [ ] **Step 1: Ler `frontend/components/brand/navbar.tsx`**

Verificar: props atuais (especialmente `dark`), links existentes, estrutura do JSX.

- [ ] **Step 2: Criar `frontend/components/brand/mobile-menu.tsx`**

```typescript
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const LINKS = [
  { label: "Loja", href: "/loja" },
  { label: "Propósito", href: "/marca" },
  { label: "Experiência", href: "/produto/cordis" },
  { label: "Conta", href: "/conta" },
];

interface MobileMenuProps {
  dark?: boolean;
}

export function MobileMenu({ dark = false }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className={`flex flex-col gap-1.5 p-2 md:hidden ${
          dark ? "text-gold" : "text-ink"
        }`}
      >
        <motion.span
          animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          className="block h-px w-6 bg-current origin-center"
        />
        <motion.span
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          className="block h-px w-6 bg-current"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          className="block h-px w-6 bg-current origin-center"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink"
            onClick={() => setOpen(false)}
          >
            {LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className="block py-4 font-subtitle text-2xl uppercase tracking-widest text-ivory hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 3: Adicionar `<MobileMenu>` na navbar**

Na navbar, importar:
```typescript
import { MobileMenu } from "@/frontend/components/brand/mobile-menu";
```

No JSX da navbar, dentro do header, adicionar após o logo (ou onde fizer sentido visualmente):
```tsx
<MobileMenu dark={dark} />
```

O botão já tem `md:hidden` — o overlay cobre toda a viewport.

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd site && git add frontend/components/brand/mobile-menu.tsx frontend/components/brand/navbar.tsx && git commit -m "feat: staggered mobile menu with framer-motion"
```

---

## Task 3: Images Badge — ProductGallery em `/produto/[slug]`

**Files:**
- Create: `frontend/components/product/images-badge.tsx`
- Modify: `frontend/components/product/product-gallery.tsx`
- Modify: `app/(public)/produto/[slug]/page.tsx`

- [ ] **Step 1: Criar `frontend/components/product/images-badge.tsx`**

```typescript
"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/cn";

interface ImagesBadgeProps {
  category: string;
  limited?: boolean;
  className?: string;
}

export function ImagesBadge({ category, limited = false, className }: ImagesBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn(
        "absolute bottom-3 left-3 z-10 flex items-center gap-2",
        className
      )}
    >
      <span className="rounded-full bg-ink/80 px-3 py-1 font-subtitle text-xs uppercase tracking-widest text-gold backdrop-blur-sm">
        {category}
      </span>
      {limited && (
        <span className="rounded-full bg-copper/90 px-3 py-1 font-subtitle text-xs uppercase tracking-widest text-ivory backdrop-blur-sm">
          Edição Limitada
        </span>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Ler `frontend/components/product/product-gallery.tsx`**

Verificar: props atuais, estrutura do container da imagem principal.

- [ ] **Step 3: Adicionar `category` prop e `ImagesBadge` ao ProductGallery**

Adicionar `category` na interface de props:
```typescript
interface ProductGalleryProps {
  images: string[];
  name: string;
  category: string;
}
```

Importar e usar:
```typescript
import { ImagesBadge } from "@/frontend/components/product/images-badge";
```

No container da imagem principal, adicionar `relative` se não tiver, e inserir:
```tsx
<ImagesBadge category={category} />
```

- [ ] **Step 4: Ler `app/(public)/produto/[slug]/page.tsx`**

Verificar: como `product` é passado ao `ProductGallery`.

- [ ] **Step 5: Passar `category` no uso de `ProductGallery`**

Onde `<ProductGallery>` é usado na página:
```tsx
<ProductGallery
  images={product.images}
  name={product.name}
  category={product.line ?? "Camiseta"}
/>
```

Verificar o tipo correto do campo de categoria no `catalog.ts` — usar `product.line` ou `"Camiseta"` como fallback.

- [ ] **Step 6: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 7: Commit**

```bash
cd site && git add frontend/components/product/images-badge.tsx frontend/components/product/product-gallery.tsx "app/(public)/produto/[slug]/page.tsx" && git commit -m "feat: images badge on product gallery"
```

---

## Task 4: 3D Drifting Marquee — Home pré-lançamento

**Files:**
- Create: `frontend/components/brand/drifting-marquee.tsx`
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Criar `frontend/components/brand/drifting-marquee.tsx`**

> Atenção: este componente usa `motion/react` (pacote `motion`) — NÃO `framer-motion`. Ambos podem coexistir.

```typescript
"use client";

import {
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  motion,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/shared/cn";

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

interface DriftingMarqueeProps {
  text?: string;
  baseVelocity?: number;
  className?: string;
}

export function DriftingMarquee({
  text = "Sutil · Premium · Missionária · Fé · Missão · Comunidade ·",
  baseVelocity = 3,
  className,
}: DriftingMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("overflow-hidden py-4", className)}>
      <motion.div
        style={{ x }}
        className="flex whitespace-nowrap gap-8"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="font-subtitle text-sm uppercase tracking-widest text-gold opacity-80"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Ler `app/(public)/page.tsx`**

Localizar: a seção estática "Sutil · Premium · Missionária" para substituir.

- [ ] **Step 3: Substituir a divisória estática pelo DriftingMarquee**

Importar:
```typescript
import { DriftingMarquee } from "@/frontend/components/brand/drifting-marquee";
```

Substituir o elemento estático (ex: `<p>Sutil · Premium · Missionária</p>` ou `<div>...`) por:
```tsx
<DriftingMarquee className="border-y border-gold/20 bg-ink" />
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd site && git add frontend/components/brand/drifting-marquee.tsx "app/(public)/page.tsx" && git commit -m "feat: 3d drifting marquee on home pre-launch page"
```

---

## Task 5: Story Carousel — `/marca`

**Files:**
- Create: `frontend/components/ui/carousel.tsx` (wrapper embla)
- Create: `frontend/components/brand/story-carousel.tsx`
- Modify: `app/(public)/marca/page.tsx`

- [ ] **Step 1: Criar `frontend/components/ui/carousel.tsx`**

Este componente substitui a dependência `@/components/ui/carousel` do shadcn — implementado diretamente com embla-carousel-react.

```typescript
"use client";

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/shared/cn";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within a <Carousel />");
  return ctx;
}

const Carousel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", opts, plugins, setApi, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => { api.off("reInit", onSelect); api.off("select", onSelect); };
  }, [api, onSelect]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <CarouselContext.Provider value={{ carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();
    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        />
      </div>
    );
  }
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
        {...props}
      />
    );
  }
);
CarouselItem.displayName = "CarouselItem";

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, useCarousel };
```

- [ ] **Step 2: Criar `frontend/components/brand/story-carousel.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/cn";

const STORIES = [
  {
    id: "sinal",
    title: "O Sinal",
    content:
      "Nascemos de uma inquietação: a fé que transforma precisa de uma linguagem que alcance o cotidiano. Cada peça é um sinal discreto — uma conversa silenciosa entre quem veste e quem vê.",
  },
  {
    id: "espera",
    title: "A Espera",
    content:
      "Há uma beleza singular na espera ativa. Não a estagnação, mas o cultivo paciente de algo maior. REBANHO nasceu nesse espaço — entre o que é e o que pode ser.",
  },
  {
    id: "veste",
    title: "A Veste",
    content:
      "Cada peça carrega um significado que vai além do tecido. É uma declaração silenciosa, uma escolha intencional de como você se apresenta ao mundo — com fé, com propósito, com beleza.",
  },
  {
    id: "gesto",
    title: "O Gesto",
    content:
      "Vestir é um gesto de identidade. Quando você escolhe REBANHO, você escolhe pertencer a algo maior — uma comunidade que acredita que a beleza e a fé caminham juntas.",
  },
];

export function StoryCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-16 px-4 bg-cream">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-8 justify-center">
          {STORIES.map((story, i) => (
            <button
              key={story.id}
              onClick={() => setActive(i)}
              className={cn(
                "px-4 py-2 font-subtitle text-xs uppercase tracking-widest transition-colors border",
                active === i
                  ? "border-gold bg-ink text-gold"
                  : "border-gold/30 text-ink hover:border-gold"
              )}
            >
              {story.title}
            </button>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-none border border-gold/30 bg-ivory p-10 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="font-display text-2xl text-ink mb-4">
                {STORIES[active].title}
              </h3>
              <p className="font-body text-base leading-relaxed text-ink/80">
                {STORIES[active].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Ler `app/(public)/marca/page.tsx`**

Localizar: onde inserir o StoryCarousel (entre o hero e a grade de produtos).

- [ ] **Step 4: Adicionar `<StoryCarousel />` na página `/marca`**

Importar:
```typescript
import { StoryCarousel } from "@/frontend/components/brand/story-carousel";
```

Inserir após o hero e antes da grade de produtos:
```tsx
<StoryCarousel />
```

- [ ] **Step 5: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 6: Commit**

```bash
cd site && git add frontend/components/ui/carousel.tsx frontend/components/brand/story-carousel.tsx "app/(public)/marca/page.tsx" && git commit -m "feat: story carousel on /marca page"
```

---

## Task 6: Circular Gallery — `/loja`

**Files:**
- Create: `frontend/components/product/circular-gallery.tsx`
- Modify: `app/(public)/loja/page.tsx`

- [ ] **Step 1: Criar `frontend/components/product/circular-gallery.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/shared/cn";

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  image: string;
  title: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
  className?: string;
}

export function CircularGallery({ items, className }: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!trackRef.current || !containerRef.current) return;

    const cards = trackRef.current.querySelectorAll<HTMLDivElement>(".gallery-card");
    const total = cards.length;
    const angleStep = 360 / total;
    const radius = 320;

    cards.forEach((card, i) => {
      const angle = angleStep * i;
      const rad = (angle * Math.PI) / 180;
      const x = Math.sin(rad) * radius;
      const z = Math.cos(rad) * radius;
      gsap.set(card, { x, z, rotateY: -angle });
    });

    gsap.to(trackRef.current, {
      rotateY: 360,
      duration: 20,
      ease: "none",
      repeat: -1,
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      onUpdate: (self) => {
        gsap.to(trackRef.current, {
          rotateY: `+=${self.getVelocity() * 0.02}`,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      },
    });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={cn("relative h-[420px] overflow-hidden flex items-center justify-center", className)}
      style={{ perspective: "1200px" }}
    >
      <div
        ref={trackRef}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="gallery-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-full h-full border border-gold/30 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Ler `app/(public)/loja/page.tsx` e `shared/catalog.ts`**

Verificar: estrutura da página loja e campos de imagem no catálogo.

- [ ] **Step 3: Adicionar `<CircularGallery />` em `/loja`**

Importar:
```typescript
import { CircularGallery } from "@/frontend/components/product/circular-gallery";
import { catalog } from "@/shared/catalog";
```

Preparar os items:
```typescript
const galleryItems = catalog.map((p) => ({
  image: p.images[0],
  title: p.name,
}));
```

Inserir acima do SectionTitle (ou no início do conteúdo):
```tsx
<CircularGallery items={galleryItems} className="mb-16" />
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd site && git add frontend/components/product/circular-gallery.tsx "app/(public)/loja/page.tsx" && git commit -m "feat: circular gallery on /loja page"
```

---

## Task 7: Card Nav — Navbar desktop

**Files:**
- Create: `frontend/components/brand/card-nav.tsx`
- Modify: `frontend/components/brand/navbar.tsx`

- [ ] **Step 1: Criar `frontend/components/brand/card-nav.tsx`**

```typescript
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { catalog } from "@/shared/catalog";

const NAV_CARDS = [
  { label: "Loja", href: "/loja", image: catalog[0]?.images[0] ?? "" },
  { label: "Propósito", href: "/marca", image: catalog[1]?.images[0] ?? "" },
  { label: "Experiência", href: `/produto/${catalog[2]?.slug ?? ""}`, image: catalog[2]?.images[0] ?? "" },
  { label: "Sobre", href: "/marca", image: catalog[3]?.images[0] ?? "" },
];

interface CardNavProps {
  dark?: boolean;
}

export function CardNav({ dark = false }: CardNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`hidden md:flex font-subtitle text-xs uppercase tracking-widest transition-colors ${
          dark ? "text-ivory hover:text-gold" : "text-ink hover:text-gold"
        }`}
      >
        Menu
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink"
            onClick={() => setOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-6 right-6 font-subtitle text-xs uppercase tracking-widest text-ivory/60 hover:text-ivory"
              onClick={() => setOpen(false)}
            >
              Fechar
            </motion.button>

            <div className="grid grid-cols-4 gap-4 max-w-5xl px-8 w-full">
              {NAV_CARDS.map((card, i) => (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={card.href}
                    className="group relative block overflow-hidden aspect-[3/4] border border-gold/20"
                    onClick={() => setOpen(false)}
                  >
                    {card.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.image}
                        alt={card.label}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink/60 group-hover:bg-ink/40 transition-colors" />
                    <div className="absolute bottom-4 left-4">
                      <span className="font-display text-xl text-ivory">{card.label}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Adicionar `<CardNav />` na navbar**

Importar:
```typescript
import { CardNav } from "@/frontend/components/brand/card-nav";
```

No JSX da navbar (visível apenas em desktop — `hidden md:flex`):
```tsx
<CardNav dark={dark} />
```

Posicionar junto dos outros links de navegação desktop (se existirem) ou próximo ao logo.

- [ ] **Step 3: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 4: Commit**

```bash
cd site && git add frontend/components/brand/card-nav.tsx frontend/components/brand/navbar.tsx && git commit -m "feat: card nav overlay on desktop navbar"
```

---

## Task 8: Interactive Book — `/produto/[slug]`

**Files:**
- Create: `frontend/components/product/interactive-book.tsx`
- Modify: `app/(public)/produto/[slug]/page.tsx`

- [ ] **Step 1: Criar `frontend/components/product/interactive-book.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/cn";

interface BookPage {
  title: string;
  content: string;
}

interface InteractiveBookProps {
  pages: BookPage[];
  className?: string;
}

export function InteractiveBook({ pages, className }: InteractiveBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
  };

  const prev = () => { if (currentPage > 0) goTo(currentPage - 1); };
  const next = () => { if (currentPage < pages.length - 1) goTo(currentPage + 1); };

  return (
    <div className={cn("relative max-w-2xl mx-auto", className)}>
      <div
        className="relative overflow-hidden border border-gold/40 bg-ivory shadow-2xl"
        style={{ minHeight: "320px", perspective: "1200px" }}
      >
        {/* Capa */}
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-ink/20 to-transparent pointer-events-none z-10" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                rotateY: dir > 0 ? 90 : -90,
                opacity: 0,
                transformOrigin: dir > 0 ? "left center" : "right center",
              }),
              center: {
                rotateY: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                rotateY: dir > 0 ? -90 : 90,
                opacity: 0,
                transformOrigin: dir > 0 ? "right center" : "left center",
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-10"
          >
            <p className="font-subtitle text-xs uppercase tracking-widest text-gold mb-6">
              {String(currentPage + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
            </p>
            <h3 className="font-display text-2xl text-ink mb-4">
              {pages[currentPage].title}
            </h3>
            <p className="font-body text-base leading-relaxed text-ink/80">
              {pages[currentPage].content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={prev}
          disabled={currentPage === 0}
          className="font-subtitle text-xs uppercase tracking-widest text-ink/60 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>
        <div className="flex gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i === currentPage ? "bg-gold" : "bg-ink/20 hover:bg-ink/40"
              )}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={currentPage === pages.length - 1}
          className="font-subtitle text-xs uppercase tracking-widest text-ink/60 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Ler `app/(public)/produto/[slug]/page.tsx` e `shared/catalog.ts`**

Verificar: campos `symbolicMeaning` e `description` disponíveis em cada produto.

- [ ] **Step 3: Adicionar seção "O Significado" com `<InteractiveBook />` na página de produto**

Importar:
```typescript
import { InteractiveBook } from "@/frontend/components/product/interactive-book";
```

Preparar os dados (após obter `product`):
```typescript
const bookPages = [
  {
    title: "O Significado",
    content: product.symbolicMeaning,
  },
  {
    title: "A Peça",
    content: product.description,
  },
];
```

Inserir abaixo de `ProductPurchasePanel` e antes dos produtos relacionados:
```tsx
<section className="py-16 px-4 bg-ivory">
  <div className="max-w-3xl mx-auto">
    <h2 className="font-subtitle text-xs uppercase tracking-widest text-gold text-center mb-10">
      O Significado
    </h2>
    <InteractiveBook pages={bookPages} />
  </div>
</section>
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error|✓)" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd site && git add frontend/components/product/interactive-book.tsx "app/(public)/produto/[slug]/page.tsx" && git commit -m "feat: interactive book for product symbolic meaning"
```

---

## Verificação Final

- [ ] **Build limpo**

```bash
cd site && npm run build 2>&1 | tail -30
```

Esperado: todas as rotas renderizadas, zero erros TypeScript.

- [ ] **Lint limpo**

```bash
cd site && npm run lint 2>&1 | grep -E "(error|warning)" | head -20
```

Esperado: nenhum erro (warnings aceitáveis se pré-existentes).

- [ ] **Commit final de verificação (se necessário)**

```bash
cd site && git log --oneline -10
```

Verificar: 9 commits (Task 0 ao Task 8 + verificação) no histórico.
