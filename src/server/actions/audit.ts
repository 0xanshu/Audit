"use server";

import { db } from "~/server/db";
import {
  runAuditEngine,
  type AuditConfiguration,
  type ToolRecommendation,
} from "~/lib/auditEngine";
import { revalidatePath, revalidateTag } from "next/cache";

import { auth } from "~/server/auth";
import { generateAuditSummaryAction } from "./ai";

async function processAuditSummaryAsync(
  auditId: string,
  recommendations: ToolRecommendation[],
  totalSavingsMonthly: number,
  tools: { tool: string; plan: string; monthlySpend: number; seats: number }[],
  teamSize: number,
  useCase: string,
  fallbackSummary: string | undefined,
) {
  try {
    const { success, summary } = await generateAuditSummaryAction(
      recommendations,
      totalSavingsMonthly,
      tools,
      teamSize,
      useCase,
    );

    await db.audit.update({
      where: { id: auditId },
      data: {
        aiSummary: summary ?? fallbackSummary ?? "",
        status: success ? "completed" : "failed",
        aiSummaryError: success ? null : "AI generation failed",
      },
    });
  } catch (error) {
    console.error("Failed async AI summary update:", error);
    await db.audit.update({
      where: { id: auditId },
      data: {
        aiSummary: fallbackSummary ?? "",
        status: "failed",
        aiSummaryError: String(error),
      },
    });
  } finally {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/audit/${auditId}`);
    revalidateTag(`audit-${auditId}`);
  }
}

export async function createAuditAction(input: AuditConfiguration) {
  try {
    const session = await auth();

    // 1. Run the data through our mathematical audit engine
    const result = runAuditEngine(input);

    // 2. Persist the raw input, recommendations, and savings to the database as "processing"
    const savedAudit = await db.audit.create({
      data: {
        userId: session?.user?.id ?? null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        userInput: input as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        auditResult: result.recommendations as unknown as any,
        totalSavingsMonthly: result.totalSavingsMonthly,
        status: "processing",
        aiSummary: "",
      },
    });

    // 3. Kick off AI summary generation in the background
    // Fire and forget so we don't block the UI
    void processAuditSummaryAsync(
      savedAudit.id,
      result.recommendations,
      result.totalSavingsMonthly,
      input.tools,
      input.teamSize,
      input.useCase,
      result.summary,
    );

    revalidatePath("/dashboard");

    // 4. Return the generated ID so the frontend can redirect or show results
    return { success: true, auditId: savedAudit.id };
  } catch (error) {
    console.error("Audit creation failed:", error);
    return { success: false, error: "Failed to generate audit." };
  }
}
