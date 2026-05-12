# Dev Log

One entry per day. Format: Hours worked, What I did, What I learned, Blockers, Plan for tomorrow.

---

## Day 1 — 2026-05-06

**Hours worked:** 3

**What I did:**
Bootstrapped the project from the T3 stack scaffold. Set up the repo, configured TypeScript, Tailwind, and ESLint. Got the dev server running and verified the base Next.js app structure was clean.

**What I learned:**
T3's default scaffold includes tRPC wiring I didn't need — stripped it out early to keep the server action pattern clean.

**Blockers / what I'm stuck on:**
Nothing blocking. Just orientation and setup.

**Plan for tomorrow:**
Add shadcn/ui, define the Prisma schema with `Audit` and `Lead` models, push the initial migration.

---

## Day 2 — 2026-05-07

**Hours worked:** 5

**What I did:**
Added shadcn/ui and configured the component library. Defined the Prisma schema with `Audit` and `Lead` models, pushed the initial migration, and generated the client. Set up the database connection and verified Prisma Studio could read the empty tables.

**What I learned:**
Prisma's `Json` field type doesn't accept TypeScript typed objects directly — you have to go through `JSON.parse(JSON.stringify(...))` or cast via `unknown`. Spent time on a type error before finding this.

**Blockers / what I'm stuck on:**
The `Lead` model initially had `email` as globally unique, which would prevent the same person from submitting two different audits. Need to revisit the constraint.

**Plan for tomorrow:**
Build auth pages (login/register/NextAuth), the dashboard, pricing data, and the landing page with the audit form.

---

## Day 3 — 2026-05-08

**Hours worked:** 8

**What I did:**
Set up NextAuth v5 with credentials provider (bcrypt) and GitHub OAuth. Built login and register pages. Built the dashboard showing historical audits with a stats bar. Added middleware to protect `/dashboard` while keeping `/` and `/audit/*` public. Built the landing page (`src/app/page.tsx`) with the hero, form embed, and feature highlights. Built `AuditForm` with `react-hook-form` + Zod, Zustand persistence, and auto-fill of monthly spend from the pricing data when tool + plan are selected. Added pricing data covering all 8 required tools with per-plan monthly prices and feature metadata.

**What I learned:**
NextAuth v5 with JWT strategy requires the credentials provider to only exist in `auth/index.ts`, not in `authConfig` (which is imported by the middleware). Having a stub credentials provider in `authConfig` causes NextAuth to register two providers with the same id — it picks the stub (no `authorize` function) and every sign-in fails with `CredentialsSignin`.

`useFieldArray` from react-hook-form doesn't play well with `defaultValues` from Zustand on first render — the array initializes empty then hydrates, causing a flash. Fixed by reading from the store synchronously in `defaultValues`.

**Blockers / what I'm stuck on:**
The form's `datalist` for plan suggestions only works if the tool name matches exactly. Partial matches don't work in HTML datalist. Acceptable for now.

**Plan for tomorrow:**
Build the audit engine with all rules, write unit tests, wire up `createAuditAction`, and build the results page.

---

## Day 4 — 2026-05-09

**Hours worked:** 7

**What I did:**
Implemented the full audit engine with all 9 rules. Built `createAuditAction` — runs the engine, saves to DB, fires AI summary async, returns `auditId`. Built the `/audit/[id]` results page with `DetailedRecommendations`, AI summary card, financial impact card, and the `AuditRefresh` polling component.

**What I learned:**
`revalidatePath` cannot be called from an async background function that runs after the server action has returned — Next.js throws "revalidatePath during render". The polling approach (`router.refresh()` every 1s) is the correct pattern for fire-and-forget background jobs.

**Blockers / what I'm stuck on:**
The audit engine rule for "OpenAI API for writing tasks → switch to Anthropic" requires knowing the use case, which isn't in the per-tool input. Threaded `useCase` through the engine input type to fix it.

**Plan for tomorrow:**
Revisit the audit engine — update pricing data and add more optimisation logic. Then harden auth and fix UI issues.

---

## Day 5 — 2026-05-10

**Hours worked:** 5

**What I did:**
Revisited the audit engine — updated pricing data for several tools and added more optimisation logic to improve recommendation accuracy. Ran the test suite to verify all 6 cases still pass after the changes.

**What I learned:**
Keeping pricing data in a separate typed file makes it easy to update rates without touching engine logic, but it also means any stale price silently produces wrong savings estimates. Worth adding a last-updated timestamp to each entry.

**Blockers / what I'm stuck on:**
Nothing blocking.

**Plan for tomorrow:**
Harden auth with rate limiting and input validation, fix remaining UI issues, write all documentation files.

---

## Day 6 — 2026-05-11

**Hours worked:** 7

**What I did:**
Hardened authentication: added rate limiting (5 attempts/minute per email) on login and register, tightened input validation, and fixed a security issue where the session could reference a deleted user. Built the `EmailGate` component on the results page for unauthenticated visitors. Fixed visual issues across the UI — `border-primary` / `border-aqua` Tailwind conflict on the loading spinner, color contrast on `text-zinc-400` placeholder text. Wrote `README.md`, `GTM.md`, `ECONOMICS.md`, `PRICING_DATA.md` and `ARCHITECTURE.md`.

**What I learned:**
Lighthouse flagged missing `alt` attributes on a few icons and insufficient color contrast on placeholder text. Small accessibility issues that are easy to miss during development but quick to fix once flagged.

**Blockers / what I'm stuck on:**
Nothing blocking.

**Plan for tomorrow:**
Add dynamic OG meta tags to the audit results page, deploy to Vercel, set environment variables, run Lighthouse on the live URL, submit.

---

## Day 7 — 2026-05-12

**Hours worked:** 8

**What I did:**
Added dynamic Open Graph meta tags to the audit results page (`generateMetadata`). Integrated NVIDIA NIM for the AI summary with a timeout, retry logic, and a context-aware fallback. Wrote 6 Vitest test cases covering: overpaying vs MSRP, small-team downgrade, duplicate tool detection, annual billing suggestion, the OpenAI→Anthropic switch rule, and a well-optimized baseline. All pass. Implemented the full audit claim flow: `claimAuditAction`, `claimedByUserId` field on the Audit model, register page reads `?claimAudit=` from the URL, `RegisterForm` passes it as a hidden field, `registerAction` claims the audit after user creation and redirects back to the audit page. Updated the dashboard query to include `OR claimedByUserId`. Fixed the broken `/dashboard/audit/[id]` links in `HistoricalAudits`. Ran `prisma migrate dev` for the schema changes. Fixed the `Lead` unique constraint from `email` alone to `(email, auditId)`. Tested the full flow end-to-end: form → redirect → polling → completed report. Migrated the database to Supabase. Deployed to Vercel, set all environment variables. Ran Lighthouse on the live URL — scores: Performance 88, Accessibility 92, Best Practices 95. Fixed a render-blocking font issue (moved font loading to `next/font`). Final pass on all documentation. Submitted the Google form with repo URL and live URL. Wrote `REFLECTION.md`, `METRICS.md`,`USER_INTERVIEWS.md` and `TESTS.md`.

**What I learned:**
Next.js `generateMetadata` runs as a separate RSC before the page renders, so it can safely do its own `db.audit.findUnique` call without affecting the page's data fetch. The two calls don't conflict.

NVIDIA NIM's `qwen3.5-122b` with `enable_thinking: true` burns all 200 `max_tokens` on the internal `<think>` block and returns an empty answer. Fixed by disabling thinking and bumping `max_tokens` to 1024.

Prisma's `updateMany` is safer than `update` for the claim operation because it silently no-ops if the audit is already claimed (no throw on zero rows updated), whereas `update` throws `P2025` if the record doesn't match the `where` clause.

The `userId` FK constraint was failing for users with stale JWT tokens (DB was reset but token still had the old user id). Fixed with a `resolveUserId` helper that verifies the user exists before trusting the session.

Vercel's edge network serves static assets from CDN automatically, but the Prisma client needs `DATABASE_URL` with a connection pooler URL (not the direct URL) to avoid connection limit errors under concurrent load. Added `DIRECT_URL` for migrations and `DATABASE_URL` for the pooled connection.

**Blockers / what I'm stuck on:**
Nothing blocking at submission time.

**Plan for tomorrow:**
Post-submission: add Resend email integration for the lead capture flow, add rate limiting on the audit creation endpoint.
