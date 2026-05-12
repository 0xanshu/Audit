"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import type { ToolRecommendation, SuggestionFlag } from "~/lib/auditEngine";
import { Card, CardContent } from "~/components/ui/card";

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

interface DetailedRecommendationsProps {
  recommendations: ToolRecommendation[];
  totalSavingsMonthly: number;
}

export function DetailedRecommendations({
  recommendations,
  totalSavingsMonthly,
}: DetailedRecommendationsProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Audit Recommendations
          </h2>
          <p className="text-muted-foreground mt-1">
            {recommendations.filter((r) => r.savingsMonthly > 0).length} action
            items found
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Total Monthly Savings</p>
          <p className="text-4xl font-bold text-teal-600">
            ${totalSavingsMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const s = statusConfig[rec.status] || statusConfig.optimize;
          const isOpen = expanded.has(idx);

          return (
            <Card
              key={idx}
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
                          <h3 className="font-semibold">{rec.tool}</h3>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {s.label}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {rec.reason}
                        </p>
                        <p className="mt-2 font-medium text-teal-600">
                          Save ${rec.savingsMonthly.toFixed(2)}/month
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`text-muted-foreground h-5 w-5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CardContent>
              </button>

              {isOpen && (
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Recommended Action
                      </p>
                      <p className="text-gray-600">{rec.recommendedAction}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Confidence</p>
                      <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 capitalize">
                        {rec.confidence}
                      </span>
                    </div>
                    {rec.isDuplicate && rec.overlapWith && (
                      <div>
                        <p className="font-semibold text-gray-900">
                          Overlaps With
                        </p>
                        <p className="text-gray-600">{rec.overlapWith}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        Savings Potential
                      </p>
                      <p className="text-gray-600">
                        ${rec.savingsMonthly.toFixed(2)}/month (
                        {rec.savingsPercent.toFixed(0)}% savings)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
