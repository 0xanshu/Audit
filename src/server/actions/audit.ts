"use server";

import { db } from "~/server/db";
import { runAuditEngine, type AuditConfiguration } from "~/lib/auditEngine";
import { revalidatePath } from "next/cache";

import { auth } from "~/server/auth";
import { generateAuditSummaryAction } from "./ai";

export async function createAuditAction(input: AuditConfiguration) {
  try {
    const session = await auth();

    // 1. Run the data through our mathematical audit engine
    const result = runAuditEngine(input);

    // 2. Generate personalized AI summary (with hardcoded fallback)
    const { summary: generatedSummary } = await generateAuditSummaryAction(
      result.recommendations,
      result.totalSavingsMonthly,
      input.tools,
      input.teamSize,
      input.useCase,
    );

    // 3. Persist the raw input, recommendations, and savings to the database
    const savedAudit = await db.audit.create({
      data: {
        userId: session?.user?.id ?? null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        userInput: input as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        auditResult: result.recommendations as unknown as any,
        totalSavingsMonthly: result.totalSavingsMonthly,
        aiSummary: generatedSummary || result.summary || "",
      },
    });

    revalidatePath("/dashboard");

    // 3. Return the generated ID so the frontend can redirect or show results
    return { success: true, auditId: savedAudit.id };
  } catch (error) {
    console.error("Audit creation failed:", error);
    return { success: false, error: "Failed to generate audit." };
  }
}
