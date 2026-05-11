"use server";

import OpenAI from "openai";
import { env } from "~/env";
import type { ToolRecommendation } from "~/lib/auditEngine";

const nimClient = new OpenAI({
  apiKey: env.NVIDIA_NIM_API_KEY || "dummy",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const FALLBACK_SUMMARY =
  "Based on your team size and tools, we found optimization opportunities that could save you money. Key recommendations include consolidating overlapping tools and optimizing plans to match your actual needs.";

export async function generateAuditSummaryAction(
  recommendations: ToolRecommendation[],
  totalSavingsMonthly: number,
  tools: { tool: string; plan: string; monthlySpend: number }[],
  teamSize: number,
  useCase: string,
): Promise<{ success: boolean; summary: string }> {
  // If no API key is provided, return the fallback text immediately
  if (!env.NVIDIA_NIM_API_KEY) {
    return { success: false, summary: FALLBACK_SUMMARY };
  }

  const annualSavings = totalSavingsMonthly * 12;
  const toolNames = tools.map((t) => t.tool).join(", ");

  const prompt = `As a financial advisor for AI spend optimization, write a 100-word personalized summary of this audit. 
Focus on: top action items, annual savings potential, confidence level, and next steps. 

Data:
- Team size: ${teamSize}
- Use Case: ${useCase}
- Tools used: ${toolNames}
- Total Monthly Savings: $${totalSavingsMonthly.toFixed(2)}
- Total Annual Savings: $${annualSavings.toFixed(2)}
- Recommendations:
${recommendations
  .map(
    (r) =>
      `  * ${r.tool}: ${r.status.toUpperCase()} (${r.recommendedAction.substring(0, 80)}...) - saves $${r.savingsMonthly}/mo`,
  )
  .join("\n")}

Format the response as a single, highly readable paragraph or two. Keep it professional, actionable, and encouraging.`;

  try {
    const response = await nimClient.chat.completions.create({
      model: "qwen2-5",
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an expert SaaS procurement and AI spend auditor. Your goal is to give a concise, actionable summary of tool expenses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const summaryText =
      response.choices[0]?.message?.content || FALLBACK_SUMMARY;

    return { success: true, summary: summaryText };
  } catch (error) {
    console.error("NVIDIA NIM API Error:", error);
    return { success: false, summary: FALLBACK_SUMMARY };
  }
}
