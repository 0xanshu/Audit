export type PricingPlan = {
  name: string;
  priceMonthly: number;
  minSeats?: number;
  features?: string[];
};

export type ToolPricing = {
  tool: string;
  type: "subscription" | "api";
  plans: Record<string, PricingPlan>;
  notes?: string;
};

export const AI_TOOLS_PRICING: Record<string, ToolPricing> = {
  Cursor: {
    tool: "Cursor",
    type: "subscription",
    plans: {
      hobby: { name: "Hobby", priceMonthly: 0 },
      pro: { name: "Pro", priceMonthly: 20 },
      business: { name: "Business", priceMonthly: 40 },
    },
  },
  Copilot: {
    tool: "Copilot",
    type: "subscription",
    plans: {
      individual: { name: "Individual", priceMonthly: 10 },
      business: { name: "Business", priceMonthly: 19 },
      enterprise: { name: "Enterprise", priceMonthly: 39 },
    },
  },
  Claude: {
    tool: "Claude",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      pro: { name: "Pro", priceMonthly: 20 },
      team: { name: "Team", priceMonthly: 30, minSeats: 5 },
    },
  },
  ChatGPT: {
    tool: "ChatGPT",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      plus: { name: "Plus", priceMonthly: 20 },
      team: { name: "Team", priceMonthly: 30, minSeats: 2 },
      enterprise: { name: "Enterprise", priceMonthly: 60, minSeats: 150 },
    },
  },
  Anthropic: {
    tool: "Anthropic API",
    type: "api",
    plans: {
      "pay-as-you-go": { name: "Pay-as-you-go", priceMonthly: 0 },
    },
    notes:
      "Typically cheaper and often better for pure writing and long-context processing.",
  },
  OpenAI: {
    tool: "OpenAI API",
    type: "api",
    plans: {
      "pay-as-you-go": { name: "Pay-as-you-go", priceMonthly: 0 },
    },
    notes:
      "Best for multimodal, function calling, but can be expensive for high-volume text rewriting.",
  },
  Gemini: {
    tool: "Gemini",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      advanced: { name: "Gemini Advanced", priceMonthly: 20 },
    },
  },
  Windsurf: {
    tool: "Windsurf",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      pro: { name: "Pro", priceMonthly: 15 },
    },
  },
};
