# User Interviews

Three conversations during dev week. 10–20 minutes each.

---

## Interview 1 — Engineering Manager, 35-person Series B SaaS

**Date:** May 8, 2026 — 15-min voice call

Small team, tight budget. Was paying for AI tools out of pocket before the company had a card.

**Quotes:**
> "We have ChatGPT Plus for 3 people, Claude Pro for 2, and we're paying for the Anthropic API separately. Pretty sure there's overlap but I've never checked."

> "The form is a bit intimidating. I don't know my exact spend off the top of my head. Can it estimate?"

> "$200/month savings? I'd implement that today. That's real money for us."

**Surprising:** Even at a tiny startup, the overlap problem already exists (ChatGPT + Claude + API).

**What changed:** Added auto-fill of spend from pricing data (tool + plan → calculated cost). Built the duplicate tool detection rule specifically for this pattern. Simplified the form — dropped the "company name" field.

---