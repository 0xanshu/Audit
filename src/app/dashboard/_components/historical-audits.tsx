import type { ToolRecommendation } from "~/lib/auditEngine";
import { Card, CardContent, CardTitle, Badge } from "~/components/dashboard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HistoricalAuditsProps {
  audits: {
    id: string;
    createdAt: Date;
    totalSavingsMonthly: number | null;
    userInput: unknown;
    auditResult: unknown;
  }[];
}

export function HistoricalAudits({ audits }: HistoricalAuditsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-ink text-2xl font-bold tracking-tight">
          Past Audits
        </h2>
        {audits.length > 0 && (
          <span className="text-sand-600 text-sm">
            {audits.length} saved audit{audits.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {audits.length === 0 ? (
        <Card
          variant="flat"
          className="bg-sand-50 border-sand-300 border border-dashed"
        >
          <CardContent className="p-12 text-center">
            <p className="text-sand-600">
              No audits yet. Fill out the form above to get your first savings
              report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => {
            const recommendations =
              (audit.auditResult as ToolRecommendation[]) ?? [];
            const userInput = (audit.userInput as {
              tools?: { tool: string }[];
            }) ?? { tools: [] };
            const toolCount = Array.isArray(userInput.tools)
              ? userInput.tools.length
              : 0;
            const actionCount = recommendations.filter(
              (r) => r.savingsMonthly > 0,
            ).length;

            return (
              <Card
                key={audit.id}
                variant="default"
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="border-sand-200 bg-sand-50/50 flex flex-col border-b p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Audit from {audit.createdAt.toLocaleDateString()}
                      </CardTitle>
                      <p className="text-sand-600 mt-1 text-sm">
                        {toolCount} tool{toolCount !== 1 ? "s" : ""} scanned ·{" "}
                        {actionCount} action item{actionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 md:mt-0">
                      <div className="text-right">
                        <p className="text-sand-600 text-sm">
                          Potential Savings
                        </p>
                        <p className="text-aqua text-2xl font-bold">
                          ${(audit.totalSavingsMonthly ?? 0).toFixed(2)}/mo
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {recommendations.map((rec, i) => (
                        <Badge
                          key={i}
                          variant={
                            rec.status === "keep"
                              ? "default"
                              : rec.status === "downgrade" ||
                                  rec.status === "cancel"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {rec.tool}: {rec.status}
                        </Badge>
                      ))}
                    </div>
                    <Link
                      href={`/audit/${audit.id}`}
                      className="bg-aqua hover:bg-aqua-dark inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
