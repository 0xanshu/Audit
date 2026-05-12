"use client";

import { useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useAuditStore } from "~/lib/auditStore";
import type { ToolRecommendation, SuggestionFlag } from "~/lib/auditEngine";
import { Card, CardContent, Badge } from "~/components/dashboard";

/* ─── Audit Results component for user review (client-side, non-persisted) ──── */

const statusConfig: Record<
  SuggestionFlag,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
    border: string;
  }
> = {
  keep: {
    label: "Keep",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  downgrade: {
    label: "Downgrade",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  switch: {
    label: "Switch",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Sparkles className="h-4 w-4" />,
  },
  cancel: {
    label: "Cancel",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  optimize: {
    label: "Optimize",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    icon: <Sparkles className="h-4 w-4" />,
  },
  upgrade: {
    label: "Upgrade",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: <Sparkles className="h-4 w-4" />,
  },
};

interface AuditResultsProps {
  results?: {
    recommendations: ToolRecommendation[];
    totalSavingsMonthly: number;
    totalSavingsYearly: number;
    summary: string;
  } | null;
  isProcessing?: boolean;
}

export function AuditResults({
  results,
  isProcessing: isProcessingProp,
}: AuditResultsProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const { isProcessing: isProcessingStore } = useAuditStore();

  // Prefer prop over store, fallback to store
  const isProcessing = isProcessingProp ?? isProcessingStore;

  if (isProcessing) {
    return (
      <section>
        <Card variant="flat" className="bg-aqua-tint/30 border-aqua/10">
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="border-aqua h-12 w-12 animate-spin rounded-full border-4 border-b-0"></div>
            </div>
            <h3 className="text-ink text-xl font-semibold">
              Generating Your Personalized Analysis
            </h3>
            <p className="text-sand-600 mx-auto mt-2 max-w-md">
              We are currently generating an AI summary based on your usage
              data. This typically takes 10-20 seconds. Please wait...
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!results || results.recommendations.length === 0) {
    return (
      <section>
        <Card variant="flat" className="bg-aqua-tint/30 border-aqua/10">
          <CardContent className="p-8 text-center">
            <Lightbulb className="text-aqua mx-auto mb-4 h-10 w-10" />
            <h3 className="text-ink text-xl font-semibold">
              Results will appear here
            </h3>
            <p className="text-sand-600 mx-auto mt-2 max-w-md">
              Fill out the audit form above to generate your personalized
              savings report.
            </p>
            <p className="text-sand-600 mt-4 text-sm">
              After submission, you&apos;ll be taken to your detailed report
              page where you can see your AI-powered analysis.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-ink text-2xl font-bold tracking-tight">
            Audit Results
          </h2>
          <p className="text-sand-600 mt-1">
            {results.recommendations.filter((r) => r.savingsMonthly > 0).length}{" "}
            action items found
          </p>
        </div>
        <div className="text-right">
          <p className="text-sand-600 text-sm">Total Monthly Savings</p>
          <p className="text-aqua text-4xl font-bold">
            ${results.totalSavingsMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card variant="flat" className="bg-aqua-tint/30 border-aqua/10 mb-6">
        <CardContent className="p-6">
          <p className="text-ink leading-relaxed font-medium">
            {results.summary}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        {results.recommendations.map((rec, idx) => {
          const s = statusConfig[rec.status] || statusConfig.optimize;
          const isOpen = expanded.has(idx);

          return (
            <Card
              key={idx}
              variant="default"
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  })
                }
                className="w-full text-left"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-full p-2 ${s.bg} ${s.color} border ${s.border}`}
                      >
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-ink font-semibold">{rec.tool}</h3>
                          <Badge
                            variant={
                              rec.status === "keep" ? "default" : "warning"
                            }
                          >
                            {s.label}
                          </Badge>
                          {rec.confidence && (
                            <span className="text-sand-600 text-[10px] tracking-wider uppercase">
                              {rec.confidence} confidence
                            </span>
                          )}
                        </div>
                        <p className="text-sand-600 mt-1 line-clamp-2 text-sm">
                          {rec.recommendedAction}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-right">
                      {rec.savingsMonthly > 0 && (
                        <div>
                          <p className="text-aqua text-lg font-bold">
                            ${rec.savingsMonthly.toLocaleString()}/mo
                          </p>
                          {rec.savingsPercent > 0 && (
                            <p className="text-sand-600 text-xs">
                              {rec.savingsPercent}% savings
                            </p>
                          )}
                        </div>
                      )}
                      <ChevronDown
                        className={`text-sand-400 h-5 w-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-sand-200 mt-4 border-t pt-4">
                      <p className="text-sand-600 text-sm leading-relaxed">
                        {rec.reason}
                      </p>
                      {rec.savingsMonthly > 0 && (
                        <div className="text-aqua mt-3 flex items-center gap-2 text-sm font-medium">
                          <ArrowRight className="h-4 w-4" />
                          Saves ${rec.savingsMonthly.toLocaleString()}/mo
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
