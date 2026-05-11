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
import type { ToolRecommendation, SuggestionFlag } from "~/lib/auditEngine";
import { Card, CardContent, Badge } from "~/components/dashboard";

/* ─── Audit Results component for user review (client-side, non-persisted) ──── */

const statusConfig: Record<
  SuggestionFlag,
  { label: string; color: string; bg: string; icon: React.ReactNode; border: string }
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
};

interface AuditResultsProps {
  results?: {
    recommendations: ToolRecommendation[];
    totalSavingsMonthly: number;
    totalSavingsYearly: number;
    summary: string;
  } | null;
}

export function AuditResults({ results }: AuditResultsProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (!results || results.recommendations.length === 0) {
    return (
      <section>
        <Card variant="flat" className="bg-aqua-tint/30 border-aqua/10">
          <CardContent className="p-8 text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-aqua mb-4" />
            <h3 className="text-xl font-semibold text-ink">
              Results will appear here
            </h3>
            <p className="mt-2 text-sand-600 max-w-md mx-auto">
              Fill out the audit form above to generate your personalized savings
              report.
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
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Audit Results
          </h2>
          <p className="mt-1 text-sand-600">
            {results.recommendations.filter((r) => r.savingsMonthly > 0).length}{" "}
            action items found
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-sand-600">Total Monthly Savings</p>
          <p className="text-4xl font-bold text-aqua">
            ${results.totalSavingsMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card variant="flat" className="bg-aqua-tint/30 border-aqua/10 mb-6">
        <CardContent className="p-6">
          <p className="text-ink font-medium leading-relaxed">
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
                      <div className={`rounded-full p-2 ${s.bg} ${s.color} border ${s.border}`}>
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-ink">
                            {rec.tool}
                          </h3>
                          <Badge variant={rec.status === "keep" ? "default" : "warning"}>
                            {s.label}
                          </Badge>
                          {rec.confidence && (
                            <span className="text-[10px] uppercase tracking-wider text-sand-600">
                              {rec.confidence} confidence
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-sand-600 line-clamp-2">
                          {rec.recommendedAction}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right shrink-0">
                      {rec.savingsMonthly > 0 && (
                        <div>
                          <p className="text-lg font-bold text-aqua">
                            ${rec.savingsMonthly.toLocaleString()}/mo
                          </p>
                          {rec.savingsPercent > 0 && (
                            <p className="text-xs text-sand-600">
                              {rec.savingsPercent}% savings
                            </p>
                          )}
                        </div>
                      )}
                      <ChevronDown
                        className={`h-5 w-5 text-sand-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-4 border-t border-sand-200 pt-4">
                      <p className="text-sm text-sand-600 leading-relaxed">
                        {rec.reason}
                      </p>
                      {rec.savingsMonthly > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-aqua">
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
