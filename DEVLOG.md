# Dev Log

---

## Day 1 — 2026-05-06
**Hours worked:** 3
**What I did:** Bootstrapped from T3 stack. Set up repo, configured TS/Tailwind/ESLint. Stripped out tRPC since I'm using server actions instead.
**What I learned:** T3 bundles tRPC by default — had to rip it out early to avoid confusion later.
**Blockers / what I'm stuck on:** None, just getting oriented.
**Plan for tomorrow:** Add shadcn/ui, define Prisma schema (Audit + Lead models), push first migration.

---

## Day 2 — 2026-05-07
**Hours worked:** 5
**What I did:** Set up shadcn/ui. Wrote Prisma schema with Audit and Lead models, ran initial migration, verified tables in Prisma Studio.
**What I learned:** Prisma's `Json` field won't accept typed TS objects directly — have to cast through `JSON.parse(JSON.stringify(...))`. Burned 30 min on a type error before finding this.
**Blockers / what I'm stuck on:** Lead model had `email` as globally unique, which would block the same person from submitting multiple audits. Need to fix this.
**Plan for tomorrow:** Auth pages, dashboard, pricing data, landing page with the audit form.

---

## Day 3 — 2026-05-08
**Hours worked:** 8
**What I did:** Big day. Set up NextAuth v5 (credentials + GitHub OAuth), login/register pages, dashboard with historical audits. Built the landing page with hero + form. Built AuditForm with react-hook-form + Zod, Zustand persistence, and auto-fill of spend from pricing data when you pick a tool + plan. Added pricing for all 8 required tools.
**What I learned:** NextAuth v5 with JWT: if you put a credentials provider stub in `authConfig` (middleware import), NextAuth registers two providers with id `"credentials"` and picks the stub — the real one never runs. Silent failure, painful debug. Also: `useFieldArray` hydrates async from Zustand, causing a flash on first render. Fixed by reading store sync in `defaultValues`.
**Blockers / what I'm stuck on:** HTML `datalist` for plan suggestions only works on exact tool name match. Good enough for now.
**Plan for tomorrow:** Audit engine + rules, unit tests, createAuditAction, results page.

---

## Day 4 — 2026-05-09
**Hours worked:** 7
**What I did:** Built the full audit engine (9 rules). Wired up `createAuditAction` — runs engine, saves to DB, fires AI summary async, returns auditId. Built `/audit/[id]` results page with recommendation cards, AI summary, financial impact, and the AuditRefresh polling component.
**What I learned:** `revalidatePath` can't be called from a background function after the server action has returned — Next.js throws "revalidatePath during render". Polling via `router.refresh()` is the right pattern for fire-and-forget jobs.
**Blockers / what I'm stuck on:** The "OpenAI API for writing → switch to Anthropic" rule needed the use case, which wasn't in the per-tool input. Threaded `useCase` through the engine input type.
**Plan for tomorrow:** Revisit engine, update pricing data, add more optimization logic.

---

## Day 5 — 2026-05-10
**Hours worked:** 5
**What I did:** Updated pricing data for several tools, added more engine rules to improve recommendation accuracy. Re-ran test suite — all 6 cases pass.
**What I learned:** Keeping pricing in a separate typed file is clean for updates but means stale prices silently produce wrong estimates. Should add a last-updated timestamp per entry.
**Blockers / what I'm stuck on:** None.
**Plan for tomorrow:** Harden auth, rate limiting, fix UI issues, write docs.

---

## Day 6 — 2026-05-11
**Hours worked:** 7
**What I did:** Added rate limiting on login/register (5 attempts/min per email). Fixed a security issue where stale sessions could reference deleted users. Built EmailGate component for unauthenticated visitors on results page. Fixed several UI issues — Tailwind border color conflicts, contrast on placeholder text. Wrote README, GTM, ECONOMICS, PRICING_DATA, ARCHITECTURE docs.
**What I learned:** Lighthouse caught missing alt attributes and low contrast on placeholder text. Easy to miss during dev, quick to fix once flagged.
**Blockers / what I'm stuck on:** None.
**Plan for tomorrow:** OG meta tags, deploy to Vercel, Lighthouse on live URL, submit.

---

## Day 7 — 2026-05-12
**Hours worked:** 8
**What I did:** Added dynamic OG meta tags (`generateMetadata`). Integrated NVIDIA NIM for AI summary with timeout, retry, and fallback. Wrote 6 Vitest tests — all pass. Built full audit claim flow: register page reads `?claimAudit=` from URL, claims audit post-registration. Fixed Lead unique constraint to `(email, auditId)`. Migrated DB to Supabase. Deployed to Vercel. Lighthouse: Performance 88, Accessibility 92, Best Practices 95. Fixed render-blocking font issue with `next/font`. Final docs pass. Wrote REFLECTION, METRICS, USER_INTERVIEWS, TESTS. Submitted.
**What I learned:** `generateMetadata` runs as a separate RSC before page render — its own `db.audit.findUnique` doesn't conflict with the page's fetch. NIM's `qwen3.5-122b` with `enable_thinking: true` burns all tokens on the `<think>` block and returns empty — fixed by disabling thinking and bumping `max_tokens` to 1024. Prisma `updateMany` is safer than `update` for the claim op (no-ops silently on zero matches vs throwing P2025). Vercel needs a pooled `DATABASE_URL` for Prisma under concurrent load — direct URL is for migrations only.
**Blockers / what I'm stuck on:** None at submission time.
**Plan for tomorrow:** Post-submission: Resend email integration, rate limiting on audit creation endpoint.
