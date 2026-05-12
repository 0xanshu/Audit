# Reflection

---

## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug was the `CredentialsSignin` error that made login and registration completely broken for about two hours.

The symptom was clear: every attempt to sign in with email/password returned a generic "Invalid credentials" error, even with a freshly created account and the correct password. The Prisma logs showed the `COMMIT` succeeding — the user was being created — but the subsequent `signIn("credentials", ...)` call was failing.

My first hypothesis was a bcrypt issue — maybe the hash was being double-hashed or the comparison was failing. I added logging around `bcrypt.compare` and confirmed it was returning `true`. So the `authorize` function was working correctly.

My second hypothesis was a session/JWT issue. I checked the `authConfig` callbacks and they looked fine.

The actual cause took another 30 minutes to find: when I added the credentials provider stub to `authConfig` (to fix a different JWT issue), NextAuth ended up with two providers both registered under the id `"credentials"`. NextAuth resolves providers by id and picks the first match — which was the stub with no `authorize` function. The real provider with the bcrypt logic was never called.

The fix was a single line: remove the stub from `authConfig`. The JWT callbacks work based on `strategy: "jwt"` regardless of which providers are listed — they don't need the credentials provider to be present in the config that the middleware imports.

What I learned: NextAuth's provider resolution is silent about duplicates. There's no warning when two providers share the same id. The only signal is the generic `CredentialsSignin` error, which points to the authorize function failing — but in this case the authorize function was never even reached.

---

## 2. A decision you reversed mid-week, and what made you reverse it

I initially built the AI summary as a synchronous part of the server action — the action would call the NVIDIA NIM API, wait for the response, update the DB, and then redirect the user. This felt clean: one action, one result, one redirect.

I reversed this after the first real test. The NIM API with a large model takes 15–45 seconds. Keeping the user on a loading screen for 45 seconds before they even see the results page is a terrible experience. The form submit button would appear frozen.

The reversal was to fire the AI call as a background promise (`void processAuditSummaryAsync(...)`) and redirect immediately. The results page starts with `status = "processing"` and polls every second via `router.refresh()`. When the AI finishes, the next poll shows the completed report.

This introduced a new problem: `revalidatePath` was being called from the background function after the server action had returned, which Next.js throws an error for ("revalidatePath during render"). The fix was to remove `revalidatePath` from the background function entirely and rely purely on the client-side polling — which is the correct pattern anyway.

The trade-off is slightly more complexity (polling component, status field in the DB) for dramatically better UX. Worth it.

---

## 3. What you would build in week 2 if you had it

The most valuable thing to build in week 2 would be the email delivery layer and a proper lead nurture sequence.

Right now, when someone submits their email in the `EmailGate`, we save a `Lead` record but send nothing. The user gets a "✓ Got it" confirmation and a link to create an account — but there's no email in their inbox, no audit link they can forward to their manager, no follow-up.

Week 2 would add:

- Resend integration to send a transactional email immediately after lead capture: "Here's your audit report: [link]. Your team could save $X/month."
- A 3-email drip sequence (Day 1: report link, Day 3: "Did you implement any of these?", Day 7: "Book a 15-minute call with our team").
- A simple admin view showing all leads, their audit savings amounts, and whether they've converted to accounts.
- Rate limiting on audit creation (currently anyone can spam the endpoint).
- Resend webhook to track email opens and clicks, feeding back into the lead score.

The email layer is where the actual business value is — a saved report link that lands in someone's inbox is far more likely to be acted on than a browser tab they close.

---

## 4. How you used AI tools

I used Kiro (Claude-based) as the primary coding assistant throughout the week.

**What I used it for:**

- Scaffolding boilerplate (Prisma schema, server actions, form components) — this saved roughly 3–4 hours of typing.
- Debugging error messages by pasting the full stack trace and asking for the root cause.
- Writing the first draft of documentation files (README, ARCHITECTURE).
- Suggesting the `JSON.parse(JSON.stringify(...))` pattern for Prisma's `Json` field type issue.

**What I didn't trust it with:**

- The audit engine business logic. The rules (which plan tiers to flag, which tools overlap, what savings percentages are realistic) required judgment about the actual AI tools market. The AI would generate plausible-sounding rules that were factually wrong about pricing.
- The NextAuth provider conflict bug. The AI's first suggestion was to add `trustHost: true` to the config, which was irrelevant. I had to trace through the NextAuth source code myself to understand provider id resolution.

**One specific time the AI was wrong:**
When I asked it to fix the `revalidatePath during render` error, it suggested wrapping the call in `setTimeout(() => revalidatePath(...), 0)`. This doesn't work — `revalidatePath` is not a browser API and the timing doesn't matter; the issue is the execution context, not the timing. The correct fix (remove it from the background function and rely on client polling) came from reading the Next.js error docs directly.

---

## 5. Self-rating on a 1–10 scale

**Discipline: 7/10**
Worked consistently across all 7 days with no zero-hour days. Lost about half a day to the auth bug that could have been avoided by reading the NextAuth v5 migration docs more carefully before starting.

**Code quality: 7/10**
The server actions are clean and well-typed. The audit engine is pure and testable. The main weakness is the frontend components — some have grown larger than they should and would benefit from being split. The `AuditForm` component in particular is doing too much.

**Design sense: 6/10**
The design is functional and consistent with the sand/aqua color system. It's not visually striking. The results page in particular could be more impactful — the savings number should be the hero of the page, not buried in a card.

**Problem solving: 8/10**
Found the root cause of both major bugs (FK constraint, credentials provider conflict) by reading source code and error docs rather than guessing. The fire-and-forget + polling architecture was a good solution to the AI latency problem.

**Entrepreneurial thinking: 7/10**
The "show value first, ask for commitment later" flow is the right call for conversion. The audit claim flow (anonymous → register → claim) is a real product decision, not just a technical one. Could have gone further — the email drip sequence and the admin lead view are obvious next steps that would make this a real lead generation tool rather than a demo.
