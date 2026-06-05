# Checkout Completo, Frete e Perfil — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar frete calculado via Melhor Envio com auto-fill de CEP (ViaCEP), cartões salvos por usuário via Stripe Customer, e expandir a área da conta com perfil editável, endereços e histórico de pedidos.

**Architecture:** CEP auto-fill usa ViaCEP (gratuito, sem auth); frete usa Melhor Envio REST API com Bearer token; cartões salvos usam Stripe Customer + SetupIntent para salvar e PaymentIntent para cobrar. Cada serviço é um módulo isolado em `backend/services/`. O checkout continua client-side com chamadas REST para as novas rotas de API.

**Tech Stack:** Next.js 14 App Router, Prisma PostgreSQL, Stripe SDK, Zod, Tailwind CSS, ViaCEP (fetch), Melhor Envio API v2

---

## Mapa de Arquivos

### Criados
- `site/backend/services/cep.ts` — lookup ViaCEP
- `site/backend/services/shipping.ts` — cálculo Melhor Envio
- `site/backend/services/stripe-customer.ts` — CRUD Stripe Customer/cards
- `site/app/api/cep/[cep]/route.ts` — endpoint público
- `site/app/api/shipping/calculate/route.ts` — endpoint autenticado
- `site/app/api/account/profile/route.ts` — PATCH perfil
- `site/app/api/account/addresses/route.ts` — GET/POST endereços
- `site/app/api/account/addresses/[id]/route.ts` — PATCH/DELETE endereço
- `site/app/api/account/cards/route.ts` — GET cartões
- `site/app/api/account/cards/setup/route.ts` — POST setup intent
- `site/app/api/account/cards/[id]/route.ts` — DELETE cartão
- `site/frontend/components/brand/cep-fields.tsx` — campos endereço com auto-fill
- `site/frontend/components/brand/shipping-selector.tsx` — seletor de método de frete
- `site/frontend/components/account/address-form.tsx` — formulário de endereço reutilizável
- `site/frontend/components/account/address-card.tsx` — card de endereço salvo
- `site/app/(account)/minha-conta/enderecos/page.tsx` — nova página
- `site/app/(account)/minha-conta/cartoes/page.tsx` — nova página
- `site/shared/validations/address.ts` — schema Zod para endereço

### Modificados
- `site/prisma/schema.prisma` — Address model, User+Order novos campos
- `site/shared/validations/checkout.ts` — campos de endereço estruturado + shipping
- `site/backend/services/checkout.ts` — usar shipping cost no total, gravar novos campos
- `site/app/api/checkout/route.ts` — passar stripeCustomerId à session
- `site/app/(public)/checkout/page.tsx` — CEP auto-fill, shipping selector, endereço estruturado
- `site/app/(account)/minha-conta/page.tsx` — formulário de edição de perfil
- `site/app/(account)/meus-pedidos/page.tsx` — exibir frete e rastreamento
- `site/prisma/seed.ts` — sem alterações necessárias

---

## Task 1: Schema — Address model + novos campos em User e Order

**Files:**
- Modify: `site/prisma/schema.prisma`

- [ ] **Ler o schema atual**

```bash
cat site/prisma/schema.prisma
```

- [ ] **Adicionar campos ao model `User`** (após `createdAt`)

```prisma
  stripeCustomerId String?
  phone            String?
  cpf              String?
  addresses        Address[]
```

- [ ] **Adicionar campos ao model `Order`** (após `state`)

```prisma
  phone           String?
  street          String  @default("")
  number          String  @default("")
  complement      String?
  neighborhood    String  @default("")
  shippingMethod  String?
  shippingCarrier String?
  shippingCost    Decimal? @db.Decimal(10, 2)
  shippingDays    Int?
  trackingCode    String?
```

- [ ] **Adicionar model `Address`** (antes do model `Coupon`)

```prisma
model Address {
  id            String   @id @default(cuid())
  userId        String
  label         String
  recipientName String
  street        String
  number        String
  complement    String?
  neighborhood  String
  city          String
  state         String
  cep           String
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

- [ ] **Aplicar schema ao banco**

```bash
cd site && npm run db:push
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Regenerar o Prisma Client**

```bash
cd site && npm run db:generate
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

Expected: `✓ Compiled successfully`

- [ ] **Commit**

```bash
git add site/prisma/schema.prisma
git commit -m "feat: add Address model, stripeCustomerId, shipping fields to schema"
```

---

## Task 2: Serviço CEP (ViaCEP) + API Route

**Files:**
- Create: `site/backend/services/cep.ts`
- Create: `site/app/api/cep/[cep]/route.ts`

- [ ] **Criar `site/backend/services/cep.ts`**

```typescript
export type CepData = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export async function lookupCep(cep: string): Promise<CepData | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      next: { revalidate: 86400 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;

    return {
      cep: data.cep,
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade,
      state: data.uf,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Criar `site/app/api/cep/[cep]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { lookupCep } from "@/backend/services/cep";

export async function GET(
  _req: Request,
  { params }: { params: { cep: string } }
) {
  const data = await lookupCep(params.cep);
  if (!data) {
    return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
  }
  return NextResponse.json(data);
}
```

- [ ] **Testar manualmente** (com o servidor rodando)

```bash
curl http://localhost:3000/api/cep/70040020
```

Expected: JSON com `street`, `neighborhood`, `city`, `state`

```bash
curl http://localhost:3000/api/cep/00000000
```

Expected: `{"error":"CEP não encontrado"}` com status 404

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/backend/services/cep.ts site/app/api/cep
git commit -m "feat: add CEP lookup service and API route (ViaCEP)"
```

---

## Task 3: Serviço de Frete (Melhor Envio) + API Route

**Files:**
- Create: `site/backend/services/shipping.ts`
- Create: `site/app/api/shipping/calculate/route.ts`

- [ ] **Adicionar variáveis de ambiente ao `.env.local`** (checar se arquivo existe antes)

```bash
# Adicionar ao .env.local — preencher com valores reais antes de testar
MELHOR_ENVIO_TOKEN=seu_token_aqui
MELHOR_ENVIO_SANDBOX=true
STORE_CEP=01310100
STORE_WEIGHT_GRAMS=350
STORE_WIDTH_CM=25
STORE_HEIGHT_CM=5
STORE_LENGTH_CM=35
```

- [ ] **Criar `site/backend/services/shipping.ts`**

```typescript
export type ShippingOption = {
  id: number;
  name: string;
  carrier: string;
  price: number;
  days: number;
  logoUrl: string;
};

type ShippingParams = {
  fromCep: string;
  toCep: string;
  quantity: number;
};

function buildPackage(quantity: number) {
  const weightG = Number(process.env.STORE_WEIGHT_GRAMS ?? 350);
  return {
    height: Number(process.env.STORE_HEIGHT_CM ?? 5),
    width: Number(process.env.STORE_WIDTH_CM ?? 25),
    length: Number(process.env.STORE_LENGTH_CM ?? 35),
    weight: (weightG * quantity) / 1000,
  };
}

export async function calculateShipping(params: ShippingParams): Promise<ShippingOption[]> {
  const baseUrl = process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";

  const body = {
    from: { postal_code: params.fromCep.replace(/\D/g, "") },
    to: { postal_code: params.toCep.replace(/\D/g, "") },
    package: buildPackage(params.quantity),
    options: { receipt: false, own_hand: false },
  };

  const res = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
      "User-Agent": "REBANHO/1.0 (contato@rebanho.com.br)",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return [];

  const data: Array<{
    id: number;
    name: string;
    company: { name: string; picture: string };
    price: string;
    delivery_time: number;
    error?: string;
  }> = await res.json();

  return data
    .filter((opt) => !opt.error && opt.price)
    .map((opt) => ({
      id: opt.id,
      name: opt.name,
      carrier: opt.company.name,
      price: Number(opt.price),
      days: opt.delivery_time,
      logoUrl: opt.company.picture,
    }))
    .sort((a, b) => a.price - b.price);
}
```

- [ ] **Criar `site/app/api/shipping/calculate/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateShipping } from "@/backend/services/shipping";

const schema = z.object({
  cep: z.string().min(8),
  quantity: z.number().int().positive(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const fromCep = process.env.STORE_CEP;
  if (!fromCep) {
    return NextResponse.json({ error: "CEP da loja não configurado" }, { status: 500 });
  }

  const options = await calculateShipping({
    fromCep,
    toCep: parsed.data.cep,
    quantity: parsed.data.quantity,
  });

  return NextResponse.json({ options });
}
```

- [ ] **Testar manualmente** (exige token real ou sandbox)

```bash
curl -X POST http://localhost:3000/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"cep":"20040020","quantity":2}'
```

Expected: `{"options":[{"id":1,"name":"PAC","carrier":"Correios","price":18.50,"days":7,...},...]}`

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/backend/services/shipping.ts site/app/api/shipping
git commit -m "feat: add Melhor Envio shipping calculation service and API route"
```

---

## Task 4: Stripe Customer + API Routes de Cartões

**Files:**
- Create: `site/backend/services/stripe-customer.ts`
- Create: `site/app/api/account/cards/route.ts`
- Create: `site/app/api/account/cards/setup/route.ts`
- Create: `site/app/api/account/cards/[id]/route.ts`

- [ ] **Checar se o SDK Stripe já está instalado**

```bash
grep '"stripe"' site/package.json
```

Expected: linha mostrando a versão. Se não existir: `cd site && npm install stripe`

- [ ] **Criar `site/backend/services/stripe-customer.ts`**

```typescript
import Stripe from "stripe";
import { prisma } from "@/backend/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export async function getOrCreateStripeCustomer(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (dbUser?.stripeCustomerId) return dbUser.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function listSavedCards(stripeCustomerId: string): Promise<SavedCard[]> {
  const methods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });

  return methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card!.brand,
    last4: pm.card!.last4,
    expMonth: pm.card!.exp_month,
    expYear: pm.card!.exp_year,
  }));
}

export async function createSetupIntent(stripeCustomerId: string): Promise<string> {
  const intent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
  });
  return intent.client_secret!;
}

export async function detachCard(paymentMethodId: string): Promise<void> {
  await stripe.paymentMethods.detach(paymentMethodId);
}
```

- [ ] **Criar helper de sessão autenticada** (padrão reutilizado em todas as rotas de account)

Verificar se `backend/lib/auth.ts` exporta `authOptions`. Se sim, usar o padrão:

```typescript
// Padrão para rotas /api/account/*:
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";

const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
const userId = (session.user as { id: string }).id;
```

- [ ] **Criar `site/app/api/account/cards/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { getOrCreateStripeCustomer, listSavedCards } from "@/backend/services/stripe-customer";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = session.user as { id: string; email: string; name?: string };

  const stripeCustomerId = await getOrCreateStripeCustomer(user);
  const cards = await listSavedCards(stripeCustomerId);

  return NextResponse.json({ cards });
}
```

- [ ] **Criar `site/app/api/account/cards/setup/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { getOrCreateStripeCustomer, createSetupIntent } from "@/backend/services/stripe-customer";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = session.user as { id: string; email: string; name?: string };

  const stripeCustomerId = await getOrCreateStripeCustomer(user);
  const clientSecret = await createSetupIntent(stripeCustomerId);

  return NextResponse.json({ clientSecret });
}
```

- [ ] **Criar `site/app/api/account/cards/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { detachCard } from "@/backend/services/stripe-customer";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await detachCard(params.id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/backend/services/stripe-customer.ts site/app/api/account/cards
git commit -m "feat: add Stripe Customer service and saved card API routes"
```

---

## Task 5: API de Perfil + API de Endereços

**Files:**
- Create: `site/shared/validations/address.ts`
- Create: `site/app/api/account/profile/route.ts`
- Create: `site/app/api/account/addresses/route.ts`
- Create: `site/app/api/account/addresses/[id]/route.ts`

- [ ] **Criar `site/shared/validations/address.ts`**

```typescript
import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1).max(50),
  recipientName: z.string().min(3),
  cep: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
```

- [ ] **Criar `site/app/api/account/profile/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";

const profileSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  cpf: z.string().min(11).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { name: true, email: true, phone: true, cpf: true },
  });

  return NextResponse.json({ user });
}
```

- [ ] **Criar `site/app/api/account/addresses/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { addressSchema } from "@/shared/validations/address";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const parsed = addressSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...parsed.data, userId, isDefault: parsed.data.isDefault ?? false },
  });
  return NextResponse.json({ address }, { status: 201 });
}
```

- [ ] **Criar `site/app/api/account/addresses/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { addressSchema } from "@/shared/validations/address";

async function ownedAddress(userId: string, id: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  if (!(await ownedAddress(userId, params.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const parsed = addressSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ address });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  if (!(await ownedAddress(userId, params.id))) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/shared/validations/address.ts site/app/api/account
git commit -m "feat: add profile PATCH and address CRUD API routes"
```

---

## Task 6: Componente CepFields (auto-fill reutilizável)

**Files:**
- Create: `site/frontend/components/brand/cep-fields.tsx`

- [ ] **Criar `site/frontend/components/brand/cep-fields.tsx`**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { maskCEP } from "@/shared/utils";

export type AddressValues = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type Props = {
  values: AddressValues;
  onChange: (values: AddressValues) => void;
  errors?: Partial<Record<keyof AddressValues, string>>;
  className?: string;
};

export function CepFields({ values, onChange, errors, className }: Props) {
  const [lookingUp, setLookingUp] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  const digits = values.cep.replace(/\D/g, "");

  useEffect(() => {
    if (digits.length !== 8) return;
    let cancelled = false;

    setLookingUp(true);
    setCepError(null);

    fetch(`/api/cep/${digits}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setCepError("CEP não encontrado.");
          return;
        }
        onChange({
          ...values,
          cep: values.cep,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        });
        setTimeout(() => numberRef.current?.focus(), 50);
      })
      .finally(() => { if (!cancelled) setLookingUp(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  function field(
    label: string,
    key: keyof AddressValues,
    opts?: { ref?: React.Ref<HTMLInputElement>; placeholder?: string; maxLength?: number; className?: string }
  ) {
    return (
      <div className={opts?.className}>
        <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
          {label}
        </label>
        <input
          ref={opts?.ref}
          value={values[key]}
          onChange={(e) => onChange({ ...values, [key]: e.target.value })}
          placeholder={opts?.placeholder}
          maxLength={opts?.maxLength}
          className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/50"
        />
        {errors?.[key] && (
          <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
          CEP {lookingUp && <span className="text-ink/40">(buscando…)</span>}
        </label>
        <input
          value={values.cep}
          onChange={(e) => onChange({ ...values, cep: maskCEP(e.target.value) })}
          placeholder="00000-000"
          maxLength={9}
          className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/50"
        />
        {(cepError ?? errors?.cep) && (
          <p className="mt-1 text-xs text-red-500">{cepError ?? errors?.cep}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          {field("Logradouro", "street", { placeholder: "Rua, Av., etc." })}
        </div>
        {field("Número", "number", { ref: numberRef, placeholder: "123", className: "" })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("Complemento (opcional)", "complement", { placeholder: "Apto, Bloco…" })}
        {field("Bairro", "neighborhood")}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          {field("Cidade", "city")}
        </div>
        {field("UF", "state", { maxLength: 2, placeholder: "DF" })}
      </div>
    </div>
  );
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/frontend/components/brand/cep-fields.tsx
git commit -m "feat: add CepFields component with ViaCEP auto-fill"
```

---

## Task 7: Componente ShippingSelector

**Files:**
- Create: `site/frontend/components/brand/shipping-selector.tsx`

- [ ] **Criar `site/frontend/components/brand/shipping-selector.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import { brl } from "@/shared/utils";

export type ShippingOption = {
  id: number;
  name: string;
  carrier: string;
  price: number;
  days: number;
  logoUrl: string;
};

type Props = {
  cep: string;
  quantity: number;
  selected: ShippingOption | null;
  onSelect: (option: ShippingOption) => void;
};

export function ShippingSelector({ cep, quantity, selected, onSelect }: Props) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = cep.replace(/\D/g, "");

  useEffect(() => {
    if (digits.length !== 8 || quantity < 1) {
      setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/shipping/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cep: digits, quantity }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.options?.length) {
          setOptions(data.options);
          onSelect(data.options[0]);
        } else {
          setError("Não foi possível calcular o frete para este CEP.");
        }
      })
      .catch(() => { if (!cancelled) setError("Erro ao calcular frete."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, quantity]);

  if (loading) {
    return (
      <p className="subtitle text-sm text-ink/50">Calculando frete…</p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!options.length) return null;

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const active = selected?.id === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? "border-ink bg-ink text-ivory"
                : "border-ink/15 bg-white/60 text-ink hover:border-ink/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {opt.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opt.logoUrl} alt={opt.carrier} className="h-5 w-5 object-contain" />
              )}
              <div>
                <span className="block text-sm font-medium">{opt.carrier} — {opt.name}</span>
                <span className={`block text-xs ${active ? "text-ivory/60" : "text-ink/50"}`}>
                  Prazo estimado: {opt.days} dia(s) útil(eis)
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold">{brl(opt.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/frontend/components/brand/shipping-selector.tsx
git commit -m "feat: add ShippingSelector component with Melhor Envio options"
```

---

## Task 8: Atualizar checkout — validação + serviço + página

**Files:**
- Modify: `site/shared/validations/checkout.ts`
- Modify: `site/backend/services/checkout.ts`
- Modify: `site/app/(public)/checkout/page.tsx`

- [ ] **Ler os três arquivos**

```bash
cat site/shared/validations/checkout.ts
cat site/backend/services/checkout.ts
cat "site/app/(public)/checkout/page.tsx"
```

- [ ] **Atualizar `site/shared/validations/checkout.ts`** — substituir campo `address` pelos campos estruturados e adicionar shipping

```typescript
import { z } from "zod";
import { donationProjects } from "@/shared/projects";

const projectIds = donationProjects.map((p) => p.id) as [string, ...string[]];

export const checkoutSchema = z.object({
  customerName: z.string().min(3),
  customerEmail: z.string().email(),
  customerCPF: z.string().min(11),
  phone: z.string().min(10).optional(),
  // endereço estruturado
  cep: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  // frete
  shippingMethod: z.string().min(1),
  shippingCarrier: z.string().min(1),
  shippingCost: z.number().min(0),
  shippingDays: z.number().int().min(0),
  // doação
  projectId: z.enum(projectIds),
  // itens
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

- [ ] **Atualizar `site/backend/services/checkout.ts`** — adicionar `shippingCost` ao total e gravar novos campos no Order

Localizar o trecho onde `total` é calculado (provavelmente `items.reduce(...)`) e incluir shipping:

```typescript
// Substituir cálculo de total
const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const total = round(itemsTotal + input.shippingCost);
```

Localizar o `prisma.order.create({ data: { ... } })` e adicionar os campos novos:

```typescript
// Adicionar junto aos campos existentes no create de Order:
phone: input.phone,
street: input.street,
number: input.number,
complement: input.complement,
neighborhood: input.neighborhood,
shippingMethod: input.shippingMethod,
shippingCarrier: input.shippingCarrier,
shippingCost: new Prisma.Decimal(input.shippingCost.toFixed(2)),
shippingDays: input.shippingDays,
```

Na criação da Stripe Checkout Session, adicionar item de frete nas `line_items` (após os itens de produto):

```typescript
// Logo após o map de items, adicionar:
...(input.shippingCost > 0 ? [{
  price_data: {
    currency: "brl",
    product_data: { name: `Frete (${input.shippingCarrier} — ${input.shippingMethod})` },
    unit_amount: Math.round(input.shippingCost * 100),
  },
  quantity: 1,
}] : []),
```

- [ ] **Atualizar `site/app/(public)/checkout/page.tsx`** — substituir campo `address` por `CepFields` + `ShippingSelector`

**a) Atualizar imports no topo do arquivo:**

```typescript
import { CepFields, type AddressValues } from "@/frontend/components/brand/cep-fields";
import { ShippingSelector, type ShippingOption } from "@/frontend/components/brand/shipping-selector";
```

**b) Atualizar estado do formulário** — remover `address`, adicionar campos estruturados e shipping:

```typescript
const [form, setForm] = useState({
  customerName: "",
  customerEmail: "",
  customerCPF: "",
  phone: "",
});

const [address, setAddress] = useState<AddressValues>({
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
});

const [shipping, setShipping] = useState<ShippingOption | null>(null);
```

**c) Atualizar o total exibido** para incluir frete:

```typescript
const shippingCost = shipping?.price ?? 0;
const displayTotal = total + shippingCost; // total = subtotal dos produtos
```

**d) Substituir o bloco de campos de endereço** pela seção com `CepFields` e `ShippingSelector`:

```tsx
{/* Entrega */}
<section>
  <h2 className="serif mb-5 text-2xl">Entrega</h2>
  <CepFields values={address} onChange={setAddress} className="space-y-0" />

  {address.cep.replace(/\D/g, "").length === 8 && (
    <div className="mt-6">
      <p className="subtitle mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
        Método de envio
      </p>
      <ShippingSelector
        cep={address.cep}
        quantity={items.reduce((s, i) => s + i.quantity, 0)}
        selected={shipping}
        onSelect={setShipping}
      />
    </div>
  )}
</section>
```

**e) Atualizar o submit** para incluir os campos de endereço e shipping no payload:

```typescript
const payload = {
  ...form,
  ...address,
  shippingMethod: shipping?.name ?? "",
  shippingCarrier: shipping?.carrier ?? "",
  shippingCost: shipping?.price ?? 0,
  shippingDays: shipping?.days ?? 0,
  projectId,
  items: items.map((i) => ({
    productId: i.product.id,
    variantId: i.variantId,
    quantity: i.quantity,
    price: i.price,
  })),
};
```

**f) Adicionar validação de shipping no submit:**

```typescript
if (!shipping) {
  setError("Selecione um método de envio.");
  return;
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/shared/validations/checkout.ts \
        site/backend/services/checkout.ts \
        "site/app/(public)/checkout/page.tsx"
git commit -m "feat: update checkout with structured address, CEP auto-fill and shipping selection"
```

---

## Task 9: Integrar Stripe Customer no checkout

**Files:**
- Modify: `site/app/api/checkout/route.ts`

- [ ] **Ler `site/app/api/checkout/route.ts`**

```bash
cat site/app/api/checkout/route.ts
```

- [ ] **Atualizar para passar `customer` à Stripe Session quando usuário está logado**

Adicionar imports:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { getOrCreateStripeCustomer } from "@/backend/services/stripe-customer";
```

Antes de criar a session, buscar/criar o Customer:

```typescript
const session = await getServerSession(authOptions);
let stripeCustomerId: string | undefined;

if (session?.user) {
  const user = session.user as { id: string; email: string; name?: string };
  stripeCustomerId = await getOrCreateStripeCustomer(user);
}
```

Na chamada `stripe.checkout.sessions.create`, adicionar:

```typescript
...(stripeCustomerId ? {
  customer: stripeCustomerId,
  payment_intent_data: {
    setup_future_usage: "on_session",
  },
} : {}),
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add site/app/api/checkout/route.ts
git commit -m "feat: attach Stripe Customer to checkout session for saved cards"
```

---

## Task 10: Página de Perfil editável

**Files:**
- Modify: `site/app/(account)/minha-conta/page.tsx`

- [ ] **Ler a página atual**

```bash
cat "site/app/(account)/minha-conta/page.tsx"
```

- [ ] **Substituir o conteúdo da página por versão editável**

```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { ProfileForm } from "@/frontend/components/account/profile-form";

export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true, cpf: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="container-x py-16">
      <h1 className="serif mb-8 text-4xl">Minha conta</h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProfileForm initial={user} />
        <nav className="space-y-3">
          <a href="/minha-conta/enderecos" className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4 text-sm font-medium hover:border-ink/30">
            Endereços salvos <span className="text-ink/40">→</span>
          </a>
          <a href="/minha-conta/cartoes" className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4 text-sm font-medium hover:border-ink/30">
            Cartões salvos <span className="text-ink/40">→</span>
          </a>
          <a href="/meus-pedidos" className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4 text-sm font-medium hover:border-ink/30">
            Meus pedidos <span className="text-ink/40">→</span>
          </a>
        </nav>
      </div>
    </main>
  );
}
```

- [ ] **Criar `site/frontend/components/account/profile-form.tsx`**

```typescript
"use client";

import { useActionState } from "react";
import { maskCPF, maskPhone } from "@/shared/utils";

type Initial = { name: string | null; email: string; phone: string | null; cpf: string | null };

type State = { ok: boolean; message: string } | null;

async function updateProfile(_prev: State, formData: FormData): Promise<State> {
  const res = await fetch("/api/account/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.get("name"),
      phone: formData.get("phone"),
      cpf: formData.get("cpf"),
    }),
  });
  if (!res.ok) return { ok: false, message: "Erro ao salvar." };
  return { ok: true, message: "Perfil atualizado com sucesso." };
}

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-ink/10 bg-white/65 p-6">
      <h2 className="serif text-2xl">Dados pessoais</h2>

      {[
        { label: "Nome", name: "name", defaultValue: initial.name ?? "", type: "text" },
        { label: "E-mail", name: "email", defaultValue: initial.email, type: "email", readOnly: true },
      ].map(({ label, name, defaultValue, type, readOnly }) => (
        <div key={name}>
          <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">{label}</label>
          <input
            name={name}
            defaultValue={defaultValue}
            type={type}
            readOnly={readOnly}
            className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none read-only:opacity-50 focus:border-ink/50"
          />
        </div>
      ))}

      <div>
        <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">Telefone</label>
        <input
          name="phone"
          defaultValue={maskPhone(initial.phone ?? "")}
          onChange={(e) => { e.target.value = maskPhone(e.target.value); }}
          className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none focus:border-ink/50"
        />
      </div>

      <div>
        <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">CPF</label>
        <input
          name="cpf"
          defaultValue={maskCPF(initial.cpf ?? "")}
          onChange={(e) => { e.target.value = maskCPF(e.target.value); }}
          className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none focus:border-ink/50"
        />
      </div>

      {state && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-500"}`}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-ink text-sm font-semibold text-ivory transition hover:bg-ink/85 disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add "site/app/(account)/minha-conta/page.tsx" \
        site/frontend/components/account/profile-form.tsx
git commit -m "feat: expandable profile page with editable name, phone and CPF"
```

---

## Task 11: Página de Endereços salvos

**Files:**
- Create: `site/app/(account)/minha-conta/enderecos/page.tsx`
- Create: `site/frontend/components/account/address-card.tsx`

- [ ] **Criar `site/frontend/components/account/address-card.tsx`**

```typescript
"use client";

import { useState } from "react";
import type { Address } from "@prisma/client";

type Props = {
  address: Address;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

export function AddressCard({ address, onDelete, onSetDefault }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Remover este endereço?")) return;
    setDeleting(true);
    await fetch(`/api/account/addresses/${address.id}`, { method: "DELETE" });
    onDelete(address.id);
  }

  async function handleSetDefault() {
    await fetch(`/api/account/addresses/${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    onSetDefault(address.id);
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/65 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/60">
            {address.label}
            {address.isDefault && <span className="text-gold">· padrão</span>}
          </span>
          <p className="mt-2 text-sm font-medium">{address.recipientName}</p>
          <p className="text-sm text-ink/60">
            {address.street}, {address.number}
            {address.complement ? ` — ${address.complement}` : ""}
          </p>
          <p className="text-sm text-ink/60">{address.neighborhood} · {address.city} / {address.state}</p>
          <p className="text-sm text-ink/60">CEP {address.cep}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium hover:border-ink/40"
          >
            Definir como padrão
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-400 disabled:opacity-50"
        >
          {deleting ? "Removendo…" : "Remover"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Criar `site/app/(account)/minha-conta/enderecos/page.tsx`**

```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { AddressesClient } from "@/frontend/components/account/addresses-client";

export const dynamic = "force-dynamic";

export default async function EnderecosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="container-x py-16">
      <a href="/minha-conta" className="subtitle mb-6 inline-flex text-xs text-ink/50 hover:text-ink">← Minha conta</a>
      <h1 className="serif mb-8 text-4xl">Endereços</h1>
      <AddressesClient initial={addresses} />
    </main>
  );
}
```

- [ ] **Criar `site/frontend/components/account/addresses-client.tsx`**

```typescript
"use client";

import { useState } from "react";
import type { Address } from "@prisma/client";
import { AddressCard } from "./address-card";
import { CepFields, type AddressValues } from "@/frontend/components/brand/cep-fields";

const EMPTY_ADDRESS: AddressValues = {
  cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: ""
};

export function AddressesClient({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Casa", recipientName: "" });
  const [addressValues, setAddressValues] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...addressValues, isDefault: addresses.length === 0 }),
    });
    if (res.ok) {
      const { address } = await res.json();
      setAddresses((prev) => [address, ...prev]);
      setShowForm(false);
      setAddressValues(EMPTY_ADDRESS);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {addresses.map((a) => (
        <AddressCard key={a.id} address={a} onDelete={handleDelete} onSetDefault={handleSetDefault} />
      ))}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex h-14 w-full items-center justify-center rounded-2xl border border-dashed border-ink/20 text-sm text-ink/50 hover:border-ink/40 hover:text-ink"
        >
          + Adicionar endereço
        </button>
      ) : (
        <form onSubmit={handleSave} className="rounded-2xl border border-ink/10 bg-white/65 p-6 space-y-4">
          <h2 className="serif text-xl">Novo endereço</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">Rótulo</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Casa, Trabalho…"
                className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none focus:border-ink/50"
              />
            </div>
            <div>
              <label className="subtitle mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">Destinatário</label>
              <input
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                required
                className="h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink outline-none focus:border-ink/50"
              />
            </div>
          </div>

          <CepFields values={addressValues} onChange={setAddressValues} />

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="h-11 flex-1 rounded-full bg-ink text-sm font-semibold text-ivory hover:bg-ink/85 disabled:opacity-50">
              {saving ? "Salvando…" : "Salvar endereço"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="h-11 rounded-full border border-ink/15 px-5 text-sm hover:border-ink/40">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add "site/app/(account)/minha-conta/enderecos" \
        site/frontend/components/account/address-card.tsx \
        site/frontend/components/account/addresses-client.tsx
git commit -m "feat: address book page with add, set default, delete"
```

---

## Task 12: Página de Cartões salvos

**Files:**
- Create: `site/app/(account)/minha-conta/cartoes/page.tsx`

- [ ] **Criar `site/app/(account)/minha-conta/cartoes/page.tsx`**

```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/backend/lib/auth";
import { CardsClient } from "@/frontend/components/account/cards-client";
import { getOrCreateStripeCustomer, listSavedCards } from "@/backend/services/stripe-customer";

export const dynamic = "force-dynamic";

export default async function CartoesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string; email: string; name?: string };
  const stripeCustomerId = await getOrCreateStripeCustomer(user);
  const cards = await listSavedCards(stripeCustomerId);

  return (
    <main className="container-x py-16">
      <a href="/minha-conta" className="subtitle mb-6 inline-flex text-xs text-ink/50 hover:text-ink">← Minha conta</a>
      <h1 className="serif mb-8 text-4xl">Cartões salvos</h1>
      <CardsClient initial={cards} />
    </main>
  );
}
```

- [ ] **Criar `site/frontend/components/account/cards-client.tsx`**

```typescript
"use client";

import { useState } from "react";
import type { SavedCard } from "@/backend/services/stripe-customer";

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex",
  elo: "Elo", hipercard: "Hipercard",
};

export function CardsClient({ initial }: { initial: SavedCard[] }) {
  const [cards, setCards] = useState(initial);

  async function handleRemove(id: string) {
    if (!confirm("Remover este cartão?")) return;
    await fetch(`/api/account/cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      {cards.length === 0 && (
        <p className="text-sm text-ink/50">Nenhum cartão salvo. Ele aparece aqui automaticamente após a primeira compra logado.</p>
      )}

      {cards.map((card) => (
        <div key={card.id} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/65 px-5 py-4">
          <div>
            <p className="text-sm font-medium">
              {BRAND_LABEL[card.brand] ?? card.brand} •••• {card.last4}
            </p>
            <p className="text-xs text-ink/50">Válido até {String(card.expMonth).padStart(2, "0")}/{card.expYear}</p>
          </div>
          <button
            onClick={() => handleRemove(card.id)}
            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:border-red-400"
          >
            Remover
          </button>
        </div>
      ))}

      <p className="text-xs text-ink/40">
        Cartões são salvos automaticamente ao comprar enquanto estiver logado. Para adicionar um cartão sem comprar, realize uma compra ou entre em contato.
      </p>
    </div>
  );
}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add "site/app/(account)/minha-conta/cartoes" \
        site/frontend/components/account/cards-client.tsx
git commit -m "feat: saved cards page with list and remove"
```

---

## Task 13: Histórico de pedidos expandido

**Files:**
- Modify: `site/app/(account)/meus-pedidos/page.tsx`

- [ ] **Ler o arquivo atual**

```bash
cat "site/app/(account)/meus-pedidos/page.tsx"
```

- [ ] **Atualizar a query para incluir campos de shipping**

Localizar o `prisma.order.findMany` e adicionar os campos de shipping no `select`:

```typescript
select: {
  id: true,
  createdAt: true,
  total: true,
  status: true,
  paymentStatus: true,
  shippingMethod: true,
  shippingCarrier: true,
  shippingCost: true,
  shippingDays: true,
  trackingCode: true,
  donation: {
    select: { amount: true, projectName: true, parishName: true }
  },
  items: {
    select: { quantity: true, product: { select: { name: true } } }
  }
}
```

- [ ] **Adicionar exibição de frete e rastreamento** no card de cada pedido

Após o bloco que mostra a doação, adicionar:

```tsx
{order.shippingCarrier && (
  <p className="mt-1 text-xs text-ink/40">
    {order.shippingCarrier} — {order.shippingMethod}
    {order.shippingCost !== null && (
      <> · R$ {Number(order.shippingCost).toFixed(2).replace(".", ",")}</>
    )}
    {order.shippingDays && <> · {order.shippingDays} dia(s) útil(eis)</>}
  </p>
)}
{order.trackingCode && (
  <p className="mt-1 text-xs">
    Rastreamento:{" "}
    <a
      href={`https://www.linketrack.com/trace/${order.trackingCode}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline"
    >
      {order.trackingCode}
    </a>
  </p>
)}
```

- [ ] **Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "✓|error"
```

- [ ] **Commit**

```bash
git add "site/app/(account)/meus-pedidos/page.tsx"
git commit -m "feat: show shipping info and tracking code in order history"
```

---

## Teste Final Manual

- [ ] Iniciar o servidor: `cd site && npm run dev`
- [ ] **Checkout:** Digitar um CEP válido → confirmar auto-fill de logradouro/bairro/cidade/UF → preencher número → confirmar que opções de frete aparecem → selecionar método → confirmar que o total inclui frete
- [ ] **Conta — Endereços:** Acessar `/minha-conta/enderecos` → adicionar novo endereço com CEP auto-fill → confirmar que aparece na lista
- [ ] **Conta — Cartões:** Acessar `/minha-conta/cartoes` → confirmar lista vazia ou cartões salvos de compra anterior
- [ ] **Conta — Perfil:** Acessar `/minha-conta` → editar nome/telefone → salvar → confirmar mensagem de sucesso
- [ ] **Pedidos:** Acessar `/meus-pedidos` → confirmar que pedidos antigos não quebram (campos de shipping como null são tratados)
