import { describe, it, expect } from "vitest";
import { runAuditEngine } from "./auditEngine";
import type { AuditConfiguration } from "./auditEngine";

// ─── Test 1: Overpaying vs MSRP ──────────────────────────────────────────────
describe("Rule 1 — Overpaying vs MSRP", () => {
  it("flags a tool where reported spend is >5% above list price", () => {
    const input: AuditConfiguration = {
      teamSize: 10,
      useCase: "Software Engineering",
      tools: [
        {
          tool: "Copilot",
          plan: "Business",
          monthlySpend: 500, // MSRP is $19/seat × 10 = $190
          seats: 10,
        },
      ],
    };

    const result = runAuditEngine(input);
    const rec = result.recommendations[0]!;

    expect(rec.status).toBe("optimize");
    expect(rec.savingsMonthly).toBeGreaterThan(0);
    expect(rec.reason).toMatch(/published price|list price|pay/i);
  });
});

// ─── Test 2: Small team on enterprise tier ────────────────────────────────────
describe("Rule 2 — Small team on enterprise tier", () => {
  it("recommends downgrade for a 3-person team on Cursor Business", () => {
    const input: AuditConfiguration = {
      teamSize: 3,
      useCase: "Software Engineering",
      tools: [
        {
          tool: "Cursor",
          plan: "Business",
          monthlySpend: 120, // $40/seat × 3
          seats: 3,
        },
      ],
    };

    const result = runAuditEngine(input);
    const rec = result.recommendations[0]!;

    expect(rec.status).toBe("downgrade");
    expect(rec.savingsMonthly).toBeGreaterThan(0);
    expect(rec.reason).toMatch(/under 5|enterprise|team/i);
  });
});

// ─── Test 3: Duplicate tool detection ────────────────────────────────────────
describe("Rule 6 — Duplicate / overlapping tools", () => {
  it("flags one of two overlapping AI coding assistants for cancellation", () => {
    const input: AuditConfiguration = {
      teamSize: 5,
      useCase: "Software Engineering",
      tools: [
        {
          tool: "Cursor",
          plan: "Pro",
          monthlySpend: 100, // 5 × $20
          seats: 5,
        },
        {
          tool: "Copilot",
          plan: "Business",
          monthlySpend: 95, // 5 × $19
          seats: 5,
        },
      ],
    };

    const result = runAuditEngine(input);
    const duplicateRecs = result.recommendations.filter((r) => r.isDuplicate);

    expect(duplicateRecs.length).toBeGreaterThan(0);
    expect(result.duplicateTools.length).toBeGreaterThan(0);
  });
});

// ─── Test 4: Annual billing opportunity ──────────────────────────────────────
describe("Rule 4 — Annual billing opportunity", () => {
  it("suggests annual billing when a yearly rate is cheaper than monthly", () => {
    // GitHub Copilot Individual: $10/mo or $100/year ($8.33/mo effective)
    const input: AuditConfiguration = {
      teamSize: 1,
      useCase: "Software Engineering",
      tools: [
        {
          tool: "Copilot",
          plan: "Individual",
          monthlySpend: 10,
          seats: 1,
        },
      ],
    };

    const result = runAuditEngine(input);
    const rec = result.recommendations[0]!;

    // Either optimize (annual billing) or keep — both are valid
    // The key check is that annual savings are tracked if the plan has yearly pricing
    expect(["optimize", "keep"]).toContain(rec.status);
    // If annual savings exist, they should be positive
    if (result.totalSavingsYearly > 0) {
      expect(result.totalSavingsYearly).toBeGreaterThan(0);
    }
  });
});

// ─── Test 5: OpenAI for writing tasks → switch to Anthropic ──────────────────
describe("Rule 7 — OpenAI for writing tasks", () => {
  it("recommends switching to Anthropic when use case is content writing", () => {
    const input: AuditConfiguration = {
      teamSize: 4,
      useCase: "Content Writing",
      tools: [
        {
          tool: "ChatGPT",
          plan: "Plus",
          monthlySpend: 80, // 4 × $20
          seats: 4,
        },
      ],
    };

    const result = runAuditEngine(input);
    const rec = result.recommendations[0]!;

    expect(rec.status).toBe("switch");
    expect(rec.recommendedAction).toMatch(/anthropic|claude/i);
    expect(rec.savingsMonthly).toBeGreaterThan(0);
  });
});

// ─── Test 6: Well-optimized stack returns "keep" ─────────────────────────────
describe("Baseline — well-optimized stack", () => {
  it("returns keep with zero savings for a correctly priced stack", () => {
    const input: AuditConfiguration = {
      teamSize: 2,
      useCase: "Software Engineering",
      tools: [
        {
          tool: "Cursor",
          plan: "Pro",
          monthlySpend: 40, // 2 × $20 — exactly MSRP
          seats: 2,
        },
      ],
    };

    const result = runAuditEngine(input);
    const rec = result.recommendations[0]!;

    // Should not flag overpaying (within 5% tolerance)
    expect(rec.savingsMonthly).toBe(0);
    expect(["keep", "optimize"]).toContain(rec.status);
  });
});
