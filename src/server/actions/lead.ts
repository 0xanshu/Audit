"use server";

import { z } from "zod";
import { db } from "~/server/db";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  auditId: z.string().min(1),
});

export async function captureLeadAction(formData: FormData) {
  const parse = schema.safeParse({
    email: formData.get("email"),
    auditId: formData.get("auditId"),
  });

  if (!parse.success) {
    return { error: parse.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, auditId } = parse.data;

  const audit = await db.audit.findUnique({
    where: { id: auditId },
    select: { id: true },
  });
  if (!audit) return { error: "Audit not found" };

  // Unique on (email, auditId) — safe to upsert
  await db.lead.upsert({
    where: { email_auditId: { email, auditId } },
    update: {},
    create: { email, auditId },
  });

  return { success: true };
}
