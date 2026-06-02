# REBANHO Site — Project Guide

## Project Overview

Next.js 14 e-commerce site for the REBANHO brand (Catholic lifestyle apparel).
Launch date: 31 May 2026.

## Architecture

```
app/              # Next.js App Router pages and API routes
frontend/         # UI layer (components, browser-only utils)
backend/          # Server layer (db, services, email)
shared/           # Shared contracts (types, utils, validations)
prisma/           # Database schema and seed
public/           # Static assets
```

### Import Conventions

| Layer    | Import path      | Contains                                      |
|----------|------------------|-----------------------------------------------|
| Frontend | `@/frontend/...` | React components, client-side utils           |
| Backend  | `@/backend/...`  | Prisma client, services, email templates      |
| Shared   | `@/shared/...`   | Zod schemas, catalog types, format utilities  |

Keep `app/api/` routes thin: validate → call backend service → return JSON.

## Tech Stack

- **Framework**: Next.js 14, React 18, TypeScript
- **Database**: Prisma (PostgreSQL)
- **Auth**: NextAuth v4 with Prisma adapter
- **Payments**: Stripe
- **Email**: Resend
- **Styling**: Tailwind CSS v3
- **Validation**: Zod
- **Animation**: Framer Motion

## Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # prisma generate
npm run db:push      # prisma db push
npm run db:seed      # Seed database
```

## Key Constraints

- No `console.log` in production code
- No hardcoded secrets — use `.env.local`
- Immutable data patterns — never mutate objects in place
- Files max 800 lines; prefer small focused modules
