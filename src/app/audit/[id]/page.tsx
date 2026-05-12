import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { AuditRefresh } from "./_components/audit-refresh";
import { DetailedRecommendations } from "./_components/detailed-recommendations";
import { EmailGate } from "./_components/email-gate";
import type { ToolRecommendation } from "~/lib/auditEngine";
import { Navbar } from "~/components/navbar";
import { Lightbulb } from "lucide-react";
import type { Metadata } from "next";

/* ─── Dynamic OG Meta Tags ─────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const audit = await db.audit.findUnique({ where: { id } });

  if (!audit) return { title: "Audit Not Found" };

  const savings = audit.totalSavingsMonthly.toFixed(0);

  return {
    title: `AI Spend Audit: Save $${savings}/month`,
    description:
      "Review your AI tool stack and find actionable ways to cut costs, downgrade over-provisioned plans, and consolidate overlapping tools.",
    openGraph: {
      title: `AI Spend Audit: Save $${savings}/month`,
      description:
        "See exactly where your team is overspending on AI tools — and what to do about it.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit: Save $${savings}/month`,
      description: "Cut your AI tool spend with a free instant audit.",
    },
  };
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default async function AuditDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const audit = await db.audit.findUnique({ where: { id } });

  if (!audit) notFound();

  const isProcessing = audit.status === "processing";
  const recommendations =
    (audit.auditResult as unknown as ToolRecommendation[]) ?? [];

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-4xl space-y-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Report</h1>
            <p className="text-muted-foreground mt-2">Audit ID: {audit.id}</p>
          </div>
        </div>

        {isProcessing && <AuditRefresh />}

        {/* Results Area */}
        {isProcessing ? (
          <Card className="bg-aqua-50 border-aqua-100">
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="border-aqua h-12 w-12 animate-spin rounded-full border-4 border-b-0"></div>
              </div>
              <h3 className="text-xl font-semibold">
                Generating Your Personalized Analysis
              </h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md">
                We are currently generating an AI summary based on your usage
                data. This typically takes 10–20 seconds. Please wait...
              </p>
            </CardContent>
          </Card>
        ) : audit.status === "failed" ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <p className="font-semibold text-red-600">Analysis Failed</p>
              <p className="mt-2 text-sm text-red-500">
                {audit.aiSummaryError ?? "An unknown error occurred"}
              </p>
            </CardContent>
          </Card>
        ) : recommendations.length === 0 ? (
          <Card className="bg-aqua-50 border-aqua-100">
            <CardContent className="p-8 text-center">
              <Lightbulb className="text-aqua mx-auto mb-4 h-10 w-10" />
              <h3 className="text-xl font-semibold">No Recommendations</h3>
              <p className="text-muted-foreground mt-2">
                Your current tool stack is well optimized!
              </p>
            </CardContent>
          </Card>
        ) : (
          <DetailedRecommendations
            recommendations={recommendations}
            totalSavingsMonthly={audit.totalSavingsMonthly}
          />
        )}

        {/* AI Summary & Financial Cards */}
        {!isProcessing && audit.status === "completed" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>
                  Personalized analysis of your AI tool stack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {audit.aiSummary}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-teal-600">
                    ${audit.totalSavingsMonthly.toFixed(2)}
                  </div>
                  <span className="text-muted-foreground text-lg">
                    / month in potential savings
                  </span>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  Annual potential: $
                  {(audit.totalSavingsMonthly * 12).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Email Gate — shown to unauthenticated visitors after a completed audit */}
        {!isProcessing && !session && audit.status === "completed" && (
          <EmailGate auditId={audit.id} />
        )}
      </div>
    </>
  );
}
