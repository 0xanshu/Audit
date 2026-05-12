"use server";

import { db } from "~/server/db";
import {
  runAuditEngine,
  type AuditConfiguration,
  type ToolRecommendation,
} from "~/lib/auditEngine";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { generateAuditSummaryAction } from "./ai";

/* ─── Background AI summary ─────────────────────────────────────────────────── */

async function processAuditSummaryAsync(
  auditId: string,
  recommendations: ToolRecommendation[],
  totalSavingsMonthly: number,
  tools: AuditConfiguration["tools"],
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
  } catch (err) {
    console.error("[audit] AI summary failed:", err);
    await db.audit.update({
      where: { id: auditId },
      data: {
        aiSummary: fallbackSummary ?? "",
        status: "failed",
        aiSummaryError: err instanceof Error ? err.message : String(err),
      },
    });
  }
  // NOTE: No revalidatePath here — calling it outside a server action context
  // causes "revalidatePath during render" errors. The audit page uses
  // AuditRefresh (polling router.refresh()) to pick up the completed state.
}

/* ─── Resolve a safe userId ──────────────────────────────────────────────────── */
// JWT tokens are stateless — the session may reference a user that no longer
// exists (e.g. after a DB reset). We verify before using the ID so we never
// hit a FK violation. Returns null for anonymous / stale sessions.
async function resolveUserId(
  sessionUserId: string | undefined,
): Promise<string | null> {
  if (!sessionUserId) return null;
  const user = await db.user.findUnique({
    where: { id: sessionUserId },
    select: { id: true },
  });
  return user?.id ?? null;
}

/* ─── Main action ────────────────────────────────────────────────────────────── */

export async function createAuditAction(input: AuditConfiguration) {
  try {
    const session = await auth();
    const userId = await resolveUserId(session?.user?.id);

    const result = runAuditEngine(input);

    const savedAudit = await db.audit.create({
      data: {
        userId,
        // Prisma Json fields require plain JSON — serialize/deserialize strips type info
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userInput: JSON.parse(JSON.stringify(input)),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        auditResult: JSON.parse(JSON.stringify(result.recommendations)),
        totalSavingsMonthly: result.totalSavingsMonthly,
        status: "processing",
        aiSummary: "",
      },
    });

    // Fire-and-forget AI summary
    void processAuditSummaryAsync(
      savedAudit.id,
      result.recommendations,
      result.totalSavingsMonthly,
      input.tools,
      input.teamSize,
      input.useCase,
      result.summary,
    );

    if (userId) revalidatePath("/dashboard");

    return { success: true, auditId: savedAudit.id };
  } catch (err) {
    console.error("[audit] createAuditAction failed:", err);
    return {
      success: false,
      error: "Failed to generate audit. Please try again.",
    };
  }
}

/* ─── Claim an anonymous audit after login/register ─────────────────────────── */

export async function claimAuditAction(auditId: string) {
  try {
    const session = await auth();
    const userId = await resolveUserId(session?.user?.id);
    if (!userId) return { success: false, error: "Not authenticated" };

    const audit = await db.audit.findUnique({
      where: { id: auditId },
      select: { userId: true, claimedByUserId: true },
    });

    if (!audit) return { success: false, error: "Audit not found" };

    // Only claim if it's still anonymous
    if (!audit.userId && !audit.claimedByUserId) {
      await db.audit.update({
        where: { id: auditId },
        data: { claimedByUserId: userId },
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[audit] claimAuditAction failed:", err);
    return { success: false, error: "Failed to claim audit." };
  }
}
