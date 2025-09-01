# Stockholm IMS

Monorepo for Stockholm — a lightweight Inventory Management System built with Next.js, React, and Prisma. It provides an authenticated dashboard to manage items, low‑stock alerts, camera barcode/QR scanning, and PDF export.

## Apps

- `apps/dashboard`: Authenticated admin dashboard (Next.js App Router) for managing inventory, low‑stock monitoring, barcode/QR scanning, and exports.
- `apps/website`: Public site (placeholder). Useful for landing/marketing.

## Packages

- `@stockholm/db`: Prisma client + schema for PostgreSQL.
- `@stockholm/ui`: Shared UI components.
- `@stockholm/utils`: Small shared utilities.
- `eslint-config`, `typescript-config`, `config`: Shared configs for the monorepo.

## Tech Stack

- Next.js 15 (App Router) + React 19
- NextAuth (credentials, JWT sessions)
- Prisma 5 + PostgreSQL 16
- Turborepo + pnpm workspaces
- Tailwind CSS 4, Zod, pdf-lib, ZXing

## Features

- Items CRUD with optional photo upload stored under `apps/dashboard/public/uploads`.
- Low‑stock badge with cached count and revalidation.
- Built‑in camera scanning for Barcode/QR to prefill SKU.
- Export inventory as PDF.
- Credentials login and basic role handling (ADMIN/MEMBER) with middleware protection.

Relevant references:

- Dashboard home: `apps/dashboard/src/app/page.tsx:1`
- Items list + low‑stock UI: `apps/dashboard/src/app/app/items/page.tsx:1`
- New item form + upload: `apps/dashboard/src/app/app/items/new/NewItemClient.tsx:1`
- Low‑stock API: `apps/dashboard/src/app/api/low-stock/count/route.ts:1`
- PDF export API: `apps/dashboard/src/app/api/exports/items/route.ts:1`
- Auth + middleware: `apps/dashboard/src/lib/auth.ts:1`, `apps/dashboard/src/middleware.ts:1`
- Prisma schema: `packages/db/prisma/schema.prisma:1`

## Getting Started

Prerequisites:

- Node.js >= 18 and pnpm >= 9
- Docker (for local PostgreSQL) or an accessible Postgres instance

1) Clone and install dependencies

```bash
pnpm install
```

2) Start PostgreSQL (dev)

```bash
docker compose -f infra/docker-compose.dev.yml up -d
# or use the helper
bash infra/dev-containers.sh
# or enable `docker up` (Docker CLI plugin)
bash infra/install-docker-up.sh   # install once
docker up -d                      # uses infra/docker-compose.dev.yml
```

3) Configure environment

Create a `.env` in repo root (example):

```env
DATABASE_URL=postgres://stockholm:stockholm@localhost:5433/stockholm
NEXTAUTH_SECRET=<generate strong secret>
NEXTAUTH_URL=http://localhost:3000
# Optional: protect low-stock cron endpoint in non-local envs
LOW_STOCK_CRON_TOKEN=<set-a-random-token>
```

4) Generate Prisma client and run migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

5) Seed an admin user (optional but recommended)

```bash
# Defaults: email=admin@stockholm.local password=admin123 role=ADMIN
pnpm -F dashboard run seed

# Or provide your own
pnpm -F dashboard run seed --email=you@example.com --password=strongpass --role=ADMIN
```

6) Run the apps in development

```bash
pnpm dev
```

Open:

- Dashboard: http://localhost:3000 (login at `/login`)
- Website: http://localhost:3001

## Common Tasks

- Build all: `pnpm build`
- Lint all: `pnpm lint`
- Typecheck: `pnpm check-types`
- Prisma Studio: `pnpm prisma:studio`

## Cron for Low Stock

An hourly cron is configured for Vercel to compute low‑stock and refresh cache (`vercel.json`). If you secure it, set `LOW_STOCK_CRON_TOKEN` and call with `Authorization: Bearer <token>`.

- Endpoint: `GET /api/cron/low-stock` — `apps/dashboard/src/app/api/cron/low-stock/route.ts:1`

## Notes

- Uploaded photos are stored under `apps/dashboard/public/uploads` and removed on item delete.
- Roles: middleware restricts `/app/admin/*` to `ADMIN` if such routes are added.
- This is a monorepo; scripts are wired via Turbo and pnpm workspaces.
