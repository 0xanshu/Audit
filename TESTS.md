# Tests

## How to Run

```bash
npx vitest run          # all tests, CI mode
npx vitest              # watch mode
npx vitest run --coverage
```

## Test File

`src/lib/auditEngine.test.ts` — 5 test cases covering the audit engine (pure function, no external deps).

| # | Test | Input | Expected |
|---|------|-------|----------|
| 1 | Overpaying vs MSRP | GitHub Copilot Business at $50/seat (MSRP $19), 5 seats | `status: "downgrade"`, `savingsMonthly > 0` |
| 2 | Small team on enterprise tier | 3-person team on Cursor Business ($40/seat) | Downgrade to Pro ($20/seat), saves $60/mo |
| 3 | Duplicate tool detection | ChatGPT Plus + Claude Pro in same stack | At least one `isDuplicate: true`, `status: "cancel"` or `"switch"` |
| 4 | Annual billing opportunity | GitHub Copilot Individual at $10/mo monthly billing | `status: "optimize"`, mentions annual saves ~17% |
| 5 | Wrong tool for use case | OpenAI API spend, `useCase: "Content Creation"` | `status: "switch"` to Anthropic API, `savingsMonthly > 0` |

## CI

Tests run on every push via `.github/workflows/ci.yml`. Failing test blocks the merge.
