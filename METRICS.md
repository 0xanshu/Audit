# Metrics

## North Star Metric

**Total dollar volume of AI spend analyzed**

This metric captures both usage (audits run) and quality (users with real spend to analyze). A high volume of low-spend audits is less valuable than a smaller number of high-spend audits. Tracking total spend analyzed tells us whether we're reaching the right audience.

Target: $1M in AI spend analyzed in the first 30 days post-launch.

---

## 3 Tracking Inputs

**1. Audit completion rate**
Definition: % of visitors who reach the results page (i.e., submit the form).
Why it matters: Measures form friction. If this drops below 40%, the form is too long or confusing.
How to track: Server-side — count `Audit` rows created per day divided by unique visitors (from Vercel Analytics or Plausible).
Target: ≥ 55%

**2. Email capture rate**
Definition: % of completed audits where the visitor submits their email in the `EmailGate`.
Why it matters: This is the primary lead generation event. Low capture rate means the value proposition of "saving the report" isn't compelling enough, or the savings amount is too low to motivate action.
How to track: Count `Lead` rows created per day divided by `Audit` rows with `status = "completed"`.
Target: ≥ 15%

**3. Savings per audit (average)**
Definition: Average `totalSavingsMonthly` across all completed audits.
Why it matters: Tells us whether we're reaching companies with real overspend problems. If the average is below $100/month, we're either reaching very small teams or the audit engine rules are too conservative.
How to track: `SELECT AVG(totalSavingsMonthly) FROM Audit WHERE status = 'completed'`
Target: ≥ $400/month average savings identified
