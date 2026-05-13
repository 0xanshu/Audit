# Prompts

## The Prompt (Current — v1.2)

**Model:** NVIDIA NIM `qwen/qwen3.5-122b-a10b`

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

**Parameters:** `max_tokens: 1024`, `temperature: 0.6`, `top_p: 0.95`, `enable_thinking: false`

No system message — NIM's qwen3.5 responds well to direct user-role prompts.

---

## What I Tried That Didn't Work

**v1.0 — `enable_thinking: true` with `max_tokens: 200`**
The model's internal `<think>` block consumed all 200 tokens. Output was empty or just the `</think>` closing tag. Fix: disabled thinking, bumped tokens to 1024.

**v1.1 — 15s timeout**
The 122B model has 20–30s cold starts on NIM. 15s timeout caused every first attempt to fail, exhausted retries. Fix: bumped to 45s timeout, reduced retries from 2 to 1 (90s max total wait — fine for a background job).

**Residual `<think>` blocks**
Even with `enable_thinking: false`, the model occasionally emits `<think>...</think>` blocks. Fix: strip with regex before saving:
```ts
rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
```

---

## Fallback

If the API fails (timeout, rate limit, 5xx, or no key), the app generates a deterministic summary from audit data:

```
Your audit identified {N} tools. We recommend: {top 3 action items}.
Top opportunity: {highest-savings recommendation}.
Potential annual savings: ${savings * 12} by implementing these changes.
```

Uses actual audit data, not a generic template. Status is set to `"failed"` so the UI can indicate it's a fallback, but the report is still fully usable.

---

## Design Notes

- Temperature 0.6 balances natural language with consistency. Lower (0.2–0.3) produced summaries that just parroted the input data instead of synthesizing it.
- The 100-word target is enforced by prompt instruction, not token limit. Model reliably produces 80–150 words.
