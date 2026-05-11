import { AI_TOOLS_PRICING } from "~/data/pricing";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToolInput {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditConfiguration {
  tools: ToolInput[];
  teamSize: number;
  useCase: string;
}

export type SuggestionFlag = "keep" | "downgrade" | "switch" | "cancel" | "optimize";

export interface ToolRecommendation {
  tool: string;
  plan: string;
  status: SuggestionFlag;
  recommendedAction: string;
  savingsMonthly: number;
  savingsPercent: number;
  reason: string;
  confidence: "high" | "medium" | "low";
  isDuplicate: boolean;
  overlapWith?: string;
}

export interface PricingBreakdown {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  costPerSeat: number;
  expectedMSRP: number;
  isOverpaying: boolean;
  similarTools: string[];
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalSavingsMonthly: number;
  totalSavingsYearly: number;
  breakdown: PricingBreakdown[];
  duplicateTools: string[][];
  summary: string;
}

interface ToolMatch {
  name: string;
  key: string;
  pricing: (typeof AI_TOOLS_PRICING)["Cursor"];
}

// ─── Types for internal pricing data ─────────────────────────────────────────

interface PricingPlanData {
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  minSeats?: number;
  features?: string[];
}

interface ToolPricingData {
  tool: string;
  type: "subscription" | "api";
  plans: Record<string, PricingPlanData>;
  notes?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find a tool in the pricing database (case-insensitive, partial match)
 */
function findTool(toolName: string): ToolMatch | undefined {
  for (const [key, pricing] of Object.entries(AI_TOOLS_PRICING)) {
    if (!pricing) continue;
    const nameMatch = key.toLowerCase() === toolName.toLowerCase();
    const toolMatch = pricing.tool?.toLowerCase() === toolName.toLowerCase();
    if (nameMatch || toolMatch) {
      return {
        name: pricing.tool,
        key,
        pricing,
      };
    }
  }
  return undefined;
}

/**
 * Find a plan in a tool's plans (case-insensitive, partial match)
 */
function findPlan(
  toolData: ToolPricingData,
  planName: string
): { key: string; data: PricingPlanData } | undefined {
  for (const key of Object.keys(toolData.plans)) {
    const plan = toolData.plans[key];
    if (!plan) continue;
    if (key.toLowerCase() === planName.toLowerCase() || plan.name.toLowerCase() === planName.toLowerCase()) {
      return { key, data: plan };
    }
  }
  return undefined;
}

/**
 * Calculate what a single seat of a plan costs per month.
 */
function getMSRP(toolData: ToolPricingData, planKey: string): number {
  return toolData.plans[planKey]?.priceMonthly ?? 0;
}

/**
 * Detect if a plan name represents an expensive enterprise-y tier.
 */
function isEnterpriseTier(planName: string): boolean {
  const lower = planName.toLowerCase();
  return ["enterprise", "business", "team", "ultra", "max", "pro-plus", "pro+", "premium"].some(
    (tier) => lower.includes(tier)
  );
}

/**
 * Detect if a plan name represents a basic pro tier.
 */
function isProTier(planName: string): boolean {
  const lower = planName.toLowerCase();
  return ["pro", "plus", "ai-pro", "team-standard"].some((tier) => lower.includes(tier));
}

/**
 * Find the cheapest non-free plan for a given tool.
 */
function findCheapestPaidPlan(toolData: ToolPricingData): { key: string; data: PricingPlanData } | undefined {
  for (const [key, plan] of Object.entries(toolData.plans)) {
    if (plan.priceMonthly > 0) {
      return { key, data: plan };
    }
  }
  return undefined;
}

/**
 * Find the pro-tier plan (typically mid-tier) for a given tool.
 */
function findProPlan(toolData: ToolPricingData): { key: string; data: PricingPlanData } | undefined {
  let cheapest: { key: string; data: PricingPlanData } | undefined;
  for (const [key, plan] of Object.entries(toolData.plans)) {
    if (isProTier(key) && plan.priceMonthly > 0) {
      if (!cheapest || plan.priceMonthly < cheapest.data.priceMonthly) {
        cheapest = { key, data: plan };
      }
    }
  }
  return cheapest;
}

/**
 * Calculate potential annual savings from switching to yearly billing.
 */
function calcAnnualSavings(planData: PricingPlanData, seats: number): number {
  if (!planData.priceYearly || planData.priceYearly >= planData.priceMonthly) {
    return 0;
  }
  const monthly = planData.priceMonthly * seats;
  const yearly = (planData.priceYearly ?? 0) * seats;
  return monthly - yearly;
}

/**
 * Determine if there are similar/fungible tools in the stack.
 */
function findSimilarTools(input: ToolInput[]): { pairs: string[][]; allSimilar: string[] } {
  const pairs: string[][] = [];
  const allSimilar = new Set<string>();

  // Categories of mutually substitutable tools
  const categories = [
    ["ChatGPT", "Claude", "Gemini", "Anthropic"],
    ["Cursor", "Windsurf", "Copilot"],
    ["OpenAI API", "Anthropic API", "Gemini API"],
  ];

  for (const cat of categories) {
    const found = input.filter((t) =>
      cat.some((c) => t.tool.toLowerCase().includes(c.toLowerCase()))
    );
    if (found.length > 1) {
      pairs.push(found.map((f) => f.tool));
      found.forEach((f) => allSimilar.add(f.tool));
    }
  }

  return { pairs, allSimilar: Array.from(allSimilar) };
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export function runAuditEngine(input: AuditConfiguration): AuditResult {
  const recommendations: ToolRecommendation[] = [];
  let totalSavingsMonthly = 0;
  let totalSavingsYearly = 0;
  const breakdown: PricingBreakdown[] = [];

  // Detect potential duplicates / overlapping tools
  const dupData = findSimilarTools(input.tools);

  for (const t of input.tools) {
    let status: SuggestionFlag = "keep";
    let recommendedAction = "Keep your current setup — pricing looks good.";
    let savingsMonthly = 0;
    let reason = "Your pricing and plan are well-optimized for your team size and use case.";
    let confidence: "high" | "medium" | "low" = "high";
    let isDuplicate = false;
    let overlapWith: string | undefined = undefined;

    const toolMatch = findTool(t.tool);

    if (!toolMatch) {
      // Unknown tool: can't make a recommendation with confidence
      confidence = "low";
      reason = `We don't have pricing data for "${t.tool}". Consider comparing manually.`;
      recommendedAction = "Compare this tool's pricing with alternatives.";

      recommendations.push({
        tool: t.tool,
        plan: t.plan,
        status: "keep",
        recommendedAction,
        savingsMonthly: 0,
        savingsPercent: 0,
        reason,
        confidence,
        isDuplicate: false,
      });

      // Pricing breakdown for unknown tools
      breakdown.push({
        tool: t.tool,
        plan: t.plan,
        monthlySpend: t.monthlySpend,
        seats: t.seats,
        costPerSeat: t.seats > 0 ? t.monthlySpend / t.seats : 0,
        expectedMSRP: 0,
        isOverpaying: false,
        similarTools: [],
      });
      continue;
    }

    const toolData = toolMatch.pricing;
    const planMatch = findPlan(toolData, t.plan);
    const planKey = planMatch?.key ?? "";
    const planData = planMatch?.data;

    const msrp = toolData ? getMSRP(toolData, planKey) : 0;
    const expectedCost = msrp * t.seats;
    const isOverpaying = expectedCost > 0 && t.monthlySpend > expectedCost;

    // Check for duplicate / overlapping tools
    if (dupData.pairs.some((pair) => pair.includes(t.tool))) {
      isDuplicate = dupData.allSimilar.includes(t.tool);
      overlapWith = dupData.allSimilar
        .filter((tool) => tool !== t.tool)
        .find((tool) =>
          dupData.pairs
            .filter((pair) => pair.includes(t.tool))
            .some((pair) => pair.includes(tool))
        );
    }

    // ─── Rule 1: Overpaying vs. Published MSRP ────────────────────────
    if (expectedCost > 0 && t.monthlySpend > expectedCost * 1.05) {
      status = "optimize";
      savingsMonthly = t.monthlySpend - expectedCost;
      recommendedAction = `Review your billing: ${t.seats} × $${msrp}/mo = $${expectedCost}/mo is the list price. Verify if you have unused add-ons or seats.`;
      reason = `You currently pay $${t.monthlySpend}/mo, but the published price for the ${t.plan} plan is ~$${expectedCost}/mo (${t.seats} seats).`;
      confidence = "high";
    }
    // ─── Rule 2: Small team on Enterprise tier ──────────────────────────
    else if (
      input.teamSize < 5 &&
      isEnterpriseTier(t.plan) &&
      toolData.type === "subscription"
    ) {
      status = "downgrade";

      const proPlan = findProPlan(toolData);

      if (proPlan) {
        const proposed = proPlan.data.priceMonthly * t.seats;
        savingsMonthly = t.monthlySpend - proposed;
        recommendedAction = `Downgrade to ${proPlan.data.name} ($${proPlan.data.priceMonthly}/seat) — your team of ${input.teamSize} likely doesn't need the ${t.plan} tier.`;
        reason = `Teams under 5 rarely need the enterprise/security features of the ${t.plan} plan. The ${proPlan.data.name} plan at $${proPlan.data.priceMonthly}/seat is usually sufficient.`;
        confidence = "high";
      } else {
        const cheapPlan = findCheapestPaidPlan(toolData);
        if (cheapPlan) {
          const proposed = cheapPlan.data.priceMonthly * t.seats;
          savingsMonthly = t.monthlySpend - proposed;
          recommendedAction = `Switch to ${cheapPlan.data.name} ($${cheapPlan.data.priceMonthly}/seat) — a smaller plan would suit your team size.`;
          reason = `Teams under 5 rarely need the enterprise/security features of the ${t.plan} plan.`;
          confidence = "high";
        }
      }
    }
    // ─── Rule 3: Expensive tier without a data-heavy use case ───────────
    else if (
      planData &&
      planData.priceMonthly >= 100 &&
      !input.useCase.toLowerCase().includes("research") &&
      !input.useCase.toLowerCase().includes("data") &&
      !input.useCase.toLowerCase().includes("heavy")
    ) {
      status = "downgrade";
      const proPlan = findProPlan(toolData);
      if (proPlan) {
        const proposed = proPlan.data.priceMonthly * t.seats;
        savingsMonthly = t.monthlySpend - proposed;
        recommendedAction = `Downgrade to ${proPlan.data.name} ($${proPlan.data.priceMonthly}/seat) — the ${t.plan} tier is overkill for your use case.`;
        reason = `The ${t.plan} plan at $${planData.priceMonthly}/seat is designed for heavy, data-intensive workloads. For general ${input.useCase || "usage"}, the ${proPlan.data.name} plan offers nearly the same functionality.`;
        confidence = "medium";
      }
    }
    // ─── Rule 4: Annual billing opportunity ───────────────────────────────
    else if (
      planData?.priceYearly &&
      planData.priceYearly < planData.priceMonthly
    ) {
      const yearlySavings = calcAnnualSavings(planData, t.seats);
      if (yearlySavings > 0) {
        // This isn't a monthly "saving", but a bill-switch opportunity
        status = "optimize";
        recommendedAction = `Switch to annual billing to save ~$${yearlySavings}/year ($${(yearlySavings / 12).toFixed(0)}/mo equiv.).`;
        reason = `You pay $${planData.priceMonthly}/seat/month. The annual plan drops the effective rate to $${planData.priceYearly}/seat/month.`;
        // Don't count this in monthly savings to avoid confusion
        totalSavingsYearly += yearlySavings;
        confidence = "high";
      }
    }
    // ─── Rule 5: Paying MSRP without credits / bulk ───────────────────────
    else if (
      toolData.type === "subscription" &&
      expectedCost > 0 &&
      Math.abs(t.monthlySpend - expectedCost) < 0.01 &&
      input.teamSize >= 5
    ) {
      status = "optimize";
      const estimatedSavings = Math.round(t.monthlySpend * 0.15);
      savingsMonthly = estimatedSavings;
      recommendedAction = `Explore startup credits or annual commitment discounts (typically 15–20% off).`;
      reason = `As a team of ${input.teamSize}, you may qualify for startup credits, bulk pricing, or annual-commitment discounts that can shave 15–20% off MSRP.`;
      confidence = "medium";
    }
    // ─── Rule 6: Overlapping tools (duplicate spending) ─────────────────
    else if (isDuplicate && overlapWith) {
      status = "cancel";
      savingsMonthly = t.monthlySpend;
      recommendedAction = `Your ${t.tool} subscription overlaps with ${overlapWith}. Consider canceling one.`;
      reason = `You're paying for both ${t.tool} and ${overlapWith}, which serve similar purposes in your stack. Consolidating can save $${t.monthlySpend}/mo.`;
      confidence = "medium";
    }
    // ─── Rule 7: OpenAI / ChatGPT for writing tasks ─────────────────────
    else if (
      (t.tool.toLowerCase().includes("openai") ||
        t.tool.toLowerCase().includes("chatgpt")) &&
      input.useCase.toLowerCase().includes("writing")
    ) {
      status = "switch";
      const estimated = Math.round(t.monthlySpend * 0.2);
      savingsMonthly = estimated;
      recommendedAction = `Consider Anthropic (Claude) for heavy writing tasks — it's often 20–30% cheaper for copy and long-form content.`;
      reason = `Your primary use case is ${input.useCase}. Anthropic's Claude typically offers better pricing per token for writing workloads and excels at long-context content.`;
      confidence = "medium";
    }

    // ─── Aggregate ─────────────────────────────────────────────────────
    recommendations.push({
      tool: t.tool,
      plan: t.plan,
      status,
      recommendedAction,
      savingsMonthly,
      savingsPercent:
        t.monthlySpend > 0
          ? Math.round((savingsMonthly / t.monthlySpend) * 100)
          : 0,
      reason,
      confidence,
      isDuplicate,
      overlapWith,
    });

    totalSavingsMonthly += savingsMonthly;

    // Pricing breakdown for this tool
    breakdown.push({
      tool: t.tool,
      plan: t.plan,
      monthlySpend: t.monthlySpend,
      seats: t.seats,
      costPerSeat: t.seats > 0 ? t.monthlySpend / t.seats : 0,
      expectedMSRP: msrp,
      isOverpaying,
      similarTools: dupData.allSimilar.filter(
        (tool) => tool !== t.tool && dupData.pairs.some((pair) => pair.includes(t.tool) && pair.includes(tool))
      ),
    });
  }

  // ─── Summary ─────────────────────────────────────────────────────────
  const totalSpend = input.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const savingsPercent = totalSpend > 0 ? Math.round((totalSavingsMonthly / totalSpend) * 100) : 0;

  const summary =
    totalSavingsMonthly > 0
      ? `We found $${totalSavingsMonthly.toFixed(2)}/mo in potential savings (${savingsPercent}% of your total $${totalSpend}/mo AI spend).${
          totalSavingsYearly > 0
            ? ` Switching to annual billing could save an additional ~$${totalSavingsYearly}/year.`
            : ""
        }`
      : totalSavingsYearly > 0
      ? `Your plan selections are solid, but switching to annual billing could save ~$${totalSavingsYearly}/year.`
      : "Your AI tool spending looks well-optimized — we didn't find any immediate savings opportunities.";

  return {
    recommendations,
    totalSavingsMonthly: Math.round(totalSavingsMonthly),
    totalSavingsYearly: Math.round(totalSavingsYearly),
    breakdown,
    duplicateTools: dupData.pairs,
    summary,
  };
}
