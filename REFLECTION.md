# Reflection

---

## 1. Hardest bug and how I debugged it

The auth system was completely broken for about two hours — every login attempt returned "Invalid credentials" even with the correct password on a freshly created account.

First thing I checked was bcrypt. Added logging around `bcrypt.compare` — it returned `true`. So the `authorize` function was fine, the password was matching. Next I looked at the JWT callbacks in `authConfig`, those looked correct too.

Took another 30 minutes to find the real issue: I'd added a credentials provider stub to `authConfig` (to fix a separate JWT problem), which meant NextAuth had two providers with the same id `"credentials"`. It resolves providers by id and picks the first match — the stub with no `authorize` function. My real provider was never called.

Fix was one line: remove the stub. JWT callbacks work based on `strategy: "jwt"` regardless of which providers are listed in the middleware config.

The frustrating part is NextAuth gives you zero warning about duplicate provider ids. The error just says `CredentialsSignin`, which makes you think `authorize` is failing — but it was never even reached.

---

## 2. Decision I reversed mid-week

Originally built the AI summary as synchronous — the server action calls NIM, waits for the response, updates DB, then redirects. Clean and simple.

Reversed it after the first real test. NIM takes 15–45 seconds with a 122B model. The user stares at a frozen submit button for 45 seconds before seeing anything. Terrible UX.

The fix: fire the AI call as a background promise, redirect immediately to the results page with `status = "processing"`, and poll via `router.refresh()` every second until it completes.

This broke `revalidatePath` — calling it from a background function after the server action has returned throws an error in Next.js. Removed it entirely and relied on the client-side polling instead, which is the correct pattern anyway.

More complex (polling component, status field in DB), but the UX went from unusable to smooth.

---

## 3. What I'd build in week 2

The email layer. Right now when someone submits their email in the EmailGate, we save a Lead record and show them "✓ Got it" — but nothing lands in their inbox. No audit link to forward to their manager, no follow-up.

Week 2 priorities:
- Resend integration: transactional email immediately after lead capture with the report link and savings amount
- 3-email drip: Day 1 report, Day 3 "did you implement any changes?", Day 7 "book a call"
- Simple admin view: all leads, their savings amounts, conversion status
- Rate limiting on audit creation
- Resend webhooks to track opens/clicks

A report link in someone's inbox is 10x more likely to be acted on than a browser tab they'll close.

---

## 4. How I used AI tools

Used Kiro (Claude-based) as my primary coding assistant.

**Used it for:** Scaffolding boilerplate (Prisma schema, server actions, form components — saved 3–4 hours of typing), debugging by pasting stack traces, first drafts of docs, and the `JSON.parse(JSON.stringify(...))` workaround for Prisma's Json field.

**Didn't trust it with:** The audit engine business logic — it generates plausible-sounding rules that are factually wrong about AI tool pricing. Also didn't trust it with the NextAuth provider bug. Its first suggestion was `trustHost: true`, which was completely irrelevant. I had to trace through NextAuth's source myself.

**One time it was wrong:** Asked it to fix the "revalidatePath during render" error. It suggested `setTimeout(() => revalidatePath(...), 0)`. That doesn't work — `revalidatePath` isn't a browser API, the issue is execution context not timing. The real fix (remove it from the background function, use client polling) came from reading the Next.js error docs.

---

## 5. Self-rating

**Discipline: 7/10** — Worked all 7 days, no zero-hour days. Lost half a day to the auth bug that I could've avoided by reading the NextAuth v5 migration docs first.

**Code quality: 7/10** — Server actions and audit engine are clean and well-typed. Frontend components got a bit fat — `AuditForm` in particular needs splitting.

**Design sense: 6/10** — Consistent color system, functional layout. Not visually striking. The savings number should be the hero of the results page, not buried in a card.

**Problem solving: 8/10** — Found root causes of both major bugs by reading source code, not guessing. The async + polling architecture was a solid solution to the latency problem.

**Entrepreneurial thinking: 7/10** — "Show value first" flow is the right call. Audit claim flow is a real product decision. Could've gone further with the email drip and admin lead view.
