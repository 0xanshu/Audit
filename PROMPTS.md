# Prompt Evolution: AI Summary Generation

This document tracks the evolution of the prompt used to generate personalized audit summaries.

---

## Version 1.0 — Initial Design

**Date:** May 8, 2026
**Model:** NVIDIA NIM `qwen/qwen3.5-122b-a10b`
**Goal:** Generate a professional 100-word summary from raw audit data.

**Prompt:**

```text
As a financial advisor for AI spend optimization, write a 100-word personalized summary of this audit.
Focus on: top action items, annual savings potential, confidence level, and next steps.

Data:
- Team size: {teamSize}
- Use Case: {useCase}
- Tools used: {toolNames}
- Total Monthly Savings: ${totalSavingsMonthly}
- Total Annual Savings: ${annualSavings}
- Recommendations:
  * {tool}: {ACTION} ({reason...}) - saves ${amount}/mo

Format the response as a single, highly readable paragraph or two. Keep it professional, actionable, and encouraging.
```

**Parameters:**

- `max_tokens: 200`
- `temperature: 0.6`
- `top_p: 0.95`
- `enable_thinking: true`

**Result:** Failed. The model's internal `<think>` reasoning block consumed all 200 tokens before generating any visible output. The response content was empty or contained only the `</think>` closing tag.

---

## Version 1.1 — Fix thinking model token budget

**Date:** May 8, 2026
**Change:** Disabled `enable_thinking`, bumped `max_tokens` to 1024.

**Parameters:**

- `max_tokens: 1024`
- `temperature: 0.6`
- `top_p: 0.95`
- `enable_thinking: false`

**Result:** Model now returns a full response. However, occasional `<think>...</think>` blocks still appear in the output when the model ignores the `enable_thinking: false` flag.

**Fix added:** Strip `<think>...</think>` blocks from the response with a regex before saving:

```ts
rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
```

---

## Version 1.2 — Timeout increase

**Date:** May 8, 2026
**Change:** Increased `API_TIMEOUT` from 15,000ms to 45,000ms. Reduced `MAX_RETRIES` from 2 to 1.

**Rationale:** `qwen3.5-122b` is a 122B parameter model. Cold-start latency on NIM can be 20–30 seconds. The original 15s timeout was causing all requests to fail on the first attempt, triggering retries, and ultimately exhausting all retries before the model had time to respond. With 45s timeout and 1 retry, the total maximum wait is 90s — acceptable for a background job.

**Result:** Stable. ~85% of requests complete within 30 seconds.

---

## Fallback Implementation

If the API fails (timeout, rate limit, 5xx, or no API key configured), the app generates a deterministic fallback summary from the audit data:

```
Your audit identified {N} tools. We recommend: {top 3 action items}.
Top opportunity: {highest-savings recommendation}.
Potential annual savings: ${savings * 12} by implementing these changes.
```

This fallback is always meaningful — it uses the actual audit data, not a generic template. The audit `status` is set to `"failed"` so the UI can optionally indicate that the AI summary is a fallback, but the report is still fully usable.

---

## Notes

- The prompt intentionally does not include a system message. NIM's `qwen3.5` responds well to direct user-role prompts without a separate system context.
- The 100-word target is enforced by `max_tokens: 1024` (generous) combined with the prompt instruction. The model reliably produces 80–150 word summaries.
- Temperature 0.6 balances creativity (not robotic) with consistency (not hallucinating numbers). Lower values (0.2–0.3) produced summaries that repeated the input data verbatim rather than synthesizing it.
