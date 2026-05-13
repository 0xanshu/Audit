# Metrics

## North Star Metric

**Total dollar volume of AI spend analyzed.**

Not DAU. Not "audits completed." Dollar volume captures both usage and audience quality — a smaller number of high-spend audits is worth more than thousands of $20/mo hobby stacks.

Target: $1M in spend analyzed within 30 days of launch.

---

## 3 Input Metrics

**1. Audit completion rate** — % of visitors who submit the form and reach the results page.
- How: `Audit` rows / unique visitors (Vercel Analytics).
- Target: ≥55%. Below 40% = form is too long or confusing.

**2. Email capture rate** — % of completed audits where the visitor submits email in EmailGate.
- How: `Lead` rows / `Audit` rows with `status = "completed"`.
- Target: ≥15%. Low rate = savings aren't compelling enough to motivate action.

**3. Average savings per audit** — mean `totalSavingsMonthly` across completed audits.
- How: `SELECT AVG(totalSavingsMonthly) FROM Audit WHERE status = 'completed'`
- Target: ≥$400/mo. Below $100 = reaching teams too small or engine rules too conservative.

---

## What I'd Instrument First

Audit completion rate. It's the top of the funnel — everything else depends on people actually finishing the form.

## Pivot Trigger

If average savings per audit stays below $150/mo after 200+ audits, the tool isn't reaching companies with real overspend. At that point either the distribution is wrong (reaching hobbyists, not teams) or the engine needs more rules to surface savings in common stacks.
