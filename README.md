# Audit — AI Spend Optimizer

Audit analyzes your team's AI tool subscriptions and surfaces actionable savings: wrong plan tiers, duplicate tools, and overpaid seats — all in under 10 seconds, no login required.

Built for engineering leads, CTOs, and finance teams at companies spending $500–$50k/month on AI tooling.

> **Live URL:** _Add your Vercel URL here_
> **Demo recording:** _Add Loom/YouTube link here_

---

## Screenshots

> _Add 3+ screenshots or a 30-second screen recording link here._
> Suggested shots: landing page with form, audit results page, email gate CTA.

---

## Quick Start

### Prerequisites

- Node.js 20+ / Bun
- PostgreSQL (local or remote)
- NVIDIA NIM API key (optional — app works without it via fallback)
- GitHub OAuth app (for social login)

### Install & Run Locally

```bash
# 1. Clone
git clone <your-repo-url>
cd audit

# 2. Install dependencies
bun install   # or npm install

# 3. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
# Optionally add NVIDIA_NIM_API_KEY

# 4. Set up the database
npx prisma migrate dev

# 5. Start dev server
bun dev   # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

```bash
# Push to GitHub, then connect repo in Vercel dashboard.
# Set all env vars from .env in Vercel → Settings → Environment Variables.
# Vercel auto-detects Next.js — no build config needed.
```

---

## Decisions

Five meaningful trade-offs made during the build:

**1. No login required to run an audit**
Gating the form behind auth kills conversion. The "show value first" model — run audit anonymously, then offer account creation to save the report — mirrors how Stripe and Linear onboard. Trade-off: anonymous audits can't be automatically linked to a user unless they register, so we added a `claimedByUserId` field and a post-register claim flow.

**2. Rule-based audit engine over pure LLM**
The core savings math is deterministic (pricing data × seats × rules). Using an LLM for the math would be slow, expensive, and non-auditable. The LLM is only used for the narrative summary — a task it's actually good at. Trade-off: the rule engine requires maintaining a pricing data file manually as vendors change plans.

**3. Fire-and-forget AI summary with polling**
The AI summary is generated asynchronously after the audit is saved. The user is redirected immediately to the results page, which polls every second via `router.refresh()` until the status flips to `completed`. Trade-off: slightly more complex than a synchronous call, but the UX is dramatically better — no 30-second loading spinner blocking the redirect.

**4. JWT sessions over database sessions**
JWT sessions mean the middleware can validate auth without a DB round-trip on every request, which matters for edge performance. Trade-off: tokens can't be revoked server-side without a blocklist. Acceptable for this use case since there's no sensitive financial data stored — only spend figures the user typed in.

**5. NVIDIA NIM over OpenAI for the summary**
NIM's `qwen3.5-122b` model is available on a generous free tier, making the app fully functional at zero AI cost during development and for low-volume production. Trade-off: the model is slower than GPT-4o-mini and the API has occasional cold-start latency, which is why the timeout is set to 45s and a fallback summary is always generated.
