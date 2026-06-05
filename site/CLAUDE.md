# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

REBANHO is a Next.js 14 e-commerce site for a Brazilian Catholic lifestyle apparel brand. Each order automatically calculates and reserves a donation (10% of net profit) to one of three partner Catholic NGOs in Brasília. Launch date: 1 August 2026.

## Dev Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # prisma generate (after schema changes)
npm run db:push      # push schema to DB without migration history
npm run db:seed      # seed database (tsx prisma/seed.ts)
```

No test runner is configured yet.

## Architecture

```
app/              # Next.js App Router — pages and API routes only
frontend/         # UI layer (React components, browser-only utils)
backend/          # Server layer (Prisma, services, email)
shared/           # Shared contracts (types, Zod schemas, static data)
prisma/           # Schema and seed
```

### Route Groups

| Group | Path | Guard |
|-------|------|-------|
| `(public)` | `/`, `/loja`, `/produto/[slug]`, `/checkout`, `/pre-lancamento`, etc. | none |
| `(auth)` | `/login`, `/cadastro` | none |
| `(account)` | `/minha-conta`, `/meus-pedidos` | NextAuth session |
| `(admin)` | `/admin/*` | `middleware.ts` — only blocks when `ENFORCE_ADMIN_AUTH=true` |

### Import Paths

```
@/frontend/...   React components, cart utils, input masks
@/backend/...    Prisma client, services, auth options, email templates
@/shared/...     Zod schemas, catalog types, donation math, projects list
```

API routes in `app/api/` must stay thin: validate input with Zod → call a `backend/services/` function → return JSON.

## Key Data Flows

### Checkout Flow

1. Cart persisted in `localStorage` via `frontend/lib/cart.ts` (keyed `rebanho-cart`).
2. `POST /api/checkout` validates with `shared/validations/checkout`, calls `createCheckoutOrder()` which:
   - Resolves products from DB, falls back to `shared/catalog.ts` static data if not found.
   - Calculates donation via `backend/services/donation` (reads live `DonationSettings` from DB).
   - Creates `Order` + `Donation` (status `RESERVADO`) in a single Prisma write.
   - Returns Stripe Checkout Session URL.
3. Stripe Checkout redirect → user pays externally.
4. `POST /api/webhooks/stripe` receives `checkout.session.completed` → sets order to `PAID` → triggers `sendOrderEmails` (customer + admin emails via Resend).

### Donation Calculation

`shared/donation.ts` holds the formula: `donation = max(0, revenue − cogs − taxes − fees) × donationRate`.  
Parameters default to `DEFAULT_DONATION_PARAMS` but are overridden at runtime from the `DonationSettings` singleton row (admin-editable). The `backend/services/donation.ts` reads this singleton before calculating.

### Static Catalogs (source-of-truth files)

- `shared/catalog.ts` — static product list used as UI source and checkout fallback.
- `shared/projects.ts` — three donation projects with `DEFAULT_PROJECT_ID`. Used by checkout, public pages, and admin.

## Authentication

NextAuth v4, credentials provider, JWT session strategy. User role (`CUSTOMER` / `ADMIN`) is stored in the JWT and forwarded to `session.user.role` via callbacks in `backend/lib/auth.ts`. The `(admin)` area is guarded by `middleware.ts`; set `ENFORCE_ADMIN_AUTH=true` to activate enforcement.

## Environment Variables

Copy `.env.example` to `.env.local`. Required keys:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | JWT signing |
| `STRIPE_SECRET_KEY` | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `RESEND_API_KEY` | Transactional email |
| `NEXT_PUBLIC_APP_URL` | Base URL (used in redirects) |

`NEXT_PUBLIC_*` vars are bundled into the client. Never put secrets under that prefix.

## Tech Stack

- **Framework**: Next.js 14, React 18, TypeScript
- **Database**: Prisma (PostgreSQL)
- **Auth**: NextAuth v4 with Prisma adapter
- **Payments**: Stripe Checkout Sessions
- **Email**: Resend
- **Styling**: Tailwind CSS v3
- **Validation**: Zod (infer types from schemas)
- **Animation**: GSAP + Framer Motion

## Key Constraints

- No `console.log` in production code.
- Immutable data patterns — never mutate objects in-place.
- Files max 800 lines; prefer small focused modules.
- Prices stored as `Prisma.Decimal` in DB; convert to `Number()` only when passing to Stripe or display logic.
