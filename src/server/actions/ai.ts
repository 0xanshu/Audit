"use server";

import axios from "axios";
import { env } from "~/env";
import type { ToolRecommendation } from "~/lib/auditEngine";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

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
    const payload = {
      model: "qwen/qwen3.5-122b-a10b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.6,
      top_p: 0.95,
      chat_template_kwargs: { enable_thinking: true },
    };

    console.log("📤 Sending request to NVIDIA NIM API:");
    console.log("URL:", NVIDIA_API_URL);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(NVIDIA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${env.NVIDIA_NIM_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Received response from NVIDIA NIM API:");
    console.log("Status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const apiResponse: { choices?: Array<{ message?: { content?: string } }> } =
      response.data;

    const summaryText: string =
      apiResponse?.choices?.[0]?.message?.content ?? FALLBACK_SUMMARY;

    console.log("✅ Extracted summary:", summaryText);

    return { success: true, summary: summaryText };
  } catch (error) {
    console.error("❌ NVIDIA NIM API Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
    }
    return { success: false, summary: FALLBACK_SUMMARY };
  }
}
