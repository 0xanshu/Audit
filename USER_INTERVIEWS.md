# User Interviews

Three interviews conducted during development week. Names anonymized.

---

## Interview 1

**Role:** Engineering Manager, 35-person Series B SaaS company
**Date:** May 7, 2026
**Format:** 20-minute Slack call

**Context:** Manages a team of 12 engineers. Approved AI tool purchases individually over the past year without a central audit.

**Key quotes:**

> "I honestly don't know what we're paying for Copilot vs Cursor. Both are on the card. I think some people use both."

> "The thing I'd actually want is something I can send to my CFO. Like a one-pager that says 'here's what we're spending, here's what we should cut.' Not a dashboard I have to log into."

> "I don't need it to be fancy. I need it to be fast and credible."

**What changed in the UI/logic:**

- Added the shareable `/audit/[id]` public URL specifically so reports can be forwarded to finance/CFO without requiring them to log in.
- Made the "Financial Impact" card more prominent on the results page — the dollar number is the thing people want to show their boss.
- Removed the requirement to log in before running an audit. This interviewee said he would have bounced immediately if he had to create an account first.

---

## Interview 2

**Role:** Technical Co-founder, 8-person pre-seed startup
**Date:** May 8, 2026
**Format:** 15-minute voice call

**Context:** Small team, tight budget. Paying for several AI tools personally before the company had a card.

**Key quotes:**

> "We have ChatGPT Plus for 3 people, Claude Pro for 2 people, and we're paying for the Anthropic API separately. I'm pretty sure there's overlap but I've never sat down to figure it out."

> "The form is a bit intimidating. I don't know my exact monthly spend off the top of my head. Can it just estimate?"

> "If it told me I could save $200/month I'd implement it that day. That's real money for us."

**What changed in the UI/logic:**

- Added auto-fill of monthly spend from the pricing data when tool + plan are selected. The user doesn't need to know their exact bill — the tool calculates it from seats × plan price.
- Added the duplicate tool detection rule specifically because this interviewee's stack (ChatGPT + Claude + Anthropic API) is a very common pattern.
- Lowered the visual complexity of the form — removed a "company name" field that was in an earlier draft.

---

## Interview 3

**Role:** VP of Engineering, 120-person Series C company
**Date:** May 9, 2026
**Format:** 20-minute Zoom call

**Context:** Manages a large engineering org with centralized software procurement. AI tools were approved ad-hoc by individual teams.

**Key quotes:**

> "We did a manual audit last quarter. It took two weeks and a spreadsheet. If this does it in 60 seconds I'd use it every quarter."

> "The thing I care about is seat utilization. We have 40 Copilot seats but I think only 20 people actually use it. That's $380/month wasted."

> "I'd want to export this as a PDF or CSV to put in a budget review doc."

**What changed in the UI/logic:**

- Added the seat utilization check to the audit engine (Rule 8: large teams on basic tier → upgrade, but also flagging teams where reported seats >> team size).
- Added the "Annual potential" line to the Financial Impact card — this interviewee specifically mentioned that annual numbers land better in budget reviews than monthly.
- PDF/CSV export is noted as a week 2 feature — not implemented this week but added to the backlog.
