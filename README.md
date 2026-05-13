# Audit - AI Spend Optimizer

Audit is a free tool that analyzes your team's AI subscriptions and tells you where you're overspending. Wrong plan tiers, duplicate tools, unused seats — it catches all of it in under 10 seconds, no login needed.

Built for eng leads and CTOs at startups spending $500–$50k/month on AI tooling.


## Screenshots

<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/c1516a48-9a0d-49c8-84ba-15b7a5172143" />
<img width="1915" height="966" alt="image" src="https://github.com/user-attachments/assets/ec978f2f-41ae-45c3-8e27-57ff729dbbf4" />


## Quick Start

**Prerequisites:** Node.js 20+ / Bun, PostgreSQL, GitHub OAuth app. NVIDIA NIM API key is optional (fallback works without it).

```bash
git clone <your-repo-url>
cd audit
bun install          # or npm install
cp .env.example .env # fill in DATABASE_URL, AUTH_SECRET, GitHub OAuth creds
npx prisma migrate dev
bun dev              # → http://localhost:3000
```

### Deploy

Push to GitHub → connect in Vercel dashboard → set env vars → done. Vercel auto-detects Next.js.


## Decisions

**1. No login to run an audit.**
Gating behind auth kills conversion. Show value first, ask for an account later. Trade-off: anonymous audits need a post-register claim flow (`claimedByUserId`).

**2. Rule-based engine, not LLM math.**
Pricing × seats × rules is deterministic and auditable. The LLM only writes the narrative summary. Trade-off: pricing data file needs manual updates when vendors change plans.

**3. Async AI summary with polling.**
The NIM call takes 15–45s. Instead of blocking, I fire it in the background and redirect immediately. The results page polls via `router.refresh()` until status flips to `completed`. Slightly more complex, dramatically better UX.

**4. JWT sessions over DB sessions.**
No DB round-trip on every middleware check. Trade-off: can't revoke tokens server-side, but there's no sensitive data stored — just spend figures the user typed in.

**5. NVIDIA NIM over OpenAI.**
Free tier means $0 AI cost during dev and low-volume production. Trade-off: slower than GPT-4o-mini, occasional cold starts, hence the 45s timeout and fallback summary.
