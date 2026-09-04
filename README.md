# Nenyere ECD Digital Learning Platform

A production-quality, offline-first, tablet-first Early Childhood Development
(ECD A / ECD B) learning platform for Nenyere Day Care Centre.

## Project status

**Ready for school deployment.**

The platform includes a full Child Mode with 10 developmental pillars,
interactive activities, synthesized sound effects, learner profiles,
progress tracking, badges, and a tablet-optimised PWA interface.

Teachers can add and manage pupils directly on the tablet — no server
required for day-to-day use.

| Document | Contents |
| --- | --- |
| `docs/product-requirements.md` | Vision, personas, information architecture, user journeys, MVP scope, NFRs |
| `docs/architecture.md` | System architecture, technology decisions, module structure, tenancy, deployment topology, scale path |
| `docs/architecture-decisions.md` | ADRs, including deviations from the master specification |
| `docs/curriculum-map.md` | Learning areas → platform skills → activity types, with validation flags |
| `docs/activity-engine.md` | Activity types → interaction engines, lifecycle, versioned Zod schema design, scoring, tracing algorithm |
| `docs/database.md` | Entities, RLS matrix, functions, indexes, retention, seed plan |
| `docs/offline-sync.md` | PWA caching, IndexedDB layout, content packs, idempotent sync protocol, conflict handling |
| `docs/security.md` | Threat model, auth/authz, headers, uploads, secrets, security test matrix |
| `docs/privacy.md` | Data protection research, data inventory, consent workflow, items for legal review |
| `docs/design-system.md` | Brand direction, tokens, component inventory, layout system, Figma file plan, 42-screen inventory |
| `docs/testing.md` | Test pyramid, 13 critical flows, security suite, DoD gates |
| `docs/deployment.md` | Environments, CI/CD pipeline, env vars, release/rollback |
| `docs/content-authoring.md` | CMS workflow, editors, media rules, seed content plan |
| `docs/implementation-plan.md` | Session/phase plan, roadmap, dependencies, risk register, cost, performance budget |

## Tech stack

Next.js 15 (App Router, React 19, TypeScript) · Tailwind CSS v4 + design tokens ·
Supabase (Postgres, Auth, Storage, RLS) · Zod · Dexie + Serwist (offline) ·
next-intl · Vitest · Playwright · pgTAP · Sentry · Vercel · GitHub Actions · Figma.

## Getting started

### Prerequisites

- Node.js >= 20
- pnpm >= 11
- Supabase CLI (`pnpm supabase`)

### Setup

```bash
# Install dependencies
pnpm install

# Copy env file and fill in values
cp .env.example .env.local

# Start local Supabase (Docker required)
pnpm supabase start

# Apply migrations
pnpm supabase db push

# Run seed data
pnpm supabase db reset --linked

# Start dev server
pnpm dev
```

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier format |
| `pnpm format:check` | Prettier check |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm test:db` | Run database tests (pgTAP) |

## Project structure

```
src/
  app/
    (kids)/          # Child Mode route group
    auth/callback/   # Auth callback handler
    login/           # Teacher/admin/device sign-in
    privacy/         # Privacy policy page
    teach/           # Teacher portal
    unauthorized/    # 403 page
    welcome/         # Welcome / sign-in chooser
    globals.css      # Design tokens + base styles
    layout.tsx       # Root layout (fonts, metadata)
    page.tsx         # Home page
  components/
    kids/            # Child Mode components
    sign-out-button.tsx
  lib/
    auth.ts          # Server-side auth helpers
    env.ts           # Environment validation (Zod)
    supabase/        # Supabase clients (server, browser, middleware)
    types.ts         # Domain types (matching DB schema)
    utils.ts         # cn() class merge utility
  middleware.ts      # Session refresh middleware
supabase/
  migrations/        # SQL migrations (7 files)
  seed.sql           # Development seed data
  config.toml        # Supabase local config
```
