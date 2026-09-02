# Deployment and Environments

Status: **PROPOSED**.

## 1. Environments

| | development | preview / staging | production |
| --- | --- | --- | --- |
| App | `pnpm dev` | Vercel preview per PR | Vercel production (`main`) |
| Database/Auth/Storage | Supabase CLI local (Docker) | Supabase project `nenyere-staging` (Free tier acceptable; reset weekly by seed job) | Supabase project `nenyere-prod` (**Pro**: daily backups + PITR add-on, no pausing) |
| Region | local | same as prod | To be decided after privacy item H5 (data residency). Candidates: closest available region with lowest latency to Harare that satisfies the transfer basis |
| Sentry | disabled or `dev` env | `preview` | `production` |
| Data | fictional seed | fictional seed | real; **no** demo learners |

## 2. CI/CD pipeline (GitHub Actions)

```
PR opened/updated
  ├─ install (pnpm, frozen lockfile)
  ├─ typecheck ─ lint ─ prettier check ─ content validate ─ gitleaks ─ pnpm audit (high+)
  ├─ unit (Vitest)
  ├─ db: supabase start → migrations → seed → pgTAP
  ├─ build (next build) → size-limit budget
  ├─ e2e (Playwright, sharded ×3, against local build + local Supabase)
  ├─ a11y (axe) ─ Lighthouse CI (report; budget breach fails)
  └─ Vercel preview deployment (Git integration) → link posted on PR
Human review + approval required (CODEOWNERS)
merge to main
  ├─ same checks
  ├─ supabase db push --linked (prod) via GitHub Action with environment protection + manual approval
  ├─ Vercel production deploy
  └─ post-deploy smoke (Playwright @smoke against prod, read-only) + Sentry release tagging
```

Migrations are applied **before** the app deploy and must be backward compatible
with the previous app version (expand → migrate → contract pattern) so a failed
deploy never leaves a broken app.

## 3. Environment variables (`.env.example` to be created in Session 3)

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Client key (RLS-limited) |
| `SUPABASE_SECRET_KEY` | server (CI/seed only) | Migrations/seeds; never at runtime |
| `SUPABASE_DB_URL` | CI | pgTAP / migrations |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | public / CI | Errors, source maps |
| `NEXT_PUBLIC_APP_ENV` | public | development/preview/production |
| `CONTENT_PACK_SIGNING_SECRET` | server | HMAC for pack manifests (integrity) |
| `FIGMA_TOKEN` | local dev only (Session 2) | Never in CI/Vercel |

## 4. Release management
- Semantic version tags; changelog generated from Conventional Commits.
- Feature flags in `schools.settings` / `platform_settings` for staged rollout.
- Rollback: Vercel instant rollback + backward-compatible migrations; PITR for data.

## 5. Operations
- Backups: Supabase daily + PITR (prod).
- Monitoring: Sentry alerts (error rate, failed sync), Vercel analytics (Core Web
  Vitals, no PII), Supabase dashboard (DB size, auth errors).
- Runbook (Session 3): restore, rotate keys, revoke device, force content
  re-download, erase learner.
