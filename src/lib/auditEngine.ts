import { AI_TOOLS_PRICING } from "~/data/pricing";

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

export interface ToolRecommendation {
  tool: string;
  status: "keep" | "downgrade" | "switch";
  recommendedAction: string;
  savingsMonthly: number;
  reason: string;
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalSavingsMonthly: number;
}

export function runAuditEngine(input: AuditConfiguration): AuditResult {
  const recommendations: ToolRecommendation[] = [];
  let totalSavingsMonthly = 0;

  for (const t of input.tools) {
    let status: "keep" | "downgrade" | "switch" = "keep";
    let recommendedAction = "Keep current plan.";
    let savingsMonthly = 0;
    let reason = "Your usage and pricing are optimized.";

    const toolKey = Object.keys(AI_TOOLS_PRICING).find(
      (k) =>
        k.toLowerCase() === t.tool.toLowerCase() ||
        AI_TOOLS_PRICING[k]?.tool.toLowerCase() === t.tool.toLowerCase(),
    );

    const toolData = toolKey ? AI_TOOLS_PRICING[toolKey] : undefined;

    if (toolData) {
      const planKey = Object.keys(toolData.plans).find(
        (k) =>
          k.toLowerCase() === t.plan.toLowerCase() ||
          toolData.plans[k]?.name.toLowerCase() === t.plan.toLowerCase(),
      );
      const planData = planKey ? toolData.plans[planKey] : undefined;

      // Calculate MSRP expected cost
      const expectedMSRP =
        toolData.type === "subscription" && planData
          ? planData.priceMonthly * t.seats
          : 0;

      if (expectedMSRP > 0 && t.monthlySpend > expectedMSRP) {
        status = "downgrade";
        savingsMonthly = t.monthlySpend - expectedMSRP;
        recommendedAction = "Remove inactive seats.";
        reason = `You are spending $${t.monthlySpend}/mo but ${t.seats} seats on the ${t.plan} plan should only cost $${expectedMSRP}/mo.`;
      } else if (
        t.seats < 5 &&
        (t.plan.toLowerCase().includes("enterprise") ||
          t.plan.toLowerCase().includes("business") ||
          t.plan.toLowerCase().includes("team"))
      ) {
        status = "downgrade";
        const lowerPlanPrice =
          toolData.plans.pro?.priceMonthly ??
          toolData.plans.plus?.priceMonthly ??
          20;
        const proposedCost = lowerPlanPrice * t.seats;

        if (t.monthlySpend > proposedCost) {
          status = "downgrade";
          savingsMonthly = t.monthlySpend - proposedCost;
          recommendedAction = `Downgrade to a Pro/Plus tier.`;
          reason = `Teams under 5 rarely need Enterprise/Business features. Downgrading saves $${savingsMonthly}/mo.`;
        }
      } else if (
        (t.tool.toLowerCase().includes("openai") ||
          t.tool.toLowerCase().includes("chatgpt")) &&
        input.useCase.toLowerCase().includes("writing")
      ) {
        status = "switch";
        savingsMonthly = Math.round(t.monthlySpend * 0.2);
        recommendedAction = "Switch to Anthropic API.";
        reason =
          "Anthropic is typically cheaper and better suited for heavy writing/copy tasks.";
      } else if (
        toolData.type === "subscription" &&
        t.monthlySpend > 0 &&
        t.monthlySpend === expectedMSRP
      ) {
        status = "switch";
        savingsMonthly = Math.round(t.monthlySpend * 0.15);
        recommendedAction = "Route billing through CreDex for credits.";
        reason = `You are paying MSRP retail prices. Get startup credits to save roughly $${savingsMonthly}/mo.`;
      }
    }

    recommendations.push({
      tool: t.tool,
      status,
      recommendedAction,
      savingsMonthly,
      reason,
    });

    totalSavingsMonthly += savingsMonthly;
  }

  return {
    recommendations,
    totalSavingsMonthly,
  };
}
