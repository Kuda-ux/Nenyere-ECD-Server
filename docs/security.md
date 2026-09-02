# Security Model

Status: **PROPOSED — awaiting review**.

## 1. Threat model (summary)

| Asset | Threats | Primary controls |
| --- | --- | --- |
| Learner personal data (names, level, progress, observations) | Cross-tenant read, privilege escalation, stolen tablet, public URL exposure | RLS by claims, minimal CLASSROOM_DEVICE role, no public learner routes, data minimisation |
| Adult accounts | Credential stuffing, session theft, phishing | Supabase Auth (bcrypt), rate limits, secure cookies, short session refresh, optional MFA for admins |
| Educational content integrity | Unauthorised publish, malicious upload | Status workflow with role gates, upload validation, signed private storage |
| Availability | Abuse of `/api/sync`, large uploads | Payload caps, per-user rate limiting, Vercel WAF |
| Secrets | Leak via client bundle or Git | Env separation, `NEXT_PUBLIC_` only for publishable key, secret scanning in CI |

## 2. Authentication
- Supabase Auth, email + password (min 10 chars, breached-password check via
  Supabase setting) and magic link for adults. Password reset via email.
- Sessions via `@supabase/ssr` cookies (`HttpOnly`, `Secure`, `SameSite=Lax`).
  `proxy.ts` refreshes tokens; server code uses `getUser()` (validated), never
  `getSession()` alone for authorisation.
- `CLASSROOM_DEVICE` accounts: created by SCHOOL_ADMIN, long random password
  stored only on the device via the sign-in flow; sessions refresh
  indefinitely while the device stays active; admin can revoke (membership
  `is_active = false` → next token refresh drops claims → RLS denies).
- MFA (TOTP) **recommended** for SUPER_ADMIN and SCHOOL_ADMIN — flagged for
  decision; Supabase supports it natively.
- Grown-up gate in Child Mode is a UX guard, **not** a security boundary.

## 3. Authorization (see ADR-008)
1. JWT claims from `memberships` via custom access token hook.
2. RLS on every table; function-only writes for `attempts`, `skill_mastery`,
   `audit_logs`.
3. Server Actions re-validate role for privileged operations and never accept
   `school_id`, `learner_id` scope or role from the client without RLS backing.
4. Deny-by-default: new tables get `enable row level security` + no policies
   until written; CI test fails if any `public` table lacks RLS.

## 4. Input validation and output encoding
- Zod at every boundary: Server Actions, Route Handlers, env vars, seed content,
  activity JSON on **both** write (CMS) and read (client, defence in depth).
- React escapes output by default; `dangerouslySetInnerHTML` is banned by ESLint
  rule except for a single sanitised SVG renderer (DOMPurify) used for
  colouring/tracing SVGs that come only from `media-published`.
- File uploads (CMS): allow-list MIME + magic-byte sniff (`image/svg+xml`,
  `image/webp`, `image/avif`, `image/png`, `audio/ogg`, `audio/webm`,
  `audio/mp4`), size caps (image 500 kB, audio 2 MB, SVG 200 kB), SVG sanitised
  server-side (strip scripts/foreign objects/external refs), re-encoded raster
  images, content-addressed filenames.

## 5. Web security headers (Next.js `headers()` config)
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'nonce-…'
  (strict-dynamic); img-src 'self' data: https://<project>.supabase.co;
  media-src 'self' https://<project>.supabase.co; connect-src 'self'
  https://<project>.supabase.co https://*.ingest.sentry.io; frame-ancestors
  'none'; base-uri 'self'; form-action 'self'`. Nonce-based CSP via `proxy.ts`.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  `X-Frame-Options: DENY`.
- CSRF: Server Actions are origin-checked by Next.js; Route Handlers require
  the Supabase bearer/cookie plus `Origin` allow-list; no cookie-only state
  changes via GET.

## 6. Rate limiting and abuse
- No Redis. Use Vercel WAF / rate-limit rules on `/api/sync` and `/auth/*`
  (platform feature), plus Supabase Auth's built-in rate limits.
- `/api/sync`: ≤ 25 items, ≤ 1 MB, ≤ 60 requests/min per user; payloads are
  rejected before DB access.
- Application-level counters in Postgres (`sync_batches`) allow detection of
  anomalous devices.

## 7. Secrets and environments
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are the
  only public values. Secret key, Sentry auth token, Figma token live in
  Vercel/GitHub encrypted env and are never referenced in client code (ESLint
  rule blocking `process.env.SUPABASE_SECRET_KEY` outside `src/lib/server`).
- `.env.example` documents every variable with purpose and where to obtain it.
- GitHub secret scanning + `gitleaks` in CI; Dependabot + `pnpm audit` gate.
- Separate Supabase projects for staging and production; local Docker for dev.

## 8. Audit logging
Trigger/function-written `audit_logs` for: membership changes, learner
create/update/delete, consent changes, publish/archive, data export/erase,
mastery overrides, sign-in failures (from Auth logs). Readable by SCHOOL_ADMIN
(own school) and SUPER_ADMIN. Never contains full learner records — only ids and
changed fields.

## 9. Supply chain
- Every dependency must be justified in `implementation-plan.md` §Dependencies.
- Lockfile committed; `pnpm install --frozen-lockfile` in CI.
- Renovate/Dependabot weekly; high/critical vulns block merge.

## 10. Security test matrix (executed in CI — see testing.md)
| Test | Layer |
| --- | --- |
| Teacher of School A selects School B learner → 0 rows | pgTAP |
| CLASSROOM_DEVICE selects `attempts`, `skill_mastery`, `teacher_observations` → 0 rows | pgTAP |
| CLASSROOM_DEVICE inserts attempt for learner outside its classes → rejected | pgTAP |
| CONTENT_EDITOR calls publish → denied | pgTAP + Server Action test |
| Client sends forged `school_id` in Server Action payload → ignored/denied | Vitest |
| Expired session hits teacher route → redirected; Server Action → 401 | Playwright |
| Upload of SVG with `<script>` → sanitised/rejected | Vitest |
| Oversized `/api/sync` payload → 413 before DB | Vitest |
| Any `public` table without RLS → test fails | pgTAP |
| Learner progress route accessed without session → 404/redirect, no data | Playwright |
| Privilege escalation: SCHOOL_ADMIN grants SUPER_ADMIN → denied | pgTAP |

## 11. Human review items
- MFA policy for admin roles.
- Whether Vercel WAF rules (paid tier) are in budget vs. relying on Supabase
  Auth limits + application caps.
- Penetration test before production release (external, if budget allows).
