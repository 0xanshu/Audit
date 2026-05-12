# Tests

## Running the Tests

```bash
# Run all tests once (CI mode)
npx vitest run

# Run in watch mode during development
npx vitest

# Run with coverage report
npx vitest run --coverage
```

## Test File

`src/lib/auditEngine.test.ts`

## Test Cases

### 1. Overpaying vs MSRP

**Input:** Team reporting $50/seat for GitHub Copilot Business (MSRP: $19/seat), 5 seats
**Expected:** `status: "downgrade"`, `savingsMonthly > 0`, reason mentions overpaying

### 2. Small team on enterprise tier

**Input:** 3-person team on Cursor Business ($40/seat), use case: "Software Engineering"
**Expected:** `status: "downgrade"` to Cursor Pro ($20/seat), `savingsMonthly: 60`

### 3. Duplicate tool detection

**Input:** Both ChatGPT Plus and Claude Pro in the same stack
**Expected:** At least one recommendation with `isDuplicate: true`, `status: "cancel"` or `"switch"`

### 4. Annual billing opportunity

**Input:** GitHub Copilot Individual at $10/month (monthly billing)
**Expected:** `status: "optimize"`, recommendation mentions annual billing saves ~17%

### 5. OpenAI API for writing tasks → switch to Anthropic

**Input:** OpenAI API spend, `useCase: "Content Creation"`
**Expected:** `status: "switch"`, `recommendedAction` mentions Anthropic API, `savingsMonthly > 0`

## Coverage

The audit engine is a pure function with no side effects or external dependencies, making it straightforward to test exhaustively.

Target coverage: 80%+ on `src/lib/auditEngine.ts`

## CI Integration

Tests run automatically on every push via GitHub Actions (`.github/workflows/ci.yml`):

```yaml
- name: Run tests
  run: npx vitest run
```

A failing test blocks the merge. The green check mark on the main branch confirms all 5 test cases pass.
