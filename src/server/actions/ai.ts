"use server";

import axios from "axios";
import { env } from "~/env";
import type { ToolRecommendation } from "~/lib/auditEngine";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const API_TIMEOUT = 200000;
const MAX_RETRIES = 1;

/**
 * Generate context-aware fallback summary based on audit data
 */
function generateContextFallback(
  recommendations: ToolRecommendation[],
  totalSavingsMonthly: number,
  teamSize: number,
  useCase: string,
  reason?: string,
): string {
  const actionItems = recommendations
    .filter((r) => r.savingsMonthly > 0)
    .slice(0, 3)
    .map((r) => `${r.tool} (${r.status})`)
    .join(", ");

  const topRecommendation = recommendations.sort(
    (a, b) => b.savingsMonthly - a.savingsMonthly,
  )[0];

  const reasonText = reason
    ? `Note: Using cached analysis due to ${reason}. `
    : "";

  return `${reasonText}Your audit identified ${recommendations.length} tools. We recommend: ${actionItems ?? "reviewing your current stack"}. Top opportunity: ${topRecommendation?.recommendedAction ?? "optimize your subscription costs"}. Potential annual savings: $${(totalSavingsMonthly * 12).toFixed(0)} by implementing these changes.`;
}

export async function generateAuditSummaryAction(
  recommendations: ToolRecommendation[],
  totalSavingsMonthly: number,
  tools: { tool: string; plan: string; monthlySpend: number }[],
  teamSize: number,
  useCase: string,
): Promise<{ success: boolean; summary: string }> {
  // If no API key is provided, return contextual fallback
  if (!env.NVIDIA_NIM_API_KEY) {
    console.warn(
      "⚠️  NVIDIA_NIM_API_KEY not configured. Using fallback summary.",
    );
    return {
      success: false,
      summary: generateContextFallback(
        recommendations,
        totalSavingsMonthly,
        teamSize,
        useCase,
        "API key not configured",
      ),
    };
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

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const payload = {
        model: "qwen/qwen3.5-122b-a10b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.6,
        top_p: 0.95,
        chat_template_kwargs: { enable_thinking: false },
      };

      console.log(
        `📤 Sending request to NVIDIA NIM API (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
      );
      console.log("URL:", NVIDIA_API_URL);

      const response = await axios.post(NVIDIA_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${env.NVIDIA_NIM_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: API_TIMEOUT,
      });

      console.log("📥 Received response from NVIDIA NIM API:");
      console.log("Status:", response.status);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const apiResponse: {
        choices?: Array<{ message?: { content?: string } }>;
      } = response.data;

      const rawContent: string =
        apiResponse?.choices?.[0]?.message?.content ?? "";

      // Strip <think>...</think> blocks that reasoning models sometimes emit
      const summaryText =
        rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim() ||
        generateContextFallback(
          recommendations,
          totalSavingsMonthly,
          teamSize,
          useCase,
        );

      console.log("✅ Successfully extracted summary from API");
      return { success: true, summary: summaryText };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (status && status >= 400 && status < 500 && status !== 429) {
          console.error(
            `❌ API Client Error (${status}). Not retrying:`,
            error.response?.data,
          );
          break;
        }

        // Classify error
        if (status === 429) {
          console.warn(`⚠️  Rate limited. Retrying after backoff...`);
        } else if (status === 503 || status === 502) {
          console.warn(`⚠️  API temporarily unavailable. Retrying...`);
        } else if (error.code === "ECONNABORTED") {
          console.warn(`⚠️  Request timeout. Retrying...`);
        } else {
          console.warn(
            `⚠️  API error (${status ?? error.code}). Attempt ${attempt + 1}/${MAX_RETRIES + 1}`,
          );
        }

        if (attempt < MAX_RETRIES) {
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${delayMs}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
      } else {
        console.error("❌ Unexpected error:", lastError.message);
      }
    }
  }

  // All retries exhausted - return graceful fallback
  console.error(
    "❌ All retry attempts exhausted. Using fallback summary.",
    lastError?.message,
  );
  return {
    success: false,
    summary: generateContextFallback(
      recommendations,
      totalSavingsMonthly,
      teamSize,
      useCase,
      lastError?.message ?? "API unavailable",
    ),
  };
}
