"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "~/server/auth";
import { db } from "~/server/db";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_")
  );
}

/* ─── Constants ────────────────────────────────────────────────────────────── */

const SALT_ROUNDS = 10;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/\S/, "Password cannot be only whitespace"),
});

/* ─── Simple In-Memory Rate Limiting ─────────────────────────────────────── */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(key: string): {
  success: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { success: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      success: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { success: true };
}

/* ─── Actions ─────────────────────────────────────────────────────────────── */

export async function loginAction(formData: FormData) {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");

  const parse = loginSchema.safeParse({
    email: typeof emailRaw === "string" ? emailRaw : "",
    password: typeof passwordRaw === "string" ? passwordRaw : "",
  });

  if (!parse.success) {
    const firstError = parse.error.issues[0];
    return { error: firstError?.message ?? "Invalid input" };
  }

  const { email, password } = parse.data;
  const rate = checkRateLimit(`login:${email}`);
  if (!rate.success) {
    return { error: `Too many attempts. Try again in ${rate.retryAfter}s.` };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return { error: "Invalid credentials" };
  }
}

export async function registerAction(formData: FormData) {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");
  const nameRaw = formData.get("name");
  const claimAuditId =
    typeof formData.get("claimAudit") === "string"
      ? (formData.get("claimAudit") as string)
      : null;

  const parse = registerSchema.safeParse({
    name: typeof nameRaw === "string" ? nameRaw : "",
    email: typeof emailRaw === "string" ? emailRaw : "",
    password: typeof passwordRaw === "string" ? passwordRaw : "",
  });

  if (!parse.success) {
    const firstError = parse.error.issues[0];
    return { error: firstError?.message ?? "Invalid input" };
  }

  const { name, email, password } = parse.data;
  const rate = checkRateLimit(`register:${email}`);
  if (!rate.success) {
    return { error: `Too many attempts. Try again in ${rate.retryAfter}s.` };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let newUserId: string;
  try {
    const user = await db.user.create({
      data: { email, name, password: hashedPassword },
    });
    newUserId = user.id;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { error: "An account with this email already exists" };
    }
    console.error("[auth] Registration failed:", error);
    return { error: "Failed to create account. Please try again." };
  }

  // Claim the anonymous audit if one was passed
  if (claimAuditId) {
    try {
      await db.audit.updateMany({
        where: { id: claimAuditId, userId: null, claimedByUserId: null },
        data: { claimedByUserId: newUserId },
      });
    } catch (err) {
      // Non-fatal — user still gets their account
      console.error("[auth] Failed to claim audit:", err);
    }
  }

  const redirectTo = claimAuditId ? `/audit/${claimAuditId}` : "/dashboard";

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return { error: "Account created but sign-in failed. Please log in." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signInWithGitHub() {
  try {
    await signIn("github", { redirectTo: "/dashboard" });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    throw new Error("GitHub sign-in failed");
  }
}
