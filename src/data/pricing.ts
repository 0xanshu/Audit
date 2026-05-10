export type PricingPlan = {
  name: string;
  priceMonthly: number;
  priceYearly?: number;
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
      hobby: { name: "Hobby", priceMonthly: 0, priceYearly: 0 },
      pro: { name: "Pro", priceMonthly: 20, priceYearly: 16 },
      "pro-plus": { name: "Pro+", priceMonthly: 60, priceYearly: 48 },
      ultra: { name: "Ultra", priceMonthly: 200, priceYearly: 160 },
      business: { name: "Business", priceMonthly: 40, minSeats: 1 },
    },
  },
  Copilot: {
    tool: "Copilot",
    type: "subscription",
    plans: {
      free: { name: "free", priceMonthly: 0 },
      pro: { name: "Pro", priceMonthly: 10 },
      "pro-plus": { name: "Pro+", priceMonthly: 39 },
      business: { name: "Business", priceMonthly: 19 },
      enterprise: { name: "Enterprise", priceMonthly: 39 },
    },
  },
  Claude: {
    tool: "Claude",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      pro: { name: "Pro", priceMonthly: 20, priceYearly: 17 },
      max: { name: "Max", priceMonthly: 100 },
      "team-standard": {
        name: "Standard Team",
        priceMonthly: 25,
        priceYearly: 20,
        minSeats: 5,
      },
      "team-premium": {
        name: "Premium Team",
        priceMonthly: 125,
        priceYearly: 100,
        minSeats: 5,
      },
    },
  },
  ChatGPT: {
    tool: "ChatGPT",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      go: { name: "Go", priceMonthly: 8 },
      plus: { name: "Plus", priceMonthly: 20 },
      Pro: { name: "Pro", priceMonthly: 100 },
      Business: {
        name: "Business",
        priceMonthly: 25,
        priceYearly: 25,
        minSeats: 2,
      },
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
      "ai-plus": { name: "AI Plus", priceMonthly: 8 },
      "ai-pro": { name: "AI Pro", priceMonthly: 20 },
      "ai-ultra": { name: "AI Ultra", priceMonthly: 250 },
    },
  },
  Windsurf: {
    tool: "Windsurf",
    type: "subscription",
    plans: {
      free: { name: "Free", priceMonthly: 0 },
      pro: { name: "Pro", priceMonthly: 20 },
      max: { name: "Max", priceMonthly: 200 },
      team: { name: "Teams", priceMonthly: 40, minSeats: 2 },
    },
  },
};
